'use strict';

const { v4: uuidv4 } = require('uuid');

const skills = [
  // Frontend
  'React', 'Vue.js', 'Angular', 'Next.js', 'TypeScript', 'JavaScript',
  'Tailwind CSS', 'CSS', 'HTML', 'Redux',
  // Backend
  'Node.js', 'Express.js', 'Python', 'Django', 'FastAPI', 'Java',
  'Spring Boot', 'Go', 'Rust', 'PHP', 'Laravel', 'Ruby on Rails',
  // Databases
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
  // DevOps
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform',
  'CI/CD', 'GitHub Actions', 'Linux', 'Nginx',
  // Data
  'Python', 'SQL', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch',
  'Tableau', 'Power BI', 'Spark', 'Kafka',
  // Mobile
  'React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin',
  // Other
  'GraphQL', 'REST APIs', 'Microservices', 'Agile', 'Scrum',
  'Git', 'Jest', 'Playwright', 'Figma', 'Jira',
];

// Deduplicate
const unique = [...new Set(skills)];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'skills',
      unique.map((name) => ({
        id: uuidv4(),
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        created_at: now,
        updated_at: now,
      })),
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('skills', null, {});
  },
};
