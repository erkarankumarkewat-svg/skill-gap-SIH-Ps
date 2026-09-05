# 5–8 Minute Hackathon Demo Script & Judge Walkthrough

## Target Presentation Duration: 6 Minutes 30 Seconds

### Core Thesis
> **“From counting certificates to measuring livelihoods.”**

---

### Minute 0:00 – 0:45 | The Problem & The Core Position
- **Speaker:** "Existing skilling portals tell us who enrolled, who attended, and who received a certificate. But they cannot answer the hardest question: *Did that training produce a durable livelihood, and can we trust that information?* SkillTrack India is the consent-driven longitudinal outcomes layer for India's skilling ecosystem."
- **Action:** Open application at `http://localhost:3001`. Show the Executive Dashboard. Point out the top KPIs: **750 Certified Trainees**, **71% Verified Placements**, **64% 6-Month Retention**, **₹16,500 Average Verified Wage**.

---

### Minute 0:45 – 1:45 | The Trainee Outcome Passport & DPDP Consent
- **Speaker:** "Every trainee has a persistent platform identity—`STI-2026-004281`—independent of mobile numbers or SIM changes. Notice that no tracking occurs without purpose-specific, versioned consent under the DPDP Act 2023."
- **Action:** Click **[Case 1: Placed & Verified]** in the top DEMO MODE bar.
  * Show Priya Sharma's Passport.
  * Point out the **Consent Active (v2.1)** badge.
  * Walk down the **Immutable Longitudinal Timeline**: Enrolled ➔ Certified ➔ Consent Granted ➔ Outcome Reported ➔ Employer Verified via OTP ➔ 6-Month Retention Confirmed.
  * Highlight the Provenance badge: `EMPLOYER_VERIFIED ✓`.

---

### Minute 1:45 – 3:00 | The Follow-up WhatsApp Bot & Outcome Ingestion
- **Speaker:** "Longitudinal tracking fails if trainees are forced into complex portals. We bring the intake to WhatsApp."
- **Action:** Click **[Follow-up WhatsApp Bot]** on the sidebar.
  * Show the mobile simulator.
  * Demonstrate answering the automated follow-up prompt: *"What is your current livelihood status?"*
  * Click *"1. Working in Formal Job"*.
  * Show that the trainee claim is captured as `SELF_REPORTED` and an employer verification request is immediately staged.

---

### Minute 3:00 – 4:00 | The Employer Verification Portal & The WOW Moment
- **Speaker:** "Now watch the core breakthrough: We never confuse self-reported data with verified evidence."
- **Action:** Click **[Employer OTP Verification]** on the sidebar.
  * Show the simulated Employer Portal for ABC Retail Pvt Ltd.
  * Candidate ID: `STI-2026-004281`. Reported Wage: ₹16,500.
  * Enter OTP: `482910`.
  * Check the skill gap checkboxes for *Advanced Excel* and *Inventory Handling*.
  * Click **[Confirm Employment & Wage]**.
  * **The WOW Moment:** Show how the system immediately converts `SELF_REPORTED` to `EMPLOYER_VERIFIED`, locks in the verified wage record, updates the Skill Gaps aggregate, and ripples into the Executive Dashboard!

---

### Minute 4:00 – 5:15 | Explainable Reason NLP & Edge Cases (Hero Cases 2, 3, 4)
- **Speaker:** "Outcomes are rarely binary. What about trainees who didn't get placed?"
- **Action:** Click **[Explainable Reason NLP]** on the sidebar.
  * Type or click Preset: *"The company is too far from my village and there is no reliable bus."*
  * Click **[Classify Reason]**.
  * Show the explainable output:
    * Standard Code: `TRANSPORTATION_BARRIER` (Category: Mobility).
    * Deterministic Confidence: 92%.
    * Matched concepts: `["commute distance", "lack of transit", "village connectivity"]`.
  * Click **[Case 3: Mobility Barrier]** in the top bar to show Sunita Meena's profile where this exact reason was recorded.
  * Click **[Case 4: Unreachable]** to show Amit Verma, displaying `HIGH Contactability Risk` and triggering the fallback chain: *Primary Mobile ➔ Alternate Contact (Brother) ➔ Field Task*.

---

### Minute 5:15 – 6:15 | Provider Scorecard & Public Policy Dashboard
- **Speaker:** "How do district collectors and state missions evaluate training quality?"
- **Action:** Click **[Provider Scorecard]** on the sidebar.
  * Show the transparent ranking of 12 training providers.
  * Explain the formula: 30% Verified Placement + 25% 6M Retention + 20% 12M Retention + 15% Wage Growth + 10% Response Quality.
  * Click **[Public Policy Dashboard]**.
  * Show district comparisons (Jaipur, Indore, Varanasi).
  * Highlight the small-sample privacy protection on Jaisalmer Remote Cohort: `INSUFFICIENT SAMPLE FOR PRIVACY (n = 3 < 5)` to demonstrate strict data protection compliance.

---

### Minute 6:15 – 7:00 | Government Integrations & Closing
- **Speaker:** "SkillTrack India integrates with Skill India Digital, NCVET, EPFO, Udyam, and e-Shram. It doesn't replace them—it completes them."
- **Action:** Click **[Govt Integration Center]**. Show simulated status badges and trigger a sync.
- **Closing Statement:**
  > **“SkillTrack India shifts skilling policy from counting certificates to measuring livelihoods.”**
