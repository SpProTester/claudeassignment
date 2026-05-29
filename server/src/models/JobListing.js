export default (sequelize, DataTypes) => {
  const JobListing = sequelize.define(
    'JobListing',
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
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: true, len: [5, 200] },
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true },
      },
      jobType: {
        type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'freelance', 'internship'),
        allowNull: false,
        defaultValue: 'full-time',
      },
      workMode: {
        type: DataTypes.ENUM('onsite', 'remote', 'hybrid'),
        allowNull: false,
        defaultValue: 'onsite',
      },
      experienceLevel: {
        type: DataTypes.ENUM('entry', 'mid', 'senior', 'lead', 'executive'),
        allowNull: false,
        defaultValue: 'mid',
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      salaryMin: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0 },
      },
      salaryMax: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0 },
      },
      status: {
        type: DataTypes.ENUM('draft', 'active', 'paused', 'closed', 'expired'),
        allowNull: false,
        defaultValue: 'draft',
      },
      viewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0 },
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'job_categories', key: 'id' },
        onDelete: 'SET NULL',
      },
    },
    {
      tableName: 'job_listings',
      timestamps: true,
      underscored: true,
      indexes: [
        { unique: true, fields: ['slug'], name: 'job_listings_slug_unique' },
        { fields: ['employer_id'], name: 'job_listings_employer_id_idx' },
        { fields: ['status'], name: 'job_listings_status_idx' },
        { fields: ['job_type'], name: 'job_listings_job_type_idx' },
        { fields: ['work_mode'], name: 'job_listings_work_mode_idx' },
        { fields: ['experience_level'], name: 'job_listings_experience_level_idx' },
      ],
    }
  );

  JobListing.associate = (models) => {
    JobListing.belongsTo(models.EmployerProfile, { foreignKey: 'employerId', as: 'employer' });
    JobListing.belongsTo(models.JobCategory, { foreignKey: 'categoryId', as: 'category' });
    JobListing.hasMany(models.Application, { foreignKey: 'jobId', as: 'applications' });
    JobListing.hasMany(models.SavedJob, { foreignKey: 'jobId', as: 'savedByUsers' });
    JobListing.belongsToMany(models.Skill, {
      through: models.JobSkill,
      foreignKey: 'jobId',
      otherKey: 'skillId',
      as: 'skills',
    });
  };

  return JobListing;
};
