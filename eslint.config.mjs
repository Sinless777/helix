// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import next from 'eslint-config-next';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

/**
 * ESLint flat config for Helix
 * - Supports Next.js App Router & TypeScript
 * - Works with React Server Components
 * - Enforces Prettier formatting rules
 */

export default defineConfig([
  // Next.js defaults (includes react & jsx-a11y rules)
  next,
  // TypeScript rules
  ...tseslint.configs.recommended,
  // Disable rules conflicting with Prettier
  prettier,

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // --- General ---
      'no-console': 'off',
      'no-debugger': 'error',
      'no-unused-vars': 'off',

      // --- TypeScript ---
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', disallowTypeAnnotations: false },
      ],
      '@typescript-eslint/no-unused-vars': [
        'off',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-require-imports': 'off',

      // --- React / Next ---
      'react/react-in-jsx-scope': 'off', // Next handles this
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': 'off',

      // --- Import rules ---
      'import/no-anonymous-default-export': 'off',
      'import/order': 'off',
    },
  },

  // --- Global Ignores ---
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'node_modules/**',
    'next-env.d.ts',
    'convex/_generated/**',
  ]),
]);
