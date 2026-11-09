# Vajrapu Jobs — context for Claude sessions

This repo is the private hub for Girija Shankar Vajrapu's remote-job sprint: landing a remote
Forward Deployed Engineer / AI Architect role (enterprise finance + SAP + GenAI positioning).
The live site is a Cloudflare Worker behind Cloudflare Access; tasks and notes live in this repo,
application records and task ticks live in D1. Same architecture as the RAMS and Ops hubs,
independent of both.

## The commitments (source of truth: `TARGETS` in `src/site.config.ts`)

- **10 applications every weekday** — 5 from the scheduled shortlist (fires ~9:04 IST), 5 sourced live. P3 long shots capped at 2/day.
- **First interview by 24 Nov 2026.**
- **Remote offer signed by 16 Jan 2027** — signed, not verbal.

If these look stale, trust `src/site.config.ts` over this file.

## The capacity frame (shared across all projects — plan inside it)

Shankar runs six tracks in fixed daily blocks (max 9 working hours, family and calls come out of
the same day): **Jobs 09:00–12:00 · Ops 12:30–14:30 · RAMS 14:30–16:30 · rotating bet 17:00–18:00**
(ShubhSankalpa Mon, Zerollet Wed, TringRX Fri) · evenings only for booked recruiter calls
(19:30–22:30 IST kept free for US/EU time zones).

THIS project's budget: **09:00–12:00 on weekdays, Block A only on Saturdays, rest on Sundays.**
Plan tasks for this project inside that block only. If the backlog doesn't fit, cut scope or push
days out — never assume extra hours and never absorb another project's block. The full frame and
its rules: `src/content/notes/plan/day-frame.md`. The same header belongs in every other project
repo's CLAUDE.md with its own block filled in.

## Hard rules of the sprint

1. **One standard CV** (`GirijaShankar_Vajrapu_CV.pdf`, generated from
   `src/content/notes/plan/standard-cv.md`). Never tailor the document per role; tailoring lives
   in the 4-sentence application note. Do not offer to create per-role resumes.
2. **Numbers before strategy.** Never critique or revise the approach without the funnel. Get it
   from the Applications **Export CSV** (`/crm/` toolbar) — the site is behind Access, you cannot
   fetch it. Compute: applied → replies → interviews → offers, by segment (P1/P2/P3), plus
   follow-ups due.
3. **Diagnosis grid (Day-14 retro, one variable only):** replies <3% → positioning/CV wrong.
   Replies but no interviews → bucket mix wrong. Interviews but no offers → prep wrong, double the
   drills. Never change two things at once.

## Where things live

- 14-day plan: `src/tasks.config.ts` (tasks + steps; ticks sync via `/api/ticks` → D1)
- Playbooks & positioning: `src/content/notes/` (plan/ playbooks/ learning/ setup/)
- Message wording: `public/messages.js` · segments: `TRADES` in `src/api/_lib.js`
- KPI strip: `public/kpis.js` + `TARGETS` in `src/site.config.ts` · day frame: `FRAME` there too
- The scheduled shortlist: the "Daily remote FDE job sourcing (5+/day)" scheduled task in
  Claude (fires ~03:34 UTC daily); its prompt carries the candidate profile and bucket rules.
- Deploy: push to `main` → Cloudflare builds (`npm run build`) and deploys (`wrangler.jsonc`)

## Field meanings (the API keeps the old column names — labels changed, columns didn't)

`town` = role title · `region` = source (LinkedIn/shortlist/…) · `trade` = segment/bucket ·
`contact_form_url` = job posting URL · `first_name/last_name/title` = recruiter or hiring manager ·
`sent_at` = applied on · `value_gbp` = offer CTC in ₹ lakh · `ltd` = 1 direct employer / 0 agency ·
statuses: `sent`=Applied, `intake`=Interviewing, `client`=Offer.

## Replan convention (the "checkout")

When a day slips (festival, travel, an Ops fire): move unfinished tasks to the next light day by
editing `src/tasks.config.ts` — tasks move between days, IDs never change. Two hard rules:
**application blocks never absorb learning debt** (learning debt goes to Saturday, never in place
of applying), and the slipped day gets a one-line marker task so the history stays honest.

## House rules for changes

- Task IDs in `tasks.config.ts` are stable; never reuse an old ID for a new task.
- Keep API field names (`trade`, `value_gbp`, `town`, …) — labels may change, columns don't.
- Run `npm test` after touching `src/api/*` or `src/worker.js`; `npm run test:page` after touching
  `src/crm.html` or `public/messages.js`.
