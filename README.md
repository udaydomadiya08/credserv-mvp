# CredServ MVP — AI-Native Onboarding & Collections

**GACPL | CredServ Platform | Case Study Submission by Uday Domadiya**

A fully functional MVP of two AI agent systems for financial workflows:
1. **Phase 1:** Evidence-Based KYC Onboarding Extractor (API-Less, VLM-powered)
2. **Phase 2:** Collections Orchestrator (LangGraph state machine, D-15 → D+3)
3. **Phase 3:** Production Architecture Documentation

---

## Project Structure

```
credserv/
├── phase1/
│   ├── extractor.py          # KYC document extractor + math verifier
│   └── test_documents/       # Auto-generated synthetic bank statements
├── phase2/
│   └── state_machine.py      # LangGraph collections orchestrator
├── phase3/
│   └── architecture.md       # Production design doc
├── requirements.txt
├── .env.example
├── demo_output.md            # Consolidated results of all demo runs
└── README.md
```

---

## Setup

### 1. Clone & install dependencies

```bash
git clone https://github.com/YOUR_USERNAME/credserv-mvp.git
cd credserv
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

> **Note for PDF support:** Install `poppler` for pdf2image:
> - macOS: `brew install poppler`
> - Ubuntu: `sudo apt-get install poppler-utils`
> - Windows: Download from https://github.com/oschwartz10612/poppler-windows

### 2. Set your Gemini API key

```bash
cp .env.example .env
# Edit .env and add your key:
# GEMINI_API_KEY=your_key_here
```

Get a free Gemini API key at: https://aistudio.google.com/app/apikey

> [!TIP]
> This project is optimized for **Gemini 1.5 Flash** and **Gemini 2.0 Flash**. If you encounter rate limits on the free tier, the code is pre-configured to use `gemini-flash-lite-latest` (8B) for better stability.

---

## Phase 1: KYC Document Extractor

### What it does
- Accepts bank statement PDFs or images (clean, skewed, bilingual)
- Uses **Gemini Flash Vision** to extract structured JSON (no regex)
- Runs deterministic math verification on every transaction row
- Auto-retries with error context if math fails (up to 3 attempts)
- Flags for human review if all retries exhausted

### Run demo (generates 3 synthetic bank statements automatically)

```bash
python phase1/extractor.py --demo
```

### Run on your own document

```bash
python phase1/extractor.py --file path/to/statement.pdf
python phase1/extractor.py --file path/to/statement.jpg
```

### Output

- Structured JSON printed to stdout
- Extracted JSON saved to `phase1/test_documents/extracted_*.json`
- Human-readable summary table in terminal

### Example output structure

```json
{
  "account_holder_name": "Ramesh Kumar Sharma",
  "bank_name": "State Bank of India",
  "account_number": "32145678901234",
  "opening_balance": 50000.0,
  "transactions": [
    {
      "date": "2024-01-05",
      "description": "ATM Withdrawal",
      "debit": 5000.0,
      "credit": 0.0,
      "balance": 45000.0
    }
  ],
  "closing_balance": 99500.0,
  "extraction_confidence": 0.96
}
```

---

## Phase 2: Collections Orchestrator

### What it does
- LangGraph state machine managing borrower lifecycle from D-15 to D+3
- States: PENDING_D15 → REMINDER_D7 → REMINDER_D1 → DUE_TODAY → GRACE_D1 → DELINQUENT_D3 → CLOSED / ESCALATED
- Uses Gemini to generate personalized message content (bounded — LLM never controls state transitions)
- Generates D+3 voice agent system prompt with strict negative constraints
- Produces immutable audit log per borrower

### Run scenarios

```bash
# Happy path: borrower pays before due date
python phase2/state_machine.py --scenario pays_on_time

# Late payment: borrower pays at D+2
python phase2/state_machine.py --scenario pays_late

# Full delinquency: reaches D+3, voice agent + legal notice triggered
python phase2/state_machine.py --scenario delinquent

# Dispute: borrower disputes debt on D+1 grace call → escalated to human
python phase2/state_machine.py --scenario disputes

# Step through manually day by day
python phase2/state_machine.py --interactive
```

### What each scenario demonstrates

| Scenario | Key Demonstration |
|----------|------------------|
| `pays_on_time` | Payment webhook closes workflow before escalation |
| `pays_late` | Full reminder sequence, payment at D+2 |
| `delinquent` | D+3 voice agent prompt + legal notice generation |
| `disputes` | Bounded autonomy handoff — dispute triggers human escalation |

### Audit log

Every run saves a JSON audit log: `audit_BRW-001_YYYYMMDD_HHMMSS.json`

---

## Phase 3: Architecture Documentation

See [`phase3/architecture.md`](phase3/architecture.md) for:
- Full system architecture diagram
- Proof log schema and storage strategy
- Prompt injection prevention controls
- Data leakage mitigations
- RBI / DPDP Act compliance mapping

---

## Key Design Decisions

### Why LangGraph over plain if/else?
LangGraph provides persistent state, checkpointing, and a declarative graph structure that makes the workflow auditable, testable, and extensible — critical for regulatory compliance.

### Why is AI not involved in state transitions?
Routing decisions (when to escalate, when to close) are 100% deterministic. AI is only used for message text generation, not for decisions. This prevents unpredictable behaviour in production and ensures every decision can be fully explained to regulators.

### Why Gemini Flash?
Fast, cost-efficient, strong vision (VLM) capabilities for document understanding, and available via Vertex AI with India data residency for DPDP Act compliance.

---

## Running Tests

```bash
# Test math verifier with a deliberately broken JSON
python -c "
from phase1.extractor import verify_bank_statement, BankStatementExtraction, Transaction
bad = BankStatementExtraction(
    account_holder_name='Test', bank_name='SBI', account_number='123',
    opening_balance=10000.0,
    transactions=[
        Transaction(date='2024-01-01', description='ATM', debit=2000, credit=0, balance=9000),  # wrong! should be 8000
    ],
    closing_balance=8000.0, extraction_confidence=0.9
)
result = verify_bank_statement(bad)
print('Passed:', result.passed)
print('Errors:', result.errors)
"
```

Expected output:
```
Passed: False
Errors: [{'row': 1, 'date': '2024-01-01', ..., 'expected_balance': 8000.0, 'stated_balance': 9000.0, 'delta': 1000.0}]
```

---

## Loom Walkthrough

*(Link to be added)* — 5-minute demo covering:
1. Phase 1: Demo run showing all 3 document variants + math error catch
2. Phase 2: `delinquent` scenario showing full D-15→D+3 flow
3. Phase 2: `disputes` scenario showing bounded autonomy handoff

---

## Quick Result
For a quick view of the system's output across all phases, see [`demo_output.md`](demo_output.md).

## License

MIT — Built for CredServ / GACPL case study evaluation.
