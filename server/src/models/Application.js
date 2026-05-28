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
        references: { model: 'job_listings', key: 'id' },
        onDelete: 'CASCADE',
      },
      seekerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      resumeId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'resumes', key: 'id' },
        onDelete: 'SET NULL',
      },
      coverLetter: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      atsStage: {
        type: DataTypes.ENUM('applied', 'screening', 'interview', 'offer', 'hired', 'rejected'),
        allowNull: false,
        defaultValue: 'applied',
      },
      employerRating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 },
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
        { unique: true, fields: ['job_id', 'seeker_id'], name: 'unique_application_per_job' },
        { fields: ['seeker_id'], name: 'applications_seeker_id_idx' },
        { fields: ['ats_stage'], name: 'applications_ats_stage_idx' },
      ],
    }
  );

  Application.associate = (models) => {
    Application.belongsTo(models.JobListing, { foreignKey: 'jobId', as: 'job' });
    Application.belongsTo(models.User, { foreignKey: 'seekerId', as: 'seeker' });
    Application.belongsTo(models.Resume, { foreignKey: 'resumeId', as: 'resume' });
  };

  return Application;
};
