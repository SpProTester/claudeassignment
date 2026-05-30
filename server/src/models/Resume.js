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
      // Uploaded resumes: fileName + storagePath set; null for built resumes until PDF generated.
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      storagePath: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      // ── Builder-specific fields ──────────────────────────────────────
      resumeType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'uploaded',
        validate: { isIn: [['uploaded', 'built']] },
      },
      templateId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'resume_templates', key: 'id' },
        onDelete: 'SET NULL',
      },
      resumeContent: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      tableName: 'resumes',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['seeker_id'],   name: 'resumes_seeker_id_idx' },
        { fields: ['is_default'],  name: 'resumes_is_default_idx' },
        { fields: ['resume_type'], name: 'resumes_resume_type_idx' },
        { fields: ['template_id'], name: 'resumes_template_id_idx' },
      ],
    }
  );

  Resume.associate = (models) => {
    Resume.belongsTo(models.User,           { foreignKey: 'seekerId',  as: 'seeker' });
    Resume.belongsTo(models.ResumeTemplate, { foreignKey: 'templateId', as: 'template' });
    Resume.hasMany(models.Application,     { foreignKey: 'resumeId',  as: 'applications' });
  };

  return Resume;
};
