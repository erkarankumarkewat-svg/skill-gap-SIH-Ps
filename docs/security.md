# Security & Privacy Architecture

## 1. Compliance: Digital Personal Data Protection (DPDP) Act 2023

SkillTrack India is engineered from the ground up to comply with the DPDP Act 2023:

- **Purpose Limitation & Purpose-Specific Notice:** Consent is collected independently for separate processing activities (`TRAINING_ADMINISTRATION`, `FOLLOW_UP_COMMUNICATION`, `EMPLOYMENT_OUTCOME_TRACKING`, `EMPLOYER_VERIFICATION`, `AGGREGATED_POLICY_ANALYTICS`). No bundled or coercive consent.
- **Append-Only Consent Ledger:** Consents cannot be overwritten. Every grant, modification, or withdrawal produces a cryptographically hashed, immutable event record in `consent_log`.
- **Easy Withdrawal of Consent:** Trainees can withdraw tracking consent with zero friction. Revocation immediately suppresses future scheduled follow-up notifications.
- **Differential Privacy & k-Anonymity (n &ge; 5):** On the public policy dashboard, small cell reporting is strictly suppressed (`INSUFFICIENT SAMPLE FOR PRIVACY`) whenever the underlying cohort has fewer than 5 respondents.
- **Data Minimization & Provenance Separation:** Employers verifying employment claims receive only the minimum necessary candidate information (Persistent ID, Reported Role, Joining Month). No Aadhaar, PAN, or full residential addresses are exposed.

---

## 2. Authentication & Authorization (RBAC)

- **Stateless JWT Tokens:** Authentication is secured via short-lived JSON Web Tokens signed with HMAC-SHA256 (`JWT_SECRET`).
- **Cryptographic Password Hashing:** All system, provider, and trainee passwords are salted and hashed using `bcrypt` (10 rounds).
- **Role-Based Access Control (RBAC):** Middleware enforces permissions at every API boundary:
  * `SYSTEM_ADMIN`: Full schema access, audit inspection, connector configuration.
  * `DISTRICT_ADMIN`: District-level aggregated reporting, provider scorecard comparisons, reason breakdown.
  * `PROVIDER`: Scoped strictly to their own enrolled batches (`provider_id = user.provider_id`). Cannot view competitor provider cohorts.
  * `TRAINEE`: Scoped strictly to their own outcome passport and consent log.
  * `EMPLOYER`: Scoped to specific, tokenized verification requests.

---

## 3. Persistent Trainee ID (Anchor of Identity)

- Format: `STI-YYYY-XXXXXX` (e.g., `STI-2026-004281`).
- Principle: **Phone Number is Not Identity.**
- The persistent ID decouples trainee livelihood records from volatile mobile numbers, SIM changes, or migration shifts.
- The ID contains zero PII: no birthdate strings, no Aadhaar digits, no PAN characters.

---

## 4. Employer Verification Token Security

- **Simulated Time-Limited OTPs:** Employer verification requests generate 6-digit cryptographic tokens with 15-minute expiration windows.
- **Attempt Throttling:** Verification tokens enforce maximum attempt limits to resist brute-force exploration.

---

## 5. Auditing & Tamper Resistance

- All sensitive operations (consent grants/revocations, data export requests, employer verification decisions, external integration synchronizations) append to the `audit_events` table.
- Normal administrative accounts do not possess permissions to edit or delete historical audit entries.
