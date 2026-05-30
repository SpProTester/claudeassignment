export default (sequelize, DataTypes) => {
  const ResumeTemplate = sequelize.define(
    'ResumeTemplate',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      slug: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      thumbnailUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: 'resume_templates',
      timestamps: true,
      underscored: true,
    }
  );

  ResumeTemplate.associate = (models) => {
    ResumeTemplate.hasMany(models.Resume, { foreignKey: 'templateId', as: 'resumes' });
  };

  return ResumeTemplate;
};
