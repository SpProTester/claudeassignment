'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('companies', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING(200), allowNull: false },
      logo_url: { type: Sequelize.TEXT, allowNull: true },
      website: { type: Sequelize.STRING(255), allowNull: true },
      industry: { type: Sequelize.STRING(100), allowNull: true },
      company_size: {
        type: Sequelize.ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'),
        allowNull: true,
      },
      description: { type: Sequelize.TEXT, allowNull: true },
      location: { type: Sequelize.STRING(255), allowNull: true },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('companies');
  },
};
