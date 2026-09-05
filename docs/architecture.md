# Architecture Documents

## 1. System Architecture

SkillTrack India acts as an outcome intelligence layer, not a replacement for operational skilling systems.

**Key Components:**
- **Frontend (SPA):** React + TypeScript + Tailwind CSS. Role-based views for Trainees, Providers, District Admins, and Employers.
- **Backend API:** Node.js + Express + TypeScript. Handles business logic, RBAC, and data validation.
- **Database:** PostgreSQL accessed via Prisma/Drizzle ORM.
- **Background Jobs (Simulated for V1):** Follow-up engine scheduler, analytics aggregator.
- **Integration Adapters:** Simulated interfaces for external government and messaging APIs.

## 2. Integration Architecture

All external interactions pass through the **Government Integration Center** adapters:
- `ISkillIndiaAdapter`
- `IEPFOAdapter`
- `IUdyamAdapter`
- `INotificationProvider`

Each adapter implements a standard interface and supports modes: `LIVE`, `SIMULATED`, `NOT_CONFIGURED`, `UNAVAILABLE`. For the hackathon, we use simulated adapters that return synthetic data matching expected API contracts.

## 3. Security Architecture

- **Authentication:** JWT-based stateless authentication with short-lived access tokens and refresh tokens.
- **Authorization:** Strict RBAC enforced via middleware. (e.g., `requireRole(['DISTRICT_ADMIN', 'SYSTEM_ADMIN'])`).
- **Data Segregation:** Providers can only query `providerId = user.providerId`. Trainees can only query `traineeId = user.traineeId`.
- **Secrets Management:** Environment variables only. No sensitive keys in the codebase or frontend.
- **Audit Logging:** All sensitive read/write actions append to the `audit_events` table.

## 4. Consent Architecture

Consent is treated as an append-only ledger, mapping to the DPDP Act 2023.

- **No boolean flags:** We do not use `is_consented = true`.
- **Purpose-Specific:** Consent is granted for specific purposes (e.g., `EMPLOYMENT_OUTCOME_TRACKING`).
- **Versioned:** We track the exact notice version the user agreed to.
- **Immutable:** A withdrawal creates a *new* event (`action: REVOKED`), it does not delete the `GRANTED` event.
- **Evaluation:** Any system action requiring consent queries the *latest* consent event for that user and purpose to check if it is `GRANTED`.

## 5. Analytics Pipeline

- **Transactional DB:** Stores normalized event data (outcomes, wages, verifications).
- **Materialized Views / Aggregation Queries:** For V1, complex analytics (retention, wage progression, skill gaps) are calculated via optimized SQL aggregations or Prisma/Drizzle queries on the fly, cached if necessary.
- **Small-Sample Suppression:** Analytics endpoints inspect the sample size (`n`). If `n < MIN_SAMPLE_THRESHOLD` (e.g., 5), the endpoint returns a specific flag (`INSUFFICIENT_SAMPLE`) to prevent privacy leaks on the public dashboard.
