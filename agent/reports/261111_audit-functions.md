# Audit A5: what a visitor can do on each site (11 November 2026)

Org issue 110, epic 99. Read-only on both sites; nothing was fixed, no form was submitted, no payment or sign-in was tested. Branch `task/audit-functions`, built from `main` at `f898ef9` (10 November 2026). The legacy side is the 6 November snapshot (761 saved pages). The method and the files are in section 2; the table is `agent/audit/a5-functions-table-261106.csv`.

## 1. The answer in one paragraph

Of 20 functions, 3 are present with the same destination (donate, post a job, watch a recording), 9 are present but done differently, 3 are absent on both sites, 2 are absent here, and **3 are not working here** (3 + 9 + 3 + 2 + 3 = 20). Those three functions have **four controls that do nothing or end in an error**: **two of the three newsletter sign-ups** (the home-page box does nothing; the Subscribe link on the newsletter archive opens a Constant Contact page that says the link is broken), **the quote form on `/hire-cuahsi`** (does nothing), and **the Code of Conduct report form** (the page merged on 10 November links a form its owner has deleted). Three more things a visitor loses: **search does not exist at phone width**; **a program cannot ask to be added to the graduate directory** (the legacy page links a form; this page has no route); and **a prospective member gets an e-mail address instead of the dean-signed request form**. One display defect: the Skills Certificate Pilot page says "This event has already taken place" and hides its Register button while the pilot runs to 4 December. Every item is a code or content decision for you (section 8); nothing was changed here.

## 2. Method and what each step can show

| Step | What it did | What it cannot show |
|---|---|---|
| `a5-functions-extract.mjs` (offline) | Read the 761 saved legacy pages and the 187 built pages here; counted forms, fields, iframes, scripts, links to services, pagers, sign-in words, downloads, social links and analytics, each marked as page chrome or content | Anything a script draws in the browser after load (here that includes the search button, the filter chips and the recording player); JavaScript behaviour of the legacy site |
| `a5-behaviour-new.mjs` (local browser) | Served the local build on this machine and tried search (4 words, desktop and 390 px), every filter, a text filter, the two controls that look like forms (clicked empty; every request recorded), the player and the documents page. Outward requests were refused | The legacy site's behaviour (no request was made to it: a search or a filter on the legacy site is a form submission) |
| `a5-forms-live.mjs` (network) | One plain GET per form or registration address (50 addresses: Jotform, Google Forms, Qualtrics, Cvent, Eventbrite, Zeffy, Mailchimp, Constant Contact), reading the page title only; one request per host name per second; nothing posted | Whether a submission would be received (nothing was submitted); the 5 `form.jotform.com` addresses that redirect to `cuahsi.jotform.com` (the redirect was not followed) |
| `a5-functions-analyse.mjs` (offline) | Joined the above with A4's link verdicts, `content/events` and `content/jobs` | |

`ok` in A4 means an address answers, not that the page works: A4 called the Constant Contact link ok (it answers 200 with an error page). The A5 step that reads the title and the hand reads below are what found it.

**The build I tested is not the deployed host.** `https://cuahsi3-website.netlify.app` is built from the organisation's repository, whose `main` is 367 commits behind this fork's `main` (organisation `main` `f3eb7bf`, 9 November; fork `main` `f898ef9`, 10 November). On 11 November the host had no `/about/code-of-conduct` (404) and showed 21 recordings where the build has 82. The counts in this report come from the build of the fork's `main`; the hand reads (section 6) were done on the deployed host where the function is the same code, and say so where it matters.

## 3. The table (summary; full evidence in the CSV)

20 functions. Status words: *present* (same function, same destination), *present differently*, *absent here*, *absent on both*, *not working here* (the control exists and does nothing or leads to an error).

| # | Function | Legacy (761 saved pages) | Here (187 built pages) | Status |
|---|---|---|---|---|
| 1 | Search the site | search form on 761 of 761 | pop-up, desktop only; 8 results at most; no results page | present differently; **absent on phones** |
| 2 | Subscribe to the newsletter | Mailchimp link on 60 of 761 | works on `/community` only; home box does nothing; archive link errors | **not working** (2 of 3 controls) |
| 3 | Donate | Zeffy form on `/donate` | same Zeffy form on `/support` | present |
| 4 | Contact the organisation | `/about/contact-us`, addresses behind JavaScript, office address | `/contact`, 3 plain e-mail links, no address | present differently |
| 5 | Request a quote | none | quote form on `/hire-cuahsi` does nothing | **not working** |
| 6 | Request membership | dean-signed Jotform | e-mail link only | present differently |
| 7 | Renew membership, invoices | no form | `/contact` routes it to membership e-mail | absent on both as a function |
| 8 | Register for an event | Zoom 99 pages, Jotform 85, Cvent 7 | 23 of 45 events have a link; button only before start | present differently; 1 defect |
| 9 | Post a job | Jotform 222235514170142 | same Jotform, 11 pages | present |
| 10 | Find and apply for a job | 2 selects, pager | chips, 72 of 72 published jobs link out | present differently |
| 11 | Sign in | 0 password fields | 0 password fields; "Member Portal" is a directory | absent on both |
| 12 | Download a document | 118 linked file addresses (116 names), search and pager | 61 PDFs on one page, no filter | present differently |
| 13 | Filter a list | selects on 61 pages | chips and 3 text boxes; none on news or documents | present differently |
| 14 | Page through a list | pager on 51 of 761 | none; whole lists | present differently |
| 15 | Watch a recording | YouTube on 13 pages | 82 of 82 play | present |
| 16 | Add your graduate program | Jotform on 31 pages | nothing | **absent here** |
| 17 | Report a Code of Conduct concern | anonymous form, 404 | same address, 404 | **not working** |
| 18 | Follow on social media | 5 networks | 3 networks | present differently |
| 19 | Calendar file, feed, share | none | none | absent on both |
| 20 | Count visits (staff side) | Google tag on 761 of 761 | none on 187 | absent here |

Counts of the 20, by status: present 3 (rows 3, 9, 15); present differently 9 (1, 4, 6, 8, 10, 12, 13, 14, 18); not working here 3 (2, 5, 17); absent here 2 (16, 20); absent on both 3 (7, 11, 19). 3 + 9 + 3 + 2 + 3 = 20. The four controls that do not work sit in rows 2 (two), 5 and 17.

## 4. Forms found on legacy pages and their destinations

50 form or registration addresses: 46 on legacy pages, 18 on pages here (14 on both), 32 only on legacy pages, 4 only here (`a5-forms-live-261106.csv`). The destination services, with what each needs from a person:

| Service | Legacy pages / addresses | Here pages / addresses | What it needs from a person |
|---|---|---|---|
| Jotform (`cuahsi.jotform.com`) | 85 / 26 | 13 / 7 | One account that owns the forms. One legacy form sits under a staff member's own user name and has been deleted. Someone reads submissions |
| Mailchimp (subscribe, archive) | 69 / 4 | 11 / 2 | The account and list; someone sends each issue |
| Constant Contact | 0 / 0 | 1 / 1 | An account that may not exist; the link reports a corrupt token |
| Zoom | 99 / 44 | 7 / 5 | Accounts of whoever hosts each event; 2 of the 5 addresses here are dead (`a4-dead-links-261106.csv`: both in newsletter issues of May, June and September) |
| Cvent | 7 / 12 | 1 / 6 | The Water Science Exchange account |
| Google Forms | 6 / 6 | 5 / 4 | A Google account; 1 legacy form needs a sign-in (401) |
| Qualtrics | 3 / 2 | 1 / 1 | Another university's account: the legacy forms and the one here sit on other universities' Qualtrics hosts, not CUAHSI's |
| Eventbrite | 1 / 1 | 0 / 0 | |
| Zeffy | 1 page, 1 form | 1 page (`/support`, an iframe; not counted by the link-based checks), same form | The Zeffy account and bank payout |
| Pagefind, YouTube | not a form | search index, player | Nothing to maintain (index) / the channel |

The 32 addresses found only on legacy pages, by what the check saw: 18 answer, 5 answer but say the form is closed or unavailable, 5 are `form.jotform.com` addresses that redirect to `cuahsi.jotform.com` (not followed), 2 are 404, 1 needs a sign-in (401), 1 is blocked (403, the Zeffy form). By title, examples: the graduate-program listing form (on 31 pages), the membership request, the anonymous Code of Conduct report (deleted), "Perceptual Models Webinar Registration", "RSVP Summer Institute Community Gathering AGU25", "CUAHSI Biennial Poster Submission", "SI TL Application 2027", "Proposal for CUAHSI Supported Training Workshop", "SnowEx hackweek Application", and several archived Cvent event pages. **Of the 18 addresses here, 14 answer and 4 say unavailable, ended or at capacity**: three are in newsletter issues from June to September (expected for past issues: two "currently unavailable", one "reached capacity"; the pages are in `a5-forms-pages-261106.csv`), and one is the 2027 Snow Field School application on an event page ("The application period for this workshop has ended"). The Zeffy form is not in the 18 or the 14: it is an iframe, and A4's list (which this step reads) holds links only, so the checks show 0 pages here for it; the local test found the iframe on `/support`. Inboxes: 14 distinct e-mail addresses are linked on 39 built pages (counts only; C11), of which `help@` and `membership@` are role addresses.

## 5. Rows where this site does it differently, and what changes for the visitor

(From the table: 1, 4, 6, 8, 10, 12, 13, 14, 18.)

- **Search:** a pop-up of 8 results with no page of its own, so a result list cannot be shared or paged; and none on phones (section 6).
- **Contact:** addresses are plain text (the legacy page hid them behind JavaScript); the office address is gone.
- **Membership:** the dean-signed form, with its institution types, becomes an e-mail; the page has no sentence about what to prepare.
- **Events:** the registration link is a button on the event page only until the start date. 3 of the 23 registration links point to a page on the legacy site (`www.cuahsi.org`); they will break at cut-over unless A2's redirects or a new page cover them.
- **Lists:** pages and selects become whole lists and chips. The recordings page asks the browser for 82 thumbnails at once.
- **Social:** Facebook and Instagram links are gone (5 networks to 3).

## 6. Control and hand reads

**Control (five functions Jordan names).** Jordan named four on 11 November: search, subscribe to the newsletter, request or contact membership, register for an event. He named no fifth; I took **download a document** and mark it **(mine)**. Each was checked by hand against the table; none was changed by the check.

| Function | Table said | By hand | Same? |
|---|---|---|---|
| Search the site | works on desktop; none on phones | 375 px, deployed host: Search button exists in the page but is hidden; the opened menu lists 9 items, none is Search | same |
| Subscribe | works on `/community`; broken on the archive; home box does nothing | `/community` link opens the Mailchimp sign-up form ("Sign up for the CUAHSI Mailing List!"); the archive link opens "The link you clicked on appears to be broken"; the home Subscribe button clicked empty: no message, no change (a word search of the page for thank, sent, success and similar found 2 matches in the local test: "represent" inside "I REPRESENT AN INSTITUTION" and a recording's blurb; neither is a message) | same |
| Request or contact membership | legacy form, e-mail link here | legacy Jotform opened ("CUAHSI Membership Request Form", institution type, dean signature); the page here shows an e-mail link only | same |
| Register for an event | link per event; Skills Certificate Pilot defect | opened the Cvent address (a "Waitlist" page), the Zoom webinar address (the registration page for the 19 November webinar); read the code (`isPast` tests `start`) and the built page ("This event has already taken place" for 3 November to 4 December) | same |
| Download a document **(mine)** | 61 PDFs on one page | all 61 linked files answered 200 on the local build | same |

Control result: 5 of 5 agree with the table. It is a small control: all five are functions the table already had.

**Six items read by hand** (rule 12), on the deployed host, nothing submitted. The hand reads are recorded only in this section; there is no data file for them:

- *Called present (3):* **Donate**, `/support`: the Zeffy form loaded with its amount buttons and a Continue button (not clicked). **Post a job**, `/community/jobs`: "Post a job" opened "CUAHSI Request for Job Post" with its fields. **Watch a recording**, `/learn-train/cyberseminars`: a click on the first card opened a `youtube-nocookie` player titled for that seminar (a script-made click did not; a real click did).
- *Called missing or not working (3):* **Search on a phone** (above). **Add a graduate program**, `/learn-train/graduate-programs`: 0 forms, 0 Jotform links, 0 e-mail links, no sentence about adding a program; the legacy page says "Interested in adding your water program to the list? Fill out this form." **Code of Conduct report form**: opened by hand, "Form not found. This form has been deleted by the owner."

**Script check.** Seven legacy figures were re-counted with plain `grep` over the 761 files: Mailchimp subscribe links 60, Jotform links 85, Zoom links 99, pager links 51, selects 61, password fields 0, Google tag 761: all equal the script. A sample of three flagged and three unflagged pages: the three flagged (membership, contact-us, governance) each hold the subscribe link; of the three I chose as unflagged, one (the team page) also holds one: my pick was wrong, the script was right (it is in the 60).

## 7. Counts with denominators

| | Legacy | Here |
|---|---|---|
| Pages read | 761 | 187 (170 with a header; the other 17 are 15 redirect stubs, `/200`, `/404`) |
| Pages with a search form or box | 761 header + 61 list pages | 4 pages have a text box (membership, member directory, portals, graduate programs); 1 pop-up in the header |
| Pages with a select | 61 | 1 (the quote form) |
| Pages with a pager | 51 | 0 |
| Password fields | 0 | 0 |
| E-mail input fields | 0 | 2 (home box, quote form), neither wired |
| Pages with analytics | 761 | 0 |
| Events with a registration link | n/a | 23 of 45 published; 9 not over on 11 Nov: 5 with a link, 4 without |
| Jobs | 86 legacy job addresses (A3f report) | 72 published of 149 files; 72 of 72 with a link |
| Hosted PDFs on the documents page | 118 linked file addresses (116 names) | 61 of 61 answer (A4 counts 63 legacy files hosted here; 2 are not PDFs on this page) |

## 8. Proposed fixes, for you to decide (nothing is done)

Ranked by what a visitor meets:

1. **Code of Conduct report route.** The page links a deleted form. Decide the route: a form CUAHSI owns, or the e-mail address, and who watches it. Content or code, depending (the page is code). The deleted form's address is on the legacy page too.
2. **Home-page newsletter box and the archive's Constant Contact link.** Make the home box a real sign-up (a link or form to the one provider you choose: Mailchimp works) and remove or replace the Constant Contact link. Code (home page) and content.
3. **Quote form.** Wire it to a destination (an inbox, a Jotform) or replace it by an e-mail link. Decision first: where do requests go and who answers. Code.
4. **Search on phones.** Put the Search button in the phone menu. Code.
5. **Event Register button.** Test the end date, not the start date, for an event that is under way. Code (`pages/community/events/[slug].vue`).
6. **Add-a-program route.** A sentence and a link (a Jotform or an e-mail) on the graduate programs page. Content and code; a decision about the form.
7. **Membership.** Say on the page what the old form asked (institution type, dean's signature), or keep the form. Content.
8. **Analytics.** A decision for A6: which tool, and whether visitors are asked to consent. Changes configuration: rule 8.
9. **Smaller:** filters on news and documents; paging or lazy loading on the recordings page (82 thumbnail requests); restore the office address; Facebook and Instagram links.

## 9. Not examined

- The legacy site's own behaviour: its search results, its filters and its pager were not used (they are form submissions); counts come from the saved pages. 761 pages.
- Whether a submission to any form is received: no form was submitted. 50 addresses were opened, not used.
- Payment: the Zeffy Continue button was not clicked. Sign-in: none exists on either side.
- 5 `form.jotform.com` addresses (redirect not followed); 1 Zeffy address (403, a script is refused; the form loads in a browser) and 1 Google Forms address (401, needs a sign-in). Zoom addresses were not requested in this step (A4 checked those on this site).
- Phone width was checked for search only (by hand and in the local test); the other functions were tried at desktop width.
- What an e-mail sent to `help@` or `membership@` does: not tested (an e-mail would be a message sent on someone's behalf).
- The 4 events with no registration link: whether they need one was not asked of anyone.
- `server/api/newsletter-redirect.ts` (old Mailchimp archive links to the new issues): not checked whether the static host runs it.
- Anything that needs a login at Mailchimp, Jotform, Zeffy, Cvent or Zoom: who owns each account is not visible from outside.

## 10. Noticed

- The home page says 96 member institutions; the member portal's directory says 101 institutions (the directory file has 229 rows and 101 distinct institutions). Possibly affiliates are counted in one and not the other; not checked.
- The clipboard: during a click in the browser pane on the deployed home page the pane reported that a page script wrote to the clipboard. I did not isolate which script or whether the site did it.
- CLAUDE.md says the site is deployed at `cuahsi3-website.netlify.app`; that host reflects the organisation's `main`, 367 commits behind the fork. A7 should decide which repository the cut-over builds from.
