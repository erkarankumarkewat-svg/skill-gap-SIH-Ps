import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database state...');

  const userCount = await prisma.user.count();
  const providerCount = await prisma.provider.count();
  const traineeCount = await prisma.trainee.count();
  const hasData = userCount > 0 || providerCount > 0 || traineeCount > 0;
  const forceReset = process.argv.includes('--force-demo-reset');

  if (hasData && !forceReset) {
    console.log('\n========================================================');
    console.log('Database already contains application data.');
    console.log('Demo seed skipped to protect existing data.');
    console.log('To force reset: npm run seed:demo -- --force-demo-reset');
    console.log('========================================================\n');
    return;
  }

  if (forceReset) {
    if (process.env.NODE_ENV === 'production' && !process.argv.includes('--danger-override')) {
      console.error('\n[ERROR] Destructive reset is BLOCKED in production.');
      console.error('If you truly want to wipe production data, append --danger-override');
      console.error('Example: npm run seed:demo -- --force-demo-reset --danger-override\n');
      process.exit(1);
    }
    
    console.log('Performing explicit destructive reset of demo data...');
    // Clean existing non-critical data for clean seed
    try {
      await prisma.employerSkillFeedback.deleteMany();
      await prisma.verificationToken.deleteMany();
      await prisma.employerVerification.deleteMany();
      await prisma.wageRecord.deleteMany();
      await prisma.attritionEvent.deleteMany();
      await prisma.employmentRecord.deleteMany();
      await prisma.selfEmploymentRecord.deleteMany();
      await prisma.outcomeEvent.deleteMany();
      await prisma.followUpResponse.deleteMany();
      await prisma.followUp.deleteMany();
      await prisma.followUpCampaign.deleteMany();
      await prisma.contactabilityEvent.deleteMany();
      await prisma.alternateContact.deleteMany();
      await prisma.contactPoint.deleteMany();
      await prisma.consentLog.deleteMany();
      await prisma.certificationRecord.deleteMany();
      await prisma.trainingEnrolment.deleteMany();
      await prisma.batch.deleteMany();
      await prisma.courseSkillTag.deleteMany();
      await prisma.skillTag.deleteMany();
      await prisma.course.deleteMany();
      await prisma.trainee.deleteMany();
      await prisma.user.deleteMany();
      await prisma.role.deleteMany();
      await prisma.provider.deleteMany();
      await prisma.employer.deleteMany();
      await prisma.consentPurpose.deleteMany();
      await prisma.reasonCode.deleteMany();
    } catch (err) {
      console.log('Clean slate pass completed or skipped due to missing tables.');
    }
  }

  console.log('Seeding Comprehensive Production-Credible Prototype Data...');

  // 1. Roles
  const roles = ['SYSTEM_ADMIN', 'DISTRICT_ADMIN', 'PROVIDER', 'TRAINEE', 'EMPLOYER'];
  for (const r of roles) {
    await prisma.role.create({ data: { name: r } });
  }

  const sysAdminRole = await prisma.role.findUnique({ where: { name: 'SYSTEM_ADMIN' } });
  const districtAdminRole = await prisma.role.findUnique({ where: { name: 'DISTRICT_ADMIN' } });
  const providerRole = await prisma.role.findUnique({ where: { name: 'PROVIDER' } });
  const traineeRole = await prisma.role.findUnique({ where: { name: 'TRAINEE' } });
  const employerRole = await prisma.role.findUnique({ where: { name: 'EMPLOYER' } });

  // 2. Consent Purposes
  const purposes = [
    { code: 'TRAINING_ADMINISTRATION', desc: 'Manage enrollment, attendance, and certification' },
    { code: 'FOLLOW_UP_COMMUNICATION', desc: 'Direct outreach via WhatsApp/SMS/Call post-training' },
    { code: 'EMPLOYMENT_OUTCOME_TRACKING', desc: 'Track longitudinal livelihood, employment, and wage changes' },
    { code: 'EMPLOYER_VERIFICATION', desc: 'Contact employer to independently verify job and wage claims' },
    { code: 'AGGREGATED_POLICY_ANALYTICS', desc: 'Anonymized, aggregate insights for district skill planning' }
  ];

  for (const p of purposes) {
    await prisma.consentPurpose.create({ data: { code: p.code, description: p.desc } });
  }

  // 3. Reason Codes
  const reasonCodes = [
    { category: 'MOBILITY', code: 'TRANSPORTATION_BARRIER' },
    { category: 'MOBILITY', code: 'UNWILLING_TO_RELOCATE' },
    { category: 'MOBILITY', code: 'MIGRATED_FOR_WORK' },
    { category: 'LABOUR_MARKET', code: 'WAGE_EXPECTATION_GAP' },
    { category: 'LABOUR_MARKET', code: 'LOW_LOCAL_DEMAND' },
    { category: 'FAMILY', code: 'FAMILY_RESPONSIBILITIES' },
    { category: 'FAMILY', code: 'CARE_RESPONSIBILITIES' },
    { category: 'SKILLS', code: 'SKILL_MISMATCH' },
    { category: 'SKILLS', code: 'INSUFFICIENT_PRACTICAL_SKILLS' },
    { category: 'PROCESS', code: 'UNREACHABLE' },
    { category: 'OTHER', code: 'SELF_EMPLOYMENT_PREFERENCE' }
  ];

  for (const rc of reasonCodes) {
    await prisma.reasonCode.create({ data: rc });
  }

  // 4. Skill Tags
  const skillsList = [
    'POS Terminal Operations',
    'Inventory Management',
    'Customer Service',
    'Advanced Excel',
    'Digital Payments (UPI/QR)',
    'Solar PV Installation',
    'Inverter Wiring',
    'CNC Machine Programming',
    'Automotive Diagnostic Tools',
    'Hospitality Front Desk',
    'Phlebotomy & Sample Collection',
    'Sewing Machine Automation'
  ];

  const skillTagRecords: Record<string, any> = {};
  for (const s of skillsList) {
    const st = await prisma.skillTag.create({ data: { name: s } });
    skillTagRecords[s] = st;
  }

  const passwordHash = await bcrypt.hash('admin123', 10);

  // 5. System Users
  const sysAdminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password_hash: passwordHash,
      role_id: sysAdminRole!.id
    }
  });

  const districtAdminUser = await prisma.user.create({
    data: {
      username: 'district_jaipur',
      password_hash: passwordHash,
      role_id: districtAdminRole!.id
    }
  });

  // 6. 12 Providers
  const providersData = [
    { name: 'Apex Skilling Academy', location: 'Jaipur, Rajasthan' },
    { name: 'Jaipur Rural Vocational Institute', location: 'Jaipur, Rajasthan' },
    { name: 'Marwar Skill Foundation', location: 'Jodhpur, Rajasthan' },
    { name: 'Mewar Technical Hub', location: 'Udaipur, Rajasthan' },
    { name: 'Malwa Livelihood Center', location: 'Indore, Madhya Pradesh' },
    { name: 'Bhopal Skill Polytechnic', location: 'Bhopal, Madhya Pradesh' },
    { name: 'Awadh Skill Development Trust', location: 'Lucknow, Uttar Pradesh' },
    { name: 'Kashi Technical Mission', location: 'Varanasi, Uttar Pradesh' },
    { name: 'Gujarat Skill Council', location: 'Ahmedabad, Gujarat' },
    { name: 'Saurashtra Craft & Trade', location: 'Rajkot, Gujarat' },
    { name: 'Haryana Skill Mission Centre', location: 'Gurugram, Haryana' },
    { name: 'Punjab Vocational Collaborative', location: 'Ludhiana, Punjab' }
  ];

  const providerRecords = [];
  for (let i = 0; i < providersData.length; i++) {
    const p = await prisma.provider.create({
      data: {
        name: providersData[i].name,
        location: providersData[i].location,
        contact_info: `contact@${providersData[i].name.toLowerCase().replace(/[^a-z]/g, '')}.org`
      }
    });
    providerRecords.push(p);

    // Create provider login user
    await prisma.user.create({
      data: {
        username: `provider_${i + 1}`,
        password_hash: passwordHash,
        role_id: providerRole!.id,
        provider_id: p.id
      }
    });
  }

  // 7. 20 Courses
  const coursesData = [
    { name: 'Retail Sales Associate', nsqf_level: '4', sector: 'Retail', skills: ['POS Terminal Operations', 'Inventory Management', 'Customer Service', 'Advanced Excel', 'Digital Payments (UPI/QR)'] },
    { name: 'Solar PV Rooftop Technician', nsqf_level: '4', sector: 'Green Energy', skills: ['Solar PV Installation', 'Inverter Wiring', 'Customer Service'] },
    { name: 'CNC Machining Specialist', nsqf_level: '5', sector: 'Automotive & Manufacturing', skills: ['CNC Machine Programming', 'Advanced Excel'] },
    { name: 'Two-Wheeler Service Technician', nsqf_level: '4', sector: 'Automotive', skills: ['Automotive Diagnostic Tools', 'Customer Service'] },
    { name: 'General Duty Medical Assistant', nsqf_level: '4', sector: 'Healthcare', skills: ['Phlebotomy & Sample Collection', 'Customer Service'] },
    { name: 'Industrial Sewing Machine Operator', nsqf_level: '3', sector: 'Apparel', skills: ['Sewing Machine Automation'] },
    { name: 'Logistics Warehouse Picker-Packer', nsqf_level: '3', sector: 'Logistics', skills: ['Inventory Management', 'Digital Payments (UPI/QR)'] },
    { name: 'Customer Care Executive', nsqf_level: '4', sector: 'IT-ITeS', skills: ['Customer Service', 'Advanced Excel'] },
    { name: 'Domestic Electrician', nsqf_level: '4', sector: 'Construction', skills: ['Inverter Wiring'] },
    { name: 'Food & Beverage Service Steward', nsqf_level: '4', sector: 'Tourism & Hospitality', skills: ['Hospitality Front Desk', 'Customer Service'] },
    { name: 'Data Entry Operator', nsqf_level: '4', sector: 'IT-ITeS', skills: ['Advanced Excel', 'Customer Service'] },
    { name: 'Assistant Beauty Therapist', nsqf_level: '3', sector: 'Beauty & Wellness', skills: ['Customer Service'] },
    { name: 'Plumber General', nsqf_level: '4', sector: 'Plumbing', skills: ['Customer Service'] },
    { name: 'Microfinance Executive', nsqf_level: '5', sector: 'BFSI', skills: ['Advanced Excel', 'Digital Payments (UPI/QR)', 'Customer Service'] },
    { name: 'Field Technician - Home Appliances', nsqf_level: '4', sector: 'Electronics', skills: ['Customer Service', 'Inverter Wiring'] },
    { name: 'Draughtsman Mechanical', nsqf_level: '5', sector: 'Capital Goods', skills: ['CNC Machine Programming', 'Advanced Excel'] },
    { name: 'Inventory Clerk', nsqf_level: '4', sector: 'Logistics', skills: ['Inventory Management', 'Advanced Excel'] },
    { name: 'Tractor Mechanic', nsqf_level: '4', sector: 'Agriculture', skills: ['Automotive Diagnostic Tools'] },
    { name: 'Phlebotomist Technician', nsqf_level: '4', sector: 'Healthcare', skills: ['Phlebotomy & Sample Collection'] },
    { name: 'Organic Farmer Specialist', nsqf_level: '4', sector: 'Agriculture', skills: ['Customer Service'] }
  ];

  const courseRecords = [];
  for (const cd of coursesData) {
    const c = await prisma.course.create({
      data: {
        name: cd.name,
        nsqf_level: cd.nsqf_level,
        sector: cd.sector
      }
    });
    courseRecords.push(c);

    // Map skills
    for (const sname of cd.skills) {
      if (skillTagRecords[sname]) {
        await prisma.courseSkillTag.create({
          data: {
            course_id: c.id,
            skill_id: skillTagRecords[sname].id
          }
        });
      }
    }
  }

  // 8. 40 Batches
  const batchRecords = [];
  for (let b = 0; b < 40; b++) {
    const provider = providerRecords[b % providerRecords.length];
    const course = courseRecords[b % courseRecords.length];
    const startDate = new Date(2025, (b % 8), 1);
    const endDate = new Date(2025, (b % 8) + 3, 1);
    const batch = await prisma.batch.create({
      data: {
        provider_id: provider.id,
        course_id: course.id,
        start_date: startDate,
        end_date: endDate
      }
    });
    batchRecords.push(batch);
  }

  // 9. 60 Employers
  const employersList = [
    'ABC Retail Pvt Ltd', 'Reliance Smart Point', 'D-Mart Avenue Supermarts', 'Tata Croma Electronics',
    'Zomato Hyperpure Logistics', 'Delhivery Express Hub', 'Shadowfax Technologies', 'Lenskart Operations',
    'Maruti Suzuki Authorized Workshop', 'Hero MotoCorp Regional Service', 'TVS Mobility Jaipur',
    'Surya Solar Solutions Ltd', 'Waaree Energies Franchise', 'Jakson Green Solar', 'Shree Cement Works',
    'Apollo Clinic Jaipur', 'Fortis Healthcare Diagnostics', 'Dr Lal PathLabs Collection Centre',
    'Raymond Tailoring Studio', 'Shahi Exports Pvt Ltd', 'Arvind Mills Garments',
    'HDFC Bank Microfinance Branch', 'Spandana Sphoorty Financial', 'Muthoot Finance Field Operations'
  ];
  const employerRecords = [];
  for (let e = 0; e < 60; e++) {
    const name = e < employersList.length ? employersList[e] : `Industrial Hub Corp Unit ${e - 20}`;
    const emp = await prisma.employer.create({
      data: {
        name,
        industry: e % 3 === 0 ? 'Retail & Ecommerce' : e % 3 === 1 ? 'Automotive & Logistics' : 'Healthcare & Technical Services',
        registry_id: `CIN-U${10000 + e}RJ2020PTC0${50000 + e}`
      }
    });
    employerRecords.push(emp);
  }

  // 10. Consent Purpose Lookup
  const outcomePurpose = await prisma.consentPurpose.findUnique({ where: { code: 'EMPLOYMENT_OUTCOME_TRACKING' } });
  const verifyPurpose = await prisma.consentPurpose.findUnique({ where: { code: 'EMPLOYER_VERIFICATION' } });
  const transitReason = await prisma.reasonCode.findUnique({ where: { code: 'TRANSPORTATION_BARRIER' } });

  // -------------------------------------------------------------
  // HERO CASE 1: Successful Verified Formal Employment (Priya Sharma)
  // -------------------------------------------------------------
  const priyaUser = await prisma.user.create({
    data: { username: 'priya_sharma', password_hash: passwordHash, role_id: traineeRole!.id }
  });
  const priya = await prisma.trainee.create({
    data: {
      persistent_id: 'STI-2026-004281',
      user_id: priyaUser.id,
      first_name: 'Priya',
      last_name: 'Sharma',
      gender: 'F',
      date_of_birth: new Date('2002-04-14')
    }
  });
  await prisma.contactPoint.create({
    data: { trainee_id: priya.id, type: 'WHATSAPP', value: '+91 98290 12345', is_primary: true, verified_date: new Date() }
  });
  const priyaEnrolment = await prisma.trainingEnrolment.create({
    data: { trainee_id: priya.id, batch_id: batchRecords[0].id, status: 'COMPLETED' }
  });
  await prisma.certificationRecord.create({
    data: { enrolment_id: priyaEnrolment.id, certificate_number: 'NCVET-2026-004281-R' }
  });
  await prisma.consentLog.create({
    data: {
      trainee_id: priya.id,
      purpose_id: outcomePurpose!.id,
      action: 'GRANTED',
      notice_version: 'v2.1',
      channel: 'WHATSAPP_BOT',
      actor_id: priyaUser.id,
      current_event_hash: 'hash_priya_c1'
    }
  });
  const priyaOutcome = await prisma.outcomeEvent.create({
    data: { trainee_id: priya.id, status: 'FORMAL_EMPLOYMENT', source: 'EMPLOYER_VERIFIED' }
  });
  const priyaEmployment = await prisma.employmentRecord.create({
    data: {
      outcome_event_id: priyaOutcome.id,
      employer_id: employerRecords[0].id,
      role: 'Senior Sales Associate',
      joining_month: '2025-06',
      current_status: 'ACTIVE'
    }
  });
  await prisma.wageRecord.create({
    data: { trainee_id: priya.id, employment_record_id: priyaEmployment.id, amount: 16500, wage_type: 'MONTHLY', verification_status: 'VERIFIED' }
  });
  const priyaVerify = await prisma.employerVerification.create({
    data: {
      employment_record_id: priyaEmployment.id,
      employer_id: employerRecords[0].id,
      status: 'CONFIRMED',
      verification_date: new Date()
    }
  });
  await prisma.verificationToken.create({
    data: { verification_id: priyaVerify.id, token: '482910', expires_at: new Date(Date.now() + 86400000), attempts: 1 }
  });

  // -------------------------------------------------------------
  // HERO CASE 2: Self-Employed Trainee (Ramesh Kumar - Solar Technician)
  // -------------------------------------------------------------
  const rameshUser = await prisma.user.create({
    data: { username: 'ramesh_kumar', password_hash: passwordHash, role_id: traineeRole!.id }
  });
  const ramesh = await prisma.trainee.create({
    data: {
      persistent_id: 'STI-2026-001942',
      user_id: rameshUser.id,
      first_name: 'Ramesh',
      last_name: 'Kumar',
      gender: 'M',
      date_of_birth: new Date('1999-08-21')
    }
  });
  const rameshEnrolment = await prisma.trainingEnrolment.create({
    data: { trainee_id: ramesh.id, batch_id: batchRecords[1].id, status: 'COMPLETED' }
  });
  await prisma.certificationRecord.create({
    data: { enrolment_id: rameshEnrolment.id, certificate_number: 'NCVET-2026-001942-S' }
  });
  await prisma.consentLog.create({
    data: {
      trainee_id: ramesh.id,
      purpose_id: outcomePurpose!.id,
      action: 'GRANTED',
      notice_version: 'v2.1',
      channel: 'WEB_PORTAL',
      actor_id: rameshUser.id,
      current_event_hash: 'hash_ramesh_c1'
    }
  });
  const rameshOutcome = await prisma.outcomeEvent.create({
    data: { trainee_id: ramesh.id, status: 'SELF_EMPLOYED', source: 'SELF_REPORTED' }
  });
  await prisma.selfEmploymentRecord.create({
    data: {
      outcome_event_id: rameshOutcome.id,
      business_type: 'Rooftop Solar Maintenance & Installation Enterprise',
      income_range: '₹18,000 - ₹24,000 / month',
      location: 'Chomu District Unit, Jaipur'
    }
  });
  await prisma.wageRecord.create({
    data: { trainee_id: ramesh.id, amount: 21000, wage_type: 'RANGE', verification_status: 'UNVERIFIED' }
  });

  // -------------------------------------------------------------
  // HERO CASE 3: Non-Placement due to Mobility / Transit (Sunita Meena)
  // -------------------------------------------------------------
  const sunitaUser = await prisma.user.create({
    data: { username: 'sunita_meena', password_hash: passwordHash, role_id: traineeRole!.id }
  });
  const sunita = await prisma.trainee.create({
    data: {
      persistent_id: 'STI-2026-003810',
      user_id: sunitaUser.id,
      first_name: 'Sunita',
      last_name: 'Meena',
      gender: 'F',
      date_of_birth: new Date('2003-11-05')
    }
  });
  const sunitaEnrolment = await prisma.trainingEnrolment.create({
    data: { trainee_id: sunita.id, batch_id: batchRecords[0].id, status: 'COMPLETED' }
  });
  await prisma.certificationRecord.create({
    data: { enrolment_id: sunitaEnrolment.id, certificate_number: 'NCVET-2026-003810-R' }
  });
  await prisma.consentLog.create({
    data: {
      trainee_id: sunita.id,
      purpose_id: outcomePurpose!.id,
      action: 'GRANTED',
      notice_version: 'v2.1',
      channel: 'WHATSAPP_BOT',
      actor_id: sunitaUser.id,
      current_event_hash: 'hash_sunita_c1'
    }
  });
  const sunitaOutcome = await prisma.outcomeEvent.create({
    data: { trainee_id: sunita.id, status: 'UNEMPLOYED_LOOKING', source: 'SELF_REPORTED' }
  });
  const sunitaEmployment = await prisma.employmentRecord.create({
    data: { outcome_event_id: sunitaOutcome.id, role: 'Retail Candidate (Declined Offer)', current_status: 'JOB_OFFER_DECLINED' }
  });
  await prisma.attritionEvent.create({
    data: {
      employment_record_id: sunitaEmployment.id,
      reason_code_id: transitReason!.id,
      exit_date: new Date()
    }
  });

  // -------------------------------------------------------------
  // HERO CASE 4: Unreachable Trainee with Fallback Outreach Chain (Amit Verma)
  // -------------------------------------------------------------
  const amitUser = await prisma.user.create({
    data: { username: 'amit_verma', password_hash: passwordHash, role_id: traineeRole!.id }
  });
  const amit = await prisma.trainee.create({
    data: {
      persistent_id: 'STI-2026-005119',
      user_id: amitUser.id,
      first_name: 'Amit',
      last_name: 'Verma',
      gender: 'M',
      date_of_birth: new Date('2001-02-17')
    }
  });
  await prisma.contactPoint.create({
    data: { trainee_id: amit.id, type: 'MOBILE', value: '+91 94140 88776', is_primary: true }
  });
  await prisma.alternateContact.create({
    data: { trainee_id: amit.id, relation: 'Elder Brother (Suresh Verma)', contact_value: '+91 94140 33221' }
  });
  await prisma.contactabilityEvent.create({
    data: { trainee_id: amit.id, event_type: 'BOUNCE' }
  });
  await prisma.contactabilityEvent.create({
    data: { trainee_id: amit.id, event_type: 'BOUNCE' }
  });
  const amitEnrolment = await prisma.trainingEnrolment.create({
    data: { trainee_id: amit.id, batch_id: batchRecords[2].id, status: 'COMPLETED' }
  });
  await prisma.certificationRecord.create({
    data: { enrolment_id: amitEnrolment.id, certificate_number: 'NCVET-2026-005119-C' }
  });

  // -------------------------------------------------------------
  // HERO CASE 5: Employer Skill-Gap Feedback Case (Vikram Singh)
  // -------------------------------------------------------------
  const vikramUser = await prisma.user.create({
    data: { username: 'vikram_singh', password_hash: passwordHash, role_id: traineeRole!.id }
  });
  const vikram = await prisma.trainee.create({
    data: {
      persistent_id: 'STI-2026-006204',
      user_id: vikramUser.id,
      first_name: 'Vikram',
      last_name: 'Singh',
      gender: 'M',
      date_of_birth: new Date('2000-09-12')
    }
  });
  const vikramEnrolment = await prisma.trainingEnrolment.create({
    data: { trainee_id: vikram.id, batch_id: batchRecords[0].id, status: 'COMPLETED' }
  });
  await prisma.certificationRecord.create({
    data: { enrolment_id: vikramEnrolment.id, certificate_number: 'NCVET-2026-006204-R' }
  });
  await prisma.consentLog.create({
    data: {
      trainee_id: vikram.id,
      purpose_id: outcomePurpose!.id,
      action: 'GRANTED',
      notice_version: 'v2.1',
      channel: 'WHATSAPP_BOT',
      actor_id: vikramUser.id,
      current_event_hash: 'hash_vikram_c1'
    }
  });
  const vikramOutcome = await prisma.outcomeEvent.create({
    data: { trainee_id: vikram.id, status: 'FORMAL_EMPLOYMENT', source: 'EMPLOYER_VERIFIED' }
  });
  const vikramEmployment = await prisma.employmentRecord.create({
    data: {
      outcome_event_id: vikramOutcome.id,
      employer_id: employerRecords[0].id,
      role: 'Inventory Trainee',
      joining_month: '2025-07',
      current_status: 'ACTIVE'
    }
  });
  const vikramVerify = await prisma.employerVerification.create({
    data: {
      employment_record_id: vikramEmployment.id,
      employer_id: employerRecords[0].id,
      status: 'CONFIRMED',
      verification_date: new Date()
    }
  });
  // Add employer skill gap feedback for Excel and Inventory
  await prisma.employerSkillFeedback.create({
    data: {
      verification_id: vikramVerify.id,
      skill_id: skillTagRecords['Advanced Excel'].id,
      deficiency_flag: true
    }
  });
  await prisma.employerSkillFeedback.create({
    data: {
      verification_id: vikramVerify.id,
      skill_id: skillTagRecords['Inventory Management'].id,
      deficiency_flag: true
    }
  });
  // Seed more employer skill feedbacks to meet the sample threshold (n >= 5) so the chart displays prominently
  for (let i = 0; i < 4; i++) {
    await prisma.employerSkillFeedback.create({
      data: {
        verification_id: vikramVerify.id,
        skill_id: skillTagRecords['Advanced Excel'].id,
        deficiency_flag: true
      }
    });
    await prisma.employerSkillFeedback.create({
      data: {
        verification_id: vikramVerify.id,
        skill_id: skillTagRecords['Inventory Management'].id,
        deficiency_flag: true
      }
    });
  }
  for (let i = 0; i < 3; i++) {
    await prisma.employerSkillFeedback.create({
      data: {
        verification_id: vikramVerify.id,
        skill_id: skillTagRecords['Digital Payments (UPI/QR)'].id,
        deficiency_flag: true
      }
    });
  }

  // -------------------------------------------------------------
  // 11. Scale Seed Data: Generate remaining Trainees to reach ~750 cohort
  // -------------------------------------------------------------
  console.log('Generating remaining cohort to achieve 750+ scale...');
  const firstNames = ['Aarav', 'Ananya', 'Rohan', 'Kavita', 'Manish', 'Deepak', 'Pooja', 'Rahul', 'Neha', 'Sanjay', 'Kajal', 'Anil', 'Geeta', 'Suresh', 'Meena'];
  const lastNames = ['Yadav', 'Verma', 'Choudhary', 'Rathore', 'Gupta', 'Saini', 'Mehta', 'Jat', 'Kumawat', 'Patel', 'Singh', 'Sharma', 'Joshi', 'Mishra'];

  const targetScale = 750;
  const batchCount = batchRecords.length;

  for (let i = 5; i < targetScale; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const pid = `STI-2026-${String(100000 + i).slice(1)}`;
    const batch = batchRecords[i % batchCount];

    // Trainee User
    const u = await prisma.user.create({
      data: {
        username: `trainee_${i}`,
        password_hash: passwordHash,
        role_id: traineeRole!.id
      }
    });

    // Trainee Profile
    const t = await prisma.trainee.create({
      data: {
        persistent_id: pid,
        user_id: u.id,
        first_name: fn,
        last_name: ln,
        gender: i % 2 === 0 ? 'M' : 'F',
        date_of_birth: new Date(1998 + (i % 8), (i % 12), 10)
      }
    });

    // Contact
    await prisma.contactPoint.create({
      data: {
        trainee_id: t.id,
        type: 'WHATSAPP',
        value: `+91 98${String(10000000 + i)}`,
        is_primary: true
      }
    });

    // Enrolment & Certification
    const enr = await prisma.trainingEnrolment.create({
      data: {
        trainee_id: t.id,
        batch_id: batch.id,
        status: 'COMPLETED'
      }
    });

    await prisma.certificationRecord.create({
      data: {
        enrolment_id: enr.id,
        certificate_number: `NCVET-2026-${String(100000 + i)}`
      }
    });

    // Consent (94% consent rate)
    if (i % 16 !== 0) {
      await prisma.consentLog.create({
        data: {
          trainee_id: t.id,
          purpose_id: outcomePurpose!.id,
          action: 'GRANTED',
          notice_version: 'v2.1',
          channel: 'WHATSAPP_BOT',
          actor_id: u.id,
          current_event_hash: `hash_cohort_${i}`
        }
      });
    }

    // Longitudinal Outcomes distribution
    if (i % 3 === 0) {
      // Formal Employment
      const isVerified = i % 4 !== 0;
      const oc = await prisma.outcomeEvent.create({
        data: {
          trainee_id: t.id,
          status: 'FORMAL_EMPLOYMENT',
          source: isVerified ? 'EMPLOYER_VERIFIED' : 'SELF_REPORTED'
        }
      });
      const emp = await prisma.employmentRecord.create({
        data: {
          outcome_event_id: oc.id,
          employer_id: employerRecords[i % employerRecords.length].id,
          role: 'Associate / Technician',
          joining_month: '2025-06',
          current_status: 'ACTIVE'
        }
      });
      await prisma.wageRecord.create({
        data: {
          trainee_id: t.id,
          employment_record_id: emp.id,
          amount: 14000 + (i % 10) * 1000,
          wage_type: 'MONTHLY',
          verification_status: isVerified ? 'VERIFIED' : 'UNVERIFIED'
        }
      });
    } else if (i % 7 === 0) {
      // Self-Employment
      const oc = await prisma.outcomeEvent.create({
        data: {
          trainee_id: t.id,
          status: 'SELF_EMPLOYED',
          source: 'SELF_REPORTED'
        }
      });
      await prisma.selfEmploymentRecord.create({
        data: {
          outcome_event_id: oc.id,
          business_type: 'Local Trade / Service Work',
          income_range: '₹15,000 - ₹20,000 / month',
          location: 'District Hub'
        }
      });
    } else if (i % 11 === 0) {
      // Apprenticeship
      await prisma.outcomeEvent.create({
        data: {
          trainee_id: t.id,
          status: 'APPRENTICESHIP',
          source: 'SYSTEM_DERIVED'
        }
      });
    }
  }

  console.log('--- Database successfully seeded with 750+ trainees and Hero Cases 1-5! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
