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

export const SHORTLIST_DATE = '2026-11-22';
export const SHORTLIST: ShortlistRole[] = [
  { id: "rs-20261122-1", role: "AI Architect", company: "PairSoft", segment: "P1", direct: true, url: "https://pairsoft.applytojob.com/apply/UBRcCAxMF6/AI-Architect", note: "PairSoft is AI-enabled procure-to-pay over NetSuite, Dynamics, Sage Intacct and Blackbaud — my home ground: 15 years in enterprise finance systems (SAP FICO, BPC, SAC; an FP&A transformation across 14 EU markets at Wipro) plus 3 years shipping production GenAI. I already run the platform pattern this role owns — RAG pipelines, multi-agent orchestration with LangGraph/CrewAI, MCP tool-use, evals and human-review guardrails — and built a live AR-collections automation on QuickBooks + n8n, so AI over AP/P2P workflows is literally my current work. Based in India and glad to work the stated 11am-8pm IST window." },
  { id: "rs-20261122-2", role: "AI Solutions Architect — Enterprise Back-End Systems (6-mo contract)", company: "ADV TECHMINDS (via recruiter)", segment: "P1", direct: false, url: "https://careers-page.com/freelancer-career/job/7XWXYW5X", note: "15 years of enterprise solutions architecture across SAP S/4HANA, FICO, BW/4HANA, BPC and SAC for global manufacturers and pharma (Wipro, Tyson Foods, TCS), now combined with 3 years of hands-on applied AI — agentic workflows, LLM-powered automation, RAG and intelligent document processing in production. I integrate AI into back-end estates daily: a QuickBooks AR-collections engine on n8n with reminder escalation and reconciliation, MCP/function-calling integrations, and REST/OData APIs and ETL across SAP and non-SAP systems. Based in Bangalore, comfortable with the 3-11 PM IST window and executive stakeholder communication." },
  { id: "rs-20261122-3", role: "Forward Deployed Engineer", company: "DevRev", segment: "P2", direct: true, url: "https://job-boards.greenhouse.io/devrev/jobs/6180279004", note: "Your FDE is 80% customer-facing, hands-on integration and applied-AI work — my current day job: I ship LLM systems end to end (RAG, function calling, prompt evals, multi-agent orchestration with LangGraph/CrewAI) and wire them into customers' SaaS and legacy systems via APIs and webhooks. Daily Python and TypeScript/JavaScript across Django/FastAPI and React/Next.js, serverless delivery with CI/CD on Cloudflare Workers. 15 years of enterprise delivery (SAP FICO/FP&A at Wipro, Tyson, TCS) taught me to turn messy business processes into working systems alongside the customer, on-site when it matters." },
  { id: "rs-20261122-4", role: "Senior DS/ML Engineer — UltraLab (Lead Applied Scientist)", company: "Turing", segment: "P2", direct: true, url: "https://job-boards.greenhouse.io/turing/jobs/5591773004", note: "UltraLab's lead role — architecting agentic systems, RAG pipelines and GenAI prototypes while sitting with customers in discovery — is my QuantumRush practice: I take LLM products from prototype to production solo, on OpenAI/Anthropic APIs with LangGraph and CrewAI orchestration, MCP integrations and eval harnesses. That sits on ~12 years of enterprise data and planning architecture (SAP BW/4HANA, BPC, SAC) and executive-level client work across India, UK, US and 14 EU markets. You ask for 8-12 years; I bring 15, the last 3 in applied AI, working remote from India." },
  { id: "rs-20261122-5", role: "Senior Forward Deployed Engineer, Remote Build (NORAM-listed — long shot)", company: "Remote.com", segment: "P3", direct: true, url: "https://job-boards.greenhouse.io/remotecom/jobs/7774935003", note: "Remote runs global payroll, HRIS and contractor finance — enterprise finance operations, my domain for 15 years — and this role builds AI-enabled integrations, agentic workflows and eval harnesses inside customer environments, which is my production work today (RAG, MCP, LangGraph; a live AR-collections automation on QuickBooks + n8n with stop-on-payment and reconciliation). HRIS/payroll domain experience is your listed plus: payroll-adjacent FP&A and finance systems were my daily work at Wipro, Tyson and TCS across US/EU stakeholders. India-based and used to NORAM overlap — I keep 19:30-22:30 IST free for US/EU calls." },
];
