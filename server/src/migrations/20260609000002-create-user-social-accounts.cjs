'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_social_accounts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      provider: {
        type: Sequelize.ENUM('google', 'apple'),
        allowNull: false,
      },
      provider_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      display_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      avatar_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      linked_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('user_social_accounts', ['provider', 'provider_id'], {
      unique: true,
      name: 'user_social_accounts_provider_id_unique',
    });

    await queryInterface.addIndex('user_social_accounts', ['user_id'], {
      name: 'user_social_accounts_user_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_social_accounts');
    // ENUM type cleanup for PostgreSQL
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_user_social_accounts_provider";');
  },
};
