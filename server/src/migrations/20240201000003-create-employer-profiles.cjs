'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('employer_profiles', {
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
      company_name: { type: Sequelize.STRING(200), allowNull: false },
      company_slug: { type: Sequelize.STRING(200), allowNull: false, unique: true },
      logo_url: { type: Sequelize.TEXT, allowNull: true },
      website_url: { type: Sequelize.STRING(255), allowNull: true },
      industry: { type: Sequelize.STRING(100), allowNull: true },
      company_size: {
        type: Sequelize.ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'),
        allowNull: true,
      },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('employer_profiles', ['company_slug'], {
      unique: true,
      name: 'employer_profiles_slug_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('employer_profiles');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_employer_profiles_company_size"');
  },
};
