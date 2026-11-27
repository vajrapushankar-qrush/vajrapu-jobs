// The day's sourced roles — WRITTEN BY THE SCHEDULED SOURCING TASK, not by hand.
//
// Every morning the Claude scheduled task "Daily remote FDE job sourcing" overwrites this
// whole file with the day's five roles and pushes; Cloudflare rebuilds (~a minute) and the
// roles appear as ordinary apply-tasks on the Today page, the full plan page and the hub —
// tickable like any other task (tasks.config.ts splices them into the matching plan day).
// Hand edits are safe to lose on the next morning's push. Curated plan tasks live in
// tasks.config.ts, never here.
//
// The contract the writer follows (mirrored in the scheduled task's own prompt):
// - ids are rs-YYYYMMDD-1 … rs-YYYYMMDD-5 — date-stamped, never reused, so ticks stay honest
// - SHORTLIST_DATE is the IST date the roles are for; they merge only into that plan day
// - at most 2 of the five are P3 long shots; every entry names its segment and direct/agency
// - note = the 4-sentence application note drafted from the JD. That note is the ONE place
//   tailoring lives — the CV is the standard file and is never tailored per role (CLAUDE.md
//   hard rule #1).

export type ShortlistRole = {
  id: string;        // rs-YYYYMMDD-N
  role: string;      // "Forward Deployed Engineer"
  company: string;
  segment: 'P1' | 'P2' | 'P3';
  direct: boolean;   // true = direct employer, false = agency/consultancy
  url: string;       // the posting
  note: string;      // the 4-sentence application note, drafted from the JD
};

export const SHORTLIST_DATE = '2026-11-27';
export const SHORTLIST: ShortlistRole[] = [
  { id: "rs-20261127-1", role: "Forward Deployed Engineer (TypeScript + AI)", company: "FullStack", segment: "P2", direct: false, url: "https://jobfound.org/job/fullstack-is-hiring-for-forward-deployed-engineer-typescript-ai-remote-india-12-november-2026", note: "Embedding with enterprise clients in regulated industries to find and ship AI use cases is my exact lane: 15 years of client-facing delivery for food and pharma majors (Tyson Foods, Nomad Foods, Astellas, Roche) via Wipro and TCS, and the last 3 as a hands-on founder shipping agentic systems to production — multi-agent orchestration (LangGraph, AutoGen, CrewAI), RAG, MCP/tool integrations and human-review guardrails. I build across TypeScript/Node (React, Next.js) and Python (Django, FastAPI), own cloud deployment and CI/CD for the LLM SaaS and client automations I operate today, and run discovery workshops from engineers up to CFOs and CTOs. India-based (Hyderabad/Bangalore), authorized to work in India, fully remote." },
  { id: "rs-20261127-2", role: "Forward Deployed Engineer", company: "Mem0", segment: "P2", direct: true, url: "https://www.workatastartup.com/jobs/79763", note: "Owning customer integrations from PoC to production is what I do solo today: I ship LLM SaaS and client automations end to end on Python and TypeScript/JavaScript — REST APIs, webhooks and auth flows, RAG with vector databases, multi-agent orchestration (LangGraph, AutoGen, CrewAI) and MCP/tool-use with human-review guardrails in production. Memory and state across agent workflows is home ground in my own products, so I can advocate for Mem0 credibly from day one. Behind that sit 15 years of customer-facing enterprise delivery (SAP FICO, BPC and SAC for Tyson Foods, Nomad Foods, Roche), so technical discovery, architecture calls, debugging across network/auth/data layers and executive communication are routine. Based in Hyderabad/Bangalore — the India/Remote listing fits exactly, and the 3+ years of customer-facing applied-AI work is well covered." },
  { id: "rs-20261127-3", role: "Forward Deployed Engineer (Remote, India time zones)", company: "SigNoz", segment: "P2", direct: true, url: "https://www.workatastartup.com/jobs/78271", note: "I run production systems I built myself — Python/FastAPI and Node services, PostgreSQL, Docker and cloud deployment pipelines (Cloudflare Workers among them), including an AR-collections engine businesses rely on daily — so instrumenting, debugging and keeping customer deployments healthy is my normal work. Fifteen years of enterprise systems delivery (SAP data platforms for Tyson Foods, Nomad Foods, Roche) taught me to work inside other teams' environments and constraints and to write integration guides and runbooks people actually use. I work in Python, Node.js and SQL, with distributed-systems thinking built on BW/4HANA-scale data landscapes. Completely-remote across India time zones is exactly how I already operate." },
  { id: "rs-20261127-4", role: "Forward Deployed Engineer - EMEA (Europe-listed — long shot)", company: "n8n", segment: "P3", direct: true, url: "https://jobs.ashbyhq.com/n8n/c9fc97fa-a473-4133-b3cb-502785649ecd", note: "My proof for this role is literal: as a solo founder I built and operate a production accounts-receivable collections engine on n8n + QuickBooks Online — data sync, reminder-escalation workflows, stop-on-payment logic, reconciliation — plus client-facing delivery automations, and I extend workflows with custom code, REST integrations and LLM steps (RAG, agents, MCP/tool-use). Before that, 15 years deploying enterprise systems inside customer environments (SAP for Tyson Foods, Nomad Foods, Roche): time-boxed engagements, reusable patterns, stakeholder rooms from engineers to CFOs. I am India-based with full EU-overlap working hours and know the listing is remote-Europe — treat this as a long-shot application on field proof: an n8n build of mine is running a business's revenue operations today." },
  { id: "rs-20261127-5", role: "Forward Deployed Engineer, APJ (Singapore-listed — long shot)", company: "Arize AI", segment: "P3", direct: true, url: "https://startup.jobs/forward-deployed-engineer-apj-arize-ai-7975122", note: "GenAI observability and evaluation is work I already do from the builder's side: my LLM products and client automations run RAG, multi-agent orchestration and MCP tool-use with prompt evaluation and human-review guardrails over them in production. I have managed concurrent customer engagements for 15 years in enterprise delivery — SAP FICO, BPC and SAC programmes for Tyson Foods, Nomad Foods, Astellas and Roche across US, UK and 14 EU markets — from scoping to delivery, engineers to executives. Python is my daily language (Django/FastAPI, Pandas), alongside TypeScript, Docker and cloud deployment experience. Hyderabad/Bangalore-based with native APJ-hours coverage; the listing asks for Singapore-based, so this is an India-based APJ long shot with full timezone overlap." },
];
