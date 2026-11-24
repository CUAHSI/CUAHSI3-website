// ESLint for the site (roadmap task 5). Vue files: the template AND the TypeScript <script> blocks are read
// (@typescript-eslint/parser handles the script). Plain .ts files are parsed with the same parser. .mjs, .js and .cjs
// files are matched by ESLint's defaults and parsed with its default parser; .mts files are not matched. The rules are
// eslint-plugin-vue's "essential" set (errors and things that break rendering; its config has no `files` key, so it
// also runs on scripts, where it finds nothing), not style rules, plus footgun rules for .vue and .ts files: patterns
// from "Known footguns" in CLAUDE.md, written with core no-restricted-syntax (script) and vue/no-restricted-syntax
// (template), so no plugin is needed for those (14 has a local rule). scripts/verify.sh has grep checks for footguns 1,
// 2 and 5 too (its checks 4, 6 and 7); these rules read the parsed code instead, so they see multi-line chains and
// template literals, and they are errors where verify.sh only warns on 1 and 5. Each message names its footgun:
//   1  queryContent('news') ('/news' and `news` too; any content folder whose name starts another folder's name)
//      in a file whose script has no startsWith('/news/') call (the trailing-slash filter). Per file: it cannot see
//      that the filter is applied to that query's result, a filter written only in the <template> does not count,
//      and a variable argument is not seen.
//   2  On <component>, an :is that is a ternary (cond ? 'a' : 'NuxtLink'; any ternary, even 'h2' : 'h3') or that
//      contains the string 'NuxtLink' / 'nuxt-link' (.vue only). A computed that returns it (:is="tag") is not seen.
//   5  .findOne() not directly followed by .catch(...). Stricter than the footgun: try/catch around an await, or
//      .then().catch(), is also flagged (none on main; rewrite as .findOne().catch()).
//   7  queryContent() of a top-level folder with a bare-array JSON file anywhere below it (read from content/, as for
//      1), in a file whose script has no Array.isArray(<something>.body). Per file, like 1. A query whose first
//      .where(), directly on queryContent(), asks for _extension: 'md' is not counted (critical-zone holds Markdown too).
//  13  A clock read (new Date() with no argument, or Date.now()) that runs while the page is set up: inside computed(),
//      inside ref()/reactive() and their shallow forms, at the top of the script, in a callback that runs at once
//      (filter, sort, map), or in a template expression other than an @event handler. Not flagged: a named helper or
//      handler, a method, and callbacks run later (useState, useAsyncData, onMounted, watch, setTimeout ...; the list is
//      `later` below). Not seen: a computed or a composable that calls a helper which reads the clock.
//      components/GageCard.vue is exempt from the script rules for 13 (see its block below), not from the template one.
//  14  A rule of its own (watchOrder below, a local plugin, no package): a watch() or watchEffect() whose source reads,
//      directly or through the computeds and functions it reads, a const, let or class declared below it in the scope
//      the watch() runs in (the script's top level, or the function it is in).
// Footgun 6 (throw createError in setup) is checked by verify.sh. No other core JS rules are switched on: Nuxt auto-imports
// (ref, computed, useAsyncData ...) would make no-undef report hundreds of false problems, and the type-aware
// unused-variable rule lives in @typescript-eslint/eslint-plugin, which is not installed.
import { readdirSync, readFileSync } from 'node:fs'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

// Footgun 1: content folders whose name is a prefix of another folder's name. Read from content/ so a new
// collision (say a 'job' folder next to 'jobs') is caught without editing this file.
const collections = readdirSync(new URL('./content/', import.meta.url), { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name)
const prefixCollections = collections.filter(a => collections.some(b => b !== a && b.startsWith(a)))

// Footgun 7: top-level content folders with a JSON file anywhere below them whose content is a bare array (Nuxt
// Content moves it into .body).
const arrayCollections = collections.filter(dir =>
  readdirSync(new URL(`./content/${dir}/`, import.meta.url), { recursive: true }).some(f =>
    f.endsWith('.json') && readFileSync(new URL(`./content/${dir}/${f}`, import.meta.url), 'utf8').trimStart().startsWith('[')))
const arrayFolders = `(${arrayCollections.join('|')})`

// Footgun 13: a read of the current time.
const clock = ":matches(NewExpression[callee.name='Date'][arguments.length=0], CallExpression[callee.object.name='Date'][callee.property.name='now'])"
const refCall = 'CallExpression[callee.name=/^(ref|shallowRef|reactive|shallowReactive)$/]'
// A function that does not run while the page is first set up: a named helper or handler, a method, or a callback
// handed to something that runs it later (or, for useState and useAsyncData, once on the server, with the value
// carried to the browser). A callback handed to anything else (filter, sort, map) runs at once, so is not here.
const later = ':matches(FunctionDeclaration, VariableDeclarator > :function, Property > :function, MethodDefinition > :function, ' +
  'CallExpression[callee.name=/^(useState|useAsyncData|useLazyAsyncData|onMounted|onBeforeMount|onUnmounted|onBeforeUnmount|nextTick|watch|watchEffect|setTimeout|setInterval|requestAnimationFrame)$/] > :function, ' +
  'CallExpression[callee.property.name=/^(addEventListener|then|catch)$/] > :function)'
const clockSyntax = [
  {
    selector: `CallExpression[callee.name='computed'] ${clock}`,
    message: "CLAUDE.md footgun 13: a computed that reads the clock renders differently in the build and in the browser. Use useState('<page>-rendered-at', () => Date.now()) and set it in onMounted.",
  },
  {
    selector: `${refCall} ${clock}`,
    message: "CLAUDE.md footgun 13: a ref that starts from the clock holds the build's time on the server and the browser's on the client. Use useState('<page>-rendered-at', () => Date.now()) and set it in onMounted.",
  },
  {
    // Any other clock read that runs during setup: at the top of the script (exported or not, in a declaration or a
    // statement), or in a callback that runs at once. Inside computed() or ref() the rules above already report it.
    selector: `${clock}:not(${later} ${clock}):not(CallExpression[callee.name='computed'] ${clock}):not(${refCall} ${clock})`,
    message: "CLAUDE.md footgun 13: a clock read while the page is set up runs on the build's day and again in the browser. Use useState('<page>-rendered-at', () => Date.now()) and set it in onMounted.",
  },
]

// Footgun 14: watch() runs its source at once, so anything the source reads, directly or through a computed or a
// function, must already be declared. Checked against the scope the watch() runs in: the script's top level, or the
// body of the function (a composable, say) it is in, and any block between. References are found with the scope
// manager, so a parameter that shadows a name is not followed. A function declaration is hoisted and is followed, not
// reported; a var is undefined, not a crash, and is followed too. Ranges are compared in file order, so a .vue file
// with a plain <script> below <script setup> would be misread (none has one).
const watchOrder = {
  meta: { type: 'problem', schema: [] },
  create(context) {
    const sourceCode = context.sourceCode
    const inside = (node, outer) => node.range[0] >= outer.range[0] && node.range[1] <= outer.range[1]
    const refsTo = (node, scopes) => sourceCode.scopeManager.scopes.flatMap(s => s.references)
      .filter(r => inside(r.identifier, node) && scopes.has(r.resolved?.scope))
    return {
      CallExpression(call) {
        if (!/^watch(Effect|PostEffect|SyncEffect)?$/.test(call.callee.name ?? '')) return
        if (!call.arguments[0]) return
        // the call's own scope, then each enclosing block, up to and including the function or module scope
        const top = new Set()
        for (let s = sourceCode.getScope(call); s; s = s.upper) {
          top.add(s)
          if (['function', 'module', 'global'].includes(s.type)) break
        }
        const options = call.arguments[2]
        const immediate = options?.type === 'ObjectExpression' &&
          options.properties.some(p => p.key?.name === 'immediate' && p.value?.value === true)
        const queue = [call.arguments[0], ...(immediate && call.arguments[1] ? [call.arguments[1]] : [])]
        const seen = new Set()
        while (queue.length) {
          for (const ref of refsTo(queue.shift(), top)) {
            const variable = ref.resolved
            if (seen.has(variable)) continue
            seen.add(variable)
            const def = variable.defs[0]
            if (!def) continue
            const tdz = (def.type === 'Variable' && def.parent?.kind !== 'var') || def.type === 'ClassName'
            if (tdz && def.node.range[0] > call.range[0]) {
              context.report({
                node: call,
                message: `CLAUDE.md footgun 14: this ${call.callee.name}() reads '${variable.name}' (line ${def.node.loc.start.line}) before it is declared; it runs at once and crashes the page. Move the ${call.callee.name}() below it (the end of <script setup>, or of the function, is safe).`,
              })
              return
            }
            if (def.type === 'Variable' && def.node.init) queue.push(def.node.init)
            if (def.type === 'FunctionName') queue.push(def.node.body)
          }
        }
      },
    }
  },
}

const footgunSyntax = [
  {
    selector: "CallExpression[callee.property.name='findOne']:not(MemberExpression[property.name='catch'] > CallExpression)",
    message: 'CLAUDE.md footgun 5: findOne() throws when nothing matches. Follow it directly with .catch(() => null).',
  },
  ...prefixCollections.map(name => ({
    selector: `Program:not(:has(CallExpression[callee.property.name='startsWith'][arguments.0.value='/${name}/'])) CallExpression[callee.name='queryContent']:matches([arguments.0.value=/^\\x2F?${name}$/], [arguments.0.quasis.0.value.cooked=/^\\x2F?${name}$/])`,
    message: `CLAUDE.md footgun 1: queryContent('${name}') also returns every folder whose name starts with '${name}'. Filter the result with _path?.startsWith('/${name}/').`,
  })),
  ...(arrayCollections.length ? [{
    selector: `Program:not(:has(CallExpression[callee.object.name='Array'][callee.property.name='isArray'] MemberExpression[property.name='body'])) CallExpression[callee.name='queryContent']:matches([arguments.0.value=/^\\x2F?${arrayFolders}(\\x2F|$)/], [arguments.0.quasis.0.value.cooked=/^\\x2F?${arrayFolders}(\\x2F|$)/]):not(CallExpression[callee.property.name='where']:has(Property[key.name='_extension'][value.value='md']) > MemberExpression > CallExpression)`,
    message: 'CLAUDE.md footgun 7: this folder holds a JSON file that is a bare array, which Nuxt Content moves into .body. Unwrap it: Array.isArray(data.value?.body) ? data.value.body : [].',
  }] : []),
]

export default [
  { ignores: ['.nuxt/**', '.output/**', '.agent/**', 'node_modules/**', 'dist/**', 'public/**', 'content/**'] },
  ...vue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: { parser: vueParser, parserOptions: { parser: tsParser, ecmaVersion: 'latest', sourceType: 'module' } },
    rules: {
      'vue/multi-word-component-names': 'off',   // Nuxt pages are named index.vue and [slug].vue
      'vue/no-restricted-syntax': ['error', {
        selector: "VElement[name='component'] > VStartTag > VAttribute[directive=true][key.name.name='bind'][key.argument.name='is'] > VExpressionContainer > ConditionalExpression",
        message: 'CLAUDE.md footgun 2: a conditional :is on <component> renders but does not navigate. Use v-if / v-else with real <a> and <NuxtLink> tags.',
      }, {
        selector: "VElement[name='component'] > VStartTag > VAttribute[directive=true][key.name.name='bind'][key.argument.name='is'] Literal[value=/^(NuxtLink|nuxt-link)$/]",
        message: 'CLAUDE.md footgun 2: <component :is> with the string NuxtLink renders but does not navigate. Use a real <NuxtLink> tag.',
      }, {
        // an @event handler runs later, on a click; any other template expression runs on render
        selector: `VExpressionContainer ${clock}:not(VAttribute[key.name.name='on'] ${clock})`,
        message: "CLAUDE.md footgun 13: a template that reads the clock renders differently in the build and in the browser. Use useState('<page>-rendered-at', () => Date.now()) and set it in onMounted.",
      }],
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } },
  },
  {
    files: ['**/*.vue', '**/*.ts'],
    plugins: { footgun: { rules: { 'watch-order': watchOrder } } },
    rules: {
      'no-restricted-syntax': ['error', ...footgunSyntax, ...clockSyntax],
      'footgun/watch-order': 'error',
    },
  },
  {
    // GageCard's ageHours computed reads Date.now(), but only once a reading has loaded in the browser (reading is
    // null in the build and on the first render), so it cannot hydrate differently. Exempt from footgun 13 only.
    files: ['components/GageCard.vue'],
    rules: { 'no-restricted-syntax': ['error', ...footgunSyntax] },
  },
]
