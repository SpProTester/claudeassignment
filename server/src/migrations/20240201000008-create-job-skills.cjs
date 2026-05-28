'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_skills', {
      job_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'job_listings', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      skill_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'skills', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      is_required: { type: Sequelize.BOOLEAN, defaultValue: true },
    });

    await queryInterface.addIndex('job_skills', ['skill_id'], { name: 'job_skills_skill_id_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('job_skills');
  },
};
