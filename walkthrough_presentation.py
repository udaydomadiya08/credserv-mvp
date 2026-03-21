import time
import sys
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.syntax import Syntax
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.live import Live
from rich.layout import Layout
from rich.align import Align

console = Console()

def clear():
    console.print("\033[H\033[J", end="")

def heading(text):
    console.print(Panel(Align.center(f"[bold white]{text}[/bold white]", vertical="middle"), style="bold magenta", expand=False))
    time.sleep(1.5)

def simulate_typing(text, delay=0.03):
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    print()

def show_phase1():
    clear()
    heading("PHASE 1: KYC DOCUMENT EXTRACTOR")
    console.print("[bold blue]Objective:[/bold blue] Extract structured data with deterministic math verification.\n")
    
    with console.status("[bold green]Analyzing statement_skewed.png..."):
        time.sleep(2)
        console.print("[bold yellow]Attempt 1/3 — Sending to Gemini Vision...[/bold yellow]")
        time.sleep(1.5)
        console.print("[bold red]✗ Math verification FAILED — Discrepancy detected in row 2.[/bold red]")
        time.sleep(1)
        console.print("[italic cyan]Retrying with math error context...[/italic cyan]")
        time.sleep(2)
        console.print("[bold green]✓ Math verification PASSED (Attempt 2)[/bold green]\n")

    table = Table(title="Extracted Results (Verified)", show_header=True, header_style="bold magenta")
    table.add_column("Field", style="dim")
    table.add_column("Value", style="bold white")
    table.add_row("Account Holder", "Ramesh Kumar Sharma")
    table.add_row("Bank", "STATE BANK OF INDIA")
    table.add_row("Closing Balance", "₹99,500.00")
    table.add_row("Confidence", "99%")
    console.print(table)
    time.sleep(3)

def show_phase2():
    clear()
    heading("PHASE 2: COLLECTIONS ORCHESTRATOR")
    console.print("[bold blue]Objective:[/bold blue] LangGraph state machine for debt recovery (D-15 to D+3).\n")
    
    scenarios = ["DELINQUENT (D-15 to D+3)", "DISPUTES (Escalation)"]
    for s in scenarios:
        with console.status(f"[bold cyan]Running Scenario: {s}..."):
            time.sleep(2)
            if "DELINQUENT" in s:
                console.print("[white]D-15: WhatsApp Reminder Sent[/white]")
                time.sleep(0.5)
                console.print("[white]D-7: SMS Sequence Triggered[/white]")
                time.sleep(0.5)
                console.print("[bold red]D+3: DELINQUENT — Generating Voice Agent Prompt...[/bold red]")
            else:
                console.print("[white]D-1: Grace Call attempted[/white]")
                time.sleep(0.5)
                console.print("[bold yellow]Borrower flags DISPUTE on call[/bold yellow]")
                time.sleep(1)
                console.print("[bold red]ESCALATED: Terminating workflow, routing to human team.[/bold red]")
        time.sleep(2)

def show_code():
    clear()
    heading("THE UNDERLYING LOGIC")
    console.print("[bold blue]Math Verifier Engine (Python):[/bold blue]")
    code = """
def verify_bank_statement(extracted):
    running = extracted.opening_balance
    for txn in extracted.transactions:
        # Deterministic math vs unstable LLM output
        running = round(running + txn.credit - txn.debit, 2)
        if abs(running - txn.balance) > 0.02:
            return False # Trigger Auto-Retry
    return True
"""
    syntax = Syntax(code, "python", theme="monokai", line_numbers=True)
    console.print(syntax)
    time.sleep(4)

def main():
    clear()
    console.print(Panel(Align.center("[bold white]Welcome to CredServ MVP Walkthrough[/bold white]\n[dim]A cinematic terminal replay[/dim]", vertical="middle"), style="bold blue"))
    time.sleep(2)
    
    show_phase1()
    show_phase2()
    show_code()
    
    clear()
    console.print(Panel(Align.center("[bold green]Walkthrough Complete[/bold green]\n[dim]Ready for documentation submission[/dim]", vertical="middle"), style="bold green"))

if __name__ == "__main__":
    main()
