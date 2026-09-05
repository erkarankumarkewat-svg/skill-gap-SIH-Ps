"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// GET /api/v1/trainees - List trainees (filtered by role)
router.get('/', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['SYSTEM_ADMIN', 'DISTRICT_ADMIN', 'PROVIDER']), async (req, res) => {
    try {
        const where = {};
        if (req.user?.role === 'PROVIDER') {
            where.enrolments = {
                some: {
                    batch: { provider_id: req.user.provider_id }
                }
            };
        }
        const trainees = await db_1.prisma.trainee.findMany({
            where,
            include: {
                enrolments: {
                    include: {
                        batch: {
                            include: { course: true, provider: true }
                        },
                        certification: true
                    }
                },
                contact_points: true
            },
            take: 100
        });
        res.json(trainees);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/v1/trainees - Create trainee
router.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['SYSTEM_ADMIN', 'PROVIDER']), async (req, res) => {
    try {
        const { first_name, last_name, persistent_id, user_id, gender, date_of_birth } = req.body;
        const newTrainee = await db_1.prisma.trainee.create({
            data: {
                first_name,
                last_name,
                persistent_id,
                user_id,
                gender,
                date_of_birth: date_of_birth ? new Date(date_of_birth) : null
            }
        });
        await db_1.prisma.auditEvent.create({
            data: {
                actor_id: req.user?.id,
                action: 'TRAINEE_CREATED',
                resource: `Trainee:${newTrainee.id}`
            }
        });
        res.status(201).json(newTrainee);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// GET /api/v1/trainees/:id - Get detailed Trainee Outcome Passport
router.get('/:id', authMiddleware_1.authenticate, async (req, res) => {
    try {
        const trainee = await db_1.prisma.trainee.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { id: true, username: true, role: true } },
                enrolments: {
                    include: {
                        batch: { include: { course: true, provider: true } },
                        certification: true
                    }
                },
                consent_log: {
                    include: { purpose: true },
                    orderBy: { timestamp: 'desc' }
                },
                outcome_events: {
                    include: {
                        employment_record: {
                            include: {
                                employer: true,
                                verifications: { include: { employer: true, skill_feedbacks: { include: { skill: true } } } },
                                attrition_events: { include: { reason_code: true } }
                            }
                        },
                        self_employment: true
                    },
                    orderBy: { reported_date: 'desc' }
                },
                wage_records: { orderBy: { recorded_date: 'desc' } },
                contact_points: true,
                alternate_contacts: true,
                contactability_events: { orderBy: { date: 'desc' } }
            }
        });
        if (!trainee)
            return res.status(404).json({ error: 'Trainee not found' });
        // STRICT RBAC VALIDATION
        const callerRole = req.user?.role;
        if (callerRole === 'TRAINEE') {
            if (trainee.user_id !== req.user?.id) {
                return res.status(403).json({ error: 'Forbidden: Trainees cannot inspect other trainees profiles' });
            }
        }
        else if (callerRole === 'PROVIDER') {
            const isEnrolledInProvider = trainee.enrolments.some(e => e.batch.provider_id === req.user?.provider_id);
            if (!isEnrolledInProvider) {
                return res.status(403).json({ error: 'Forbidden: Cannot access trainee records outside your provider organization' });
            }
        }
        else if (callerRole === 'EMPLOYER') {
            return res.status(403).json({ error: 'Forbidden: Employers may only access tokenized verification requests' });
        }
        else if (callerRole !== 'SYSTEM_ADMIN' && callerRole !== 'DISTRICT_ADMIN') {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        // AUDIT LOG: Trainee record access
        await db_1.prisma.auditEvent.create({
            data: {
                actor_id: req.user?.id,
                action: 'TRAINEE_RECORD_ACCESS',
                resource: `Trainee:${trainee.id}`,
                metadata: JSON.stringify({ persistent_id: trainee.persistent_id, accessedByRole: callerRole })
            }
        });
        res.json(trainee);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// GET /api/v1/trainees/:id/timeline - Longitudinal Timeline
router.get('/:id/timeline', authMiddleware_1.authenticate, async (req, res) => {
    try {
        const trainee = await db_1.prisma.trainee.findUnique({
            where: { id: req.params.id },
            include: {
                enrolments: { include: { batch: { include: { course: true, provider: true } }, certification: true } },
                consent_log: { include: { purpose: true }, orderBy: { timestamp: 'asc' } },
                outcome_events: { include: { employment_record: { include: { employer: true, verifications: true } } }, orderBy: { reported_date: 'asc' } }
            }
        });
        if (!trainee)
            return res.status(404).json({ error: 'Trainee not found' });
        // Format into chronological events
        const timeline = [];
        // Enrolments
        for (const enr of trainee.enrolments) {
            timeline.push({
                type: 'ENROLMENT',
                date: enr.enrollment_date,
                title: `Enrolled in ${enr.batch.course.name}`,
                meta: `Provider: ${enr.batch.provider.name} • Batch ID: ${enr.batch_id}`
            });
            if (enr.certification) {
                timeline.push({
                    type: 'CERTIFICATION',
                    date: enr.certification.issue_date,
                    title: `Certified NSQF Level ${enr.batch.course.nsqf_level || '4'}`,
                    meta: `Certificate No: ${enr.certification.certificate_number}`
                });
            }
        }
        // Consents
        for (const c of trainee.consent_log) {
            timeline.push({
                type: 'CONSENT',
                date: c.timestamp,
                title: `Consent ${c.action} (${c.purpose.code})`,
                meta: `Notice ${c.notice_version} via ${c.channel}`
            });
        }
        // Outcomes
        for (const o of trainee.outcome_events) {
            timeline.push({
                type: 'OUTCOME',
                date: o.reported_date,
                title: `Livelihood Outcome: ${o.status.replace(/_/g, ' ')}`,
                meta: `Source: ${o.source} • Role: ${o.employment_record?.role || 'N/A'}`
            });
            if (o.employment_record?.verifications) {
                for (const v of o.employment_record.verifications) {
                    if (v.status === 'CONFIRMED') {
                        timeline.push({
                            type: 'VERIFICATION',
                            date: v.verification_date || o.reported_date,
                            title: 'Employer Verified via OTP ✓',
                            meta: `Confirmed by employer. Provenance upgraded to EMPLOYER_VERIFIED.`
                        });
                    }
                }
            }
        }
        // Sort chronologically
        timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        res.json({
            traineeId: trainee.id,
            persistentId: trainee.persistent_id,
            name: `${trainee.first_name} ${trainee.last_name}`,
            timeline
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
