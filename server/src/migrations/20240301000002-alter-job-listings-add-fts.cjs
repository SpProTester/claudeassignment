'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add category_id FK — IF NOT EXISTS so re-runs are safe
    await queryInterface.sequelize.query(`
      ALTER TABLE job_listings
        ADD COLUMN IF NOT EXISTS category_id UUID
          REFERENCES job_categories(id) ON DELETE SET NULL ON UPDATE CASCADE;
    `);

    // 2. Add the tsvector column — IF NOT EXISTS for idempotency
    await queryInterface.sequelize.query(`
      ALTER TABLE job_listings
        ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;
    `);

    // 3. Backfill existing rows:
    //    title  → weight A (highest priority)
    //    description → weight B
    await queryInterface.sequelize.query(`
      UPDATE job_listings
      SET search_vector =
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B');
    `);

    // 4. GIN index for O(log n) FTS lookups
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS job_listings_search_vector_gin
        ON job_listings USING GIN(search_vector);
    `);

    // 5. Plain B-tree index for category filter joins
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS job_listings_category_id_idx
        ON job_listings(category_id);
    `);

    // 6. Trigger function — keeps search_vector in sync on INSERT / UPDATE
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION job_listings_search_vector_update()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 7. Fire trigger only when title or description changes (cheap)
    await queryInterface.sequelize.query(`
      CREATE TRIGGER job_listings_search_vector_trigger
        BEFORE INSERT OR UPDATE OF title, description
        ON job_listings
        FOR EACH ROW EXECUTE FUNCTION job_listings_search_vector_update();
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS job_listings_search_vector_trigger ON job_listings;
    `);
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS job_listings_search_vector_update();
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS job_listings_search_vector_gin;
    `);
    await queryInterface.removeIndex('job_listings', 'job_listings_category_id_idx');
    await queryInterface.removeColumn('job_listings', 'search_vector');
    await queryInterface.removeColumn('job_listings', 'category_id');
  },
};
