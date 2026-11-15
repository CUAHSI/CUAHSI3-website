#!/usr/bin/env node
// PreToolUse guard for the CUAHSI website repo.
// Exit 2 blocks the tool call and shows the message to the agent.
// This is a backstop, not a sandbox: scripts/verify.sh checks the same things
// against the actual git diff, and Jordan's PR review is the real control.
//
// Design (14 November 2026, CUAHSI/CUAHSI3-website#118): the checks match the command TEXT, broadly, as before, so a form
// the guard does not understand is blocked, not allowed. Two things make them narrower than before, and both fail safe:
//   1. Text that is provably data is removed first: the body of a heredoc whose delimiter is quoted (so the shell expands
//      nothing in it) and which is written to a file or read by cat/tee, with nothing piped onward. Anything else stays.
//   2. A push is checked for the default branch only in its own simple command (up to the next ; & | or newline),
//      not in the whole text, so `git push origin task/x && gh pr create --base main` passes.
// And one check is wider: a write is refused if ANY folder the command could run in is on the default branch (the
// session's folder, the project root, and every folder named after cd, pushd or git -C), not only the project root.
// Cases: node scripts/test-guard-hook.mjs (block or allow for each command form).
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const PHASE = 2;          // 1 = content/ is frozen. Change only when Jordan opens Phase 2.
const BASE = 'main';

let input;
try { input = JSON.parse(readFileSync(0, 'utf8')); } catch { process.exit(0); }
const tool = input.tool_name ?? '';
const ti = input.tool_input ?? {};
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const cwd0 = input.cwd || root;

const block = (msg) => { console.error(`Blocked by .claude/hooks/guard.mjs: ${msg}`); process.exit(2); };

if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
  const p = ti.file_path ?? ti.notebook_path ?? '';
  const rel = path.relative(root, path.resolve(root, p)).split(path.sep).join('/');
  if (PHASE === 1 && (rel === 'content' || rel.startsWith('content/')))
    block(`${rel} is under content/, which is frozen in Phase 1 (CLAUDE.md rule 3). Stop and tell Jordan why the change seemed necessary.`);
  if (rel.startsWith('.claude/hooks/') || rel === '.claude/settings.json')
    block(`${rel} is a guardrail. Ask Jordan to change it himself.`);
}

// Drop heredoc bodies that are provably data. The opening line must hold only cat or tee (optionally inside $( ), with
// no shell, interpreter or eval before them on that line (bash -c "$(cat <<'EOF' ... runs the body); the delimiter must
// be quoted ('EOF' or "EOF", so nothing in the body is expanded); nothing may follow the << word on that line except a
// redirection to a file; and the body must end with its delimiter line. A body written to a file is kept if the file is
// named again anywhere else in the command (it might be run: bash run.sh, chmod +x, ./run.sh). Otherwise the text is
// left alone and the checks below read it.
const RUNNER = /(?<![\w.\/-])(bash|sh|zsh|dash|ksh|source|eval|exec|python[0-9.]*|node|ruby|perl|xargs)(?![\w.-])/;
const dropDataHeredocs = (s) => {
  const lines = s.split('\n'); const out = []; const written = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]; out.push(l);
    const m = /^(.*?)\b(cat|tee)\b([^|;&<`$]*)<<-?[ \t]*(['"])([A-Za-z_][A-Za-z0-9_-]*)\4[ \t]*((?:>>?[ \t]*[^\s|;&<>`$()]+[ \t]*)?)$/.exec(l);
    // The simple command that holds cat/tee is the text after the last ; & or | before it: nothing in it may run the body.
    if (!m) continue;
    const own = m[1].split(/[;&|]/).pop();
    if (/`/.test(m[1]) || RUNNER.test(own) || (own !== m[1] && /\|\s*$/.test(m[1]) && RUNNER.test(m[1]))) continue;
    let j = i + 1;
    while (j < lines.length && lines[j].replace(/^\t+/, '') !== m[5]) j++;
    if (j >= lines.length) continue;                      // no closing line: not provably data
    const target = (/>>?[ \t]*([^\s]+)/.exec(m[3] + ' ' + m[6]) ?? [])[1];
    if (target) written.push(path.basename(target));
    out.push(lines[j]); i = j;
  }
  const rest = out.join('\n');
  // The file is run later in the command (by a shell or interpreter, sourced, made executable, or as ./file): keep all.
  for (const f of written) {
    const e = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(${RUNNER.source}|\\bchmod\\b)[^;&|\\n]*${e}|(^|[\\s;&|(])\\.{0,2}\\/?[^\\s;&|]*\\/?${e}(?=\\s*($|[;&|\\n)]))`, 'm').test(rest.split('\n').filter(l => !l.includes('<<')).join('\n').replace(/\bgit\b[^;&|\n]*/g, ''))) return s;
  }
  return rest;
};

// A for loop over written-out words (for b in task/x task/y; do git push origin $b; done) is read with the loop
// variable standing for its words: for the default branch if any word is it, else for a plain name. A list that holds
// a variable, a $(...) or a pattern is left alone, so a push of $b stays unreadable and is refused.
const expandLoops = (s) => {
  let out = s;
  for (const m of s.matchAll(/\bfor[ \t]+([A-Za-z_][A-Za-z0-9_]*)[ \t]+in[ \t]+([^;\n]*?)[ \t]*(;|\n)[ \t]*do\b/g)) {
    const [, name, list] = m;
    if (/[$`*?{}()]/.test(list)) continue;
    const words = list.split(/\s+/).map(w => w.replace(/^["']|["']$/g, '')).filter(Boolean);
    const stand = words.find(w => /^(refs\/heads\/)?(main|master)$/.test(w)) ?? 'loop-word';
    out = out.replace(new RegExp(`"?\\$(\\{${name}\\}|${name}(?![A-Za-z0-9_]))"?`, 'g'), stand);
  }
  return out;
};

const branchOf = (dir) => {
  try { return execSync('git branch --show-current', { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return null; }
};

if (tool === 'Bash') {
  const raw = String(ti.command ?? '');
  // A backslash at the end of a line joins it to the next, as the shell does.
  const cmd = expandLoops(dropDataHeredocs(raw).replace(/\\\r?\n/g, ' '));
  const seg = '[^|;&\\n]*';                               // the rest of one simple command
  const git = (re) => new RegExp(`\\bgit\\b${seg}\\b${re}`).test(cmd);
  const PROTECTED = `(${BASE}|master)`;

  // -n is --no-verify for git commit; in a group such as -mnote the letters after m are the message.
  if (/--no-verify\b/.test(cmd) || git('commit\\b' + seg + '\\s-(?![a-zA-Z]*[mFCct][a-zA-Z]*n)[a-zA-Z]*n[a-zA-Z]*(?=\\s|$)') || /core\.hooksPath/i.test(cmd))
    block('never skip hooks (rule 4).');
  if (git('push') && /(--forc|\s-[a-zA-Z]*f[a-zA-Z]*\b|\s\+[^\s]|--mirror|--all\b|--delete\b|--prune\b)/.test(cmd))
    block('never force-push, and push one named branch at a time (rule 4).');
  // The default branch named as a push target in the same simple command, by any spelling (main, HEAD:main,
  // refs/heads/main, heads/main), or a target the guard cannot read (a variable or a $(...)), or a config or alias
  // that could redirect a push.
  if (new RegExp(`\\bgit\\b${seg}\\bpush\\b${seg}[\\s:/'"]${PROTECTED}(?![\\w./-])`).test(cmd)) block(`never push to ${BASE} (rule 4).`);
  if (new RegExp(`\\bgit\\b${seg}\\bpush\\b${seg}(\\$|\`)`).test(cmd)) block('write the branch to push out in full, not as a variable or a $(...) (rule 4).');
  if (new RegExp(`\\bgit\\b${seg}\\bpush\\b${seg}(\\s['"]?\\+?:['"]?(?=\\s|$)|\\*)`).test(cmd) || new RegExp(`\\bxargs\\b${seg}\\bgit\\b${seg}\\bpush\\b`).test(cmd))
    block('push one named branch at a time, written out; ":", patterns and xargs push others (rule 4).');
  if (/\bgit\b.*\b(alias\.|remote\.[^\s.]+\.push|push\.default)/.test(cmd)) block('do not change git aliases or push settings from a command (rule 4).');
  if (/\bgh\b[\s'"]+pr[\s'"]+merge\b/.test(cmd)) block('never merge a PR; Jordan merges (rule 4).');
  // -u with paths after it (git add -u content/jobs) stages only those paths and is allowed; -u alone stages every change.
  if (git(`add\\b${seg}(\\s-[a-zA-Z]*A[a-zA-Z]*\\b|\\s--all\\b|\\s(-[a-zA-Z]*u[a-zA-Z]*|--update)(?=[ \\t]*($|[;&|\\n)]))|\\s\\.\\/?(\\s|$)|\\s:\\/?(\\s|$))`) || /\bgit\b[^|;&\n]*\badd\s+\.$/m.test(cmd))
    block('stage files by name, not with -A, a bare -u or "." (rule 4).');

  // A write (merge-base and friends are not one).
  if (git('(commit|push|merge(?!-)|rebase|cherry-pick|revert|am)\\b')) {
    // Fast-forwarding a local main to origin/main (git switch main && git merge --ff-only origin/main) writes nothing new.
    const realWrite = git(`(commit|push|rebase|cherry-pick|revert|am)\\b`) || new RegExp(`\\bgit\\b${seg}\\bmerge\\b(?!-)(?!${seg}--ff-only)`).test(cmd);
    if (realWrite && new RegExp(`\\bgit\\b${seg}\\b(switch|checkout)\\s+(-[a-zA-Z]+\\s+)*${PROTECTED}(?=\\s*($|[;&|\\n)]))`).test(cmd))
      block(`this command switches to ${BASE} and then writes. Create a task/ branch first (rule 4).`);
    // Every folder the command could run in: the session's, the project root's, and each one named after cd, pushd
    // or git -C (resolved from the session's folder; one that does not exist yet, such as a new worktree, is skipped).
    const dirs = new Set([cwd0, root]);
    for (const m of cmd.matchAll(/(?:\bcd|\bpushd|\s-C)\s+("[^"]*"|'[^']*'|[^\s;&|)]+)/g)) {
      const p = m[1].replace(/^["']|["']$/g, '');
      if (/[$`*?]/.test(p)) continue;                    // unknown: the session folder and the root still count
      dirs.add(path.resolve(cwd0, p.replace(/^~(?=\/|$)/, process.env.HOME ?? '~')));
    }
    for (const d of dirs) {
      const b = branchOf(d);
      if (b === BASE || b === 'master') block(`${d} is on ${b}, and this command may write there. Create a task/ branch first, or run the command from a task folder only (rule 4).`);
    }
  }

  if (PHASE === 1 && /(\brm\b|\bmv\b|\bcp\b|\bsed\s+(-[a-zA-Z]*i|--in-place)|\btee\b|\btouch\b|>>?)[^|;&]*\bcontent\//.test(cmd))
    block('this command looks like it writes under content/, which is frozen in Phase 1 (rule 3). If it only reads, rephrase it so the write target is clearly elsewhere.');
}

process.exit(0);
