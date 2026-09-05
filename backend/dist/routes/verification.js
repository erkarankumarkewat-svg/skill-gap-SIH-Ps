"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Generate an employer verification request (Mocking OTP generation)
router.post('/request/:employmentRecordId', authMiddleware_1.authenticate, async (req, res) => {
    try {
        const { employmentRecordId } = req.params;
        const employment = await db_1.prisma.employmentRecord.findUnique({
            where: { id: employmentRecordId }
        });
        if (!employment || !employment.employer_id) {
            return res.status(400).json({ error: 'Invalid employment record or no employer attached' });
        }
        const verification = await db_1.prisma.employerVerification.create({
            data: {
                employment_record_id: employmentRecordId,
                employer_id: employment.employer_id,
                status: 'PENDING'
            }
        });
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);
        await db_1.prisma.verificationToken.create({
            data: {
                verification_id: verification.id,
                token: otp,
                expires_at: expiresAt
            }
        });
        // For Hackathon Demo purposes, we return the OTP in the response
        // In production, this would be dispatched via SMS/Email to the employer
        res.json({ message: 'Verification requested', verificationId: verification.id, demo_otp: otp });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Employer confirms the outcome via OTP
router.post('/confirm', async (req, res) => {
    try {
        const { verificationId, otp, status, skill_gaps } = req.body;
        // status: CONFIRMED, REJECTED, CANNOT_VERIFY
        const tokenRecord = await db_1.prisma.verificationToken.findFirst({
            where: { verification_id: verificationId, token: otp },
            orderBy: { expires_at: 'desc' }
        });
        if (!tokenRecord) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        if (tokenRecord.expires_at < new Date()) {
            return res.status(400).json({ error: 'OTP expired' });
        }
        // Update Verification State
        await db_1.prisma.employerVerification.update({
            where: { id: verificationId },
            data: {
                status: status || 'CONFIRMED',
                verification_date: new Date()
            }
        });
        // If confirmed, update WageRecords as verified
        if (status === 'CONFIRMED') {
            const v = await db_1.prisma.employerVerification.findUnique({ where: { id: verificationId } });
            if (v) {
                await db_1.prisma.wageRecord.updateMany({
                    where: { employment_record_id: v.employment_record_id },
                    data: { verification_status: 'VERIFIED' }
                });
                // Update OutcomeEvent provenance
                const emp = await db_1.prisma.employmentRecord.findUnique({ where: { id: v.employment_record_id } });
                if (emp) {
                    await db_1.prisma.outcomeEvent.update({
                        where: { id: emp.outcome_event_id },
                        data: { source: 'EMPLOYER_VERIFIED' }
                    });
                }
            }
        }
        // Handle Skill Gaps (Demo logic)
        if (skill_gaps && Array.isArray(skill_gaps)) {
            for (const skillName of skill_gaps) {
                const skill = await db_1.prisma.skillTag.upsert({
                    where: { name: skillName },
                    update: {},
                    create: { name: skillName }
                });
                await db_1.prisma.employerSkillFeedback.create({
                    data: {
                        verification_id: verificationId,
                        skill_id: skill.id,
                        deficiency_flag: true
                    }
                });
            }
        }
        res.json({ message: 'Verification processed successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
