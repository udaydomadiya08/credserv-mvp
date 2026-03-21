# Loom Video: Professional Walkthrough Script

This script is designed for a **3-5 minute screen recording**. Follow the "What to show" instructions while reading the "What to say" script (first-person).

---

## 🎬 Prologue: Introduction (30s)
**What to show:** Open `README.md` in your editor. Highlight the "CredServ MVP" title and the Phase 1/2/3 overview. Move your cursor over the project structure.

**What to say:**
> "Hi, I'm [Your Name], and today I’m walking you through CredServ—a platform I’ve built to modernize financial onboarding and collections using AI and deterministic verification. My goal was to create a system that’s as smart as an LLM but as reliable as a spreadsheet. I’ve divided this into three phases: KYC math verification, an autonomous state machine, and a production-grade architecture."

---

## 🔍 Shot 1: Phase 1 - The Math Verifier (60s)
**What to show:** 
1. Open `phase1/extractor.py`. 
2. Highlight the `verify_bank_statement` function (around line 167).
3. Then, run this command in your terminal: `python phase1/extractor.py`

**What to say:**
> "First, let’s look at Phase 1. When I use Gemini to extract data from bank statements, I don't just trust the raw output. Here in `extractor.py`, specifically in the `verify_bank_statement` function, I’ve implemented a custom engine that recalibrates the math for every row. As you can see when I run the demo, if I detect a discrepancy between the stated balance and the calculated credits/debits—like in this 'skewed' example—my system catches it and triggers an automatic retry. This ensures 100% auditability for every KYC document I process."

---

## 🤖 Shot 2: Phase 2 - State Machine & Escalation (90s)
**What to show:** 
1. Open `phase2/state_machine.py`.
2. Highlight the `BorrowerState` class (line 46) and the `route` function (line 209). 
3. Run these terminal commands: 
   - `python phase2/state_machine.py --scenario payment` (Successful)
   - `python phase2/state_machine.py --scenario dispute` (Escalation)

**What to say:**
> "Next is the heart of the system: the Collections Orchestrator in `state_machine.py`. I use LangGraph to manage the borrower journey. Unlike a simple chatbot, this is ‘bounded autonomy.’ As you see in the `route` function, it's strictly deterministic. 
> 
> In a successful scenario, the state machine moves from D-15 to completion once payment is received. But watch what happens when I simulate a dispute. My code detects the `dispute_flagged` status and immediately triggers the `node_escalate_human` function. This terminates the AI flow and hands it over to my human team, ensuring we stay compliant and empathetic."

---

## 🏗️ Shot 3: Phase 3 - Production Readiness (30s)
**What to show:** Open `phase3/architecture.md`. Scroll through the security and scaling sections. Wrap up by showing your GitHub repository.

**What to say:**
> "Finally, I designed Phase 3 to be production-ready. I’ve architected this for Google Cloud Vertex AI, incorporating PII masking, immutable audit logs, and RBI-compliant data governance. This isn’t just a demo; it’s a blueprint for a secure, scalable financial agent. Thanks for watching my CredServ walkthrough!"

---

## 💡 Quick Demo Tips:
- **Phase 1 Demo**: Run `python phase1/demo.py` (if you have one) or shown the contents of `demo_output.md`.
- **Phase 2 Demo**: Trigger a "Dispute" scenario to show the state machine stopping.
- **Resolution**: Record at 1080p for clarity.
