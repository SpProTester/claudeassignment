export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true, len: [2, 100] },
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true, len: [2, 100] },
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
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      avatarUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      underscored: true,
    }
  );

  User.associate = (models) => {
    User.hasOne(models.Company, { foreignKey: 'userId', as: 'company' });
    User.hasMany(models.Application, { foreignKey: 'userId', as: 'applications' });
  };

  return User;
};
