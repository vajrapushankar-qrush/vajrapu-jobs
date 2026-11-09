---
title: "How this vault works"
description: "Where things live, how to edit, and the three rules of the sprint."
order: 1
---

## The system

- **Tasks** (`/tasks/`) — the 14-day sprint, day by day. Ticks save to the shared database, so phone and laptop agree. Tasks live in `src/tasks.config.ts`.
- **Notes** (this vault) — markdown files in `src/content/notes/`. Edit on GitHub from the phone, push, live in a minute. Wikilinks work: `[[plan/standard-cv]]`.
- **Applications** (`/crm/`) — every application with status, follow-up dates, and the exact message to copy for where it stands. The wording lives in `public/messages.js`.

## The three rules of the sprint

1. **One CV.** The standard CV goes to every role, unchanged. Tailoring happens in the 4-sentence application note, never in the document. Changing CVs per role is the spiral this site exists to prevent.
2. **Minimum viable day = Block A.** Five applications from the shortlist keeps the streak alive on any travel, festival, or client-fire day.
3. **Change one variable per fortnight.** CV, bucket mix, or note wording — at the Day-14 retro, with the funnel numbers in hand. Never mid-sprint, never two at once.

## The position in one breath

AI Architect / Forward Deployed Engineer for enterprise finance: ~12 years architecting SAP FICO / SAC FP&A systems for global companies + 3 years shipping production GenAI solo. The rare overlap is the pitch — details in [[plan/positioning|Positioning]].

## Where everything is

- [[plan/standard-cv|The standard CV]] — the single source of truth; the .docx/PDF is generated from it.
- [[plan/positioning|Positioning]] — headline, About, the one-breath pitch, bucket definitions.
- [[plan/day-frame|The day frame]] — how this sprint coexists with Ops, RAMS and the three bets.
- [[playbooks/application-playbook|Application playbook]] — the daily loop, spelled out.
- [[playbooks/linkedin-sourcing|Sourcing]] — the five saved searches, boards, recruiter scripts.
- [[learning/learning-plan|Learning plan]] — Udemy + SAP AI + FDE drills, mapped to the 14 days.
- [[learning/fde-stories|STAR stories]] — the interview bank, built from real shipped work.
