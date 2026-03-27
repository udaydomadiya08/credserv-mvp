# Phase 3: Production Architecture & Auditability

## Overview

This document describes how to deploy the CredServ Onboarding Extractor (Phase 1) and Collections Orchestrator (Phase 2) into a production environment that is compliant with RBI Digital Lending Guidelines, DPDP Act 2023, and FAIR Practices Code.

---

## System Architecture

```
                        ┌─────────────────────────────────────────┐
                        │              API Gateway                │
                        │  (Kong + FastAPI, Rate Limiting, Auth)  │
                        └──────────────┬──────────────────────────┘
                                       │
               ┌───────────────────────┼────────────────────────┐
               ▼                       ▼                        ▼
   ┌───────────────────┐   ┌─────────────────────┐  ┌────────────────────┐
   │  Onboarding       │   │  Collections        │  │  Voice Agent       │
   │  Extractor        │   │  Orchestrator       │  │  Service           │
   │  (Phase 1)        │   │  LangGraph          │  │  (Twilio + Gemini) │
   └────────┬──────────┘   └──────────┬──────────┘  └────────┬───────────┘
            │                         │                       │
            └──────────────┬──────────┘                       │
                           ▼                                  │
               ┌───────────────────────┐                      │
               │     Audit Bus         │◄─────────────────────┘
               │  (Apache Kafka)       │
               └───────────┬───────────┘
                           │
          ┌────────────────┼────────────────────┐
          ▼                ▼                    ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Proof Log   │  │  State Store     │  │  Human Escalation│
│  OpenSearch  │  │  Redis+Postgres  │  │  Queue (SQS+CRM) │
│  (7yr retain)│  │                  │  │                  │
└──────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 1. Proof Logs & Audit Trail

### What is logged

Every agent action writes an immutable event to Kafka **before** the external action is taken (write-ahead logging pattern):

```json
{
  "event_id": "uuid-v4",
  "timestamp": "2025-01-15T10:23:45.123Z",
  "agent": "onboarding_extractor | collections_orchestrator | voice_agent",
  "triggered_by": {
    "user_id": "ops-user-001",
    "role": "field_officer",
    "ip": "10.0.1.45",
    "session_id": "session-xyz"
  },
  "data_accessed": ["document_id:DOC-789", "borrower_id:BRW-456"],
  "llm_reasoning_chain": {
    "model": "gemini-1.5-flash",
    "prompt_hash": "sha256:abc123...",
    "input_tokens": 1240,
    "output_tokens": 380,
    "temperature": 0,
    "response_summary": "Extracted 23 transactions, confidence: 0.94"
  },
  "decision_made": "EXTRACTION_PASSED | RETRY_TRIGGERED | ESCALATED",
  "edge_case_routing": null
}
```

**Note:** The prompt itself is never logged verbatim if it contains PII. Only a SHA-256 hash is stored, enabling reproducibility without data leakage.

### Storage & Retention

| Store | Technology | Retention | Purpose |
|-------|-----------|-----------|---------|
| Hot log stream | Apache Kafka | 30 days | Real-time monitoring |
| Queryable audit trail | OpenSearch | 7 years | RBI compliance |
| Archived cold storage | S3 Glacier | 10 years | Legal discovery |

### Edge Case Routing to Human Analysts

Any of the following automatically routes to the human review queue:
- Extraction confidence < 0.80
- Math verification fails after 3 retries
- Voice agent handoff triggered (dispute/distress)
- State machine enters ESCALATED state
- LLM response contains flagged keywords (legal threats, PII leakage patterns)

---

## 2. Prompt Injection Prevention

### Attack Surface & Mitigations

| Attack Vector | Mitigation |
|--------------|-----------|
| Malicious text embedded in uploaded bank statement | Document content is passed as image bytes — never concatenated into text prompts. JSON output is parsed against strict Pydantic schema before use. |
| Borrower manipulating voice agent via speech | Input transcription is sanitized through a regex filter stripping instruction-like patterns before being passed to context. Hard token limit (200 tokens) on borrower speech input per turn. |
| Indirect injection via extracted transaction descriptions | Extracted data is treated as untrusted user input at all downstream steps. Never interpolated into new LLM prompts without sanitization. |
| Prompt leakage via verbose error messages | All LLM errors caught server-side. Only sanitized error codes returned to clients. Full errors stored internally in audit log only. |

### System Prompt Protection

- System prompts are injected server-side only, never exposed to clients
- Borrower/user input is always passed as a separate `user` turn, never appended to `system`
- Voice agent system prompt is loaded from a secrets manager (AWS Secrets Manager), not hardcoded

---

## 3. Data Leakage Prevention

- **PII Masking in Logs:** Account numbers, Aadhaar, PAN masked as `XXXX1234` in all log outputs
- **Encryption at Rest:** AES-256 for all stored documents and extracted JSON
- **Encryption in Transit:** TLS 1.3 for all service-to-service and client communication
- **Data Minimization:** VLM receives only the document image, not borrower metadata
- **Model Provider Controls:** Azure OpenAI (India data residency) preferred in production; no training data opt-in
- **Access Control:** Field officers have read-only access to borrower status; no access to raw LLM prompts or full audit logs

---

## 4. Compliance Summary

| Regulation | Control |
|-----------|---------|
| RBI Digital Lending Guidelines (2022) | All AI decisions have a human review path; no automated rejection without human sign-off; audit trail per section 10 |
| DPDP Act 2023 | Consent captured at onboarding; data deletion capability via borrower ID purge; purpose limitation enforced in Pydantic schema |
| FAIR Practices Code (RBI) | Voice agent negative constraints enforced at system prompt level; all calls recorded with consent; no harassment language |
| Model Risk Management | Monthly accuracy audits; extraction confidence drift detection; champion-challenger VLM evaluation framework |

---

## 5. Infrastructure Stack

```
Compute:        Kubernetes (EKS) — autoscaling agent pods
LLM:            Google Gemini 1.5 Flash (via Vertex AI for data residency)
Orchestration:  LangGraph + LangSmith (tracing)
State Store:    Redis (hot) + PostgreSQL (persistent)
Audit Bus:      Apache Kafka (MSK)
Search/Audit:   OpenSearch
Voice:          Twilio Programmable Voice + Deepgram STT
Monitoring:     Prometheus + Grafana + PagerDuty
Secrets:        AWS Secrets Manager
CI/CD:          GitHub Actions → ECR → EKS
```
