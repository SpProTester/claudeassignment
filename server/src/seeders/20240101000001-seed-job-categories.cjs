'use strict';

const { v4: uuidv4 } = require('uuid');

const categories = [
  { name: 'Engineering', slug: 'engineering', icon: '⚙️' },
  { name: 'Design', slug: 'design', icon: '🎨' },
  { name: 'Product', slug: 'product', icon: '📦' },
  { name: 'Marketing', slug: 'marketing', icon: '📣' },
  { name: 'Sales', slug: 'sales', icon: '💼' },
  { name: 'Data & Analytics', slug: 'data-analytics', icon: '📊' },
  { name: 'DevOps & Cloud', slug: 'devops-cloud', icon: '☁️' },
  { name: 'Finance', slug: 'finance', icon: '💰' },
  { name: 'Human Resources', slug: 'human-resources', icon: '👥' },
  { name: 'Customer Success', slug: 'customer-success', icon: '🤝' },
  { name: 'Legal', slug: 'legal', icon: '⚖️' },
  { name: 'Operations', slug: 'operations', icon: '🔧' },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'job_categories',
      categories.map((c) => ({
        id: uuidv4(),
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        created_at: now,
        updated_at: now,
      })),
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('job_categories', null, {});
  },
};
