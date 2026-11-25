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

export const SHORTLIST_DATE = '2026-11-25';
export const SHORTLIST: ShortlistRole[] = [
  { id: "rs-20261125-1", role: "AI Specialist (Applied AI)", company: "BPM LLP", segment: "P1", direct: true, url: "https://jobs.lever.co/bpmcpa/dd90a4f1-1c12-4a8d-ad96-da9aa24ffac1", note: "BPM's clients live where I have spent 15 years: finance and accounting systems for US and global enterprises — SAP FICO, BPC and SAP Analytics Cloud FP&A for Tyson Foods, Nomad Foods, Astellas and Roche — so I speak the language of both the advisory teams and their clients. For the last 3 years I have built exactly what this role delivers: production LLM workflows, RAG pipelines and agentic automation integrated into client systems, including an AR-collections engine on QuickBooks + n8n with evaluation logic and human-review guardrails. As a founder shipping on Python/FastAPI I have defined the prompt patterns, review workflows and ROI measures this role sets for the pod. I have worked US-overlap hours from India for most of my career, including offshore-lead years supporting Tyson Foods." },
  { id: "rs-20261125-2", role: "Forward Deployed Engineer", company: "Workato", segment: "P1", direct: true, url: "https://www.workato.com/careers/forward-deployed-engineer-8526776002", note: "I build and operate agentic automation on an iPaaS every day: my production AR-collections engine runs on n8n over QuickBooks Online — data sync, reminder-escalation workflows, stop-on-payment, reconciliation — which is Workato's recipe-and-connector model in practice, alongside RAG pipelines, multi-agent orchestration (LangGraph, AutoGen, CrewAI) and MCP integrations. Behind that sit 15 years of enterprise integration: SAP S/4HANA, ECC and BW estates, REST APIs and cloud business apps for global manufacturers and pharma. I am Hyderabad-based, so this Hyderabad-listed role needs no relocation, and I routinely work US/EU-overlap hours. I do not yet have a year on Workato itself, but platform transfer from daily n8n production work plus deep ERP and finance integration experience is the shortest path to productive." },
  { id: "rs-20261125-3", role: "Deployment Strategist", company: "Databricks", segment: "P2", direct: true, url: "https://www.databricks.com/company/careers/professional-services-operations/deployment-strategist-8637736002", note: "This role is the shape of my whole career: 15 years scoping and delivering customer-facing data and planning engagements — architecting a 14-market SAP Analytics Cloud FP&A transformation at Wipro, leading offshore FP&A-systems delivery for Tyson Foods — always quantifying business value with C-suite and VP-Finance stakeholders before anything gets built. The last 3 years I have shipped GenAI to production as a founder: LLM and RAG products, multi-agent orchestration, and an AR-collections automation over QuickBooks, owning PRD through launch, adoption and handover solo. I am hands-on in Python and SQL and fluent in modern data and AI architecture from SAP BW/HANA and cloud platform years. Remote-India fits exactly (Hyderabad/Bangalore base), and embedded onsite stints with enterprise customers are familiar territory from consulting." },
  { id: "rs-20261125-4", role: "Senior Principal Forward Deployed Engineer", company: "Atlassian", segment: "P2", direct: true, url: "https://www.atlassian.com/company/careers/details/27180", note: "I bring 15 years of enterprise systems delivery — SAP FICO, BPC and SAC architecture for Nomad Foods, Tyson Foods, Astellas and Roche — with the last 3 in production applied AI as founder and product architect: LLM-powered SaaS, RAG, agent frameworks (LangGraph, AutoGen, CrewAI) and MCP tool-use, with evaluation and human-review guardrails. I deploy AI into customer environments end to end, most recently an AR-collections engine on QuickBooks + n8n and client-facing agent workflows, covering enterprise integration (REST APIs, microservices, legacy estates), monitoring and compliance-conscious design. I have operated at principal-equivalent scope: solution authority across 14 international markets, mentoring offshore teams, and influencing stakeholders from engineers to C-suite without formal authority. Bangalore-based and remote-ready — and AI in the flow of enterprise work, the Rovo pattern, is exactly what I build." },
  { id: "rs-20261125-5", role: "Forward Deployed AI Engineer (4-8 yrs)", company: "Zoenix", segment: "P2", direct: true, url: "https://www.linkedin.com/jobs/view/4491908045/", note: "The JD reads like my current stack: enterprise agentic AI with multi-step reasoning, tool calling and context management — I build with LangGraph, CrewAI and AutoGen; RAG pipelines end to end from ingestion and chunking to embeddings and retrieval optimisation; and hands-on MCP integrations connecting agents to enterprise systems, all in production on Python/FastAPI with schema validation, retries and guardrails. I have owned deployments from discovery to production solo — an AR-collections engine on QuickBooks + n8n, LLM SaaS products — and mentored offshore engineering teams for years. Behind 3 years of applied AI sit 15 years in enterprise operations domains, including manufacturing supply chains at Tyson Foods and logistics-heavy FMCG at Nomad Foods, which maps directly to your aviation, logistics and cargo use cases. Remote-India full-time works perfectly from Hyderabad." },
];
