"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = {
            id: payload.id,
            role: payload.role,
            provider_id: payload.provider_id
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient role' });
        }
        next();
    };
};
exports.requireRole = requireRole;
