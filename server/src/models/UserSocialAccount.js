export default (sequelize, DataTypes) => {
  const UserSocialAccount = sequelize.define(
    'UserSocialAccount',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      provider: {
        type: DataTypes.ENUM('google', 'apple'),
        allowNull: false,
      },
      providerId: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      displayName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      avatarUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      linkedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'user_social_accounts',
      timestamps: true,
      underscored: true,
      indexes: [
        { unique: true, fields: ['provider', 'provider_id'], name: 'user_social_accounts_provider_id_unique' },
        { fields: ['user_id'], name: 'user_social_accounts_user_id_idx' },
      ],
    }
  );

  UserSocialAccount.associate = (models) => {
    UserSocialAccount.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return UserSocialAccount;
};
