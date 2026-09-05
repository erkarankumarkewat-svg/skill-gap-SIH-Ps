import { prisma } from '../db';

/**
 * Evaluates whether a trainee currently has an active GRANTED consent event
 * for a specific purpose under DPDP Act 2023 versioned consent ledger rules.
 */
export async function hasActiveConsent(traineeId: string, purposeCode: string): Promise<boolean> {
  const purpose = await prisma.consentPurpose.findUnique({
    where: { code: purposeCode }
  });

  if (!purpose) {
    return false;
  }

  const latestLog = await prisma.consentLog.findFirst({
    where: {
      trainee_id: traineeId,
      purpose_id: purpose.id
    },
    orderBy: {
      timestamp: 'desc'
    }
  });

  return latestLog !== null && latestLog.action === 'GRANTED';
}
