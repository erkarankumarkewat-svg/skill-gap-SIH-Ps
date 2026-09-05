"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const trainees_1 = __importDefault(require("./routes/trainees"));
const consent_1 = __importDefault(require("./routes/consent"));
const providers_1 = __importDefault(require("./routes/providers"));
const outcomes_1 = __importDefault(require("./routes/outcomes"));
const verification_1 = __importDefault(require("./routes/verification"));
const followups_1 = __importDefault(require("./routes/followups"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const integrations_1 = __importDefault(require("./routes/integrations"));
const audit_1 = __importDefault(require("./routes/audit"));
const db_1 = require("./db");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
const nodeEnv = process.env.NODE_ENV || 'development';
// 1. CORS Configuration (Configurable for production domains)
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : '*';
app.use((0, cors_1.default)({
    origin: allowedOrigins === '*' ? true : allowedOrigins,
    credentials: true
}));
app.use(express_1.default.json());
// 2. Static Frontend Assets Serving (Supports Monolith Single-Service Deployments)
const publicDir = path_1.default.resolve(__dirname, '../public');
const cwdPublicDir = path_1.default.resolve(process.cwd(), 'public');
app.use(express_1.default.static(publicDir));
app.use(express_1.default.static(cwdPublicDir));
// 3. Health Check Endpoints (Complies with /api/health, /health, /api/v1/health standards)
const healthHandler = async (req, res) => {
    let dbStatus = 'healthy';
    try {
        await db_1.prisma.$queryRaw `SELECT 1`;
    }
    catch (err) {
        dbStatus = 'unreachable';
    }
    const isHealthy = dbStatus === 'healthy';
    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'degraded',
        service: 'skilltrack-india-api',
        version: '1.0.0',
        environment: nodeEnv,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        database: dbStatus
    });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get('/api/v1/health', healthHandler);
// 4. REST API Routing
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/trainees', trainees_1.default);
app.use('/api/v1/consent', consent_1.default);
app.use('/api/v1/providers', providers_1.default);
app.use('/api/v1/outcomes', outcomes_1.default);
app.use('/api/v1/verification', verification_1.default);
app.use('/api/v1/follow-ups', followups_1.default);
app.use('/api/v1/analytics', analytics_1.default);
app.use('/api/v1/integrations', integrations_1.default);
app.use('/api/v1/audit', audit_1.default);
// 5. SPA Fallback (Non-API requests serve index.html for client routing)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found', path: req.path });
    }
    const indexPath = path_1.default.resolve(publicDir, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            const fallbackPath = path_1.default.resolve(cwdPublicDir, 'index.html');
            res.sendFile(fallbackPath, (fallbackErr) => {
                if (fallbackErr)
                    next();
            });
        }
    });
});
// 6. Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Unhandled Server Error]:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: nodeEnv === 'production' ? 'An unexpected error occurred' : err.message
    });
});
// 7. Start Server (No localhost binding in logs)
const server = app.listen(Number(port), '0.0.0.0', () => {
    console.log(`[SkillTrack India] Server active on port ${port} (Environment: ${nodeEnv})`);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
        await db_1.prisma.$disconnect();
        process.exit(0);
    });
});
exports.default = app;
