// ESLint for the Vue templates (roadmap task 5). Template-only on purpose: the <script> blocks are TypeScript, and
// reading them needs a TypeScript parser (@typescript-eslint/parser plus typescript), which has not been approved as
// a dependency. With `parser: false` the script blocks are skipped and every template is still checked. The rules are
// eslint-plugin-vue's "essential" set. Because script blocks are skipped, only its TEMPLATE rules do anything here
// (v-for needs a :key that uses the loop variable, no duplicate attributes, no v-if with v-for, template syntax
// errors). Its script rules (duplicate keys, computed without return, mutating props, ...) are inert, and so are
// checks that need to know what the script defines (undefined names in a template, unregistered components).
// Tested: an Options-API script with a duplicate key and a computed without return gave no report.
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  { ignores: ['.nuxt/**', '.output/**', '.agent/**', 'node_modules/**', 'dist/**', 'public/**', 'content/**', 'visual/**'] },
  ...vue.configs['flat/essential'],
  {
    // These two files put TypeScript syntax inside template expressions ((n:string)=>...), which the template-only
    // parser cannot read: 3 false "parsing error" reports. The cost: a syntax error in those two templates is not
    // reported by ESLint (I expect the Vue compiler to fail the build on one, but have not tested it), and any
    // expression the parser cannot read is skipped by the other template rules too.
    files: ['pages/about/team/[[]slug].vue', 'pages/community/newsletter/[[]slug].vue'],
    rules: { 'vue/no-parsing-error': 'off' },
  },
  {
    files: ['**/*.vue'],
    languageOptions: { parser: vueParser, parserOptions: { parser: false, ecmaVersion: 'latest', sourceType: 'module' } },
    rules: {
      'vue/multi-word-component-names': 'off',   // Nuxt pages are named index.vue and [slug].vue
    },
  },
]
