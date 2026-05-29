'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('search_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      keyword: { type: Sequelize.STRING(255), allowNull: false },
      searched_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // Composite index for weekly aggregation queries
    await queryInterface.addIndex('search_logs', ['keyword', 'searched_at'], {
      name: 'search_logs_keyword_time_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('search_logs');
  },
};
