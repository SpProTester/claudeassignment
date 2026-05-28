'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_listings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      employer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'employer_profiles', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      title: { type: Sequelize.STRING(200), allowNull: false },
      slug: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: false },
      job_type: {
        type: Sequelize.ENUM('full-time', 'part-time', 'contract', 'freelance', 'internship'),
        allowNull: false,
        defaultValue: 'full-time',
      },
      work_mode: {
        type: Sequelize.ENUM('onsite', 'remote', 'hybrid'),
        allowNull: false,
        defaultValue: 'onsite',
      },
      experience_level: {
        type: Sequelize.ENUM('entry', 'mid', 'senior', 'lead', 'executive'),
        allowNull: false,
        defaultValue: 'mid',
      },
      location: { type: Sequelize.STRING(255), allowNull: true },
      salary_min: { type: Sequelize.INTEGER, allowNull: true },
      salary_max: { type: Sequelize.INTEGER, allowNull: true },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'paused', 'closed', 'expired'),
        allowNull: false,
        defaultValue: 'draft',
      },
      views_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      expires_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('job_listings', ['slug'], { unique: true, name: 'job_listings_slug_unique' });
    await queryInterface.addIndex('job_listings', ['employer_id'], { name: 'job_listings_employer_id_idx' });
    await queryInterface.addIndex('job_listings', ['status'], { name: 'job_listings_status_idx' });
    await queryInterface.addIndex('job_listings', ['job_type'], { name: 'job_listings_job_type_idx' });
    await queryInterface.addIndex('job_listings', ['work_mode'], { name: 'job_listings_work_mode_idx' });
    await queryInterface.addIndex('job_listings', ['experience_level'], { name: 'job_listings_experience_level_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('job_listings');
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_job_listings_job_type";
      DROP TYPE IF EXISTS "enum_job_listings_work_mode";
      DROP TYPE IF EXISTS "enum_job_listings_experience_level";
      DROP TYPE IF EXISTS "enum_job_listings_status";
    `);
  },
};
