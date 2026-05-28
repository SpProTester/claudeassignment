export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true, notEmpty: true },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('seeker', 'employer', 'admin'),
        allowNull: false,
        defaultValue: 'seeker',
      },
      fullName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: true, len: [2, 200] },
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      passwordResetOtp: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      passwordResetOtpExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      underscored: true,
      indexes: [
        { unique: true, fields: ['email'], name: 'users_email_unique' },
        { fields: ['role'], name: 'users_role_idx' },
      ],
    }
  );

  User.associate = (models) => {
    User.hasOne(models.SeekerProfile, { foreignKey: 'userId', as: 'seekerProfile' });
    User.hasOne(models.EmployerProfile, { foreignKey: 'userId', as: 'employerProfile' });
    User.hasMany(models.Resume, { foreignKey: 'seekerId', as: 'resumes' });
    User.hasMany(models.Application, { foreignKey: 'seekerId', as: 'applications' });
    User.hasMany(models.SavedJob, { foreignKey: 'seekerId', as: 'savedJobs' });
    User.hasMany(models.JobAlert, { foreignKey: 'seekerId', as: 'jobAlerts' });
    User.hasMany(models.Notification, { foreignKey: 'userId', as: 'notifications' });
    User.belongsToMany(models.Skill, {
      through: models.SeekerSkill,
      foreignKey: 'seekerId',
      otherKey: 'skillId',
      as: 'skills',
    });
    User.hasMany(models.Experience, { foreignKey: 'seekerId', as: 'experiences' });
    User.hasMany(models.Education, { foreignKey: 'seekerId', as: 'educations' });
    User.hasMany(models.Certification, { foreignKey: 'seekerId', as: 'certifications' });
  };

  return User;
};
