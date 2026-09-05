# API Blueprint

Base URL: `/api/v1`

## Authentication & Authorization
- `POST /auth/login` - Authenticate and receive JWT
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile and permissions

## Trainees (Trainee Passport)
- `GET /trainees` - List trainees (paginated, filtered by RBAC)
- `GET /trainees/:id` - Get detailed profile (Persistent ID: STI-YYYY-XXXXXX)
- `GET /trainees/:id/timeline` - Get longitudinal outcome timeline

## Consent Ledger
- `GET /consent/:traineeId` - Get consent timeline and current state
- `POST /consent/:traineeId` - Append new consent event (GRANT/REVOKE)

## Training & Providers
- `GET /providers` - List providers
- `GET /providers/:id/scorecard` - Get calculated provider metrics
- `GET /courses` - List courses

## Follow-ups Engine
- `GET /follow-ups/campaigns` - List campaigns
- `POST /follow-ups/trigger` - Force trigger a follow-up for a trainee (Demo use)
- `POST /follow-ups/webhook` - Receive mock WhatsApp responses

## Outcomes & Verification
- `POST /outcomes` - Report an outcome (Self-reported)
- `GET /outcomes/:traineeId` - List outcome history
- `POST /verification/request` - Generate an employer verification request
- `POST /verification/confirm` - Employer confirms outcome via OTP

## Analytics & Intelligence (Dashboard)
- `GET /analytics/funnel` - Outcome funnel stats
- `GET /analytics/retention` - 3M, 6M, 12M retention rates
- `GET /analytics/wages` - Wage progression statistics
- `GET /analytics/skill-gaps` - Top employer-reported skill deficiencies
- `GET /analytics/attrition-reasons` - Breakdown of non-placement reasons

## Integrations
- `GET /integrations/status` - List active connectors and sync status
- `POST /integrations/:connector/sync` - Trigger a mock sync event

## Audit
- `GET /audit` - System-wide audit log (System Admin only)
