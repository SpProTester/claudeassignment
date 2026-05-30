'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('billing_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      employer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'employer_profiles', key: 'id' },
        onDelete: 'CASCADE',
      },
      stripe_invoice_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Amount in smallest currency unit (cents)',
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'usd',
      },
      status: {
        type: Sequelize.ENUM('paid', 'failed', 'pending', 'refunded'),
        allowNull: false,
      },
      plan: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      period_start: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      period_end: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      receipt_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('billing_events', ['employer_id'], {
      name: 'billing_events_employer_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('billing_events');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_billing_events_status";'
    );
  },
};
