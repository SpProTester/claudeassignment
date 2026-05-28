export default (sequelize, DataTypes) => {
  const Skill = sequelize.define(
    'Skill',
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
        validate: { notEmpty: true },
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: 'skills',
      timestamps: true,
      underscored: true,
      indexes: [
        { unique: true, fields: ['slug'], name: 'skills_slug_unique' },
        { fields: ['category'], name: 'skills_category_idx' },
      ],
    }
  );

  Skill.associate = (models) => {
    Skill.belongsToMany(models.User, {
      through: models.SeekerSkill,
      foreignKey: 'skillId',
      otherKey: 'seekerId',
      as: 'seekers',
    });
    Skill.belongsToMany(models.JobListing, {
      through: models.JobSkill,
      foreignKey: 'skillId',
      otherKey: 'jobId',
      as: 'jobListings',
    });
  };

  return Skill;
};
