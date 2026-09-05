import { Router } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole, AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/v1/audit - Retrieve system audit trail (SYSTEM_ADMIN and DISTRICT_ADMIN only)
router.get('/', authenticate, requireRole(['SYSTEM_ADMIN', 'DISTRICT_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const logs = await prisma.auditEvent.findMany({
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
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
