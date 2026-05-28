export default (sequelize, DataTypes) => {
  const JobAlert = sequelize.define(
    'JobAlert',
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
      keywords: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      jobType: {
        type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'freelance', 'internship'),
        allowNull: true,
      },
      workMode: {
        type: DataTypes.ENUM('onsite', 'remote', 'hybrid'),
        allowNull: true,
      },
      experienceLevel: {
        type: DataTypes.ENUM('entry', 'mid', 'senior', 'lead', 'executive'),
        allowNull: true,
      },
      salaryMin: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0 },
      },
      frequency: {
        type: DataTypes.ENUM('instant', 'daily', 'weekly'),
        allowNull: false,
        defaultValue: 'daily',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      lastSentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'job_alerts',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['seeker_id'], name: 'job_alerts_seeker_id_idx' },
        { fields: ['is_active'], name: 'job_alerts_is_active_idx' },
      ],
    }
  );

  JobAlert.associate = (models) => {
    JobAlert.belongsTo(models.User, { foreignKey: 'seekerId', as: 'seeker' });
  };

  return JobAlert;
};
