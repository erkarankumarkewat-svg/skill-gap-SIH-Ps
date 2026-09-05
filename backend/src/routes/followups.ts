import { Router } from 'express';
import { prisma } from '../db';
import { authenticate, AuthRequest } from '../middlewares/authMiddleware';
import { hasActiveConsent } from '../middlewares/consentMiddleware';

const router = Router();

// Trigger a new follow-up campaign
router.post('/campaigns', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, target_cohort, scheduled_date } = req.body;
    
    const campaign = await prisma.followUpCampaign.create({
      data: {
        name,
        target_cohort,
        scheduled_date: new Date(scheduled_date)
      }
    });

    await prisma.auditEvent.create({
      data: {
        actor_id: req.user?.id,
        action: 'CAMPAIGN_SCHEDULED',
        resource: `FollowUpCampaign:${campaign.id}`
      }
    });

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Force trigger a specific follow-up (For Demo)
router.post('/trigger', authenticate, async (req: AuthRequest, res) => {
  try {
    let { traineeId, campaignId, interval_months } = req.body;

    // Fallback to existing or created campaign if campaignId is not provided or dummy
    if (!campaignId || campaignId === 'dummy-campaign') {
      let existingCampaign = await prisma.followUpCampaign.findFirst();
      if (!existingCampaign) {
        existingCampaign = await prisma.followUpCampaign.create({
          data: { name: 'Active Cohort Campaign', target_cohort: '2025-Q1', scheduled_date: new Date() }
        });
      }
      campaignId = existingCampaign.id;
    }

    // PRINCIPLE A: Enforce Consent Validation before outreach
    const consentActive = await hasActiveConsent(traineeId, 'FOLLOW_UP_COMMUNICATION');
    if (!consentActive) {
      // Record cancelled follow-up matching State Diagram
      const cancelledFollowUp = await prisma.followUp.create({
        data: {
          campaign_id: campaignId,
          trainee_id: traineeId,
          status: 'CANCELLED',
          interval_months: interval_months || 3
        }
      });

      return res.status(403).json({
        error: 'CONSENT_REQUIRED_OR_REVOKED',
        message: 'Outreach cancelled. Trainee has not granted or has revoked FOLLOW_UP_COMMUNICATION consent.',
        followUpId: cancelledFollowUp.id,
        status: 'CANCELLED'
      });
    }

    const followUp = await prisma.followUp.create({
      data: {
        campaign_id: campaignId,
        trainee_id: traineeId,
        status: 'SENT', // Dispatched to Mock WhatsApp
        interval_months: interval_months || 3
      }
    });

    await prisma.auditEvent.create({
      data: {
        actor_id: req.user?.id,
        action: 'FOLLOW_UP_DISPATCHED',
        resource: `FollowUp:${followUp.id}`,
        metadata: JSON.stringify({ traineeId, interval_months })
      }
    });

    res.json({ message: 'Follow-up triggered successfully', followUpId: followUp.id, status: 'SENT' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Webhook for Mock WhatsApp Response
router.post('/webhook', async (req, res) => {
  try {
    const { followUpId, raw_response, mapped_outcome_id } = req.body;

    // Record the response
    await prisma.followUpResponse.create({
      data: {
        follow_up_id: followUpId,
        raw_response,
        mapped_outcome_id
      }
    });

    // Update FollowUp state to RESPONDED
    await prisma.followUp.update({
      where: { id: followUpId },
      data: { status: 'RESPONDED' }
    });

    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
