'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const cols = await queryInterface.describeTable('users');

    if (!cols.refresh_token) {
      await queryInterface.addColumn('users', 'refresh_token', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      });
    }
    if (!cols.password_reset_otp) {
      await queryInterface.addColumn('users', 'password_reset_otp', {
        type: Sequelize.STRING(6),
        allowNull: true,
        defaultValue: null,
      });
    }
    if (!cols.password_reset_otp_expiry) {
      await queryInterface.addColumn('users', 'password_reset_otp_expiry', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    const cols = await queryInterface.describeTable('users');
    if (cols.refresh_token) await queryInterface.removeColumn('users', 'refresh_token');
    if (cols.password_reset_otp) await queryInterface.removeColumn('users', 'password_reset_otp');
    if (cols.password_reset_otp_expiry) await queryInterface.removeColumn('users', 'password_reset_otp_expiry');
  },
};
