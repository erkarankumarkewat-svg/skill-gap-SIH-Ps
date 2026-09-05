"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const INTEGRATIONS_CATALOG = [
    {
        id: 'sid',
        name: 'Skill India Digital (SID)',
        category: 'Training Lifecycle',
        purpose: 'Enrolment, batch, and certification lifecycle synchronization',
        status: 'SIMULATED',
        isMock: true,
        lastSync: new Date(Date.now() - 3600000 * 2).toISOString(),
        recordsProcessed: 750,
        errors: 0,
        healthScore: 99,
        dataTypes: ['Trainee KYC', 'Batch Enrolment', 'NCVET Certificate No']
    },
    {
        id: 'ncvet',
        name: 'NCVET Qualifications Register',
        category: 'Standards & Taxonomy',
        purpose: 'National Qualification Register (NQR) NSQF Level & Job Role Alignment',
        status: 'SIMULATED',
        isMock: true,
        lastSync: new Date(Date.now() - 3600000 * 12).toISOString(),
        recordsProcessed: 20,
        errors: 0,
        healthScore: 100,
        dataTypes: ['NSQF Levels', 'NOS Codes', 'Standard Skill Tags']
    },
    {
        id: 'epfo',
        name: 'Employees Provident Fund Organisation (EPFO)',
        category: 'Formal Livelihood Validation',
        purpose: 'Simulated UAN contribution signal for dual-verification of formal employment',
        status: 'SIMULATED',
        isMock: true,
        lastSync: new Date(Date.now() - 3600000 * 4).toISOString(),
        recordsProcessed: 312,
        errors: 3,
        healthScore: 96,
        dataTypes: ['UAN Seeding Indicator', 'Active Remittance Signal', 'Establishment Code']
    },
    {
        id: 'udyam',
        name: 'Udyam MSME Portal',
        category: 'Enterprise / Self-Employment',
        purpose: 'Validation of registered self-employed enterprise accounts',
        status: 'SIMULATED',
        isMock: true,
        lastSync: new Date(Date.now() - 3600000 * 8).toISOString(),
        recordsProcessed: 89,
        errors: 1,
        healthScore: 98,
        dataTypes: ['Udyam Registration Number', 'Enterprise Category', 'District Unit']
    },
    {
        id: 'eshram',
        name: 'e-Shram National Database',
        category: 'Unorganized Worker Registry',
        purpose: 'Informal sector occupational linkage and migration signals',
        status: 'SIMULATED',
        isMock: true,
        lastSync: new Date(Date.now() - 3600000 * 24).toISOString(),
        recordsProcessed: 142,
        errors: 0,
        healthScore: 97,
        dataTypes: ['e-Shram UAN', 'Primary Occupation Code', 'Current Address State']
    },
    {
        id: 'ncs',
        name: 'National Career Service (NCS)',
        category: 'Labour Market Demand',
        purpose: 'Vacancy feeds, district vacancy matching, and active job postings',
        status: 'NOT_CONFIGURED',
        isMock: false,
        lastSync: 'None',
        recordsProcessed: 0,
        errors: 0,
        healthScore: 0,
        dataTypes: ['District Vacancies', 'Industry Hiring Demand', 'Skill Tag Demand']
    }
];
// GET /api/v1/integrations - List all integration adapters
router.get('/', (req, res) => {
    res.json({
        timestamp: new Date().toISOString(),
        totalConnectors: INTEGRATIONS_CATALOG.length,
        activeSimulated: INTEGRATIONS_CATALOG.filter(i => i.status === 'SIMULATED').length,
        live: INTEGRATIONS_CATALOG.filter(i => i.status === 'LIVE').length,
        integrations: INTEGRATIONS_CATALOG
    });
});
// POST /api/v1/integrations/:id/sync - Trigger sync event
router.post('/:id/sync', authMiddleware_1.authenticate, async (req, res) => {
    const { id } = req.params;
    const integration = INTEGRATIONS_CATALOG.find(i => i.id === id);
    if (!integration) {
        return res.status(404).json({ error: 'Integration connector not found' });
    }
    if (integration.status === 'NOT_CONFIGURED') {
        return res.status(400).json({ error: 'Connector is not configured. Live API keys or certificates required.' });
    }
    // Record audit and sync event
    const newRecords = Math.floor(Math.random() * 25) + 5;
    integration.lastSync = new Date().toISOString();
    integration.recordsProcessed += newRecords;
    await db_1.prisma.integrationSyncEvent.create({
        data: {
            integration_name: integration.name,
            status: 'SUCCESS',
            records_processed: newRecords
        }
    });
    await db_1.prisma.auditEvent.create({
        data: {
            actor_id: req.user?.id,
            action: 'INTEGRATION_SYNC',
            resource: integration.id,
            metadata: JSON.stringify({ recordsProcessed: newRecords, isMock: integration.isMock })
        }
    });
    res.json({
        message: `Successfully synchronized ${integration.name}`,
        recordsAdded: newRecords,
        integration
    });
});
exports.default = router;
