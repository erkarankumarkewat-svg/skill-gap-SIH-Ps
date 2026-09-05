"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// GET /api/v1/audit - Retrieve system audit trail (SYSTEM_ADMIN and DISTRICT_ADMIN only)
router.get('/', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['SYSTEM_ADMIN', 'DISTRICT_ADMIN']), async (req, res) => {
    try {
        const logs = await db_1.prisma.auditEvent.findMany({
            include: {
                actor: {
                    select: {
                        id: true,
                        username: true,
                        role: { select: { name: true } }
                    }
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
