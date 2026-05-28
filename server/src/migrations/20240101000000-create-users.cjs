'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      first_name: { type: Sequelize.STRING(100), allowNull: false },
      last_name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      role: {
        type: Sequelize.ENUM('seeker', 'employer', 'admin'),
        allowNull: false,
        defaultValue: 'seeker',
      },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      avatar_url: { type: Sequelize.TEXT, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      email_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('users', ['email'], { unique: true, name: 'users_email_unique' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
