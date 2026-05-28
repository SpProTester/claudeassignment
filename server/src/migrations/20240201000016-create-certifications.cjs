'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('certifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      seeker_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      name: { type: Sequelize.STRING(255), allowNull: false },
      issuing_organization: { type: Sequelize.STRING(255), allowNull: false },
      issue_date: { type: Sequelize.DATEONLY, allowNull: true },
      expiry_date: { type: Sequelize.DATEONLY, allowNull: true },
      credential_id: { type: Sequelize.STRING(255), allowNull: true },
      credential_url: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('certifications', ['seeker_id'], {
      name: 'certifications_seeker_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('certifications');
  },
};
