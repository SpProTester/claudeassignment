'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('educations', {
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
      institution: { type: Sequelize.STRING(255), allowNull: false },
      degree: { type: Sequelize.STRING(255), allowNull: false },
      field_of_study: { type: Sequelize.STRING(255), allowNull: true },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: true },
      is_current: { type: Sequelize.BOOLEAN, defaultValue: false },
      grade: { type: Sequelize.STRING(100), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('educations', ['seeker_id'], {
      name: 'educations_seeker_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('educations');
  },
};
