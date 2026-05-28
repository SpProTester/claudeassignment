'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seeker_skills', {
      seeker_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'users', key: 'id' },
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
      proficiency_level: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'expert'),
        allowNull: false,
        defaultValue: 'intermediate',
      },
      years_of_experience: { type: Sequelize.INTEGER, allowNull: true },
    });

    await queryInterface.addIndex('seeker_skills', ['skill_id'], { name: 'seeker_skills_skill_id_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('seeker_skills');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_seeker_skills_proficiency_level"');
  },
};
