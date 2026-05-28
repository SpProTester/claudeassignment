'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('jobs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      requirements: { type: Sequelize.TEXT, allowNull: true },
      responsibilities: { type: Sequelize.TEXT, allowNull: true },
      job_type: {
        type: Sequelize.ENUM('full-time', 'part-time', 'contract', 'remote', 'internship'),
        allowNull: false,
        defaultValue: 'full-time',
      },
      experience_level: {
        type: Sequelize.ENUM('entry', 'mid', 'senior', 'lead', 'executive'),
        allowNull: false,
        defaultValue: 'mid',
      },
      salary_min: { type: Sequelize.INTEGER, allowNull: true },
      salary_max: { type: Sequelize.INTEGER, allowNull: true },
      location: { type: Sequelize.STRING(255), allowNull: true },
      category: { type: Sequelize.STRING(100), allowNull: true },
      skills: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      expires_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('jobs', ['company_id'], { name: 'jobs_company_id_idx' });
    await queryInterface.addIndex('jobs', ['is_active'], { name: 'jobs_is_active_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('jobs');
  },
};
