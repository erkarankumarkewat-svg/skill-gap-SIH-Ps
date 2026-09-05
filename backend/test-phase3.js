"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = 'http://localhost:3001/api/v1';
async function runTest() {
    console.log('--- Phase 3 Analytics Test ---');
    try {
        // 1. Login as Admin
        const adminAuth = await axios_1.default.post(`${API_URL}/auth/login`, { username: 'admin', password: 'admin123' });
        const adminToken = adminAuth.data.token;
        // Get Trainee Profile (using Priya Sharma's seeded ID)
        const adminMe = await axios_1.default.get(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${adminToken}` } });
        // Find Priya's ID by hitting the trainees endpoint
        const trainees = await axios_1.default.get(`${API_URL}/trainees`, { headers: { Authorization: `Bearer ${adminToken}` } });
        const traineeId = trainees.data[0].id;
        // 2. Initial Dashboard State
        console.log('1. Fetching Initial Analytics...');
        const initialDash = await axios_1.default.get(`${API_URL}/analytics/dashboard`, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log(`   Initial Verified Rate: ${initialDash.data.metrics.verified_employment_rate}%`);
        // Test the text classifier
        console.log('2. Testing Explainable Attrition Classifier...');
        const classifyReq = await axios_1.default.post(`${API_URL}/analytics/classify-reason`, {
            raw_text: "The company is too far from my village and there is no reliable bus."
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log(`   Classifier Result: ${classifyReq.data.reason} (Confidence: ${classifyReq.data.confidence})`);
        // Contactability Risk
        console.log('3. Testing Contactability Risk...');
        const riskReq = await axios_1.default.get(`${API_URL}/analytics/contactability-risk/${traineeId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log(`   Risk Score: ${riskReq.data.risk_level}`);
        // Skill Gaps
        console.log('4. Fetching Skill Gaps...');
        const skillsReq = await axios_1.default.get(`${API_URL}/analytics/skill-gaps`, { headers: { Authorization: `Bearer ${adminToken}` } });
        if (skillsReq.data.message === 'INSUFFICIENT SAMPLE') {
            console.log('   Skill Gaps: Privacy threshold active (Insufficient Sample) - working as expected.');
        }
        else {
            console.log(`   Top Skill Gap: ${skillsReq.data.gaps[0]?.skill}`);
        }
        console.log('--- Phase 3 Test Passed Successfully! ---');
    }
    catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}
runTest();
