export default (sequelize, DataTypes) => {
  const Job = sequelize.define(
    'Job',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      companyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'companies', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: true, len: [5, 200] },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true },
      },
      requirements: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      responsibilities: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      jobType: {
        type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'remote', 'internship'),
        allowNull: false,
        defaultValue: 'full-time',
      },
      experienceLevel: {
        type: DataTypes.ENUM('entry', 'mid', 'senior', 'lead', 'executive'),
        allowNull: false,
        defaultValue: 'mid',
      },
      salaryMin: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      salaryMax: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      skills: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'jobs',
      timestamps: true,
      underscored: true,
    }
  );

  Job.associate = (models) => {
    Job.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    Job.hasMany(models.Application, { foreignKey: 'jobId', as: 'applications' });
  };

  return Job;
};
