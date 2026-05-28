export default (sequelize, DataTypes) => {
  const EmployerProfile = sequelize.define(
    'EmployerProfile',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      companyName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: true, len: [2, 200] },
      },
      companySlug: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      logoUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      websiteUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: { isUrl: true },
      },
      industry: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      companySize: {
        type: DataTypes.ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'),
        allowNull: true,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      subscriptionPlan: {
        type: DataTypes.ENUM('free', 'basic', 'premium'),
        allowNull: false,
        defaultValue: 'free',
      },
    },
    {
      tableName: 'employer_profiles',
      timestamps: true,
      underscored: true,
      indexes: [
        { unique: true, fields: ['company_slug'], name: 'employer_profiles_slug_unique' },
      ],
    }
  );

  EmployerProfile.associate = (models) => {
    EmployerProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    EmployerProfile.hasMany(models.JobListing, { foreignKey: 'employerId', as: 'jobListings' });
  };

  return EmployerProfile;
};
