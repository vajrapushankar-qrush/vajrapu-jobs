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

export const SHORTLIST_DATE = '2026-11-24';
export const SHORTLIST: ShortlistRole[] = [
  { id: "rs-20261124-1", role: "Solutions Consultant - FP&A (Product Implementation)", company: "Drivetrain", segment: "P1", direct: true, url: "https://jobs.lever.co/drivetrain/ad7869b5-1d27-4ed6-87c3-5b540bd57214", note: "Twelve of my 15 years have been FP&A platforms — SAP BPC, BW-IP and SAP Analytics Cloud (SAC Planning certified, 2023) — including architecting an FP&A transformation across 14 international markets at Wipro: P&L, balance sheet, OpEx/CapEx, workforce, cash and working-capital planning, so EPM modeling, driver trees, consolidation and revenue-recognition logic are my daily language. I have run discovery and modeling workshops with CFO and VP-Finance stakeholders at Nomad Foods, Tyson Foods, Astellas and Roche, translating finance requirements into dimensions, hierarchies and data actions. The last 3 years I have also shipped production automation and GenAI over finance systems — an AR-collections engine on QuickBooks + n8n, LLM/RAG products on Python and PostgreSQL — a direct fit for an AI-native FP&A platform. Bangalore-based, remote, MBA plus ISB AMPBA." },
  { id: "rs-20261124-2", role: "Forward Deployed Engineer - Agents", company: "Level AI", segment: "P2", direct: true, url: "https://jobs.lever.co/levelai/498dfb1d-2f80-4a74-8d08-ecadccd8a221", note: "Deploying AI agents into customer environments is my current day job: multi-agent orchestration with LangGraph, CrewAI and AutoGen, RAG pipelines, MCP/function-calling integrations, prompt evaluation and human-review guardrails, shipped end to end on Python (Django/FastAPI). Recent production work matches this role's shape exactly — an AR dunning engine on QuickBooks + n8n with escalation logic, stop-on-payment and reconciliation, plus client-facing CRM and ops tools — built solo from discovery through launch and optimization. Behind that sit 15 years of customer-facing enterprise delivery (SAP FICO/FP&A at Wipro, Tyson Foods, TCS) across US, UK and EU stakeholders, including offshore-lead years worked on US-overlap hours, so the EST-overlap expectation is familiar territory." },
  { id: "rs-20261124-3", role: "Deployment Strategist Lead - India", company: "ElevenLabs", segment: "P2", direct: true, url: "https://jobs.ashbyhq.com/elevenlabs/6b5a902d-49ea-4fa9-ab67-d6e88c361695", note: "I have led technical delivery for enterprise accounts for 15 years — offshore FP&A-systems lead at Tyson Foods, architect on a 14-market transformation at Wipro — presenting to and winning C-suite and VP stakeholders across India, the UK, US and EU. As founder/director of QuantumRush I have run the zero-to-one motion this role asks for: scoping bespoke AI deployments with clients, building the integrations myself (LLM APIs, Python, REST, n8n), and closing and delivering the first customers. Three years of production GenAI means I can go as deep technically as an engagement needs while owning the commercial conversation, and I am ready to hire and lead the first regional forward-deployed engineers. Bangalore-based, remote, GMT+5:30." },
  { id: "rs-20261124-4", role: "Solutions Architect (Pre-Sales)", company: "LiveKit", segment: "P2", direct: true, url: "https://jobs.ashbyhq.com/livekit/63cec43b-4627-4494-b70d-cb7f8041a4b1", note: "I am a hands-on architect who wins technical rooms: 15 years of enterprise solution architecture (SAP FICO/SAC/FP&A for Nomad Foods, Tyson Foods, Astellas and Roche) running discovery, workshops and demos to C-level, plus 3 years building production LLM systems. I build POCs fast and solo — LLM-powered SaaS on Python/FastAPI and React/Next.js, agent pipelines with tool-use and MCP, automated reminder and messaging workflows — deployed to production on cloud infrastructure including Cloudflare Workers, working daily in Python, TypeScript and SQL. Real-time voice agents are the natural next layer on that stack, and pairing them with deep enterprise-integration experience (REST APIs, webhooks, legacy ERP estates) fits a pre-sales SA brief spanning startups and enterprises. Based in India — the role is listed anywhere-in-the-world — and I keep 19:30-22:30 IST open for US/EU calls." },
  { id: "rs-20261124-5", role: "AI Process Forward Deployed Engineer (US-listed — long shot)", company: "Camunda", segment: "P3", direct: true, url: "https://jobs.ashbyhq.com/camunda/987fb6e0-1e22-45e5-b152-57acbcb59cb2", note: "My career is process-to-technology translation: 15 years turning messy enterprise finance processes into executable systems across SAP FICO, BPC and SAC for global manufacturers and pharma, now paired with 3 years of production agentic automation — LangGraph/CrewAI orchestration, MCP tool-use, and n8n flows with escalation, stop-conditions and reconciliation, which is BPMN thinking in practice. Connector logic that gets legacy enterprise systems talking is literally my positioning: I integrate and rebuild legacy ERP and finance estates (SAP, QuickBooks, REST/OData) and have shipped customer deployments end to end, solo, through to a trained-and-independent handover. This posting is US-listed, so I am applying as a long shot: I work daily US-overlap hours from India, and Camunda's global employer-of-record hiring gives me hope the scope has flexibility." },
];
