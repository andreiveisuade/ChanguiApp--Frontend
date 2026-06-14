// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*'],
  },
  {
    // import/no-named-as-default(-member) da falsos positivos con módulos que
    // exportan default + named con el mismo nombre (axios, i18n, repositories).
    rules: {
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
    },
  },
  {
    // Tests y mocks: globals de Jest/Node; require() permitido (patrón del repo);
    // los componentes inline de los tests no necesitan displayName.
    files: [
      '**/__tests__/**/*.{ts,tsx,js,jsx}',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/__mocks__/**/*.{ts,tsx,js,jsx}',
    ],
    languageOptions: {
      globals: { ...globals.jest, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'react/display-name': 'off',
    },
  },
]);
