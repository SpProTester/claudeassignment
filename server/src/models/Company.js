export default (sequelize, DataTypes) => {
  const Company = sequelize.define(
    'Company',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: true, len: [2, 200] },
      },
      logoUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      website: {
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'companies',
      timestamps: true,
      underscored: true,
    }
  );

  Company.associate = (models) => {
    Company.belongsTo(models.User, { foreignKey: 'userId', as: 'owner' });
    Company.hasMany(models.Job, { foreignKey: 'companyId', as: 'jobs' });
  };

  return Company;
};
