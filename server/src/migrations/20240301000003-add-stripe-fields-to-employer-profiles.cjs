'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employer_profiles', 'stripe_customer_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('employer_profiles', 'stripe_subscription_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('employer_profiles', 'subscription_status', {
      type: Sequelize.ENUM('active', 'canceled', 'past_due', 'trialing', 'at_risk'),
      allowNull: true,
    });

    await queryInterface.addColumn('employer_profiles', 'subscription_current_period_end', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Extend existing plan enum with new plan names (Postgres supports ADD VALUE)
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_employer_profiles_subscription_plan" ADD VALUE IF NOT EXISTS 'starter';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_employer_profiles_subscription_plan" ADD VALUE IF NOT EXISTS 'professional';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_employer_profiles_subscription_plan" ADD VALUE IF NOT EXISTS 'business';`
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('employer_profiles', 'stripe_customer_id');
    await queryInterface.removeColumn('employer_profiles', 'stripe_subscription_id');
    await queryInterface.removeColumn('employer_profiles', 'subscription_status');
    await queryInterface.removeColumn('employer_profiles', 'subscription_current_period_end');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_employer_profiles_subscription_status";'
    );
  },
};
