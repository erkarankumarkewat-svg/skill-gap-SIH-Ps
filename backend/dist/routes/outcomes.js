"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const consentMiddleware_1 = require("../middlewares/consentMiddleware");
const router = (0, express_1.Router)();
// Endpoint for a trainee (or admin/authorized provider) to report an outcome
router.post('/:traineeId', authMiddleware_1.authenticate, async (req, res) => {
    try {
        const { traineeId } = req.params;
        const { status, // FORMAL_EMPLOYMENT, SELF_EMPLOYED, APPRENTICESHIP, etc.
        employer_name, role, joining_month, wage_amount, wage_type, business_type, income_range } = req.body;
        // 1. Verify trainee existence and RBAC permissions
        const trainee = await db_1.prisma.trainee.findUnique({
            where: { id: traineeId },
            include: {
                enrolments: {
                    include: {
                        batch: true
                    }
                }
            }
        });
        if (!trainee) {
            return res.status(404).json({ error: 'Trainee not found' });
        }
        const callerRole = req.user?.role;
        if (callerRole === 'TRAINEE') {
            if (trainee.user_id !== req.user?.id) {
                return res.status(403).json({ error: 'Forbidden: Trainees cannot submit outcomes for other trainees' });
            }
        }
        else if (callerRole === 'PROVIDER') {
            const isAssigned = trainee.enrolments.some(e => e.batch.provider_id === req.user?.provider_id);
            if (!isAssigned) {
                return res.status(403).json({ error: 'Forbidden: Provider cannot submit outcomes for trainees outside their batches' });
            }
        }
        else if (callerRole !== 'SYSTEM_ADMIN' && callerRole !== 'DISTRICT_ADMIN') {
            return res.status(403).json({ error: 'Forbidden: Unauthorized role' });
        }
        // 2. PRINCIPLE A: Enforce Consent Validation
        const consentActive = await (0, consentMiddleware_1.hasActiveConsent)(traineeId, 'EMPLOYMENT_OUTCOME_TRACKING');
        if (!consentActive) {
            return res.status(403).json({
                error: 'CONSENT_REQUIRED_OR_REVOKED',
                message: 'No active consent for EMPLOYMENT_OUTCOME_TRACKING found. Process cannot proceed under DPDP Act 2023.'
            });
        }
        // 3. Create the Outcome Event
        const outcomeEvent = await db_1.prisma.outcomeEvent.create({
            data: {
                trainee_id: traineeId,
                status,
                source: 'SELF_REPORTED'
            }
        });
        let employmentRecordId = null;
        // 4. Handle specific outcome types
        if (status === 'FORMAL_EMPLOYMENT' || status === 'APPRENTICESHIP') {
            let employer = null;
            if (employer_name) {
                employer = await db_1.prisma.employer.create({
                    data: { name: employer_name }
                });
            }
            const employment = await db_1.prisma.employmentRecord.create({
                data: {
                    outcome_event_id: outcomeEvent.id,
                    employer_id: employer?.id,
                    role,
                    joining_month,
                    current_status: 'ACTIVE'
                }
            });
            employmentRecordId = employment.id;
        }
        else if (status === 'SELF_EMPLOYED') {
            await db_1.prisma.selfEmploymentRecord.create({
                data: {
                    outcome_event_id: outcomeEvent.id,
                    business_type,
                    income_range
                }
            });
        }
        // 5. Record Wage if provided
        if (wage_amount || income_range) {
            await db_1.prisma.wageRecord.create({
                data: {
                    trainee_id: traineeId,
                    employment_record_id: employmentRecordId,
                    amount: wage_amount ? Number(wage_amount) : null,
                    wage_type: wage_type || 'MONTHLY',
                    verification_status: 'UNVERIFIED'
                }
            });
        }
        // 6. Audit Logging
        await db_1.prisma.auditEvent.create({
            data: {
                actor_id: req.user?.id,
                action: 'OUTCOME_REPORTED',
                resource: `OutcomeEvent:${outcomeEvent.id}`,
                metadata: JSON.stringify({ status, traineeId, source: 'SELF_REPORTED' })
            }
        });
        res.status(201).json({
            message: 'Outcome recorded successfully',
            outcomeEventId: outcomeEvent.id,
            provenance: 'SELF_REPORTED'
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/:traineeId', authMiddleware_1.authenticate, async (req, res) => {
    try {
        const { traineeId } = req.params;
        // RBAC validation
        const trainee = await db_1.prisma.trainee.findUnique({
            where: { id: traineeId },
            include: { enrolments: { include: { batch: true } } }
        });
        if (!trainee)
            return res.status(404).json({ error: 'Trainee not found' });
        if (req.user?.role === 'TRAINEE' && trainee.user_id !== req.user?.id) {
            return res.status(403).json({ error: 'Forbidden: Cannot view outcomes of other trainees' });
        }
        if (req.user?.role === 'PROVIDER') {
            const isAssigned = trainee.enrolments.some(e => e.batch.provider_id === req.user?.provider_id);
            if (!isAssigned) {
                return res.status(403).json({ error: 'Forbidden: Cannot view trainees outside your organization' });
            }
        }
        const outcomes = await db_1.prisma.outcomeEvent.findMany({
            where: { trainee_id: traineeId },
            include: {
                employment_record: { include: { employer: true, verifications: true } },
                self_employment: true
            },
            orderBy: { reported_date: 'desc' }
        });
        res.json(outcomes);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
