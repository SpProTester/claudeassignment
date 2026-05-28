export default (sequelize, DataTypes) => {
  const Certification = sequelize.define(
    'Certification',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      seekerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      issuingOrganization: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      issueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      expiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      credentialId: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      credentialUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: { isUrl: true },
      },
    },
    {
      tableName: 'certifications',
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ['seeker_id'], name: 'certifications_seeker_id_idx' }],
    }
  );

  Certification.associate = (models) => {
    Certification.belongsTo(models.User, { foreignKey: 'seekerId', as: 'seeker' });
  };

  return Certification;
};
