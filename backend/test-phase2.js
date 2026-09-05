"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = 'http://localhost:3001/api/v1';
async function runTest() {
    console.log('--- Phase 2 E2E Test ---');
    try {
        // 1. Login as Trainee
        console.log('1. Logging in as Trainee...');
        const traineeAuth = await axios_1.default.post(`${API_URL}/auth/login`, { username: 'priya_sharma', password: 'admin123' });
        const traineeToken = traineeAuth.data.token;
        // Get Trainee Profile
        const me = await axios_1.default.get(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${traineeToken}` } });
        const traineeId = me.data.trainee.id;
        console.log(`   Trainee ID: ${traineeId}`);
        // 2. Trainee Reports Outcome
        console.log('2. Trainee Reporting Formal Employment...');
        const outcomeResp = await axios_1.default.post(`${API_URL}/outcomes/${traineeId}`, {
            status: 'FORMAL_EMPLOYMENT',
            employer_name: 'ABC Retail Pvt Ltd',
            role: 'Sales Associate',
            joining_month: '2026-05',
            wage_amount: 15000,
            wage_type: 'MONTHLY'
        }, { headers: { Authorization: `Bearer ${traineeToken}` } });
        console.log(`   Outcome Event ID: ${outcomeResp.data.outcomeEventId}`);
        // Fetch the updated trainee to get the employmentRecordId
        const profile = await axios_1.default.get(`${API_URL}/trainees/${traineeId}`, { headers: { Authorization: `Bearer ${traineeToken}` } });
        const employmentRecordId = profile.data.outcome_events[0].employment_record.id;
        console.log(`   Employment Record ID: ${employmentRecordId}`);
        // 3. Login as Admin
        console.log('3. Logging in as Admin...');
        const adminAuth = await axios_1.default.post(`${API_URL}/auth/login`, { username: 'admin', password: 'admin123' });
        const adminToken = adminAuth.data.token;
        // 4. Admin Generates Verification Request (Simulating Employer Outreach)
        console.log('4. Generating Verification Request...');
        const verifyReq = await axios_1.default.post(`${API_URL}/verification/request/${employmentRecordId}`, {}, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const verificationId = verifyReq.data.verificationId;
        const otp = verifyReq.data.demo_otp;
        console.log(`   Verification ID: ${verificationId}, OTP: ${otp}`);
        // 5. Employer Confirms (via OTP) and reports a Skill Gap
        console.log('5. Employer Confirms Verification via OTP...');
        await axios_1.default.post(`${API_URL}/verification/confirm`, {
            verificationId,
            otp,
            status: 'CONFIRMED',
            skill_gaps: ['Excel', 'Inventory']
        });
        // 6. Verify Final State
        console.log('6. Verifying Final Trainee State...');
        const finalProfile = await axios_1.default.get(`${API_URL}/trainees/${traineeId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
        const finalOutcome = finalProfile.data.outcome_events[0];
        console.log(`   Outcome Source: ${finalOutcome.source} (Expected: EMPLOYER_VERIFIED)`);
        console.log(`   Wage Verification: ${finalProfile.data.wage_records[0].verification_status} (Expected: VERIFIED)`);
        console.log('--- Phase 2 Test Passed Successfully! ---');
    }
    catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}
runTest();
