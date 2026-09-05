# Research Brief: Indian Skilling Ecosystem & Tracer Studies

## 1. Indian Ecosystem Integration Points

| System | Purpose | Relevant Data | Publicly Documented Integration | API/Sandbox Availability | Limitations | Appropriate Role in Architecture |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Skill India Digital (SID)** | Unified skilling platform | Trainee profiles, training lifecycle, certification status | Yes (via NCDC / API Setu) | Limited public sandbox for hackers | Often requires extensive KYC and institutional onboarding | Identity linkage and training verification source |
| **NCVET** | Qualifications registry | Course metadata, NSQF levels, job roles | Yes (National Qualification Register) | Public portal, limited open API | Primarily metadata, not transactional | Course and job role taxonomy source |
| **PMKVY** | Flagship skilling scheme | Scheme enrollment, batch data | Yes (often integrated via SID/NSDC) | Restricted access | Scheme-specific, data silos | Historical training context source |
| **EPFO** | Provident Fund | Formal employment contributions, wage indicators | Yes (via API Setu for specific use cases) | Highly restricted (needs UAN + Consent) | Only covers formal sector (>20 employees usually) | Golden source for formal employment & wage verification |
| **Udyam** | MSME Registration | Enterprise registration, business classification | Yes | Restricted (Verification APIs exist) | Excludes informal/micro businesses without registration | Validation source for formal self-employment |
| **e-Shram** | Unorganized worker database | Occupational details, migration status, skills | Proposed/Partial | Restricted | Data can be self-reported, freshness varies | Broad indicator of informal sector participation |
| **NCS (National Career Service)** | Job portal | Job postings, labor market demand | Yes | Available with partner registration | Varies by region, adoption rates differ | Labor market signaling and demand mapping |

## 2. Tracer Studies

Credible international tracer studies (e.g., ILO, World Bank) emphasize the following best practices:
- **Timing:** Baselines at enrollment, immediate follow-up at graduation, then 3, 6, and 12-month intervals.
- **Indicators:** Employment status, income/wage, job relevance to training, and job satisfaction.
- **Identifiers:** Use of persistent pseudonymous identifiers to track individuals longitudinally across surveys and administrative data.
- **Reasons:** Capturing nuanced reasons for unemployment (e.g., caregiving, mismatch, mobility) rather than binary employed/unemployed.
- **Response Management:** Multi-channel outreach (SMS, Phone, WhatsApp, Field) is critical to combat attrition.

## 3. Messaging Providers

- **Twilio:** Global standard, highly reliable, robust API, slightly higher cost for Indian WhatsApp/SMS.
- **Gupshup:** Deep Indian market penetration, strong WhatsApp Business API support, preferred for local deployments.
- **Mock Provider:** Essential for local hackathon development and testing without incurring costs or relying on external network conditions.

## 4. Data Protection (DPDP Act 2023 Translation)

- **Consent:** Must be explicit, clear, and purpose-specific. We implement *versioned, event-based consent records*.
- **Notice:** Users must know what is collected and why. We implement *purpose text snapshots* in the consent ledger.
- **Withdrawal:** Must be as easy to withdraw as it is to give. We implement an *append-only revocation action*.
- **Minimization:** Only collect what is needed. We enforce *RBAC* and mask PII for district admins.
- **Accountability:** We implement a comprehensive *Audit Log* for all data access and modifications.

---

## 5. Verified Source Table

| System | Relevant Signal | Verified Public Capability | What we demo | Future Integration |
| :--- | :--- | :--- | :--- | :--- |
| SID | Certification | SID provides trainee & cert data | Mock SID Adapter | Real API Setu integration |
| EPFO | Formal Employment | UAN verification exists | Mock EPFO Adapter | UAN-based verification |
| Udyam | Self-Employment | Udyam verification API exists | Mock Udyam Adapter | Udyam Number verification |
| Gupshup | Follow-up Comms | WhatsApp Business API | Mock WhatsApp Provider | Live WhatsApp Bot |

---

## 6. CLAIMS WE MUST NOT MAKE (Unverified Claims)

- We must **not** claim we are directly accessing live Aadhaar, PAN, or UAN data.
- We must **not** claim our AI is a "machine learning predictive model" (we will clearly label it an explainable rules-based risk score).
- We must **not** claim we have live production access to EPFO/e-Shram databases (we will explicitly mark these as "Simulated" integrations).
- We must **not** claim our system automatically signs users up for government schemes.
