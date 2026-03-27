# CredServ MVP — Demo Output

This file contains the consolidated output of all project phases, demonstrating the AI-native onboarding and collections workflows.

---

## Phase 1: KYC Document Extractor
**Command:** `python phase1/extractor.py --demo`

### 1. Clean Document (statement_clean.png)
Successfully extracted structured data with high confidence.
```text
Processing: phase1/test_documents/statement_clean.png
  Attempt 1/3 — Sending to Gemini Vision...
  Schema valid. Confidence: 99%
  ✓ Math verification PASSED
        Extracted Bank Statement         
┏━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┓
┃ Field           ┃ Value               ┃
┡━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━┩
│ Account Holder  │ Ramesh Kumar Sharma │
│ Bank            │ STATE BANK OF INDIA │
│ Account No      │ 32145678901234      │
│ Opening Balance │ ₹50,000.00          │
│ Transactions    │ 5                   │
│ Closing Balance │ ₹99,500.00          │
│ Confidence      │ 99%                 │
└─────────────────┴─────────────────────┘
```

### 2. Skewed Document (statement_skewed.png)
Demonstrates the **Deterministic Math Verification Engine** catching errors and triggering an auto-retry.
```text
Processing: phase1/test_documents/statement_skewed.png
  Attempt 1/3 — Sending to Gemini Vision...
  Schema valid. Confidence: 98%
  ✗ Math verification FAILED — 2 error(s)
    → {'row': 2, 'date': '2024-01-05', 'description': 'ATM Withdrawal', 'expected_balance': 42500.0, 'stated_balance': 46000.0, 'delta': 3500.0}
  Retrying with error context...
```

### 3. Bilingual Document (statement_bilingual.png)
Successfully handled mixed Hindi/English text.
```text
Processing: phase1/test_documents/statement_bilingual.png
  Attempt 1/3 — Sending to Gemini Vision...
  Schema valid. Confidence: 99%
  ✓ Math verification PASSED
        Extracted Bank Statement         
┏━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┓
┃ Field           ┃ Value               ┃
┡━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━┩
│ Account Holder  │ Ramesh Kumar Sharma │
│ Bank            │ State Bank of India │
│ Account No      │ 32145678901234      │
│ Opening Balance │ ₹50,000.00          │
│ Transactions    │ 5                   │
│ Closing Balance │ ₹99,500.00          │
│ Confidence      │ 99%                 │
└─────────────────┴─────────────────────┘
```

---

## Phase 2: Collections Orchestrator
**Command:** `python phase2/state_machine.py --scenario [scenario_name]`

### Scenario: DELINQUENT
Managed borrower from D-15 to D+3 escalation.
```text
╭──────────────────────────────────────────────────────────────────╮
│ Simulating Scenario: DELINQUENT                                  │
╰──────────────────────────────────────────────────────────────────╯
D-15: Workflow initialized for Ramesh Kumar
D-7: Sending WhatsApp reminder
D-1: Sending urgent SMS + email
D-0: Due date reached — final nudge
D+1: Grace period — courtesy call attempt
D+3: DELINQUENT — Triggering AI Voice Agent + Legal Notice

Voice Agent System Prompt Generated:
╭─────────────────────────── D+3 Voice Agent Prompt ───────────────────────────╮
│ You are a professional loan servicing representative for CredServ...         │
│ Overdue amount: ₹25,000 | Overdue by: 3 days                                 │
│ === STRICT NEGATIVE CONSTRAINTS ===                                          │
│ - NEVER threaten legal action or use intimidating language                   │
│ - NEVER discuss details not confirmed by the borrower                        │
╰──────────────────────────────────────────────────────────────────────────────╯
```

### Scenario: DISPUTES
Demonstrates **Bounded Autonomy** — once a dispute is flagged, the automated flow terminates and routes to a human.
```text
╭──────────────────────────────────────────────────────────────────╮
│ Simulating Scenario: DISPUTES                                    │
╰──────────────────────────────────────────────────────────────────╯
D-7: Sending WhatsApp reminder
D-1: Sending urgent SMS + email
ESCALATED: Routing Ramesh Kumar to human team

Audit Log Snippet:
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Timestamp                 ┃ Stage       ┃ Action                 ┃ Details                        ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩
│ 2026-03-21T08:46:00       │ START       │ workflow_initialized   │ {'loan_amount': 25000.0}       │
│ 2026-03-21T08:46:06       │ PENDING_D15 │ whatsapp_sent          │ {'channel': 'whatsapp'...}     │
│ 2026-03-21T08:46:07       │ DUE_TODAY   │ escalated_to_human     │ {'reason': 'dispute_flagged'}  │
└───────────────────────────┴─────────────┴────────────────────────┴────────────────────────────────┘
```
