'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_alerts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      seeker_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      keywords: { type: Sequelize.STRING(255), allowNull: true },
      location: { type: Sequelize.STRING(255), allowNull: true },
      job_type: {
        type: Sequelize.ENUM('full-time', 'part-time', 'contract', 'freelance', 'internship'),
        allowNull: true,
      },
      work_mode: {
        type: Sequelize.ENUM('onsite', 'remote', 'hybrid'),
        allowNull: true,
      },
      experience_level: {
        type: Sequelize.ENUM('entry', 'mid', 'senior', 'lead', 'executive'),
        allowNull: true,
      },
      salary_min: { type: Sequelize.INTEGER, allowNull: true },
      frequency: {
        type: Sequelize.ENUM('instant', 'daily', 'weekly'),
        allowNull: false,
        defaultValue: 'daily',
      },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      last_sent_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('job_alerts', ['seeker_id'], { name: 'job_alerts_seeker_id_idx' });
    await queryInterface.addIndex('job_alerts', ['is_active'], { name: 'job_alerts_is_active_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('job_alerts');
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_job_alerts_job_type";
      DROP TYPE IF EXISTS "enum_job_alerts_work_mode";
      DROP TYPE IF EXISTS "enum_job_alerts_experience_level";
      DROP TYPE IF EXISTS "enum_job_alerts_frequency";
    `);
  },
};
