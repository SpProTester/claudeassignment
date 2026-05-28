'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('applications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      job_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'job_listings', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      seeker_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      resume_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'resumes', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      cover_letter: { type: Sequelize.TEXT, allowNull: true },
      ats_stage: {
        type: Sequelize.ENUM('applied', 'screening', 'interview', 'offer', 'hired', 'rejected'),
        allowNull: false,
        defaultValue: 'applied',
      },
      employer_rating: { type: Sequelize.INTEGER, allowNull: true },
      employer_notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('applications', ['job_id', 'seeker_id'], {
      unique: true,
      name: 'unique_application_per_job',
    });
    await queryInterface.addIndex('applications', ['seeker_id'], { name: 'applications_seeker_id_idx' });
    await queryInterface.addIndex('applications', ['ats_stage'], { name: 'applications_ats_stage_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('applications');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_applications_ats_stage"');
  },
};
