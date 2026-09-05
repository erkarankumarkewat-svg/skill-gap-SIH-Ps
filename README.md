# SkillTrack India 🇮🇳

> **“From counting certificates to measuring livelihoods.”**  
> *A consent-driven longitudinal skilling outcomes and livelihood intelligence layer for India's skilling ecosystem.*  
> **Smart India Hackathon (SIH) — Production-Credible Prototype**

---

## 📌 Executive Overview

Existing skilling portals answer *who enrolled, who attended, and who got certified*. SkillTrack India is the missing longitudinal intelligence layer that answers:

> **“What happened to a trainee after training, and can we trust that information?”**

### Core Highlights
- **Consent-First Architecture:** DPDP Act 2023 compliant, purpose-specific, append-only immutable consent ledger with live revocation enforcement.
- **Evidence Provenance:** Clear separation between `SELF_REPORTED`, `EMPLOYER_VERIFIED`, and `SYSTEM_DERIVED`.
- **Persistent Trainee ID:** `STI-YYYY-XXXXXX` decoupling identity from volatile mobile phone numbers.
- **Explainable NLP Reason Classifier:** Deterministic natural language categorization of non-placement and attrition reasons with auditable confidence scores.
- **Longitudinal Durability:** Dynamic tracking of 3M, 6M, 9M, and 12M livelihood retention curves and wage trajectories.
- **Small-Sample Privacy Guard:** Automatic differential privacy suppression (`INSUFFICIENT SAMPLE FOR PRIVACY`) for small cells ($n < 5$).
- **Government Integration Center:** Pre-built adapters for Skill India Digital, NCVET, EPFO, Udyam, e-Shram, and NCS.

---

## 🛠️ Prerequisites

- **Node.js**: v18.x, v20.x, or later
- **npm**: v9.x or later
- **Operating System**: Windows / macOS / Linux (Fully cross-platform)
- **Database**: SQLite (default, zero-dependency) or PostgreSQL 14+

---

## 🌐 Live Production Deployment Guide

The application is structured as a **single-service deployable monolith** (Node/Express backend serving both the REST API and the responsive single-page application from `public/`).

### Production Build & Start Commands
- **Build Command:** `npm run build`
- **Setup Command (Schema push & Seed):** `npm run deploy:setup`
- **Production Start Command:** `npm start`
- **Health Check Endpoint:** `/api/health` or `/health`

---

### Option A: Deploy on Render (Web Service)

1. Connect your GitHub repository to [Render](https://render.com).
2. Create a new **Web Service** with the following settings:
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build && npm run deploy:setup`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
3. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render default)
   - `JWT_SECRET`: `[generate strong 64-char string]`
   - `DATABASE_URL`: `file:./dev.db` (or attach a Render PostgreSQL database and set `postgresql://...`)
   - `CORS_ORIGIN`: `*`

---

### Option B: Deploy on Railway / Fly.io

1. Create a project on [Railway](https://railway.app).
2. Attach a **PostgreSQL** plugin. Railway automatically sets `DATABASE_URL`.
3. Set the service settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build && npm run deploy:setup`
   - **Start Command:** `npm start`
4. The `deploy:setup` script automatically detects the PostgreSQL URL and compiles the PostgreSQL Prisma client!

---

### Option C: Deploy with Docker Compose (PostgreSQL + API)

```bash
cd backend
docker compose up -d
npm run deploy:setup
npm run build
npm start
```

---

## 🚀 Local Development Quickstart

### 1. Clone & Enter Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database & Seed 750+ Cohort Data
```bash
npm run deploy:setup
```

### 4. Start Local Development Server
```bash
npm run dev
```

### 5. Access Interactive Web Interface
Open your browser and navigate to:
```
http://localhost:3001
```

---

## ⚙️ Environment Variables Reference

See [`.env.example`](file:///C:/Users/kewat/.gemini/antigravity/scratch/skilltrack-india/.env.example) for the full configuration template:

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | No | `development` | Runtime mode (`production` or `development`) |
| `PORT` | No | `3001` | Port number for HTTP server |
| `DATABASE_URL` | Yes | `file:./dev.db` | Prisma database connection string (SQLite or PostgreSQL) |
| `JWT_SECRET` | Yes | Generated | Cryptographic HMAC secret for signing stateless JWTs |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins (wildcard or comma-separated domains) |

---

## 🔑 Demo Accounts & Pre-configured Credentials

All accounts share the default demo password: `admin123`

| Role | Username | Password | Purpose / Scope |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin` | `admin123` | Full administrative control, connector management, audit log inspection |
| **District Admin** | `district_jaipur` | `admin123` | District-level aggregated reporting, provider scorecard comparisons |
| **Training Provider** | `provider_1` | `admin123` | Apex Skilling Academy dashboard, batch outcomes, trainee tracking |
| **Trainee (Hero Case 1)** | `priya_sharma` | `admin123` | Trainee Outcome Passport, consent log, wage progression |
| **Trainee (Hero Case 2)** | `ramesh_kumar` | `admin123` | Self-employed Solar Technician micro-enterprise journey |
| **Trainee (Hero Case 3)** | `sunita_meena` | `admin123` | Attrition case due to transportation barriers & transit gaps |
| **Trainee (Hero Case 4)** | `amit_verma` | `admin123` | Unreachable trainee with contactability risk & fallback chain |
| **Trainee (Hero Case 5)** | `vikram_singh` | `admin123` | Employer skill-gap feedback case (Advanced Excel & Inventory) |

> 💡 **Hackathon Tip:** The top DEMO MODE bar allows instant one-click switching between all 5 Hero Cases without manually typing credentials.

---

## 🧪 Testing Verification

Run the automated integration test suites:

```bash
cd backend

# Complete Master Prompt Audit & RBAC / Consent test
npx ts-node test-audit-e2e.ts

# Longitudinal Outcome Engine & Verification test
npx ts-node test-phase2.ts

# Analytics, Explainable NLP Classifier & Privacy test
npx ts-node test-phase3.ts
```

---

## 📁 Repository Structure

```text
skilltrack-india/
├── README.md                           # Master documentation & deployment guide
├── GAP_REPORT.md                       # Comprehensive Master Prompt gap analysis
├── SKILLTRACK_INDIA_PROJECT_REPORT.txt # Detailed project report
├── .env.example                        # Production environment variables template
│
├── docs/                               # Engineering Specifications
│   ├── research.md                     # Indian skilling ecosystem, tracer studies, DPDP review
│   ├── architecture.md                 # System, integration, security & consent architecture
│   ├── data-model.md                   # Database schema & entity models
│   ├── api.md                          # REST API blueprint (endpoints, parameters, responses)
│   ├── state-machines.md               # Follow-up & outcome verification state diagrams
│   ├── roadmap-and-risks.md            # V1 scope vs post-hackathon roadmap & mitigations
│   ├── security.md                     # DPDP compliance, RBAC, k-anonymity & token security
│   ├── integrations.md                 # Govt connector specifications (SID, EPFO, Udyam, etc.)
│   └── demo-script.md                  # 5-8 minute presentation walkthrough for judges
│
└── backend/                            # Server & Frontend Application
    ├── .env.example                    # Environment template
    ├── docker-compose.yml              # Local PostgreSQL container service
    ├── package.json                    # Scripts & dependencies
    ├── tsconfig.json                   # TypeScript build config
    │
    ├── scripts/                        # Cross-platform deployment utilities
    │   ├── deploy-setup.js             # Automated schema detection, db push & seed
    │   └── switch-db.js                # Dual-engine switch (postgres vs sqlite)
    │
    ├── prisma/
    │   ├── schema.prisma               # Active Prisma schema
    │   ├── schema.postgresql.prisma    # Production PostgreSQL definition
    │   ├── schema.sqlite.prisma        # Local SQLite definition
    │   ├── dev.db                      # Local database
    │   └── seed.ts                     # Deterministic 750+ cohort seed generator
    │
    ├── public/
    │   └── index.html                  # Full interactive Single-Page Application (Frontend)
    │
    ├── src/
    │   ├── index.ts                    # Express server with /api/health & SPA fallback
    │   ├── db.ts                       # Prisma client singleton
    │   ├── middlewares/                # JWT auth, RBAC, and active consent checkers
    │   └── routes/                     # REST API route controllers
    │
    └── test-audit-e2e.ts               # Master audit test suite (22/22 tests passing)
```

---

## ⚖️ License & Ethical Declaration

Built for the **Smart India Hackathon**. Designed strictly with synthetic, pseudonymized data. No live personal Aadhaar, PAN, or confidential bank details are stored or processed.
