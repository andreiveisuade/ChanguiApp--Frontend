const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  prettier,
  {
    // Reglas nuevas de react-hooks (React 19) que el patrón establecido del
    // proyecto (fetch-on-mount en useEffect) aún no cumple: visibles como
    // warning para ir migrando, sin bloquear el lint.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react/display-name': 'warn',
    },
  },
  // Los mocks manuales de jest viven fuera de __tests__/ y usan el global `jest`.
  {
    files: ['__mocks__/**/*.js'],
    languageOptions: { globals: { jest: 'readonly' } },
  },
  { ignores: ['dist/', 'android/', 'ios/', '.expo/', 'node_modules/'] },
];
