import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { authenticate, requireRole, AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true, trainee: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role.name, provider_id: user.provider_id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    // AUDIT LOG: Successful authentication
    await prisma.auditEvent.create({
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
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  try {
    // AUDIT LOG: Logout
    await prisma.auditEvent.create({
      data: {
        actor_id: req.user?.id,
        action: 'AUTH_LOGOUT',
        resource: `User:${req.user?.id}`
      }
    });

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { role: true, trainee: true, provider: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
