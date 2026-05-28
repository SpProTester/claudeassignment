'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('skills', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      slug: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      category: { type: Sequelize.STRING(100), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('skills', ['slug'], { unique: true, name: 'skills_slug_unique' });
    await queryInterface.addIndex('skills', ['category'], { name: 'skills_category_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('skills');
  },
};
