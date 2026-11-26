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

export const SHORTLIST_DATE = '2026-11-26';
export const SHORTLIST: ShortlistRole[] = [
  { id: "rs-20261126-1", role: "Applied AI Engineer, Partner - AWS", company: "OpenAI", segment: "P1", direct: true, url: "https://openai.com/careers/applied-ai-engineer-partner-aws-bangalore-remote/", note: "My 15 years are exactly this role's shape: enterprise technical consulting with C-level stakeholders at complex global organisations — SAP FICO, BPC and SAP Analytics Cloud transformations for Nomad Foods (14 international markets), Tyson Foods, Astellas and Roche, delivered from inside GSIs (Wipro, TCS), so I know first-hand how the GSI/RSI partner ecosystem this role scales through actually works. The last 3 years I have built production GenAI end to end as a founder: LLM APIs, RAG, multi-agent orchestration (LangGraph, AutoGen, CrewAI), MCP tool-use and cloud deployment for real customers. I design end-to-end AI architectures and reference implementations hands-on in Python, and I have run executive workshops and enablement across India, UK, US and EU markets. Bangalore-based, remote-ready, with a career of US/EU-overlap collaboration." },
  { id: "rs-20261126-2", role: "AI Deployment Engineer, Startups", company: "OpenAI", segment: "P2", direct: true, url: "https://openai.com/careers/ai-deployment-engineer-startups-india-remote/", note: "I am the founder this role says it values: since Nov 2023 I have built and shipped LLM-powered SaaS end to end at QuantumRush — subscription billing, automated appointment-reminder workflows, an LMS — on Python/FastAPI, PostgreSQL and React/Next.js, plus production automations clients run daily, including an AR-collections engine on QuickBooks + n8n. I work hands-on with the OpenAI API stack: RAG and retrieval workflows, multi-agent orchestration (LangGraph, AutoGen, CrewAI), MCP/function-calling, prompt evaluation and human-review guardrails. Fifteen years of enterprise delivery before that taught me to own ambiguous problems end to end and run several workstreams at once. The remote-Bangalore base fits exactly." },
  { id: "rs-20261126-3", role: "Forward Deployed Engineer (India)", company: "Qdrant", segment: "P2", direct: true, url: "https://join.com/companies/qdrant/15846454-forward-deployed-engineer-india", note: "Vector search and RAG are my daily stack: I build production retrieval workflows end to end — ingestion, chunking, embeddings, vector databases, retrieval optimisation — alongside multi-agent orchestration and MCP integrations, shipped as LLM SaaS and client automations on Python/FastAPI and PostgreSQL. Behind that sit 15 years of customer-facing technical delivery for global enterprises (Tyson Foods, Nomad Foods, Roche): architecture reviews, migration assessments and stakeholder workshops are home ground, including on SAP BW/4HANA and HANA data platforms. I explain complex trade-offs to both engineers and executives and have worked US/EU-overlap hours from India my whole career. India-based in Hyderabad/Bangalore, so the India-only remote eligibility fits exactly." },
  { id: "rs-20261126-4", role: "Forward Deployed Architect - Applied AI", company: "DevRev", segment: "P2", direct: true, url: "https://job-boards.greenhouse.io/devrev/jobs/5671156004", note: "I have spent 15 years as a hands-on enterprise architect — SAP FICO, BPC and SAP Analytics Cloud across a 14-market transformation — and the last 3 building applied AI in production: LLM agents with RAG, function-calling and evals, integrated with CRMs, APIs and databases on Python and TypeScript stacks. I own exactly this role's arc solo today: pre-sales scoping, live demos, technical design and post-sale delivery of AI automations into customer systems, most recently an AR-collections engine on QuickBooks + n8n and client CRM/PWA deployments on cloud CI/CD. I have mentored offshore teams and worked 20-40% customer-facing throughout my career, from engineers to C-suite. The Bangalore listing needs no relocation — I am based between Bangalore and Hyderabad." },
  { id: "rs-20261126-5", role: "Forward Deployed AI Engineer", company: "Emergent", segment: "P2", direct: true, url: "https://job-boards.greenhouse.io/emergentlabsinc/jobs/4061409009", note: "I build with agentic coding tools every day and ship full-stack apps end to end on Python (Django/FastAPI), JavaScript/TypeScript (React/Next.js) and PostgreSQL — most recently LLM-powered SaaS and client automations: CRMs, daily-ops PWAs and an AR-collections engine on QuickBooks + n8n. Turning high-context problems from non-technical business users into working software is my career: 15 years translating finance and operations requirements into systems for global enterprises, the last 3 doing it with prompts, agent debugging and evals in production. I train customer teams to self-sufficiency — I have run stakeholder workshops from plant managers to CFOs. Remote/hybrid with Bengaluru preferred fits; I am based between Bangalore and Hyderabad." },
];
