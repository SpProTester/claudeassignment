'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('resumes', {
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
      file_name: { type: Sequelize.STRING(255), allowNull: false },
      storage_path: { type: Sequelize.TEXT, allowNull: false },
      file_size: { type: Sequelize.INTEGER, allowNull: true },
      is_default: { type: Sequelize.BOOLEAN, defaultValue: false },
      label: { type: Sequelize.STRING(100), allowNull: true },
      parsed_data: { type: Sequelize.JSONB, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('resumes', ['seeker_id'], { name: 'resumes_seeker_id_idx' });
    await queryInterface.addIndex('resumes', ['is_default'], { name: 'resumes_is_default_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('resumes');
  },
};
