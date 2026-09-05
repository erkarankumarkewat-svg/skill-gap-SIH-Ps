"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasActiveConsent = hasActiveConsent;
const db_1 = require("../db");
/**
 * Evaluates whether a trainee currently has an active GRANTED consent event
 * for a specific purpose under DPDP Act 2023 versioned consent ledger rules.
 */
async function hasActiveConsent(traineeId, purposeCode) {
    const purpose = await db_1.prisma.consentPurpose.findUnique({
        where: { code: purposeCode }
    });
    if (!purpose) {
        return false;
    }
    const latestLog = await db_1.prisma.consentLog.findFirst({
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
