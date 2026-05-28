'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'full_name', {
      type: Sequelize.STRING(200),
      allowNull: true, // temporarily nullable for existing rows
    });

    // Back-fill full_name from first_name + last_name if those columns exist
    await queryInterface.sequelize.query(`
      UPDATE users SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
      WHERE full_name IS NULL
    `);

    await queryInterface.changeColumn('users', 'full_name', {
      type: Sequelize.STRING(200),
      allowNull: false,
      defaultValue: '',
    });

    await queryInterface.addColumn('users', 'is_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    // Copy email_verified → is_verified
    await queryInterface.sequelize.query(`
      UPDATE users SET is_verified = email_verified WHERE is_verified IS DISTINCT FROM email_verified
    `);

    await queryInterface.removeColumn('users', 'first_name');
    await queryInterface.removeColumn('users', 'last_name');
    await queryInterface.removeColumn('users', 'phone');
    await queryInterface.removeColumn('users', 'avatar_url');
    await queryInterface.removeColumn('users', 'email_verified');

    await queryInterface.addIndex('users', ['role'], { name: 'users_role_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'users_role_idx');
    await queryInterface.removeColumn('users', 'full_name');
    await queryInterface.removeColumn('users', 'is_verified');
    await queryInterface.addColumn('users', 'first_name', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.addColumn('users', 'last_name', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.addColumn('users', 'phone', { type: Sequelize.STRING(20), allowNull: true });
    await queryInterface.addColumn('users', 'avatar_url', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('users', 'email_verified', { type: Sequelize.BOOLEAN, defaultValue: false });
  },
};
