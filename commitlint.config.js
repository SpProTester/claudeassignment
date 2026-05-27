// =============================================================================
// COMMITLINT CONFIGURATION — Job Portal Enterprise
// Enforces Conventional Commits specification across all packages
// Spec: https://www.conventionalcommits.org/en/v1.0.0/
// =============================================================================

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],

  // ---------------------------------------------------------------------------
  // PARSER OPTIONS
  // ---------------------------------------------------------------------------
  parserPreset: {
    parserOpts: {
      // Pattern: type(scope): subject
      // Breaking change via footer: BREAKING CHANGE: description
      headerPattern: /^(\w*)(?:\((\w*)\))?: (.*)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },

  // ---------------------------------------------------------------------------
  // RULES
  // Format: [level, applicable, value]
  // Level:  0 = disabled | 1 = warn | 2 = error
  // ---------------------------------------------------------------------------
  rules: {
    // --- TYPE ---
    'type-enum': [
      2,
      'always',
      [
        'feat',      // New feature — triggers MINOR version bump
        'fix',       // Bug fix — triggers PATCH version bump
        'docs',      // Documentation only
        'style',     // Formatting, whitespace (no logic change)
        'refactor',  // Code restructuring (no feature/fix)
        'perf',      // Performance improvement
        'test',      // Adding or updating tests
        'build',     // Build system or external dependency changes
        'ci',        // CI/CD configuration
        'chore',     // Maintenance (no production code change)
        'revert',    // Reverts a previous commit
        'security',  // Security patch or improvement
        'a11y',      // Accessibility improvement
        'i18n',      // Internationalization
        'db',        // Database migration or schema change
        'release',   // Release commit (automated by semantic-release)
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // --- SCOPE ---
    'scope-enum': [
      1, // warn (not error) — allows occasional non-standard scopes
      'always',
      [
        // Auth & Identity
        'auth',
        'mfa',
        'oauth',
        'session',

        // Core Modules
        'jobs',
        'seeker',
        'employer',
        'admin',
        'ats',

        // Features
        'ai',
        'payments',
        'notifications',
        'search',
        'resume',
        'analytics',
        'subscriptions',

        // Tech Layer
        'api',
        'db',
        'migrations',
        'middleware',
        'edge-functions',
        'storage',
        'realtime',

        // Frontend
        'ui',
        'components',
        'hooks',
        'store',
        'layout',
        'pages',
        'forms',

        // Infrastructure
        'ci',
        'cd',
        'config',
        'deps',
        'docker',
        'vercel',
        'supabase',

        // Cross-cutting
        'security',
        'performance',
        'a11y',
        'seo',
        'types',
        'utils',
        'testing',
      ],
    ],
    'scope-case': [2, 'always', 'lower-case'],

    // --- SUBJECT ---
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-min-length': [2, 'always', 10],
    'subject-max-length': [2, 'always', 100],

    // --- HEADER ---
    'header-max-length': [2, 'always', 120],

    // --- BODY ---
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [1, 'always', 200],

    // --- FOOTER ---
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [1, 'always', 200],
  },

  // ---------------------------------------------------------------------------
  // CUSTOM MESSAGES
  // ---------------------------------------------------------------------------
  helpUrl:
    'https://github.com/your-org/job-portal/blob/main/docs/git/COMMIT_CONVENTION.md',

  prompt: {
    messages: {
      skip: '(press enter to skip)',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyWarning: 'can not be empty',
      upperLimitWarning: 'over limit',
      lowerLimitWarning: 'below limit',
    },
    questions: {
      type: {
        description: "Select the TYPE of change you're committing:",
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description:
              'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description:
              'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
            emoji: '🚨',
          },
          build: {
            description:
              'Changes that affect the build system or external dependencies',
            title: 'Builds',
            emoji: '🛠',
          },
          ci: {
            description:
              'Changes to our CI configuration files and scripts',
            title: 'Continuous Integrations',
            emoji: '⚙️',
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: 'Chores',
            emoji: '♻️',
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
            emoji: '🗑',
          },
          security: {
            description: 'Security patch or improvement',
            title: 'Security',
            emoji: '🔒',
          },
        },
      },
      scope: {
        description:
          'What is the SCOPE of this change (e.g. auth, jobs, seeker, employer)',
      },
      subject: {
        description: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
      },
      body: {
        description: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
      },
      isBreaking: {
        description: 'Are there any BREAKING CHANGES?',
      },
      breakingBody: {
        description:
          'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself:\n',
      },
      breaking: {
        description: 'Describe the breaking changes:\n',
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?',
      },
      issuesBody: {
        description:
          'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself:\n',
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".):\n',
      },
    },
  },
}

module.exports = config
