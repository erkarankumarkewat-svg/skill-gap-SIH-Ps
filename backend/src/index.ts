import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import traineeRoutes from './routes/trainees';
import consentRoutes from './routes/consent';
import providerRoutes from './routes/providers';
import outcomeRoutes from './routes/outcomes';
import verificationRoutes from './routes/verification';
import followUpRoutes from './routes/followups';
import analyticsRoutes from './routes/analytics';
import integrationRoutes from './routes/integrations';
import auditRoutes from './routes/audit';
import { prisma } from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const nodeEnv = process.env.NODE_ENV || 'development';

// 1. CORS Configuration (Configurable for production domains)
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : '*';
app.use(cors({
  origin: allowedOrigins === '*' ? true : allowedOrigins,
  credentials: true
}));

app.use(express.json());

// 2. Static Frontend Assets Serving (Supports Monolith Single-Service Deployments)
const publicDir = path.resolve(__dirname, '../public');
const cwdPublicDir = path.resolve(process.cwd(), 'public');
app.use(express.static(publicDir));
app.use(express.static(cwdPublicDir));

// 3. Health Check Endpoints (Complies with /api/health, /health, /api/v1/health standards)
const healthHandler = async (req: Request, res: Response) => {
  let dbStatus = 'healthy';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
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
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trainees', traineeRoutes);
app.use('/api/v1/consent', consentRoutes);
app.use('/api/v1/providers', providerRoutes);
app.use('/api/v1/outcomes', outcomeRoutes);
app.use('/api/v1/verification', verificationRoutes);
app.use('/api/v1/follow-ups', followUpRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/integrations', integrationRoutes);
app.use('/api/v1/audit', auditRoutes);

// 5. SPA Fallback (Non-API requests serve index.html for client routing)
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found', path: req.path });
  }
  const indexPath = path.resolve(publicDir, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      const fallbackPath = path.resolve(cwdPublicDir, 'index.html');
      res.sendFile(fallbackPath, (fallbackErr) => {
        if (fallbackErr) next();
      });
    }
  });
});

// 6. Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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
    await prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
