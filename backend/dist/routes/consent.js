"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/:traineeId', authMiddleware_1.authenticate, async (req, res) => {
    try {
        const logs = await db_1.prisma.consentLog.findMany({
            where: { trainee_id: req.params.traineeId },
            include: { purpose: true },
            orderBy: { timestamp: 'desc' }
        });
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/:traineeId', authMiddleware_1.authenticate, async (req, res) => {
    try {
        const { purpose_code, action, notice_version, channel } = req.body;
        const purpose = await db_1.prisma.consentPurpose.findUnique({ where: { code: purpose_code } });
        if (!purpose)
            return res.status(400).json({ error: 'Invalid purpose code' });
        // In a real app, generate proper hashes for immutability
        const previousEvent = await db_1.prisma.consentLog.findFirst({
            where: { trainee_id: req.params.traineeId, purpose_id: purpose.id },
            orderBy: { timestamp: 'desc' }
        });
        const newLog = await db_1.prisma.consentLog.create({
            data: {
                trainee_id: req.params.traineeId,
                purpose_id: purpose.id,
                action,
                notice_version,
                channel,
                actor_id: req.user?.id,
                previous_event_hash: previousEvent ? previousEvent.current_event_hash : null,
                current_event_hash: Math.random().toString(36).substring(7) // Mock hash for V1
            }
        });
        await db_1.prisma.auditEvent.create({
            data: {
                actor_id: req.user?.id,
                action: 'CONSENT_' + action,
                resource: 'ConsentLog:' + newLog.id
            }
        });
        res.json(newLog);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
