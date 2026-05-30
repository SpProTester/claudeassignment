export default (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      adminId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      entityType: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      details: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      tableName: 'audit_logs',
      timestamps: true,
      updatedAt: false,
      underscored: true,
      indexes: [
        { fields: ['admin_id'], name: 'audit_logs_admin_id_idx' },
        { fields: ['action'], name: 'audit_logs_action_idx' },
        { fields: ['entity_type', 'entity_id'], name: 'audit_logs_entity_idx' },
        { fields: ['created_at'], name: 'audit_logs_created_at_idx' },
      ],
    }
  );

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, { foreignKey: 'adminId', as: 'admin' });
  };

  return AuditLog;
};
