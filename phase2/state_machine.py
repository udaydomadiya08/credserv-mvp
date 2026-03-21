"""
Phase 2: Collections Orchestrator (LangGraph State Machine)
============================================================
Manages a borrower's collections workflow from D-15 to D+3 using a
deterministic LangGraph state machine. AI is used only for message
generation — all state transitions are rule-based and auditable.

Usage:
    python phase2/state_machine.py --scenario pays_on_time
    python phase2/state_machine.py --scenario pays_late
    python phase2/state_machine.py --scenario delinquent
    python phase2/state_machine.py --scenario disputes
    python phase2/state_machine.py --interactive   # step through manually
"""

import os
import warnings
import os

# Suppress annoying Google API and Python version warnings for a clean professional demo
warnings.filterwarnings("ignore", category=FutureWarning)
os.environ["GRPC_VERBOSITY"] = "ERROR"
os.environ["GLOG_minloglevel"] = "2"

import sys
import json
import argparse
from datetime import datetime, timedelta
from typing import TypedDict, Literal, Optional
from dataclasses import dataclass, field as dc_field

import google.generativeai as genai
from langgraph.graph import StateGraph, END
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import print as rprint

load_dotenv()
console = Console()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    console.print("[bold red]ERROR:[/] GEMINI_API_KEY not set. Copy .env.example to .env and add your key.")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)
llm = genai.GenerativeModel("gemini-flash-lite-latest")

# ---------------------------------------------------------------------------
# State definition
# ---------------------------------------------------------------------------
class BorrowerState(TypedDict):
    borrower_id: str
    borrower_name: str
    loan_amount: float
    due_date: str
    days_from_due: int          # negative = before due, positive = overdue
    payment_received: bool
    dispute_flagged: bool
    contact_attempts: int
    current_stage: str
    messages_sent: list[str]
    audit_log: list[dict]       # append-only proof log


# ---------------------------------------------------------------------------
# Audit logging helper
# ---------------------------------------------------------------------------
def append_audit(state: BorrowerState, action: str, details: dict = {}) -> list[dict]:
    """Immutable append — returns new list, never mutates."""
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "borrower_id": state["borrower_id"],
        "stage": state["current_stage"],
        "action": action,
        "days_from_due": state["days_from_due"],
        **details
    }
    return state["audit_log"] + [entry]


# ---------------------------------------------------------------------------
# AI message generator (bounded — only generates text, never drives state)
# ---------------------------------------------------------------------------
def generate_message(template_type: str, borrower: BorrowerState, mock: bool = False) -> str:
    """
    Uses Gemini to generate personalized communication text.
    The LLM only generates the message body — it has zero control over
    state transitions or escalation decisions.
    """
    if mock:
        # High-fidelity mock responses for Loom recording
        mocks = {
            "d15_gentle": f"Hi {borrower['borrower_name']}, this is a friendly reminder that your payment of ₹{borrower['loan_amount']:,.0f} is due in 15 days.",
            "d7_whatsapp": f"Hi {borrower['borrower_name']}, this is a WhatsApp reminder for your payment of ₹{borrower['loan_amount']:,.0f} due in 7 days. [PAYMENT_LINK]",
            "d1_sms": f"URGENT: {borrower['borrower_name']}, your ₹{borrower['loan_amount']:,.0f} loan is due TOMORROW. Pay at [PAYMENT_LINK] to avoid late fees.",
            "d0_final": f"FINAL NOTICE: {borrower['borrower_name']}, your payment of ₹{borrower['loan_amount']:,.0f} is due TODAY. Pay now: [PAYMENT_LINK].",
            "grace_call_script": f"Hello {borrower['borrower_name']}, this is CredServ. We noticed your payment is 1 day overdue. How can we assist you today?",
            "legal_notice": f"LEGAL DEMAND: {borrower['borrower_name']}, your account is now 3 days overdue. Formal notice before legal action."
        }
        return mocks.get(template_type, f"Professional reminder for your ₹{borrower['loan_amount']:,.0f} loan.")

    prompts = {
        "d7_whatsapp": f"""
Write a friendly WhatsApp payment reminder for a microfinance borrower.
Borrower name: {borrower['borrower_name']}
Amount due: ₹{borrower['loan_amount']:,.0f}
Due in: 7 days

Rules:
- Warm and friendly tone
- 2-3 sentences max
- Include a payment link placeholder: [PAYMENT_LINK]
- Do NOT threaten or use legal language
- End with a positive note
Output only the message text, nothing else.
""",
        "d1_sms": f"""
Write a concise SMS reminder (160 chars max) for loan repayment.
Borrower: {borrower['borrower_name']}, Amount: ₹{borrower['loan_amount']:,.0f}, Due: TOMORROW
Include [PAYMENT_LINK]. Urgent but polite. Output only the SMS text.
""",
        "d0_final": f"""
Write a final due-date reminder message (WhatsApp).
Borrower: {borrower['borrower_name']}, ₹{borrower['loan_amount']:,.0f} is due TODAY.
Mention payment link [PAYMENT_LINK]. Helpful tone. 2 sentences. Output only the message.
""",
        "grace_call_script": f"""
Write a short, polite phone call opening script for a collections representative.
Borrower: {borrower['borrower_name']}, overdue by 1 day, amount: ₹{borrower['loan_amount']:,.0f}.
Goal: Understand reason for delay, not threaten.
3-4 sentences. Output only the script.
""",
    }

    prompt = prompts.get(template_type, f"Write a polite payment reminder for {borrower['borrower_name']}.")
    try:
        response = llm.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        if "429" in str(e) or "ResourceExhausted" in str(e):
             return f"[SYSTEM MOCK] Reminder for {borrower['borrower_name']} regarding ₹{borrower['loan_amount']:,.0f} loan."
        return f"[AI generation failed: {e}] Please contact us to discuss your payment of ₹{borrower['loan_amount']:,.0f}."


# ---------------------------------------------------------------------------
# Node functions (each is a pure state transition)
# ---------------------------------------------------------------------------

def node_d15_init(state: BorrowerState) -> BorrowerState:
    console.print(Panel(f"[bold cyan]D-15:[/] Workflow initialized for {state['borrower_name']}", style="cyan"))
    audit = append_audit(state, "workflow_initialized", {"loan_amount": state["loan_amount"]})
    return {**state, "current_stage": "PENDING_D15", "audit_log": audit}


def node_d7_reminder(state: BorrowerState) -> BorrowerState:
    console.print(Panel("[bold blue]D-7:[/] Sending WhatsApp reminder", style="blue"))
    # Check if 'mock' is in state, default to False
    mock = state.get("mock", False)
    msg = generate_message("d7_whatsapp", state, mock=mock)
    console.print(f"[dim]WhatsApp → {state['borrower_name']}:[/]\n{msg}\n")
    audit = append_audit(state, "whatsapp_sent", {"channel": "whatsapp", "message_preview": msg[:80]})
    messages = state["messages_sent"] + [f"D-7 WhatsApp: {msg}"]
    return {**state, "current_stage": "REMINDER_D7", "audit_log": audit, "messages_sent": messages}


def node_d1_reminder(state: BorrowerState) -> BorrowerState:
    console.print(Panel("[bold blue]D-1:[/] Sending urgent SMS + email", style="blue"))
    mock = state.get("mock", False)
    msg = generate_message("d1_sms", state, mock=mock)
    console.print(f"[dim]SMS → {state['borrower_name']}:[/]\n{msg}\n")
    audit = append_audit(state, "sms_sent", {"channel": "sms", "message_preview": msg[:80]})
    messages = state["messages_sent"] + [f"D-1 SMS: {msg}"]
    return {**state, "current_stage": "REMINDER_D1", "audit_log": audit, "messages_sent": messages}


def node_due_today(state: BorrowerState) -> BorrowerState:
    console.print(Panel("[bold yellow]D-0:[/] Due date reached — final nudge", style="yellow"))
    mock = state.get("mock", False)
    msg = generate_message("d0_final", state, mock=mock)
    console.print(f"[dim]Final reminder → {state['borrower_name']}:[/]\n{msg}\n")
    audit = append_audit(state, "due_date_reminder_sent", {"channel": "whatsapp+email"})
    messages = state["messages_sent"] + [f"D-0 Final: {msg}"]
    return {**state, "current_stage": "DUE_TODAY", "audit_log": audit, "messages_sent": messages}


def node_grace_call(state: BorrowerState) -> BorrowerState:
    console.print(Panel("[bold orange3]D+1:[/] Grace period — courtesy call attempt", style="orange3"))
    mock = state.get("mock", False)
    script = generate_message("grace_call_script", state, mock=mock)
    console.print(f"[dim]Call script for {state['borrower_name']}:[/]\n{script}\n")
    attempts = state["contact_attempts"] + 1
    audit = append_audit(state, "call_attempted", {"attempt_number": attempts, "script_preview": script[:80]})
    return {**state, "current_stage": "GRACE_D1", "contact_attempts": attempts, "audit_log": audit}


def node_delinquent_d3(state: BorrowerState) -> BorrowerState:
    console.print(Panel("[bold red]D+3:[/] DELINQUENT — Triggering AI Voice Agent + Legal Notice", style="red"))

    voice_prompt = _build_voice_agent_prompt(state)
    console.print("[bold]Voice Agent System Prompt (sent to telephony system):[/]")
    console.print(Panel(voice_prompt, title="D+3 Voice Agent Prompt", style="red"))

    # Generate legal notice text
    notice = _generate_legal_notice(state)
    console.print("[bold]Legal Notice Generated:[/]")
    console.print(Panel(notice, title="Legal Notice", style="dim red"))

    audit = append_audit(state, "voice_agent_triggered", {
        "legal_notice_generated": True,
        "contact_attempts": state["contact_attempts"]
    })
    return {**state, "current_stage": "DELINQUENT_D3", "audit_log": audit}


def node_close_workflow(state: BorrowerState) -> BorrowerState:
    console.print(Panel(f"[bold green]CLOSED:[/] Payment received from {state['borrower_name']} ✓", style="green"))
    audit = append_audit(state, "workflow_closed", {"reason": "payment_received"})
    return {**state, "current_stage": "CLOSED", "audit_log": audit}


def node_escalate_human(state: BorrowerState) -> BorrowerState:
    console.print(Panel(f"[bold magenta]ESCALATED:[/] Routing {state['borrower_name']} to human team", style="magenta"))
    audit = append_audit(state, "escalated_to_human", {
        "reason": "dispute_flagged" if state["dispute_flagged"] else "no_resolution",
        "contact_attempts": state["contact_attempts"]
    })
    return {**state, "current_stage": "ESCALATED", "audit_log": audit}


# ---------------------------------------------------------------------------
# Router (deterministic — zero AI involvement in transitions)
# ---------------------------------------------------------------------------
def route(state: BorrowerState) -> str:
    """Pure deterministic routing logic. No LLM here."""
    if state["payment_received"]:
        return "close_workflow"
    if state["dispute_flagged"]:
        return "escalate_human"

    days = state["days_from_due"]
    stage = state["current_stage"]

    # Progress through stages in order
    if stage == "START":
        return "d15_init"
    if stage == "PENDING_D15" and days <= -7:
        return "d7_reminder"
    if stage in ("PENDING_D15", "REMINDER_D7") and -7 < days <= -1:
        return "d1_reminder"
    if stage in ("PENDING_D15", "REMINDER_D7", "REMINDER_D1") and days == 0:
        return "due_today"
    if stage in ("PENDING_D15", "REMINDER_D7", "REMINDER_D1", "DUE_TODAY") and days == 1:
        return "grace_call"
    if days >= 3:
        return "delinquent_d3"

    return END


# ---------------------------------------------------------------------------
# Build the LangGraph
# ---------------------------------------------------------------------------
def build_graph():
    g = StateGraph(BorrowerState)

    g.add_node("d15_init", node_d15_init)
    g.add_node("d7_reminder", node_d7_reminder)
    g.add_node("d1_reminder", node_d1_reminder)
    g.add_node("due_today", node_due_today)
    g.add_node("grace_call", node_grace_call)
    g.add_node("delinquent_d3", node_delinquent_d3)
    g.add_node("close_workflow", node_close_workflow)
    g.add_node("escalate_human", node_escalate_human)

    # All nodes go back to router after executing
    for node in ["d15_init", "d7_reminder", "d1_reminder", "due_today",
                 "grace_call", "delinquent_d3", "close_workflow", "escalate_human"]:
        g.add_edge(node, END)

    g.set_entry_point("d15_init")
    return g.compile()


# ---------------------------------------------------------------------------
# Voice Agent System Prompt (D+3)
# ---------------------------------------------------------------------------
def _build_voice_agent_prompt(state: BorrowerState) -> str:
    return f"""
You are a professional loan servicing representative for CredServ, calling {state['borrower_name']}.
Overdue amount: ₹{state['loan_amount']:,.0f} | Overdue by: 3 days

=== STRICT NEGATIVE CONSTRAINTS (NEVER violate under any circumstance) ===
- NEVER threaten legal action, arrest, property seizure, or use intimidating language
- NEVER discuss account details not already confirmed by the borrower
- NEVER make promises about waivers, discounts, or settlements
- NEVER continue if borrower asks to speak to a human — immediately transfer
- NEVER argue or escalate emotional tension
- NEVER call outside 9 AM - 6 PM IST (enforced at infrastructure level)
- NEVER share borrower details with third parties during the call

=== ALLOWED ACTIONS ===
- Confirm overdue amount (pre-loaded: ₹{state['loan_amount']:,.0f}) — read only
- Provide a payment link via SMS during the call
- Offer to schedule a callback with a human representative
- Log the borrower's stated reason for non-payment
- Express empathy and offer to help find a solution

=== MANDATORY HANDOFF TRIGGERS ===
If ANY of the following occur, say EXACTLY:
"I completely understand. Let me connect you with our team who can help you better. Please hold."
Then: set dispute_flagged=True, log full interaction, end call gracefully.

Triggers:
  1. Borrower disputes the debt amount or says payment was made
  2. Borrower requests to speak to a human at any point
  3. Borrower uses aggressive, distressed, or emotional language
  4. Call exceeds 4 minutes without payment commitment
  5. Borrower mentions financial hardship (offer human counsellor instead)

=== OPENING SCRIPT ===
"Hello, may I speak with {state['borrower_name']}? ... This is a call from CredServ regarding
your loan account. I'm calling about a payment of ₹{state['loan_amount']:,.0f} that was due 3 days ago.
I wanted to check in and see how we can help you get this resolved today."
"""


def _generate_legal_notice(state: BorrowerState) -> str:
    today = datetime.now().strftime("%d %B %Y")
    return f"""
NOTICE OF OVERDUE PAYMENT
Date: {today}

To: {state['borrower_name']}
Borrower ID: {state['borrower_id']}

Dear {state['borrower_name']},

This notice is to inform you that a payment of ₹{state['loan_amount']:,.0f} on your loan
account was due on {state['due_date']} and remains unpaid as of today.

Please clear this outstanding amount within 7 days of receipt of this notice
to avoid further action as per your loan agreement.

Payment options:
  • Online: [PAYMENT_PORTAL_LINK]
  • Contact us: 1800-XXX-XXXX

If you believe this notice is in error or wish to discuss repayment options,
please contact our support team immediately.

Regards,
CredServ Collections Team
GACPL Financial Services
[This is a system-generated notice. Not a legal summons.]
"""


# ---------------------------------------------------------------------------
# Scenario simulator
# ---------------------------------------------------------------------------
def make_initial_state(borrower_id: str = "BRW-001") -> BorrowerState:
    return BorrowerState(
        borrower_id=borrower_id,
        borrower_name="Ramesh Kumar",
        loan_amount=25000.0,
        due_date="2024-02-01",
        days_from_due=-15,
        payment_received=False,
        dispute_flagged=False,
        contact_attempts=0,
        current_stage="START",
        messages_sent=[],
        audit_log=[]
    )


def simulate_scenario(scenario: str, mock: bool = False):
    """
    Simulate the full timeline for a given scenario by stepping through days.
    """
    console.print(Panel(f"[bold]Simulating Scenario: {scenario.upper()}[/]", style="bold white on blue"))

    graph = build_graph()
    state = make_initial_state()
    state["mock"] = mock

    # Timeline: simulate day by day
    # We manually drive state through the graph by invoking nodes in sequence
    day_sequence = {
        "pays_on_time": [
            (-15, False, False),  # D-15: init
            (-7,  False, False),  # D-7: reminder
            (-1,  True,  False),  # D-1: payment received!
        ],
        "pays_late": [
            (-15, False, False),
            (-7,  False, False),
            (-1,  False, False),
            (0,   False, False),
            (1,   False, False),
            (2,   True,  False),  # D+2: pays
        ],
        "delinquent": [
            (-15, False, False),
            (-7,  False, False),
            (-1,  False, False),
            (0,   False, False),
            (1,   False, False),
            (3,   False, False),  # D+3: delinquent
        ],
        "disputes": [
            (-15, False, False),
            (-7,  False, False),
            (-1,  False, False),
            (0,   False, False),
            (1,   False, True),   # D+1: dispute flagged on call
        ],
    }

    sequence = day_sequence.get(scenario)
    if not sequence:
        console.print(f"[red]Unknown scenario: {scenario}[/]")
        console.print("Available: pays_on_time, pays_late, delinquent, disputes")
        return

    for days, paid, disputed in sequence:
        state["days_from_due"] = days
        state["payment_received"] = paid
        state["dispute_flagged"] = disputed

        day_label = f"D{days:+d}" if days != 0 else "D-0"
        console.print(f"\n{'='*60}")
        console.print(f"[bold]Simulating {day_label}[/] | Paid: {paid} | Disputed: {disputed}")
        console.print(f"{'='*60}")

        next_node = route(state)
        if next_node == END:
            console.print("[dim]No action needed at this stage.[/]")
            continue

        # Execute the appropriate node
        node_fn = {
            "d15_init": node_d15_init,
            "d7_reminder": node_d7_reminder,
            "d1_reminder": node_d1_reminder,
            "due_today": node_due_today,
            "grace_call": node_grace_call,
            "delinquent_d3": node_delinquent_d3,
            "close_workflow": node_close_workflow,
            "escalate_human": node_escalate_human,
        }.get(next_node)

        if node_fn:
            state = node_fn(state)

        if state["current_stage"] in ("CLOSED", "ESCALATED"):
            break

    # Print final audit log
    _print_audit_log(state)


def _print_audit_log(state: BorrowerState):
    console.print("\n")
    table = Table(title=f"Audit Log — {state['borrower_id']}", show_header=True, header_style="bold magenta")
    table.add_column("Timestamp", style="dim", width=25)
    table.add_column("Stage")
    table.add_column("Action")
    table.add_column("Details")

    for entry in state["audit_log"]:
        details = {k: v for k, v in entry.items()
                   if k not in ("timestamp", "stage", "action", "borrower_id", "days_from_due")}
        table.add_row(
            entry["timestamp"][:19],
            entry["stage"],
            entry["action"],
            str(details)[:60]
        )
    console.print(table)

    # Save audit log to file
    log_path = f"audit_{state['borrower_id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(log_path, "w") as f:
        json.dump(state["audit_log"], f, indent=2)
    console.print(f"[green]Audit log saved:[/] {log_path}")


def interactive_mode(mock: bool = False):
    """Step through the state machine manually."""
    console.print(Panel("[bold]Interactive Mode — Step Through Collections Workflow[/]", style="bold cyan"))
    state = make_initial_state()
    state["mock"] = mock
    state = node_d15_init(state)

    while state["current_stage"] not in ("CLOSED", "ESCALATED"):
        console.print(f"\n[bold]Current stage:[/] {state['current_stage']} | Day: D{state['days_from_due']:+d}")
        console.print("Options: [1] Advance day  [2] Mark payment received  [3] Flag dispute  [q] Quit")
        choice = input(">>> ").strip()

        if choice == "1":
            state["days_from_due"] += 1
        elif choice == "2":
            state["payment_received"] = True
        elif choice == "3":
            state["dispute_flagged"] = True
        elif choice.lower() == "q":
            break

        next_node = route(state)
        if next_node == END:
            console.print("[dim]No action at this stage.[/]")
            continue

        node_fn = {
            "d7_reminder": node_d7_reminder, "d1_reminder": node_d1_reminder,
            "due_today": node_due_today, "grace_call": node_grace_call,
            "delinquent_d3": node_delinquent_d3, "close_workflow": node_close_workflow,
            "escalate_human": node_escalate_human,
        }.get(next_node)
        if node_fn:
            state = node_fn(state)

    _print_audit_log(state)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CredServ Collections Orchestrator")
    parser.add_argument("--scenario", choices=["pays_on_time", "pays_late", "delinquent", "disputes"],
                        help="Run a predefined scenario")
    parser.add_argument("--interactive", action="store_true", help="Step through manually")
    parser.add_argument("--mock", action="store_true", help="Use mock AI messages (safe for recording)")
    args = parser.parse_args()

    if args.interactive:
        interactive_mode(mock=args.mock)
    elif args.scenario:
        simulate_scenario(args.scenario, mock=args.mock)
    else:
        parser.print_help()
