export default (sequelize, DataTypes) => {
  const SavedJob = sequelize.define(
    'SavedJob',
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
      jobId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'job_listings', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'saved_jobs',
      timestamps: true,
      underscored: true,
      indexes: [
        { unique: true, fields: ['seeker_id', 'job_id'], name: 'unique_saved_job' },
        { fields: ['seeker_id'], name: 'saved_jobs_seeker_id_idx' },
      ],
    }
  );

  SavedJob.associate = (models) => {
    SavedJob.belongsTo(models.User, { foreignKey: 'seekerId', as: 'seeker' });
    SavedJob.belongsTo(models.JobListing, { foreignKey: 'jobId', as: 'job' });
  };

  return SavedJob;
};
