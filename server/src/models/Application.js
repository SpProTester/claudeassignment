export default (sequelize, DataTypes) => {
  const Application = sequelize.define(
    'Application',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      jobId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'jobs', key: 'id' },
        onDelete: 'CASCADE',
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      coverLetter: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      resumeUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'hired'),
        allowNull: false,
        defaultValue: 'pending',
      },
      employerNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'applications',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['job_id', 'user_id'],
          name: 'unique_application_per_job',
        },
      ],
    }
  );

  Application.associate = (models) => {
    Application.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' });
    Application.belongsTo(models.User, { foreignKey: 'userId', as: 'applicant' });
  };

  return Application;
};
