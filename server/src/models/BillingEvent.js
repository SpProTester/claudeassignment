export default (sequelize, DataTypes) => {
  const BillingEvent = sequelize.define(
    'BillingEvent',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      employerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'employer_profiles', key: 'id' },
        onDelete: 'CASCADE',
      },
      stripeInvoiceId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Amount in smallest currency unit (cents)',
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'usd',
      },
      status: {
        type: DataTypes.ENUM('paid', 'failed', 'pending', 'refunded'),
        allowNull: false,
      },
      plan: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      periodStart: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      periodEnd: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      receiptUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'billing_events',
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ['employer_id'], name: 'billing_events_employer_id_idx' }],
    }
  );

  BillingEvent.associate = (models) => {
    BillingEvent.belongsTo(models.EmployerProfile, { foreignKey: 'employerId', as: 'employer' });
  };

  return BillingEvent;
};
