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

export const SHORTLIST_DATE = '2026-11-21';
export const SHORTLIST: ShortlistRole[] = [
  { id: "rs-20261121-1", role: "Sr Forward Deployed Engineer", company: "Databricks", segment: "P2", direct: true, url: "https://www.databricks.com/company/careers/professional-services-operations/sr-forward-deployed-engineer-8362737002", note: "Databricks FDEs build and productionize customers' data & AI solutions — my exact intersection: ~12 years of SAP FICO/FP&A enterprise delivery (a SAC transformation across 14 EU markets at Wipro; Tyson; TCS pharma) plus three years solo-shipping production GenAI — RAG, multi-agent orchestration, MCP — including a live AR-automation engine on QuickBooks + n8n. Billable, customer-embedded delivery is how I've worked my whole career; India-based (GMT+5:30), daily Python/SQL." },
  { id: "rs-20261121-2", role: "Forward Deployed Engineer — Agentic AI / GenAI", company: "TalentGigs (AU product studio)", segment: "P2", direct: false, url: "https://arc.dev/remote-jobs/j/talentgigs-forward-deployed-engineer-agentic-ai-genai-plrd28isjn", note: "This is end-to-end AI product engineering — agents, RAG, tool-calling, owned in production — exactly how I work today at QuantumRush, shipping LLM-powered SaaS and client delivery workflows solo. 15 years of enterprise delivery (SAP FICO, a SAC/FP&A transformation across 14 EU markets at Wipro) means I translate messy business process into working systems. I build on Python (FastAPI/Django), React/Next.js and multi-agent stacks (LangGraph, CrewAI, AutoGen), use Claude Code daily, and the remote-India + Australia-overlap setup suits GMT+5:30." },
  { id: "rs-20261121-3", role: "Forward Deployed Engineer, India", company: "Exa", segment: "P2", direct: true, url: "https://startup.jobs/forward-deployed-engineer-india-exa-10560663", note: "Exa's FDE owns the technical win — discovery, solution design on the API, demos and POCs that convert evaluations into deals. That's my current delivery motion at QuantumRush (client-facing agentic and retrieval builds, production RAG) on top of 15 years of enterprise stakeholder work across India, UK and US. Comfortable being the first GTM engineer in a region and writing the playbook from GMT+5:30." },
  { id: "rs-20261121-4", role: "Staff Forward Deployed Engineer", company: "Databricks", segment: "P2", direct: true, url: "https://www.databricks.com/company/careers/professional-services-operations/staff-forward-deployed-engineer-8530855002", note: "I bring the Staff-FDE blend: years architecting enterprise data estates (SAP BW/4HANA, BPC, SAC across Wipro/Tyson/TCS) and three recent years of applied AI in production — RAG, MCP/tool-use, context engineering, multi-agent orchestration — including a live receivables-automation system (QBO + n8n) I built and operate solo. Customer-facing delivery end to end, India-remote, stakeholder-fluent across business and engineering." },
  { id: "rs-20261121-5", role: "Forward Deployed Engineer (enterprise GenAI/agentic — via Jobgether)", company: "Jobgether partner co.", segment: "P2", direct: false, url: "https://jobs.lever.co/jobgether/e5d84214-64d6-4f16-ae49-b62131dd1799", note: "End-to-end AI agent development for enterprise customers with CXO-level exposure — matches my solo production work (multi-agent orchestration, RAG, MCP, human-review guardrails) layered on 15 years of enterprise finance delivery. A majority-coding FDE role in enterprise + GenAI is precisely my QuantumRush day job, India-remote." },
];
