// .eslintrc.cjs

module.exports = {
  // ...
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  extends: ['@nuxtjs/eslint-config-typescript', 'plugin:prettier/recommended'],

  root: true,
  env: {
    browser: true,
    node: true
  },

  plugins: [],
  // add your custom rules here
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-console': 'off'
  }

  // ...
}
