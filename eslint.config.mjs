// ESLint for the site (roadmap task 5). Vue files: the template AND the TypeScript <script> blocks are read
// (@typescript-eslint/parser handles the script). Plain .ts files are only parsed with the same parser (a syntax error
// fails; no rules apply to them); .mts, .cjs and .js files are not matched by any block here. The rules are
// eslint-plugin-vue's "essential" set (errors and things that break rendering), not style rules. No core JS rules are
// switched on: Nuxt auto-imports (ref, computed, useAsyncData ...) would make no-undef report hundreds of false
// problems, and the type-aware unused-variable rule lives in @typescript-eslint/eslint-plugin, which is not installed.
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

export default [
  { ignores: ['.nuxt/**', '.output/**', '.agent/**', 'node_modules/**', 'dist/**', 'public/**', 'content/**', 'visual/**'] },
  ...vue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: { parser: vueParser, parserOptions: { parser: tsParser, ecmaVersion: 'latest', sourceType: 'module' } },
    rules: {
      'vue/multi-word-component-names': 'off',   // Nuxt pages are named index.vue and [slug].vue
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } },
  },
]
