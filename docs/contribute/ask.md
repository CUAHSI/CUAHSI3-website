# Level 1: ask for a change

For CUAHSI staff who want something added to the website, or their own profile changed, without editing
anything themselves. You fill in one form. A website owner (today, Jordan Read) and their agent do the rest.

## What you need

- **A GitHub account.** Every staff member who asks for website changes needs one. It is free: sign up at
  https://github.com/signup. You do not need any access to the repository to send a request.
- **The facts for your item.** [What you can add, in plain words](item-types.md) lists them for each kind
  of item.
- **Optional: Claude.** The prompt below has Claude interview you and write the request for you.

## How to ask

1. Open the request form: https://github.com/CUAHSI/CUAHSI3-website/issues/new?template=content-request.yml
2. In the title, after "[Content request]", say in a few words what it is ("Snow field school 2027
   applications open").
3. Fill in the rest. Write "unknown" for anything you do not know.
4. Submit it. **Everything in the form is public from the moment you submit it.** A picture is public as
   soon as you drag it into the form, even before you submit. Send a request only once the item can be
   announced, and only pictures you have the right to use, of people who agreed to be shown.

What happens next:
- A website owner picks it up. Their agent checks for the same item already on the site, writes it, runs
  the site's checks, and prepares the change for the owner to review.
- If something cannot be confirmed, they ask you in a comment on your request.
- The request closes when the change goes live on the site, and the page's address is added to it.

## Let Claude write it for you

Start the chat only once the item can be public. Copy everything in the box below into a new chat at
https://claude.ai. Then, under it, paste the section for your item from [What you can add](item-types.md):
Event, News item, Impact story or Profile update. For a job or a Critical Zone paper or dataset, there is
no section to paste: write "a job" or "a Critical Zone paper or dataset" instead. Answer Claude's
questions, and copy what it gives you into the form, one part per box.

```text
I want to ask for an item on the CUAHSI website. Below my message is the website's own description of this
kind of item, including the facts it needs. Please interview me for those facts.

- Ask me one question at a time, in the order of the list. Say what the fact is for if I seem unsure.
- Use only what I tell you or what is in a document or link I give you. If you cannot open a link, say so
  and do not describe what it contains. Never fill in a date, time, time zone, link, name, award number
  or any other fact yourself. If I do not know something, write "unknown".
- Any longer text that will appear on the site (a description, summary or story) may contain only facts I
  gave you: add no claims, numbers, names, outcomes or praise. Write it in a few sentences of your own;
  never copy or closely follow an article or a document I paste in.
- Leave out anything that must not be public: phone numbers, personal email or home addresses, results or
  news not yet announced, and details of other people beyond their name and role. If I give you any of
  these, tell me and leave them out.
- When we are done, give me the request in exactly these parts, so I can copy each into the form:
  1. What is it? (one of: Event, News item, Impact story (highlight), Update to my own profile, A job to
     list, Critical Zone paper, dataset or software, Not sure)
  2. A title of a few words for the request
  3. The facts: one line per fact, in the list's order, "Fact: value"; then any longer text (description,
     summary, story) under its own heading
  4. Link to the thing itself (or leave it empty)
  5. What is not confirmed yet (or "None")
  6. Pictures: for each, what it shows, the caption and the credit (I will attach the files myself)
- Then remind me that everything in the form is public, and ask whether all of it can be public now.

The website's description of this item:
```

## Who to ask if you are stuck

Comment on your request, or ask Jordan Read. Larger changes (a new page, a layout change, a web address)
are level 3 in [CONTRIBUTING.md](../../CONTRIBUTING.md), not a content request.
