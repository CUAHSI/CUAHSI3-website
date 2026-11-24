# Contributing to the CUAHSI website

Any CUAHSI staff member can change this website. You do not need to be a developer. An agent (Claude)
does the file work, and a website owner reviews every change before it goes live.

## Which level are you?

| Level | You want to | You need | Status |
|---|---|---|---|
| **1. Ask** | Add an event, a news item or an impact story, or update your profile, without editing anything yourself | A GitHub account (free; every staff member who asks for website changes needs one). Claude can help you fill in the form, but you do not need it | **The request form** (below). |
| **2. Do it with an agent** | Make the same changes yourself and open the pull request | The Claude desktop app, a GitHub account and your own fork of the repository | **Open** (below). |
| **3. Propose a larger change** | A new page or section, a change to layout or navigation, anything involving code or a web address | As for level 2 | **Ask Jordan first.** A written guide is coming. |

**Not sure which item type you need?** Read [docs/contribute/item-types.md](docs/contribute/item-types.md). It
explains, in plain words, what each kind of item is, where it shows on the site and what facts it needs.

## Level 1: ask

Fill in the [website content request form](https://github.com/CUAHSI/CUAHSI3-website/issues/new?template=content-request.yml).
It is the only way to ask. **Everything in it is public** once you submit it, so send a request only once
the item can be announced. [docs/contribute/ask.md](docs/contribute/ask.md) walks you through it, and has a
Claude prompt that interviews you and writes the request for you.

A website owner (today, Jordan) and their agent turn the request into a change. If a fact cannot be
confirmed, the owner asks you in a comment on your request. The request closes when the change goes live, and the
owner adds the page's address to it.

## Level 2: do it with an agent

1. Fork [CUAHSI/CUAHSI3-website](https://github.com/CUAHSI/CUAHSI3-website) to your own GitHub account, and clone your fork.
   Install the GitHub command-line tool, [`gh`](https://cli.github.com), and sign in with `gh auth login`.
2. Open the folder in the Claude desktop app and say what you want to change. Tell Claude you are working from your own
   fork; it follows "Own fork" in [docs/procedures.md](docs/procedures.md) and sets up the rest, including the browser the
   checks need ([README.md](README.md), "Quick start").
3. Claude opens the pull request on the organisation repository when you say so. A website owner reviews it, answers any
   question it raises, and merges it. Some decisions are an owner's, not yours (for example whether your profile page is
   switched on); Claude asks them in the pull request.

Expect it to take a while the first time: the checks build the whole site.

## What happens to every change

- **Checks.** Every change runs through the same automatic checks, which make sure the required facts are
  there and that links within the site work. The agent also searches for the same item already on the site.
- **Facts.** The agent never invents a fact. Anything it could not confirm is listed for a person to check.
- **Review.** A website owner reviews it and merges it. Changes that touch code, settings or web addresses
  are approved by Jordan before they are built.

## For developers and agents

The rules every change follows are in [AGENTS.md](AGENTS.md), which links to the rest: the full rules
(`docs/rules.md`), the procedures (`docs/procedures.md`), and the content rules
(`.claude/rules/content.md`). [README.md](README.md) covers setting up the code.
