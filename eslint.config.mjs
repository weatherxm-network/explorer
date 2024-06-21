import withNuxt from './.nuxt/eslint.config.mjs'

import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueEslintParser from 'vue-eslint-parser'
import eslintConfigPrettier from 'eslint-config-prettier'

export default withNuxt([
  { files: ['**/*.{js,mjs,cjs,ts,vue}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/base'],
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    plugins: {
      'typescript-eslint': tseslint.plugin
    },
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
        parser: {
          js: 'espree',
          jsx: 'espree',
          mjs: 'espree',
          ts: tseslint.parser,
          tsx: tseslint.parser,
          mts: tseslint.parser
          // Leave the template parser unspecified, so that it could be determined by `<script lang="...">`
        }
      },
      // https://eslint.vuejs.org/user-guide/#auto-imports-support
      globals: {
        ref: 'readonly',
        computed: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly'
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-console': 'off'
    }
  },
  {
    ignores: ['node_modules', 'dist', 'public', '.nuxt']
  },
  // As usual prettier config should come last in order
  // to not clash with the linter
  eslintConfigPrettier
])
