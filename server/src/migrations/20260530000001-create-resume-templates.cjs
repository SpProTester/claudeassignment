'use strict';

const TEMPLATES = [
  { id: '11111111-0001-0001-0001-000000000001', name: 'Modern',    slug: 'modern',    description: 'Clean two-column layout with purple sidebar. Great for tech roles.', sort_order: 1 },
  { id: '11111111-0001-0001-0001-000000000002', name: 'Corporate', slug: 'corporate', description: 'Traditional single-column format with a dark header. Ideal for finance and law.', sort_order: 2 },
  { id: '11111111-0001-0001-0001-000000000003', name: 'Minimal',   slug: 'minimal',   description: 'Ultra-clean design with subtle dividers. ATS-optimised and distraction-free.', sort_order: 3 },
  { id: '11111111-0001-0001-0001-000000000004', name: 'Creative',  slug: 'creative',  description: 'Bold coloured header with two-column body. Perfect for design & marketing.', sort_order: 4 },
  { id: '11111111-0001-0001-0001-000000000005', name: 'Executive', slug: 'executive', description: 'Premium centred header with elegant typography. For senior leadership roles.', sort_order: 5 },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('resume_templates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      name:          { type: Sequelize.STRING(100), allowNull: false },
      slug:          { type: Sequelize.STRING(50),  allowNull: false, unique: true },
      description:   { type: Sequelize.TEXT,        allowNull: true },
      thumbnail_url: { type: Sequelize.TEXT,        allowNull: true },
      is_active:     { type: Sequelize.BOOLEAN,     defaultValue: true },
      sort_order:    { type: Sequelize.INTEGER,     defaultValue: 0 },
      created_at:    { type: Sequelize.DATE,        allowNull: false },
      updated_at:    { type: Sequelize.DATE,        allowNull: false },
    });

    await queryInterface.addIndex('resume_templates', ['slug'],      { name: 'resume_templates_slug_idx', unique: true });
    await queryInterface.addIndex('resume_templates', ['is_active'], { name: 'resume_templates_is_active_idx' });

    const now = new Date();
    await queryInterface.bulkInsert('resume_templates',
      TEMPLATES.map(t => ({ ...t, is_active: true, created_at: now, updated_at: now }))
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('resume_templates');
  },
};
