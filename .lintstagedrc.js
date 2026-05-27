// =============================================================================
// LINT-STAGED CONFIGURATION — Job Portal Enterprise
// Runs targeted linters/formatters only on staged files before commit
// Keeps pre-commit hooks fast by scoping work to changed files only
// =============================================================================

/** @type {import('lint-staged').Config} */
const config = {
  // ---------------------------------------------------------------------------
  // TYPESCRIPT & JAVASCRIPT
  // Run ESLint with auto-fix, then Prettier format
  // Type checking is deferred to pre-push (too slow for pre-commit)
  // ---------------------------------------------------------------------------
  '**/*.{ts,tsx,js,jsx,mjs,cjs}': [
    'eslint --fix --max-warnings=0 --no-ignore',
    'prettier --write',
  ],

  // ---------------------------------------------------------------------------
  // STYLES
  // ---------------------------------------------------------------------------
  '**/*.{css,scss,sass}': [
    'stylelint --fix',
    'prettier --write',
  ],

  // ---------------------------------------------------------------------------
  // JSON & CONFIG FILES
  // ---------------------------------------------------------------------------
  '**/*.{json,jsonc}': [
    'prettier --write',
  ],

  // ---------------------------------------------------------------------------
  // MARKDOWN & DOCUMENTATION
  // ---------------------------------------------------------------------------
  '**/*.{md,mdx}': [
    'prettier --write --prose-wrap always',
  ],

  // ---------------------------------------------------------------------------
  // YAML (GitHub Actions, configs)
  // ---------------------------------------------------------------------------
  '**/*.{yml,yaml}': [
    'prettier --write',
  ],

  // ---------------------------------------------------------------------------
  // DATABASE MIGRATIONS
  // Validate SQL syntax before committing migration files
  // ---------------------------------------------------------------------------
  'supabase/migrations/**/*.sql': [
    // Placeholder: add sql-lint or pg-formatter if needed
    'prettier --write --parser sql',
  ],

  // ---------------------------------------------------------------------------
  // PACKAGE.JSON FILES
  // Sort package.json keys consistently
  // ---------------------------------------------------------------------------
  '**/package.json': [
    'prettier --write',
  ],
}

module.exports = config
