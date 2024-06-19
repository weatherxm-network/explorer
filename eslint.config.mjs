import withNuxt from './.nuxt/eslint.config.mjs'

import prettierPlugin from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'
import vueEslintParser from 'vue-eslint-parser'
import tsEslingParser from '@typescript-eslint/parser'
import globals from 'globals'

export default withNuxt({
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
  plugins: {
    prettier: prettierPlugin
  },
  // add your custom rules here
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-console': 'off',

    ...prettierPlugin.configs.recommended.rules
    // following the trail from eslint-plugin-prettier/reccomended
    // the exported items are an extention of a the rules field type
    // => interface FlatConfig<Rules extends RulesRecord = RulesRecord>
    // so we just use .rules instead of adding two separate imports
    // and as usual, it should remain the last item in the array
    // ...eslintConfigPrettier.rules
  }
})
