export default (sequelize, DataTypes) => {
  const Education = sequelize.define(
    'Education',
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
      institution: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      degree: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      fieldOfStudy: {
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
      grade: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'educations',
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ['seeker_id'], name: 'educations_seeker_id_idx' }],
    }
  );

  Education.associate = (models) => {
    Education.belongsTo(models.User, { foreignKey: 'seekerId', as: 'seeker' });
  };

  return Education;
};
