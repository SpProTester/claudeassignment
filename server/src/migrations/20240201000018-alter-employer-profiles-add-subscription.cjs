'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employer_profiles', 'subscription_plan', {
      type: Sequelize.ENUM('free', 'basic', 'premium'),
      allowNull: false,
      defaultValue: 'free',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('employer_profiles', 'subscription_plan');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_employer_profiles_subscription_plan";'
    );
  },
};
