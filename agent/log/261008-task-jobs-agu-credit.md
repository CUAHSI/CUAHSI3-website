# 2026-10-08: agent-prototype brought current, jobs credit generalised

- Merged main into agent-prototype. Conflicts were all in content/jobs; kept main's version.
- Removed nine bot-written job files that only existed on agent-prototype: four failed the schema
  (`type: graduate`), two shared slugs, several were AGU test output.
- Applied website PR 93 (`temporary` type, `source_url`, Faculty/Temporary chips, JWJ credit) from the fork;
  it is not yet on main.
- Added `source: agu` to the jobs schema and a "via AGU Career Center" credit (findajob.agu.org).
  AGU files are for a demo PR that is not merged until AGU gives permission.
- Pushed once by hand with Jordan's approval; this branch mixes code and content (verify rule 3 fails by design).
