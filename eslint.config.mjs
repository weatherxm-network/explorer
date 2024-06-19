import withNuxt from './.nuxt/eslint.config.mjs'

import eslintConfigPrettier from 'eslint-config-prettier'
import vueEslintParser from 'vue-eslint-parser'
import tsEslingParser from '@typescript-eslint/parser'
import globals from 'globals'

export default withNuxt([
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: tsEslingParser
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {},
    // add your custom rules here
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-console': 'off'
    }
  },
  // As usual prettier config should come last in order
  // to not clash with the linter
  eslintConfigPrettier
])
