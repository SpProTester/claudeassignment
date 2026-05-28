'use strict';

// PostgreSQL lets you ADD values to an existing ENUM type but never remove them
// without a data migration. We add 'reviewing' (after 'screening') and
// 'shortlisted' (after 'reviewing') for the expanded ATS pipeline.
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_applications_ats_stage" ADD VALUE IF NOT EXISTS 'reviewing' AFTER 'screening';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_applications_ats_stage" ADD VALUE IF NOT EXISTS 'shortlisted' AFTER 'reviewing';`
    );
  },

  async down() {
    // PostgreSQL cannot remove ENUM values; a full type-swap migration would be
    // required (CREATE new type → ALTER column → DROP old type), which is only
    // safe with no data using the removed values.
  },
};
