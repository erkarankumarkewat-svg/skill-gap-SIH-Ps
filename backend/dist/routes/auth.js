"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { username },
            include: { role: true, trainee: true }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role.name, provider_id: user.provider_id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
        // AUDIT LOG: Successful authentication
        await db_1.prisma.auditEvent.create({
            data: {
                actor_id: user.id,
                action: 'AUTH_LOGIN',
                resource: `User:${user.id}`,
                metadata: JSON.stringify({ role: user.role.name, username: user.username })
            }
        });
        res.json({
            token,
            role: user.role.name,
            userId: user.id,
            traineeId: user.trainee?.id || null,
            providerId: user.provider_id || null
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/logout', authMiddleware_1.authenticate, async (req, res) => {
    try {
        // AUDIT LOG: Logout
        await db_1.prisma.auditEvent.create({
            data: {
                actor_id: req.user?.id,
                action: 'AUTH_LOGOUT',
                resource: `User:${req.user?.id}`
            }
        });
        res.json({ message: 'Logged out successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/me', authMiddleware_1.authenticate, async (req, res) => {
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            include: { role: true, trainee: true, provider: true }
        });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
