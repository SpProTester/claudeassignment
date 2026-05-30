'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const rounds = 10;

    const adminId      = uuidv4();
    const seeker1Id    = uuidv4();
    const seeker2Id    = uuidv4();
    const employer1Id  = uuidv4();
    const employer2Id  = uuidv4();
    const seeker1ProfileId   = uuidv4();
    const seeker2ProfileId   = uuidv4();
    const employer1ProfileId = uuidv4();
    const employer2ProfileId = uuidv4();

    const [adminHash, seekerHash, employerHash] = await Promise.all([
      bcrypt.hash('Admin@1234', rounds),
      bcrypt.hash('Seeker@1234', rounds),
      bcrypt.hash('Employer@1234', rounds),
    ]);

    await queryInterface.bulkInsert('users', [
      { id: adminId,     full_name: 'Platform Admin', email: 'admin@jobportal.com', password_hash: adminHash,    role: 'admin',    is_verified: true, is_active: true, created_at: now, updated_at: now },
      { id: seeker1Id,   full_name: 'John Doe',        email: 'john@example.com',   password_hash: seekerHash,   role: 'seeker',   is_verified: true, is_active: true, created_at: now, updated_at: now },
      { id: seeker2Id,   full_name: 'Jane Smith',      email: 'jane@example.com',   password_hash: seekerHash,   role: 'seeker',   is_verified: true, is_active: true, created_at: now, updated_at: now },
      { id: employer1Id, full_name: 'Alice Johnson',   email: 'alice@techcorp.com', password_hash: employerHash, role: 'employer', is_verified: true, is_active: true, created_at: now, updated_at: now },
      { id: employer2Id, full_name: 'Bob Williams',    email: 'bob@designhub.com',  password_hash: employerHash, role: 'employer', is_verified: true, is_active: true, created_at: now, updated_at: now },
    ], {});

    await queryInterface.bulkInsert('seeker_profiles', [
      { id: seeker1ProfileId, user_id: seeker1Id, headline: 'Senior Full-Stack Developer', summary: 'Passionate developer with 6 years of experience in React and Node.js.', location: 'New York, US',     experience_years: 6, open_to_work: true, profile_visibility: 'public', profile_views: 0, created_at: now, updated_at: now },
      { id: seeker2ProfileId, user_id: seeker2Id, headline: 'UX / Product Designer',       summary: 'Creating beautiful accessible interfaces with 4 years of experience.',   location: 'San Francisco, US', experience_years: 4, open_to_work: true, profile_visibility: 'public', profile_views: 0, created_at: now, updated_at: now },
    ], {});

    await queryInterface.bulkInsert('employer_profiles', [
      { id: employer1ProfileId, user_id: employer1Id, company_name: 'TechCorp Inc.',    company_slug: 'techcorp-inc',     industry: 'Technology', company_size: '51-200', is_verified: false, subscription_plan: 'professional', created_at: now, updated_at: now },
      { id: employer2ProfileId, user_id: employer2Id, company_name: 'DesignHub Studio', company_slug: 'designhub-studio', industry: 'Design',     company_size: '11-50',  is_verified: false, subscription_plan: 'free',         created_at: now, updated_at: now },
    ], {});

    const job1Id = uuidv4();
    const job2Id = uuidv4();
    const job3Id = uuidv4();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [[engCat], [desCat]] = await Promise.all([
      queryInterface.sequelize.query("SELECT id FROM job_categories WHERE slug='engineering' LIMIT 1", { type: queryInterface.sequelize.QueryTypes.SELECT }),
      queryInterface.sequelize.query("SELECT id FROM job_categories WHERE slug='design' LIMIT 1",      { type: queryInterface.sequelize.QueryTypes.SELECT }),
    ]);

    await queryInterface.bulkInsert('job_listings', [
      { id: job1Id, employer_id: employer1ProfileId, category_id: engCat?.id||null, title: 'Senior React Developer',     slug: 'senior-react-developer-techcorp-a1b2',    description: 'Build scalable React frontends. 5+ yrs React, TypeScript, Tailwind required.',  job_type: 'full-time', work_mode: 'remote',  experience_level: 'senior', location: 'Remote (US)',       salary_min: 130000, salary_max: 170000, status: 'active', views_count: 124, expires_at: futureDate, created_at: now, updated_at: now },
      { id: job2Id, employer_id: employer1ProfileId, category_id: engCat?.id||null, title: 'Backend Engineer — Node.js', slug: 'backend-engineer-nodejs-techcorp-c3d4',   description: 'Design and build REST APIs. 3+ yrs Node.js, PostgreSQL, Docker required.',      job_type: 'full-time', work_mode: 'hybrid',  experience_level: 'mid',    location: 'New York, NY',      salary_min: 100000, salary_max: 130000, status: 'active', views_count: 87,  expires_at: futureDate, created_at: now, updated_at: now },
      { id: job3Id, employer_id: employer2ProfileId, category_id: desCat?.id||null, title: 'UI/UX Designer',             slug: 'ui-ux-designer-designhub-e5f6',           description: 'Create wireframes in Figma. 2+ yrs experience and strong portfolio required.',   job_type: 'full-time', work_mode: 'onsite', experience_level: 'mid',    location: 'San Francisco, CA', salary_min: 85000,  salary_max: 110000, status: 'active', views_count: 56,  expires_at: futureDate, created_at: now, updated_at: now },
    ], {});

    const getSkill = async (name) => {
      const [row] = await queryInterface.sequelize.query('SELECT id FROM skills WHERE name=$1 LIMIT 1', { bind:[name], type: queryInterface.sequelize.QueryTypes.SELECT });
      return row?.id;
    };

    const [reactId, tsId, nodeId, pgId, figmaId] = await Promise.all([
      getSkill('React'), getSkill('TypeScript'), getSkill('Node.js'), getSkill('PostgreSQL'), getSkill('Figma'),
    ]);

    // job_skills has composite PK (job_id, skill_id) — no id column
    const jobSkills = [
      reactId && { job_id: job1Id, skill_id: reactId },
      tsId    && { job_id: job1Id, skill_id: tsId    },
      nodeId  && { job_id: job2Id, skill_id: nodeId  },
      pgId    && { job_id: job2Id, skill_id: pgId    },
      figmaId && { job_id: job3Id, skill_id: figmaId },
    ].filter(Boolean);

    if (jobSkills.length) await queryInterface.bulkInsert('job_skills', jobSkills, {});

    console.log('\n  Seed complete!');
    console.log('  Admin     admin@jobportal.com  / Admin@1234    -> http://localhost:5174');
    console.log('  Seeker    john@example.com     / Seeker@1234   -> http://localhost:5173');
    console.log('  Employer  alice@techcorp.com   / Employer@1234 -> http://localhost:5173\n');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('job_skills', null, {});
    await queryInterface.bulkDelete('job_listings', null, {});
    await queryInterface.bulkDelete('employer_profiles', null, {});
    await queryInterface.bulkDelete('seeker_profiles', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('skills', null, {});
    await queryInterface.bulkDelete('job_categories', null, {});
  },
};
