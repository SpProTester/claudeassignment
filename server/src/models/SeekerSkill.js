export default (sequelize, DataTypes) => {
  const SeekerSkill = sequelize.define(
    'SeekerSkill',
    {
      seekerId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      skillId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'skills', key: 'id' },
        onDelete: 'CASCADE',
      },
      proficiencyLevel: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'expert'),
        allowNull: false,
        defaultValue: 'intermediate',
      },
      yearsOfExperience: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0, max: 60 },
      },
    },
    {
      tableName: 'seeker_skills',
      timestamps: false,
      underscored: true,
    }
  );

  return SeekerSkill;
};
