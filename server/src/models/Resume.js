export default (sequelize, DataTypes) => {
  const Resume = sequelize.define(
    'Resume',
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
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      storagePath: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true },
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0 },
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      label: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      parsedData: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      tableName: 'resumes',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['seeker_id'], name: 'resumes_seeker_id_idx' },
        { fields: ['is_default'], name: 'resumes_is_default_idx' },
      ],
    }
  );

  Resume.associate = (models) => {
    Resume.belongsTo(models.User, { foreignKey: 'seekerId', as: 'seeker' });
    Resume.hasMany(models.Application, { foreignKey: 'resumeId', as: 'applications' });
  };

  return Resume;
};
