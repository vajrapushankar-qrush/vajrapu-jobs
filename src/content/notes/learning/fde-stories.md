---
title: "STAR stories & technical answers"
description: "The interview bank: five stories and the technical drills, all from real shipped work. Drafted across Days 4–12."
order: 2
---

## How to use this page

One story per heading, in STAR shape (Situation → Task → Action → Result), each under 90 seconds out loud. Draft them on the scheduled days; read all five aloud on Day 12. Numbers beat adjectives — fill every `⟨…⟩` with a real figure.

## #1 · The 14-market SAC transformation (Wipro / Nomad Foods) — *Day 5*

- **S:** Global food group, 14 European markets, fragmented legacy planning.
- **T:** Architect one SAP Analytics Cloud FP&A platform — P&L, balance sheet, OpEx/CapEx, workforce, cash, working capital, commodity forecasting.
- **A:** ⟨models/data actions/value-driver trees designed; stakeholders wrangled across ⟨n⟩ countries; the migration sequence; the predictive PoCs⟩
- **R:** ⟨markets live, cycle-time or consolidation wins, what the CFO org could do after that it couldn't before⟩
- *Proves:* enterprise-scale architecture + multinational stakeholder work — the "enterprise half" of FDE.

## #2 · The AR-collections agent in production (QuantumRush) — *Day 4 (from the LinkedIn case story)*

- **S/T:** SMBs bleed cash to late invoices; build collections automation on their real books.
- **A:** QBO → n8n sync; 4-level escalation matrix with skip rules; one bundled email per customer; stop-on-payment reconciliation; every send *and* skip logged with reasons; Monday owner digest.
- **R:** ⟨running live since …; dry-run to production in ⟨n⟩ days; built and operated solo⟩
- *Proves:* production AI in a customer environment with guardrails — the exact FDE job description.

## #3 · Pharma finance at TCS (Astellas / Roche) — *Day 12*

- SAP BPC / BW-IP / FICO across budgeting, consolidation, month-end for global pharma; the war story: ⟨a month-end that nearly failed and what you changed⟩.
- *Proves:* regulated-industry rigour; surviving real enterprise pressure.

## #4 · The RAMS sprint — *Day 12*

- Standing start → outreach system in 2 weeks, solo: CRM with D1 backend, daily-loop tracker PWA, warmed inboxes, 20-prospect/day pipeline.
- *Proves:* speed, autonomy, judgment with no spec — the startup half of FDE.

## #5 · Shipping an LMS/SaaS end to end (ShubhSankalpa / QuantumRush) — *Day 12*

- Product decisions → stack → build → launch as the only engineer; what shipped, what got cut, ⟨usage/launch result⟩.
- *Proves:* ownership of a whole product lifecycle.

## Technical (Day 8 drill — 4 sentences each, anchored in the above)

- **Grounding an LLM in customer data (RAG):** …
- **Keeping an agent safe in production (guardrails / human review):** …
- **Knowing it works (evals):** …
- **Scoping a pilot for a skeptical enterprise (Day 10 recording):** …

## The two questions every FDE interview asks

1. *"Tell me about deploying into a messy customer environment."* → #1 or #3.
2. *"Show me something you shipped yourself."* → #2 + the demo repo + the 3-minute video.
