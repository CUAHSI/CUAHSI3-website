#!/usr/bin/env node
// Tests for the PreToolUse guard hook (.claude/hooks/guard.mjs): each case is a tool call in, block (exit 2) or allow out.
//   node scripts/test-guard-hook.mjs                 test .claude/hooks/guard.mjs
//   node scripts/test-guard-hook.mjs path/to/hook.mjs   test another copy (a proposed fix)
// It builds a throwaway git repository with a main checkout on a task branch and a worktree on main, so the
// "which branch is this folder on" cases are real. Exit 1 if any case gives the wrong answer.
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const hook = path.resolve(process.argv[2] ?? '.claude/hooks/guard.mjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'guard-test-'));
const repo = path.join(tmp, 'repo'); const wtMain = path.join(tmp, 'wt-base'); const wtTask = path.join(tmp, 'wt-task');
const sh = (c, cwd = repo) => { try { execSync(c, { cwd, stdio: 'pipe' }); } catch (e) { console.error(`setup failed: ${c}\n${e.stderr}`); fs.rmSync(tmp, { recursive: true, force: true }); process.exit(1); } };
fs.mkdirSync(repo);
sh('git init -q -b main && git -c user.email=t@t -c user.name=t -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -q --allow-empty -m init');
sh('git branch task/a && git branch task/b && git branch side');
sh(`git worktree add -q ${wtTask} task/b`);
sh(`git worktree add -q ${wtMain} side && git -C ${wtMain} switch -q --detach && git switch -q task/a`);
// wt-main must be ON main, but main is not checked out anywhere else after the switch above:
sh(`git -C ${wtMain} switch -q main`);

const run = (command, cwd = repo, tool = 'Bash') => {
  const input = JSON.stringify({ tool_name: tool, tool_input: tool === 'Bash' ? { command } : { file_path: command }, cwd });
  const r = spawnSync('node', [hook], { input, env: { ...process.env, CLAUDE_PROJECT_DIR: repo }, encoding: 'utf8' });
  return r.status === 2 ? 'block' : 'allow';
};

// [expected, description, command, cwd]
const cases = [
  // the misfires (CUAHSI/CUAHSI3-website#118)
  ['allow', 'push of a task branch followed by gh pr create --base main', 'git push -u origin task/a && gh pr create --base main --head task/a'],
  ['allow', 'push of a branch whose name contains "main"', 'git push origin task/main-menu'],
  ['allow', 'commit in a worktree on a task branch', `cd ${wtTask} && git commit -m x`],
  ['block', 'commit in a worktree on main (cd prefix)', `cd ${wtMain} && git commit -m x`],
  ['block', 'commit in a worktree on main (git -C)', `git -C ${wtMain} commit -m x`],
  ['block', 'commit in a worktree on main (session cwd)', 'git commit -m x', wtMain],
  ['allow', 'a heredoc that mentions --no-verify, written to a file', "cat > notes.md <<'EOF'\nnever use git commit --no-verify\nEOF"],
  ['block', 'a commit message that mentions --no-verify (known false block, as the current hook; write the message with a quoted heredoc instead)', 'git commit -m "explain why --no-verify is banned"'],
  ['allow', 'merge-base check while main checkout is on a task branch', 'git merge-base --is-ancestor origin/main HEAD'],
  // the existing blocks still block
  ['block', 'push to main', 'git push origin main'],
  ['block', 'push to main by refspec', 'git push origin HEAD:main'],
  ['block', 'push to refs/heads/main', 'git push origin task/a:refs/heads/main'],
  ['block', 'push to master', 'git push origin master'],
  ['block', 'push HEAD from a folder on main', 'git push origin HEAD', wtMain],
  ['block', 'bare push from a folder on main', `cd ${wtMain} && git push`],
  ['block', 'force-push --force', 'git push --force origin task/a'],
  ['block', 'force-push -f', 'git push -f origin task/a'],
  ['block', 'force-push --force-with-lease', 'git push --force-with-lease origin task/a'],
  ['block', 'force-push +refspec', 'git push origin +task/a'],
  ['block', 'gh pr merge', 'gh pr merge 12 --squash'],
  ['block', 'git add -A', 'git add -A'],
  ['block', 'git add .', 'git add .'],
  ['block', 'git add --all', 'git add --all'],
  ['block', 'commit --no-verify', 'git commit --no-verify -m x'],
  ['block', 'push --no-verify', 'git push --no-verify origin task/a'],
  ['block', 'commit while the main checkout is on main', 'git commit -m x', repo, 'main-checkout-on-main'],
  ['block', 'edit the hook', path.join(repo, '.claude/hooks/guard.mjs'), repo, 'Edit'],
  ['block', 'edit settings.json', path.join(repo, '.claude/settings.json'), repo, 'Write'],
  // forms the current hook blocks that a parser could miss (reviewer, 14 November)
  ['block', 'line continuation before push', 'git \\\n  push origin main'],
  ['block', 'line continuation, commit in a folder on main', `git -C ${wtMain} \\\n  commit -m x`],
  ['block', 'bash -c with a push to main', 'bash -c "git push origin main"'],
  ['block', 'timeout N bash -c with --no-verify', "timeout 60 bash -c 'git commit --no-verify -m x'"],
  ['block', 'eval of a push to main', 'eval "git push origin main"'],
  ['block', '$(...) with a push to main', 'x=$(git push origin main)'],
  ['block', 'backticks with a push to main', 'echo `git push origin main`'],
  ['block', 'heredoc fed to bash', "bash <<'EOF'\ngit push origin main\nEOF"],
  ['block', 'heredoc piped to sh', "cat <<EOF | sh\ngit push origin main\nEOF"],
  ['block', '<< inside quotes does not hide the next line', 'echo "use <<EOF"\ngit push origin main'],
  ['block', 'here-string does not hide the next line', 'cat <<<word\ngit push origin main'],
  ['block', 'cd to a variable while the main checkout is on main', 'cd "$WT" && git commit -m x', repo, 'main-checkout-on-main'],
  ['block', 'git --git-dir <path> commit --no-verify', 'git --git-dir .git commit --no-verify -m x'],
  ['block', 'push to heads/main', 'git push origin task/a:heads/main'],
  ['block', 'push --force-w (an abbreviation git accepts)', 'git push --force-w origin task/a'],
  ['block', 'push -uf', 'git push -uf origin task/a'],
  ['block', 'push ":" (all matching branches)', "git push origin ':'"],
  ['block', 'push a pattern', "git push origin 'refs/heads/*:refs/heads/*'"],
  ['block', 'push --all', 'git push --all origin'],
  ['block', 'push --delete', 'git push --delete origin task/a'],
  ['block', 'commit -n (skips hooks)', 'git commit -n -m x'],
  ['block', 'commit with core.hooksPath', 'git -c core.hooksPath=/dev/null commit -m x'],
  ['block', 'git add -u', 'git add -u'],
  ['block', 'git add -Av', 'git add -Av'],
  ['block', 'git add ./', 'git add ./'],
  ['block', 'switch to main then commit, one command', 'git switch main && git commit -m x'],
  ['block', 'cherry-pick in a folder on main', 'git cherry-pick abc123', wtMain],
  ['block', 'gh pr merge inside bash -c', "bash -c 'gh pr merge 3'"],
  ['allow', 'heredoc written to a file that mentions a push to main', "cat > notes.md <<'EOF'\ngit push origin main\nEOF"],
  ['allow', 'cd ~ then status', 'cd ~ && git status'],
  ['allow', 'pull on main (Start a task)', 'git pull --ff-only', wtMain],
  ['block', 'switch to a new task branch then commit, from a folder on main (refused: any folder on main counts)', 'git switch -c task/new && git commit -m x', wtMain],
  ['allow', 'a here-string to grep', 'grep -c main <<<"main main"'],
  // second review (14 November): quoting and folder tracking
  ['block', 'apostrophe in a message before a $(push to main)', `git commit -m "it's done" && echo "$(git push origin main)"`],
  ['block', 'bash -lc', 'bash -lc "git push origin main"'],
  ['block', 'sh -xc', "sh -xc 'git commit --no-verify -m x'"],
  ['block', 'python one-liner that pushes', `python3 -c "import subprocess; subprocess.run(['git','push','origin','main'])"`],
  ['block', 'xargs git push', 'echo main | xargs git push origin'],
  ['block', 'process substitution', 'cat <(git push origin main)'],
  ['block', 'time (subshell)', 'time (git push origin main)'],
  ['block', 'redirect written against the ref', 'git push origin main>/dev/null'],
  ['block', 'arithmetic << does not hide the next line', 'echo $((1<<n))\ngit push origin main'],
  ['block', 'cd into a folder on main, then a commit inside $(...)', `cd ${wtMain} && x=$(git commit -m y)`],
  ['block', 'a subshell cd does not leak out', `(cd ${wtTask} && git status); git commit -m x`, wtMain],
  ['block', 'pushd to a folder on main', `pushd ${wtMain} && git commit -m x`],
  ['block', 'unquoted heredoc written to a file runs its $(...)', "cat > f.txt <<EOF\n$(git push origin main)\nEOF"],
  // the project's everyday commands (CLAUDE.md procedures) stay allowed
  ['allow', 'commit with a $(cat <<EOF) message holding backticks, an apostrophe and "1)"', "git commit -m \"$(cat <<'EOF'\nFix the hook\n\n1) don't use `git push --force origin x` or `git add -A`\n2) :)\n\nCo-Authored-By: x\nEOF\n)\""],
  ['allow', 'gh pr create with a title apostrophe and a $(cat <<EOF) body', "gh pr create --repo a/b --base main --head task/a --title \"Don't misfire\" --body \"$(cat <<'EOF'\n## What\n1) `git push origin main` is blocked\nUse --no-verify never.\nEOF\n)\""],
  ['block', 'an escaped backtick in a double-quoted message naming a force-push (known false block, as the current hook)', 'git commit -m "explain \\`git push --force origin x\\`"'],
  ['allow', 'switch to main and pull (Start a task)', 'git switch main && git pull --ff-only', wtMain],
  ['allow', 'restore the frozen log from origin/main', 'git checkout origin/main -- agent/eval-log.md'],
  ['allow', 'worktree add from origin/main', 'git worktree add -q ../x -b task/y origin/main'],
  ['allow', 'worktree add, cd in, commit, in one command', `git worktree add ${path.join(tmp, 'new-wt')} -b task/z && cd ${path.join(tmp, 'new-wt')} && git commit -m x`],
  ['allow', 'verify with VERIFY_BASE', 'VERIFY_BASE=origin/main ./scripts/verify.sh 2>&1 | tail -5'],
  ['allow', 'merge origin/main into a task branch', 'git switch task/a && git merge origin/main'],
  ['allow', 'merge-base check before a PR', 'git fetch origin && git merge-base --is-ancestor origin/main HEAD'],
  ['allow', 'log lines appended through a heredoc', "cat >> agent/log/x.md <<'EOF'\n261114 | task/a | note | never push to main or use --force\nEOF"],
  ['allow', 'commit -m with an attached message containing n', 'git commit -mnote'],
  ['block', 'a comment that names main after a push (known false block, as the current hook)', 'git push origin task/a # not main'],
  ['allow', 'heredoc written to a .sh file', "cat > run.sh <<'EOF'\ngit push origin main\nEOF"],
  ['allow', 'checkout a file from main without --', 'git checkout main README.md && git commit -m x'],
  // third review (14 November): forms a shell parser missed; the text-based design blocks them
  ['block', '$(...) inside arithmetic', 'echo $(( $(git push origin main) ))'],
  ['block', 'ANSI-C quoting before a push', "echo $'it\\'s' && git push origin main && echo 'done'"],
  ['block', 'a subshell inside "$(...)"', 'echo "$( (true); git push origin main )"'],
  ['block', 'case inside "$(...)"', 'echo "$(case x in a) git push origin main;; esac)"'],
  ['block', 'heredoc delimiter written E"OF"', 'cat <<E"OF"\ndata\nEOF\ngit push origin main'],
  ['block', 'heredoc delimiter written \\EOF', "cat <<\\EOF\ndon't\nEOF\ngit push origin main"],
  ['block', 'heredoc to bash with no closing line', 'bash <<EOF\ngit push origin main'],
  ['block', '(( << )) does not hide the next line', '((a<<b))\ngit push origin main'],
  ['block', 'nested escaped backticks', 'echo `git push origin \\`echo main\\``'],
  ['block', 'echo piped to bash', "echo 'git push origin main' | bash"],
  ['block', 'printf piped to sh', "printf 'git commit --no-verify -m x\\n' | sh"],
  ['block', 'here-string to bash', "bash <<< 'git push origin main'"],
  ['block', 'heredoc piped to timeout bash', "cat <<'EOF' | timeout 60 bash\ngit push origin main\nEOF"],
  ['block', 'heredoc to python', "python3 <<'EOF'\nimport subprocess; subprocess.run(['git','push','origin','main'])\nEOF"],
  ['block', 'branch in a variable', 'B=main; git push origin $B'],
  ['block', 'branch from a positional argument', `xargs sh -c 'git push origin "$1"' _ <<< main`],
  ['block', 'alias that skips hooks', "git -c alias.ci='commit --no-verify' ci -m x"],
  ['block', 'alias set by git config', "git config alias.p 'push --force' && git p origin task/a"],
  ['block', 'push refspec from config', 'git -c remote.origin.push=HEAD:main push origin'],
  ['block', 'unknown folder, inner $(...), project root on main', 'cd "$WT" && echo $(git commit -m y)', wtTask, 'main-checkout-on-main'],
  ['block', 'unknown folder, bash -c, project root on main', `cd "$WT" && bash -c 'git commit -m y'`, wtTask, 'main-checkout-on-main'],
  ['block', '<<EOF inside quotes before gh pr merge', 'echo "a <<EOF"\ngh pr merge 3\nEOF'],
  ['block', 'gh with a quoted pr', 'gh "pr" merge 3'],
  ['block', 'heredoc to a file, then run it', "cat > run.sh <<'EOF'\ngit push origin main\nEOF\nbash run.sh"],
  ['block', 'log lines through a heredoc that name a force-push to main, piped onward', "cat <<'EOF' | tee -a agent/log/x.md\ngit push --force origin main\nEOF"],
  ['allow', 'log lines through a heredoc that name a force-push to main', "cat >> agent/log/x.md <<'EOF'\n261114 | task/a | note | git push --force origin main was refused\nEOF"],
  ['allow', 'cd to an unknown folder from a task folder, root on a task branch', 'cd "$WT" && git commit -m y', wtTask],
  // replay of 7,523 commands from past sessions (14 November): forms the first redesign refused that were fine
  ['allow', 'push several named branches in a loop', 'for b in task/x content/y task/z; do git push -u origin $b 2>&1 | tail -1; done'],
  ['block', 'a loop whose list holds main', 'for b in task/x main; do git push origin "$b"; done'],
  ['block', 'a loop over a $(...) list', 'for b in $(git branch --format=%(refname:short)); do git push origin $b; done'],
  ['allow', 'git add -u with named paths', 'git add -u content/jobs agent/log/x.md'],
  ['allow', 'fast-forward a local main', 'git fetch -q origin && git switch -q main && git merge -q --ff-only origin/main && git status --short'],
  ['block', 'switch to main then a real merge', 'git switch main && git merge task/a'],
  ['allow', 'log lines through a heredoc, then the log check', "cat >> agent/log/x.md <<'EOF'\n261114 | task/a | note | never use git add -u or push --force to main\nEOF\nnode scripts/eval-log.mjs --check"],
  ['block', 'bash -c around a $(cat <<EOF) body', "bash -c \"$(cat <<'EOF'\ngit push origin main\nEOF\n)\""],
  ['block', 'eval around a $(cat <<EOF) body', "eval \"$(cat <<'EOF'\ngit push origin main\nEOF\n)\""],
  ['allow', 'another command, then log lines through a heredoc on the same line', "pkill -f 'serve .output'; cat >> agent/log/x.md <<'E'\n261114 | task/a | note | git push --force origin main was refused\nE"],
  ['allow', 'log lines through a heredoc, then git add of that file', "cat >> agent/log/x.md <<'EOF'\n261114 | task/a | note | git add -u was refused\nEOF\ngit add agent/log/x.md && git commit -q -m log"],
  ['block', 'heredoc to a file, then source it', "cat > env.txt <<'EOF'\ngit push origin main\nEOF\nsource env.txt"],
  ['block', 'heredoc to a file, then run it by its bare name', "cat > go <<'EOF'\ngit push origin main\nEOF\ngo"],
  ['block', 'a shell, then a heredoc on the same line that feeds it', "bash -c 'x'; bash <<'EOF'\ngit push origin main\nEOF"],
  ['block', 'heredoc to a file, then chmod and run it', "cat > go <<'EOF'\ngit push origin main\nEOF\nchmod +x go && ./go"],
  // ordinary commands stay allowed
  ['allow', 'commit on a task branch', 'git commit -m "Fix main menu"'],
  ['allow', 'add files by name', 'git add pages/index.vue agent/log/x.md'],
  ['allow', 'push a task branch', 'git push origin task/a'],
  ['allow', 'log of main', 'git log --oneline origin/main -3'],
  ['allow', 'diff against main', 'git diff origin/main...HEAD > .agent/review.diff'],
  ['allow', 'edit a page', path.join(repo, 'pages/index.vue'), repo, 'Edit'],
];

let bad = 0;
for (const [want, what, cmd, cwd = repo, mode = 'Bash'] of cases) {
  if (mode === 'main-checkout-on-main') sh('git switch -q --detach && git -C ' + wtMain + ' switch -q --detach && git switch -q main');
  const got = mode === 'Edit' || mode === 'Write' ? run(cmd, cwd, mode) : run(cmd, cwd);
  if (mode === 'main-checkout-on-main') sh('git switch -q task/a && git -C ' + wtMain + ' switch -q main');
  const ok = got === want; if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${want.padEnd(5)} ${what}${ok ? '' : `  (got ${got})`}`);
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${cases.length - bad} of ${cases.length} cases right (${hook})`);
process.exit(bad ? 1 : 0);
