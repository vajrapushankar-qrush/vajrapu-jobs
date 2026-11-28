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

export const SHORTLIST_DATE = '2026-11-28';
export const SHORTLIST: ShortlistRole[] = [
  { id: "rs-20261128-1", role: "Senior Solutions Engineer - BFSI (India)", company: "Neo4j", segment: "P1", direct: true, url: "https://remowork.life/jobs/6adef2dec50bd96d19bee5cd/senior-solutions-engineer-bfsi", note: "The JD asks for 7+ years in pre-sales, professional services or customer-facing technical architecture: I bring 15 — SAP FICO, BPC and SAC architecture for Roche, Astellas, Tyson Foods and Nomad Foods, running discovery, PoCs and demos for rooms spanning data engineers to CFOs across India, UK, US and 14 EU markets. Finance data is my core domain, from general ledger to FP&A planning, so BFSI conversations about lineage, risk and compliance start on familiar ground. The last three years add hands-on production GenAI — RAG and retrieval pipelines, multi-agent orchestration, MCP tool-use, the machinery behind GraphRAG — plus daily Python, SQL, Docker and cloud deployment. Bangalore-based, matching the stated location priority." },
  { id: "rs-20261128-2", role: "AI Engineer (Enterprise Technology & AI)", company: "GitLab", segment: "P2", direct: true, url: "https://job-boards.greenhouse.io/gitlab/jobs/8556658002", note: "This role's stack is my daily work: three years building production GenAI as a solo founder — prompt and model-selection trade-offs, RAG versus long-context decisions, agentic patterns with tool-use, multi-agent orchestration, human-in-the-loop guardrails and evals — shipped into real business workflows, not demos. The enterprise-systems half is my first career: twelve years embedding SAP, CRM and planning platforms into sales, finance and operations workflows for Tyson Foods, Nomad Foods and Roche, exactly the Salesforce-Marketo-Zendesk class of system this team automates. I build integrations in Python and JavaScript/TypeScript over REST and webhooks, and I diagnose the workflow constraint before writing code — my current AR-automation product exists because I found the bottleneck first. Bangalore-based, long practised at remote, async, handbook-style work." },
  { id: "rs-20261128-3", role: "Forward Deployed Engineer (Remote - IN)", company: "Plexe (YC)", segment: "P2", direct: true, url: "https://www.ycombinator.com/companies/plexe/jobs/eocGfXv-forward-deployed-engineer", note: "I have spent three years deploying LLM and agentic systems into customer environments: multi-agent orchestration with LangGraph, CrewAI and AutoGen, RAG pipelines, MCP tool-use, and scikit-learn/Pandas ML foundations, all in production for paying clients. My current business is forward deployment in miniature — I scope with the customer, build on their stack (a QuickBooks + n8n collections automation runs a client's revenue operations today), and operate it live with guardrails and reconciliation. Behind that sit 15 years of enterprise data and planning systems (SAP, Python, SQL) delivered onsite and remote for Tyson Foods, Nomad Foods and Roche, so customer-site travel and executive communication are routine. India-based, matching the Remote (IN) listing." },
  { id: "rs-20261128-4", role: "Forward Deployed Engineer (US-remote — long shot)", company: "Leena AI", segment: "P3", direct: true, url: "https://apply.workable.com/leena-ai/jobs/view/D4C4A9641D", note: "The JD reads like my CV: against the 8+ years of customer-facing engineering asked, I bring 15 deploying enterprise systems inside client environments — including SAP, named in your preferred stack — for Roche, Astellas, Tyson Foods and Nomad Foods, with the REST/SOAP integration, SSO and security-review work enterprise IT demands and CIO-level communication across US, UK and EU stakeholders. The last three years I have built agentic AI in production solo: LLM integrations, RAG, multi-agent orchestration, MCP tool-use and human-review guardrails. I note the listing is US-remote: I am India-based, but my Tyson Foods offshore-lead years ran on US hours, and I offer full US-time-zone overlap and travel." },
  { id: "rs-20261128-5", role: "Forward Deployed Engineer (US-remote — long shot)", company: "Stack Overflow", segment: "P3", direct: true, url: "https://stackoverflow.co/company/careers/7772964", note: "Deploying AI into enterprise environments is my current work: MCP servers, RAG architectures and agentic tool-use in production, wired into the systems enterprises actually run via REST and webhook integrations, auth flows, Docker and cloud deployment pipelines, in Python and JavaScript. Fifteen years of customer-facing enterprise delivery — SAP platforms for Roche, Tyson Foods and Nomad Foods — mean I own deployments, integration validation and runbooks with engineers and business stakeholders alike, well past the 3+ years asked. The posting lists US-remote hiring hubs, so this is a long-shot application from India, offered with full US-time-zone flexibility and a long record of distributed, async delivery." },
];
