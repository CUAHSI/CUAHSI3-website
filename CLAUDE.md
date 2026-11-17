@AGENTS.md

<!-- Claude Code reads AGENTS.md only through the import above (it ignores AGENTS.md when a CLAUDE.md exists).
     The two files together stay at 200 lines or fewer, and nothing else is imported with @ (an import loads in
     full, so it would count too); scripts/verify.sh fails otherwise. HTML comments like this one are stripped
     before loading. Split from the 549-line CLAUDE.md on 14 November 2026 (org issue 124). -->

## Claude Code only

```
.claude/rules/content.md     C1 to C16; loads by itself when a file under content/ or public/documents/ is read or edited
.claude/rules/site-code.md   footguns, grid rule, oddities, design tokens; loads when site code is read or edited
.claude/agents/reviewer.md   read-only reviewer subagent
.claude/hooks/guard.mjs      unsafe git commands; blocks edits to content/ only if its PHASE is set back to 1
.claude/settings.json        permissions and hook wiring
```

A rule file loads only once a matching file is touched: read the one that applies before the first edit of that kind.

**Locks.** Phase 2 was opened on 4 October 2026; Jordan lifted the locks on 5 October 2026: `PHASE = 2` in
`.claude/hooks/guard.mjs`, the `content/` deny rule removed from `.claude/settings.json`,
and `reviewer.md` check 1b added. The hook and `settings.json` are protected by the
deny rules; `.claude/agents/` is not (an edit goes through), so it is Jordan's by
convention only: tell him in the PR when you touch it. If a hook or permission blocks you, stop and tell the requester (and Jordan, in the PR, if it is someone else); do not look
for a way around it.
