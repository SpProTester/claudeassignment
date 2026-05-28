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
        references: { model: 'jobs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      cover_letter: { type: Sequelize.TEXT, allowNull: true },
      resume_url: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'hired'),
        allowNull: false,
        defaultValue: 'pending',
      },
      employer_notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('applications', ['job_id', 'user_id'], {
      unique: true,
      name: 'unique_application_per_job',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('applications');
  },
};
