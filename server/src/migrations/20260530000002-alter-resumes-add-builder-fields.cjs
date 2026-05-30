'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Make file columns nullable so built resumes (no physical file) are valid
    await queryInterface.changeColumn('resumes', 'file_name',    { type: Sequelize.STRING(255), allowNull: true });
    await queryInterface.changeColumn('resumes', 'storage_path', { type: Sequelize.TEXT,        allowNull: true });

    await queryInterface.addColumn('resumes', 'resume_type', {
      type:         Sequelize.STRING(20),
      allowNull:    false,
      defaultValue: 'uploaded',
    });

    await queryInterface.addColumn('resumes', 'template_id', {
      type:       Sequelize.UUID,
      allowNull:  true,
      references: { model: 'resume_templates', key: 'id' },
      onDelete:   'SET NULL',
      onUpdate:   'CASCADE',
    });

    await queryInterface.addColumn('resumes', 'resume_content', {
      type:      Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.addIndex('resumes', ['resume_type'], { name: 'resumes_resume_type_idx' });
    await queryInterface.addIndex('resumes', ['template_id'], { name: 'resumes_template_id_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('resumes', 'resumes_template_id_idx');
    await queryInterface.removeIndex('resumes', 'resumes_resume_type_idx');
    await queryInterface.removeColumn('resumes', 'resume_content');
    await queryInterface.removeColumn('resumes', 'template_id');
    await queryInterface.removeColumn('resumes', 'resume_type');
    await queryInterface.changeColumn('resumes', 'storage_path', { type: Sequelize.TEXT,        allowNull: false });
    await queryInterface.changeColumn('resumes', 'file_name',    { type: Sequelize.STRING(255), allowNull: false });
  },
};
