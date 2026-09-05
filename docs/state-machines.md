# State Machines

## 1. Follow-up State Machine

This state machine governs the lifecycle of a scheduled follow-up for a trainee.

```mermaid
stateDiagram-v2
    [*] --> SCHEDULED: Campaign Created
    SCHEDULED --> QUEUED: Time to process
    QUEUED --> SENT: Dispatch to Provider (e.g. WhatsApp)
    QUEUED --> CANCELLED: Trainee revoked consent
    
    SENT --> DELIVERED: Provider confirmation
    SENT --> FAILED: Provider bounce / invalid number
    
    DELIVERED --> RESPONDED: Trainee completes flow
    DELIVERED --> PARTIAL: Trainee drops off
    DELIVERED --> NO_RESPONSE: Timeout (e.g. 7 days)
    
    FAILED --> RETRY: Alternate contact available
    NO_RESPONSE --> RETRY: Escalation strategy
    
    RETRY --> QUEUED
    
    RESPONDED --> [*]
    PARTIAL --> [*]
    CANCELLED --> [*]
```

## 2. Outcome Verification State Machine

This state machine tracks the trustworthiness of a reported employment outcome.

```mermaid
stateDiagram-v2
    [*] --> UNVERIFIED: Initial state
    
    UNVERIFIED --> SELF_REPORTED: Trainee reports outcome
    UNVERIFIED --> SYSTEM_DERIVED: e.g. from EPFO sync
    
    SELF_REPORTED --> PENDING_VERIFICATION: Verification request generated
    
    PENDING_VERIFICATION --> EMPLOYER_VERIFIED: Employer confirms via OTP
    PENDING_VERIFICATION --> REJECTED: Employer explicitly denies
    PENDING_VERIFICATION --> CANNOT_VERIFY: Employer lacks records
    PENDING_VERIFICATION --> EXPIRED: OTP/Request times out
    
    EMPLOYER_VERIFIED --> [*]
    SYSTEM_DERIVED --> [*]
    
    REJECTED --> UNVERIFIED: Needs investigation
    EXPIRED --> SELF_REPORTED: Remains self-reported, unverified
    CANNOT_VERIFY --> SELF_REPORTED: Remains self-reported, unverified
```
