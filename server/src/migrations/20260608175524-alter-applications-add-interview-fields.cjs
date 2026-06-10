'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('applications', 'interview_scheduled_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('applications', 'interview_meeting_link', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('applications', 'interview_meeting_provider', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

    await queryInterface.addColumn('applications', 'interview_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('applications', 'interview_notes');
    await queryInterface.removeColumn('applications', 'interview_meeting_provider');
    await queryInterface.removeColumn('applications', 'interview_meeting_link');
    await queryInterface.removeColumn('applications', 'interview_scheduled_at');
  },
};
