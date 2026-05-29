export default (sequelize, DataTypes) => {
  const JobCategory = sequelize.define(
    'JobCategory',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true, len: [2, 100] },
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: 'job_categories',
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ['slug'], name: 'job_categories_slug_unique' }],
    }
  );

  JobCategory.associate = (models) => {
    JobCategory.hasMany(models.JobListing, { foreignKey: 'categoryId', as: 'jobs' });
  };

  return JobCategory;
};
