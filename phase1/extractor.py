"""
Phase 1: Evidence-Based Onboarding Extractor (API-Less KYC)
============================================================
Uses Google Gemini Vision to extract structured data from Indian bank statements.
Includes a deterministic math verification engine with auto-retry on failure.

Usage:
    python phase1/extractor.py --file path/to/statement.pdf
    python phase1/extractor.py --demo   # runs on synthetic test documents
"""

import os
import sys
import json
import base64
import argparse
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field

import google.generativeai as genai
from PIL import Image
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import print as rprint

load_dotenv()
console = Console()

# ---------------------------------------------------------------------------
# Gemini setup
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    console.print("[bold red]ERROR:[/] GEMINI_API_KEY not set. Copy .env.example to .env and add your key.")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-flash-lite-latest")

# ---------------------------------------------------------------------------
# Pydantic models (strict schema enforcement)
# ---------------------------------------------------------------------------
class Transaction(BaseModel):
    date: str
    description: str
    debit: float
    credit: float
    balance: float


class BankStatementExtraction(BaseModel):
    account_holder_name: str
    bank_name: str
    account_number: str
    opening_balance: float
    transactions: list[Transaction]
    closing_balance: float
    extraction_confidence: float


# ---------------------------------------------------------------------------
# Verification result
# ---------------------------------------------------------------------------
@dataclass
class VerificationResult:
    passed: bool
    errors: list[dict] = field(default_factory=list)
    computed_closing: float = 0.0


# ---------------------------------------------------------------------------
# Universal VLM Prompt
# ---------------------------------------------------------------------------
UNIVERSAL_EXTRACTION_PROMPT = """
You are a financial document extraction specialist for Indian banking documents.
Your task: Extract structured data from the provided bank statement image.

CRITICAL RULES:
1. Return ONLY valid JSON. No markdown, no prose, no code fences.
2. If a field is unreadable, use null (never guess or hallucinate values).
3. Amounts must be numeric floats (e.g., 10500.00), never strings.
4. Dates must be in YYYY-MM-DD format.
5. Handle mixed Hindi/English text: transliterate names to English.
6. For skewed/degraded images: infer from context, mark confidence < 0.8.
7. Debit = money going OUT, Credit = money coming IN.
8. The balance column shows the running balance AFTER each transaction.

OUTPUT SCHEMA (return exactly this structure):
{
  "account_holder_name": "string",
  "bank_name": "string",
  "account_number": "string",
  "opening_balance": 0.00,
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "debit": 0.00,
      "credit": 0.00,
      "balance": 0.00
    }
  ],
  "closing_balance": 0.00,
  "extraction_confidence": 0.95
}
"""

RETRY_PROMPT_TEMPLATE = """
Your previous extraction had math errors. Please re-extract the bank statement carefully.

ERRORS FOUND:
{error_details}

Pay special attention to:
- Reading amount columns correctly (debit vs credit)
- The running balance after each transaction
- Not confusing commas and decimals in Indian number format (1,00,000 = 100000)

Return ONLY valid JSON following the same schema. No markdown, no prose.
"""


# ---------------------------------------------------------------------------
# Core extraction function
# ---------------------------------------------------------------------------
def extract_from_image(image: Image.Image, prompt: str) -> dict:
    """Send image + prompt to Gemini, return parsed JSON."""
    response = model.generate_content([prompt, image])
    raw = response.text.strip()

    # Strip accidental markdown code fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)


def load_document_as_image(file_path: str) -> list[Image.Image]:
    """Load PDF or image file, return list of PIL Images (one per page)."""
    path = Path(file_path)
    ext = path.suffix.lower()

    if ext in [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"]:
        return [Image.open(file_path).convert("RGB")]
    elif ext == ".pdf":
        try:
            from pdf2image import convert_from_path
            images = convert_from_path(file_path, dpi=200)
            return [img.convert("RGB") for img in images]
        except Exception as e:
            console.print(f"[yellow]Warning: Could not convert PDF pages ({e}). Trying first page only.[/]")
            return [Image.open(file_path).convert("RGB")]
    else:
        raise ValueError(f"Unsupported file format: {ext}. Use PDF, JPG, or PNG.")


# ---------------------------------------------------------------------------
# Math Verification Engine
# ---------------------------------------------------------------------------
def verify_bank_statement(extracted: BankStatementExtraction) -> VerificationResult:
    """
    Deterministic guardrail. Walks every transaction and checks:
    1. Running balance matches stated balance at each row.
    2. Final computed balance matches stated closing balance.
    Returns VerificationResult with detailed error list.
    """
    running = extracted.opening_balance
    errors = []
    TOLERANCE = 0.02  # 2 paisa tolerance for rounding

    for i, txn in enumerate(extracted.transactions):
        running = round(running + txn.credit - txn.debit, 2)
        delta = abs(running - txn.balance)
        if delta > TOLERANCE:
            errors.append({
                "row": i + 1,
                "date": txn.date,
                "description": txn.description[:40],
                "expected_balance": running,
                "stated_balance": txn.balance,
                "delta": round(delta, 2)
            })

    final_delta = abs(running - extracted.closing_balance)
    if final_delta > TOLERANCE:
        errors.append({
            "type": "closing_balance_mismatch",
            "computed": running,
            "stated": extracted.closing_balance,
            "delta": round(final_delta, 2)
        })

    return VerificationResult(passed=len(errors) == 0, errors=errors, computed_closing=running)


# ---------------------------------------------------------------------------
# Main extraction pipeline with retry
# ---------------------------------------------------------------------------
def run_extraction_pipeline(file_path: str, max_retries: int = 3) -> Optional[BankStatementExtraction]:
    """
    Full pipeline:
    1. Load document as image(s)
    2. Extract with Gemini VLM
    3. Validate schema (Pydantic)
    4. Verify math (deterministic)
    5. Retry with error context if failed
    6. Return result or flag for human review
    """
    console.print(f"\n[bold blue]Processing:[/] {file_path}")
    images = load_document_as_image(file_path)
    # Use first page for bank statements (most info is on page 1)
    image = images[0]

    prompt = UNIVERSAL_EXTRACTION_PROMPT
    last_errors = []

    for attempt in range(1, max_retries + 1):
        console.print(f"  [cyan]Attempt {attempt}/{max_retries}[/] — Sending to Gemini Vision...")

        try:
            raw_json = extract_from_image(image, prompt)
        except json.JSONDecodeError as e:
            console.print(f"  [red]JSON parse error:[/] {e}")
            if attempt == max_retries:
                console.print("  [bold red]Max retries reached. Flagging for human review.[/]")
                return None
            continue
        except Exception as e:
            console.print(f"  [red]Gemini API error:[/] {e}")
            raise

        # Schema validation
        try:
            extraction = BankStatementExtraction(**raw_json)
        except (ValidationError, TypeError) as e:
            console.print(f"  [red]Schema validation failed:[/] {e}")
            if attempt == max_retries:
                return None
            continue

        console.print(f"  [green]Schema valid.[/] Confidence: {extraction.extraction_confidence:.0%}")

        # Math verification
        result = verify_bank_statement(extraction)

        if result.passed:
            console.print(f"  [bold green]✓ Math verification PASSED[/]")
            _print_summary(extraction)
            return extraction
        else:
            console.print(f"  [bold yellow]✗ Math verification FAILED — {len(result.errors)} error(s)[/]")
            for err in result.errors[:3]:
                console.print(f"    → {err}")
            last_errors = result.errors

            if attempt < max_retries:
                error_details = json.dumps(last_errors, indent=2)
                prompt = RETRY_PROMPT_TEMPLATE.format(error_details=error_details)
                console.print(f"  [yellow]Retrying with error context...[/]")

    console.print("[bold red]FAILED after all retries. Flagging for human review.[/]")
    return None


# ---------------------------------------------------------------------------
# Synthetic test document generator
# ---------------------------------------------------------------------------
def generate_synthetic_statement(variant: str) -> Image.Image:
    """
    Generate a synthetic bank statement image for demo purposes.
    Variants: 'clean', 'skewed', 'bilingual'
    """
    from PIL import ImageDraw, ImageFont, ImageFilter
    import math

    width, height = 900, 700
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([0, 0, width, 80], fill="#1a3c6e")
    draw.text((20, 15), "STATE BANK OF INDIA" if variant != "bilingual" else "भारतीय स्टेट बैंक / State Bank of India",
              fill="white", font=None)
    draw.text((20, 45), "Account Statement", fill="#aaccff", font=None)

    # Account info
    name = "Ramesh Kumar Sharma" if variant != "bilingual" else "रमेश कुमार शर्मा (Ramesh Kumar Sharma)"
    draw.text((20, 100), f"Account Holder: {name}", fill="black")
    draw.text((20, 120), "Account No: 32145678901234", fill="black")
    draw.text((20, 140), "Opening Balance: 50,000.00", fill="black")

    # Table header
    draw.rectangle([20, 170, 880, 195], fill="#e8f0fe")
    for x, label in [(20, "Date"), (120, "Description"), (420, "Debit"), (560, "Credit"), (700, "Balance")]:
        draw.text((x, 175), label, fill="#1a3c6e", font=None)

    # Transactions
    transactions = [
        ("2024-01-05", "ATM Withdrawal", "5000.00", "", "45000.00"),
        ("2024-01-08", "NEFT Transfer In", "", "20000.00", "65000.00"),
        ("2024-01-12", "UPI Payment", "2500.00", "", "62500.00"),
        ("2024-01-18", "Salary Credit", "", "45000.00", "107500.00"),
        ("2024-01-22", "Bill Payment", "8000.00", "", "99500.00"),
    ]
    y = 205
    for i, (date, desc, debit, credit, balance) in enumerate(transactions):
        bg = "#f8f9fa" if i % 2 == 0 else "white"
        draw.rectangle([20, y, 880, y + 22], fill=bg)
        draw.text((20, y + 3), date, fill="black")
        draw.text((120, y + 3), desc, fill="black")
        draw.text((420, y + 3), debit, fill="#cc0000")
        draw.text((560, y + 3), credit, fill="#006600")
        draw.text((700, y + 3), balance, fill="black")
        y += 25

    draw.text((20, y + 10), "Closing Balance: 99,500.00", fill="black")
    draw.text((500, y + 10), "Statement generated by SBI NetBanking", fill="gray")

    if variant == "skewed":
        img = img.rotate(8, fillcolor="white", expand=False)
        img = img.filter(ImageFilter.GaussianBlur(0.5))

    return img


def run_demo():
    """Run extraction on all three synthetic test variants."""
    variants = ["clean", "skewed", "bilingual"]
    demo_dir = Path("phase1/test_documents")
    demo_dir.mkdir(parents=True, exist_ok=True)

    console.print(Panel("[bold]Running Demo on Synthetic Test Documents[/]", style="blue"))

    for variant in variants:
        img_path = demo_dir / f"statement_{variant}.png"
        if not img_path.exists():
            console.print(f"[yellow]Generating synthetic {variant} statement...[/]")
            img = generate_synthetic_statement(variant)
            img.save(img_path)

        result = run_extraction_pipeline(str(img_path))
        if result:
            out_path = demo_dir / f"extracted_{variant}.json"
            out_path.write_text(json.dumps(result.model_dump(), indent=2))
            console.print(f"[green]Saved:[/] {out_path}\n")


def _print_summary(extraction: BankStatementExtraction):
    table = Table(title="Extracted Bank Statement", show_header=True, header_style="bold blue")
    table.add_column("Field", style="cyan")
    table.add_column("Value")
    table.add_row("Account Holder", extraction.account_holder_name)
    table.add_row("Bank", extraction.bank_name)
    table.add_row("Account No", extraction.account_number)
    table.add_row("Opening Balance", f"₹{extraction.opening_balance:,.2f}")
    table.add_row("Transactions", str(len(extraction.transactions)))
    table.add_row("Closing Balance", f"₹{extraction.closing_balance:,.2f}")
    table.add_row("Confidence", f"{extraction.extraction_confidence:.0%}")
    console.print(table)


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CredServ KYC Document Extractor")
    parser.add_argument("--file", help="Path to bank statement PDF or image")
    parser.add_argument("--demo", action="store_true", help="Run on synthetic test documents")
    args = parser.parse_args()

    if args.demo:
        run_demo()
    elif args.file:
        result = run_extraction_pipeline(args.file)
        if result:
            print(json.dumps(result.model_dump(), indent=2))
        else:
            sys.exit(1)
    else:
        parser.print_help()
