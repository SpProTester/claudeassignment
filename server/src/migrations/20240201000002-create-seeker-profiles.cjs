'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seeker_profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      headline: { type: Sequelize.STRING(255), allowNull: true },
      summary: { type: Sequelize.TEXT, allowNull: true },
      location: { type: Sequelize.STRING(255), allowNull: true },
      experience_years: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      open_to_work: { type: Sequelize.BOOLEAN, defaultValue: true },
      profile_visibility: {
        type: Sequelize.ENUM('public', 'private', 'connections'),
        allowNull: false,
        defaultValue: 'public',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('seeker_profiles');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_seeker_profiles_profile_visibility"');
  },
};
