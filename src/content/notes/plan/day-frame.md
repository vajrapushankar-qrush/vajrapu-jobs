---
title: "The day frame"
description: "One shared budget across six projects: share the budget, not the backlog."
order: 3
---

## The problem this solves

Six tracks — Jobs, Ops (Cash Flow Autopilot), RAMS, ShubhSankalpa, Zerollet, TringRX — each planned in its own isolated hub. The isolation is the feature: one context per block, nothing bleeding. But each hub's planning sessions can't see the others, so every plan quietly assumes it owns the whole day, and six reasonable plans add up to an impossible one.

**The fix is not a merged tracker.** Merging kills the isolation that makes the system work. The fix is a thin layer above the projects: one fixed frame of time-blocks, agreed in one place (here), that every project plans *inside*. Share the budget, not the backlog.

## The frame (weekdays)

| Block | Project | Notes |
|---|---|---|
| 09:00–12:00 | **Jobs — this sprint** | Blocks A→E. The shortlist lands ~9:04. |
| 12:00–12:30 | Lunch / family | Real break, not overflow. |
| 12:30–14:30 | **Ops · Cash Flow Autopilot** | The 15 Nov first-client push. |
| 14:30–16:30 | **RAMS loop** | Matches the UK-morning send window. |
| 16:30–17:00 | Buffer | Calls, tea, the unexpected. |
| 17:00–18:00 | **Rotating bet** | Mon ShubhSankalpa · Wed Zerollet · Fri TringRX. Tue/Thu: overflow or off. |
| Evening | Booked calls only | 19:30–22:30 IST kept free for US/EU recruiters. No calls booked = off. |

≈8 planned hours against a 9-hour ceiling; the buffer and lunch absorb life. **Saturday:** Jobs Block A + week review; one bet slot if fresh. **Sunday:** rest (the rest day is in the plan, so the streak survives it).

## The rules

1. **A project plans only inside its block.** If the backlog doesn't fit, cut scope or push days — never borrow another block.
2. **The rotating bets ship increments.** One slot = one finished chunk (a test pass, one page, one SEO fix) — not "planning".
3. **Holiday / travel mode:** Jobs Block A (45m) + RAMS inbox (15m). Everything else pauses without guilt; slipped tasks move to the next light day with a one-line marker (the ops "checkout" convention).
4. **Re-cut at known dates, not daily.** Next re-cut: **15 Nov** (Ops client verdict) and the **Day-14 retro** here. If a client lands, Ops grows and a bet pauses; if a job lands, this block shrinks to interviews and the frame is re-drawn around the notice period.

## The paste-header (put this in every project's CLAUDE.md)

```
## The capacity frame (shared across all projects — plan inside it)
Shankar runs six tracks in fixed daily blocks (max 9 working hours, family and
calls come out of the same day): Jobs 09:00–12:00 · Ops 12:30–14:30 ·
RAMS 14:30–16:30 · rotating bet 17:00–18:00 (ShubhSankalpa Mon, Zerollet Wed,
TringRX Fri) · evenings only for booked recruiter calls.
THIS project's budget: <ITS BLOCK>. Plan tasks for this project inside that
block only. If the backlog doesn't fit, cut scope or push days out — never
assume extra hours and never absorb another project's block. The full frame
and its rules live in the jobs tracker at /notes/plan/day-frame/.
```

Fill `<ITS BLOCK>` per repo: Ops `12:30–14:30 daily`, RAMS `14:30–16:30 daily`, each bet `one 17:00–18:00 slot per week`. Once the header is in a repo's CLAUDE.md, every planning session there inherits the budget automatically — isolation intact, overcommitment gone.
