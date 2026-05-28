'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.dropTable('applications', { cascade: true });
    await queryInterface.dropTable('jobs', { cascade: true });
    await queryInterface.dropTable('companies', { cascade: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('companies', {
      id: { type: Sequelize.UUID, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      name: { type: Sequelize.STRING(200), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.createTable('jobs', {
      id: { type: Sequelize.UUID, primaryKey: true },
      company_id: { type: Sequelize.UUID, allowNull: false },
      title: { type: Sequelize.STRING(200), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.createTable('applications', {
      id: { type: Sequelize.UUID, primaryKey: true },
      job_id: { type: Sequelize.UUID, allowNull: false },
      user_id: { type: Sequelize.UUID, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
};
