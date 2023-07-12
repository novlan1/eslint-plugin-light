module.exports = {
  plugins: ['eslint-plugin-light', 'vue'],
  parser: require.resolve('vue-eslint-parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
  },
  rules: {
    'light/valid-vue-comp-import': 2,
    'light/no-plus-turn-number': 2,
  },
};
