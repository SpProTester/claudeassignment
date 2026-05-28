export default (sequelize, DataTypes) => {
  const SeekerProfile = sequelize.define(
    'SeekerProfile',
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
      headline: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      experienceYears: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: { min: 0, max: 60 },
      },
      openToWork: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      profileVisibility: {
        type: DataTypes.ENUM('public', 'private', 'connections'),
        allowNull: false,
        defaultValue: 'public',
      },
    },
    {
      tableName: 'seeker_profiles',
      timestamps: true,
      underscored: true,
    }
  );

  SeekerProfile.associate = (models) => {
    SeekerProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return SeekerProfile;
};
