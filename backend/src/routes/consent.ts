import { Router } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole, AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

router.get('/:traineeId', authenticate, async (req: AuthRequest, res) => {
  try {
    const logs = await prisma.consentLog.findMany({
      where: { trainee_id: req.params.traineeId },
      include: { purpose: true },
      orderBy: { timestamp: 'desc' }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:traineeId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { purpose_code, action, notice_version, channel } = req.body;
    const purpose = await prisma.consentPurpose.findUnique({ where: { code: purpose_code } });
    if (!purpose) return res.status(400).json({ error: 'Invalid purpose code' });

    // In a real app, generate proper hashes for immutability
    const previousEvent = await prisma.consentLog.findFirst({
      where: { trainee_id: req.params.traineeId, purpose_id: purpose.id },
      orderBy: { timestamp: 'desc' }
    });

    const newLog = await prisma.consentLog.create({
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

    await prisma.auditEvent.create({
      data: {
        actor_id: req.user?.id,
        action: 'CONSENT_' + action,
        resource: 'ConsentLog:' + newLog.id
      }
    });

    res.json(newLog);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
