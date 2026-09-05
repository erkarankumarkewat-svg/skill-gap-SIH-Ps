# Government Integration Center Specification

SkillTrack India acts as an **outcome intelligence layer**, not a replacement for national skilling or employment registries. It interfaces with external national databases via standard integration adapters.

---

## 1. Connector Matrix

| Connector Name | Authority | Integration Mode | Data Signal Consumed | Verification Role |
| :--- | :--- | :--- | :--- | :--- |
| **Skill India Digital (SID)** | MSDE / NSDC | `SIMULATED` | Trainee Enrolment & Lifecycle KYC | Baseline cohort ingestion & certification validity |
| **NCVET Qualifications** | NCVET | `SIMULATED` | National Qualification Register (NQR) | Standardized NSQF levels & National Occupational Standards |
| **EPFO** | MoL&E | `SIMULATED` | Electronic Challan Return / UAN Remittance | Gold-standard dual-verification for formal sector jobs |
| **Udyam MSME** | Ministry of MSME | `SIMULATED` | Enterprise Registration Number & Classification | Formalization evidence for self-employed entrepreneurs |
| **e-Shram** | MoL&E | `SIMULATED` | Unorganized Worker National Database | Migration & informal sector occupational tracking |
| **National Career Service (NCS)** | MoL&E | `NOT_CONFIGURED` | District-level job vacancy postings | Real-time local labor market demand comparison |

---

## 2. Adapter State Protocol

Each adapter in `src/routes/integrations.ts` adheres to explicit operational states:
1. `LIVE`: Active, authenticated production/sandbox connection with TLS mutual auth.
2. `SIMULATED`: Deterministic mock adapter matching verified schema structures for offline demonstration.
3. `NOT_CONFIGURED`: Adapter declared in catalog but awaiting credentials or institutional onboarding.
4. `UNAVAILABLE`: Network outage, external gateway downtime, or rate-limited circuit breaker.

---

## 3. Transparency & Boundary Constraints

- **Claims We Must Not Make:** We never claim real-time live access to EPFO, Aadhaar, or PAN databases during the hackathon. All signals are explicitly marked as `SIMULATED`.
- **Dual-Verification Mechanism:** Trainee self-report is corroborated either by direct employer OTP confirmation or simulated EPFO electronic challan remittance signals.
