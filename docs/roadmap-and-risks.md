# Hackathon Phase 0 Summary: Planning, Roadmap, and Risks

## 1. V1 vs Roadmap Decision

For the 5-8 minute hackathon demo, we must ruthlessly prioritize the **longitudinal outcome story**. 

**In V1 (Hackathon Build):**
- Synthetic data generation (to show scale immediately).
- Mock integration adapters (WhatsApp, EPFO).
- Explainable, rules-based engines for classification and risk scoring (no complex ML to debug).
- Pure RBAC for security.
- Consent implemented as an immutable event ledger.

**Pushed to Roadmap (Post-Hackathon):**
- Real API Setu integration with UIDAI/EPFO.
- Production LLMs for parsing unstructured WhatsApp audio/text.
- Causal-impact statistical modeling.
- True multi-tenant deployment architecture.

## 2. 5-8 Minute Demo Architecture & Script

**The "Wow" Pipeline Flow:**
1. **[0:00] The Passport:** Open Trainee Dashboard. Show `STI-2026-004281` profile. Status: Certified, Currently Unverified.
2. **[1:00] The Consent:** Show the immutable consent ledger for this trainee.
3. **[2:00] The Follow-up:** Trigger the Mock WhatsApp adapter. The UI shows the trainee's phone simulating a response: "I am working at ABC Retail".
4. **[3:30] The Verification:** Generate verification link. Open in incognito as "Employer". Enter OTP. Confirm employment and flag "Excel" as a skill gap.
5. **[5:00] The Ripple Effect (The WOW moment):** 
   - Trainee passport updates to `EMPLOYER-VERIFIED`.
   - Wage timeline updates.
   - Switch to Provider Scorecard: Retention metrics tick up.
   - Switch to District Dashboard: "Excel" jumps up on the "Top Skill Gaps" chart.
6. **[7:00] Public Policy View:** Show aggregated, privacy-safe district stats.

## 3. Technical Risks & Mitigations

| Risk | Mitigation |
| :--- | :--- |
| **Running out of time building CRUD** | Use Prisma/Drizzle for fast DB iteration; focus exclusively on the 'Outcome' vertical slice. |
| **Demo data looks empty/fake** | Build a robust `seed.ts` script that generates 750+ realistic trajectories before the demo. |
| **Live API dependencies fail** | Strictly use Mock Providers; no external network calls required for the core demo. |
| **Analytics queries are too slow** | Since it's a prototype with <10k rows, on-the-fly SQL aggregation is perfectly fine. No need for complex ETL. |
| **Judges think it's just a form** | Emphasize the *state changes* and *provenance* (Self-Reported -> Verified) visually. |

## 4. Phase 0 Stop Condition Met
All research, architecture, schema, state machines, API contracts, and demo plans are documented. Ready for Phase 1: Foundation.
