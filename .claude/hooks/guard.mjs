#!/usr/bin/env node
// PreToolUse guard for the CUAHSI website repo.
// Exit 2 blocks the tool call and shows the message to the agent.
// This is a backstop, not a sandbox: scripts/verify.sh checks the same things
// against the actual git diff, and Jordan's PR review is the real control.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const PHASE = 1;          // 1 = content/ is frozen. Change only when Jordan opens Phase 2.
const BASE = 'main';

let input;
try { input = JSON.parse(readFileSync(0, 'utf8')); } catch { process.exit(0); }
const tool = input.tool_name ?? '';
const ti = input.tool_input ?? {};
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();

const block = (msg) => { console.error(`Blocked by .claude/hooks/guard.mjs: ${msg}`); process.exit(2); };

if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
  const p = ti.file_path ?? ti.notebook_path ?? '';
  const rel = path.relative(root, path.resolve(root, p)).split(path.sep).join('/');
  if (PHASE === 1 && (rel === 'content' || rel.startsWith('content/')))
    block(`${rel} is under content/, which is frozen in Phase 1 (CLAUDE.md rule 3). Stop and tell Jordan why the change seemed necessary.`);
  if (rel.startsWith('.claude/hooks/') || rel === '.claude/settings.json')
    block(`${rel} is a guardrail. Ask Jordan to change it himself.`);
}

if (tool === 'Bash') {
  const cmd = String(ti.command ?? '');
  const git = (re) => new RegExp(`\\bgit\\b[^|;&]*\\b${re}`).test(cmd);

  if (/--no-verify\b/.test(cmd)) block('never skip hooks (rule 4).');
  if (git('push') && /(--force\b|--force-with-lease\b|\s-f\b)/.test(cmd)) block('never force-push (rule 4).');
  if (git('push') && new RegExp(`\\b(${BASE}|master)\\b`).test(cmd)) block(`never push to ${BASE} (rule 4).`);
  if (/\bgh\s+pr\s+merge\b/.test(cmd)) block('never merge a PR; Jordan merges (rule 4).');
  if (/\bgit\s+add\s+(-A\b|--all\b|\.(\s|$))/.test(cmd)) block('stage files by name, not with -A or "." (rule 4).');

  if (git('(commit|push|merge|rebase)')) {
    let branch = '';
    try { branch = execSync('git branch --show-current', { cwd: root, encoding: 'utf8' }).trim(); } catch {}
    if (branch === BASE || branch === 'master')
      block(`you are on ${branch}. Create a task/ branch first (rule 4).`);
  }

  if (PHASE === 1 && /(\brm\b|\bmv\b|\bcp\b|\bsed\s+(-[a-zA-Z]*i|--in-place)|\btee\b|\btouch\b|>>?)[^|;&]*\bcontent\//.test(cmd))
    block('this command looks like it writes under content/, which is frozen in Phase 1 (rule 3). If it only reads, rephrase it so the write target is clearly elsewhere.');
}

process.exit(0);
