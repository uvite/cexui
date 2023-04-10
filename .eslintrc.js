/** @type {import('eslint').Linter['Config']} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
    'plugin:prettier/recommended',
     "next",
    "prettier"
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off"
  },
  ignorePatterns: ['**/*.d.ts', '**/__generated__/', '**/*.generated.ts'],
};
