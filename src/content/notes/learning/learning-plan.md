---
title: "Learning plan"
description: "45 minutes a day inside Block D: the Udemy course, the SAP AI stack, and FDE drills — proof over certificates."
order: 1
---

## The principle

The learning exists to pass FDE and AI-architect interviews, not to collect certificates. Three years of shipped GenAI already outweighs any 20-hour course — Block D turns that experience into *sayable, showable* material. Proof (a public repo, a case story, crisp answers) beats completion percentages.

## Track 1 — the Udemy course (Days 2, 4, 7, 9, 11)

The 20-hour course runs at ~45 min/day inside Block D — finished in ~3–4 weeks, **never** blocking applications (applying started on Day 1). One page of notes per module into this folder. If a module repeats what you've already shipped, skim it at 2× and say so in the notes; the course serves the sprint, not the reverse.

## Track 2 — the SAP AI stack (Day 3, then ambient)

One sitting for vocabulary, from the free learning journeys on learning.sap.com (search these names):

- **Joule** — SAP's copilot across 35+ apps; **Joule Studio** — building custom Joule agents
- **Generative AI Hub** — model access layer on BTP; **BTP AI Core** — the runtime
- **SAP Knowledge Graph** — business-context grounding (the "7 million fields" story)
- **Autonomous Finance** — Joule Assistants aimed at CFO orgs (the reason P1 roles exist)

Write one sentence each. In a P1 interview, "I've architected FICO/SAC for 12 years and I know exactly where Joule Studio fits in a CFO's landscape" is a sentence almost no other candidate can say.

## Track 3 — FDE drills (Days 8, 10, 12)

The seven FDE skill areas (production code · enterprise integration · data & retrieval · agents & LLMs · evals & guardrails · cloud & security · discovery & judgment) — each answered from something already shipped:

- **RAG:** how the retrieval workflows in the QuantumRush products chunk, embed, rerank — and what broke.
- **Agents in production:** the dunning engine's guardrails — human review, stop-on-payment, logging every send AND skip with reasons.
- **Evals:** how output quality was checked before customers saw it; what "working" measurably meant.
- **The pilot drill (Day 10):** "CFO wants AI in collections, trusts nothing — scope a 2-week pilot." Discovery questions → smallest useful slice → success metric → rollback. Recorded, listened to once.

Answers land in [[learning/fde-stories|the story bank]] under "Technical".

## Deliberately not now

SAP's paid certifications, new frameworks, anything speculative. After an offer (or at a retro that shows P1 interviews stalling on credentials), revisit. During the sprint: apply, drill, ship the demo repo.
