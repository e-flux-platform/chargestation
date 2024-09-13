const path = require('path');

module.exports = {
  env: {
    node: true,
    browser: true,
  },
  settings: {
    jest: { version: 26 },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  extends: [
    'plugin:bedrock/recommended',
    'plugin:bedrock/react',
    'plugin:bedrock/jest',
    'plugin:@typescript-eslint/recommended',
  ],
  globals: {
    __ENV__: 'readonly',
  },
  ignorePatterns: ['.eslintrc.js'],
};
