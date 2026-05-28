'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('experiences', {
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
      company: { type: Sequelize.STRING(255), allowNull: false },
      title: { type: Sequelize.STRING(255), allowNull: false },
      location: { type: Sequelize.STRING(255), allowNull: true },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: true },
      is_current: { type: Sequelize.BOOLEAN, defaultValue: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('experiences', ['seeker_id'], {
      name: 'experiences_seeker_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('experiences');
  },
};
