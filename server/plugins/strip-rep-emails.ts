// Keeps the member representatives' email addresses out of the built site. @nuxt/content v2 writes every content file, in full, into
// the static output (/api/_content/cache.<id>.json and /api/_content/query/<hash>.json) so that pages can query it in the browser;
// leaving an address out of a page's markup is therefore not enough. This hook removes the `email` field from
// content/members/reps.json as the file is parsed, so it never reaches the content cache, the query files or any page.
// content/members/reps.json itself is not changed (the validator reads it directly). Remove this plugin if addresses are meant to be
// published again.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('content:file:afterParse', (file: any) => {
    if (file?._id !== 'content:members:reps.json') return
    if (Array.isArray(file.body)) file.body = file.body.map(({ email: _email, ...rest }: any) => rest)
  })
})
