# Database ER Model (PostgreSQL)

*Note: This is a high-level logical model.*

## 1. Identity & Access
- **`users`**: id, username/email, password_hash, role_id, created_at, updated_at, active
- **`roles`**: id, name (TRAINEE, PROVIDER, DISTRICT_ADMIN, etc.)
- **`trainees`**: id, persistent_id (STI-YYYY-XXXXXX), user_id, first_name, last_name, date_of_birth, gender

## 2. Training
- **`providers`**: id, name, location, contact_info
- **`courses`**: id, name, nsqf_level, sector
- **`batches`**: id, provider_id, course_id, start_date, end_date
- **`training_enrolments`**: id, trainee_id, batch_id, status, enrollment_date
- **`certification_records`**: id, enrolment_id, issue_date, certificate_number

## 3. Contactability
- **`contact_points`**: id, trainee_id, type (MOBILE, WHATSAPP, EMAIL), value, is_primary, verified_date
- **`alternate_contacts`**: id, trainee_id, relation, contact_value
- **`contactability_events`**: id, trainee_id, event_type (BOUNCE, REACHED, STALE), date

## 4. Consent (Ledger)
- **`consent_purposes`**: id, code, description
- **`consent_log`**: id, trainee_id, purpose_id, action (GRANTED, REVOKED), notice_version, timestamp, channel, actor_id, previous_event_hash, current_event_hash

## 5. Outcomes & Employment
- **`outcome_events`**: id, trainee_id, status (FORMAL_EMPLOYMENT, SELF_EMPLOYED, etc.), source (SELF, EMPLOYER, SYSTEM), reported_date
- **`employment_records`**: id, outcome_event_id, employer_id, role, joining_month, current_status
- **`self_employment_records`**: id, outcome_event_id, business_type, income_range_id, location
- **`attrition_events`**: id, employment_record_id, exit_date, reason_code_id

## 6. Employers & Verification
- **`employers`**: id, name, industry, registry_id (optional)
- **`employer_verifications`**: id, employment_record_id, employer_id, status (PENDING, CONFIRMED, REJECTED, CANNOT_VERIFY), verification_date
- **`verification_tokens`**: id, verification_id, token, expires_at, attempts

## 7. Wages
- **`wage_records`**: id, trainee_id, employment_record_id, amount, wage_type (MONTHLY, STIPEND, RANGE), recorded_date, verification_status

## 8. Follow-up Engine
- **`follow_up_campaigns`**: id, name, target_cohort, scheduled_date
- **`follow_ups`**: id, campaign_id, trainee_id, status (SCHEDULED, SENT, RESPONDED), interval_months (3, 6, 9, 12)
- **`follow_up_responses`**: id, follow_up_id, raw_response, mapped_outcome_id

## 9. Intelligence
- **`reason_codes`**: id, category (SKILLS, MOBILITY, etc.), code
- **`skill_tags`**: id, name
- **`course_skill_tags`**: course_id, skill_id
- **`employer_skill_feedback`**: id, verification_id, skill_id, deficiency_flag

## 10. System
- **`audit_events`**: id, actor_id, action, resource, timestamp, metadata
- **`integration_sync_events`**: id, integration_name, status, records_processed, timestamp
