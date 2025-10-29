// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/**
 * ESLint flat config for Helix
 * - Supports Next.js App Router & TypeScript
 * - Works with React Server Components
 * - Enforces Prettier formatting rules
 */

export default defineConfig([
  // Next.js defaults (includes react & jsx-a11y rules)
  ...next(),
  // TypeScript rules
  ...tseslint.configs.recommended,
  // Disable rules conflicting with Prettier
  prettier,

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // --- General ---
      "no-console": "warn",
      "no-debugger": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      // --- TypeScript ---
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", disallowTypeAnnotations: false },
      ],

      // --- React / Next ---
      "react/react-in-jsx-scope": "off", // Next handles this
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",

      // --- Import ordering (optional but tidy) ---
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },

  // --- Global Ignores ---
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "node_modules/**",
    "next-env.d.ts",
    "convex/_generated/**",
  ]),
]);
