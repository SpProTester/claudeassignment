export default (sequelize, DataTypes) => {
  const Experience = sequelize.define(
    'Experience',
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
      company: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      isCurrent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'experiences',
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ['seeker_id'], name: 'experiences_seeker_id_idx' }],
    }
  );

  Experience.associate = (models) => {
    Experience.belongsTo(models.User, { foreignKey: 'seekerId', as: 'seeker' });
  };

  return Experience;
};
