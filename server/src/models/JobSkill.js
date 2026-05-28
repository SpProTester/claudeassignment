export default (sequelize, DataTypes) => {
  const JobSkill = sequelize.define(
    'JobSkill',
    {
      jobId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'job_listings', key: 'id' },
        onDelete: 'CASCADE',
      },
      skillId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'skills', key: 'id' },
        onDelete: 'CASCADE',
      },
      isRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'job_skills',
      timestamps: false,
      underscored: true,
    }
  );

  return JobSkill;
};
