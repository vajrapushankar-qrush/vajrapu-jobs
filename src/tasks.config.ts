// The 14-day job sprint, day by day. This file is the single source of truth for tasks;
// check-off state lives in D1 (via /api/ticks) so your phone and laptop stay in sync.
//
// Rules this file follows:
// - Every task either lists its steps in full, or links a note that does.
// - IDs are stable ("d07-c"): renaming a task keeps its tick; deleting one orphans its tick
//   harmlessly. Don't reuse an old ID for a new task.
// - Day numbers count from SITE.startDate in site.config.ts (Day 1 = that date).
// - The whole sprint lives inside the 09:00–12:00 block. Three hours, then Ops. Never more.

export type Task = {
  id: string;
  title: string;
  mins?: number;       // rough budget, shown as a chip
  steps?: string[];    // concrete steps, no assumed knowledge
  note?: string;       // path of the note with the full detail
  tag?: 'apply' | 'pipeline' | 'learn' | 'build' | 'admin' | 'review';
};

export type DayPlan = {
  day: number;
  theme: string;
  tasks: Task[];
};

// ---------- the daily application loop (weekdays) ----------
// Same order every day, inside 09:00–12:00. Minimum viable day (travel, festival,
// a client call that overruns) = Block A alone; the streak survives on that.
function loop(d: number, learn: string, learnSteps: string[], learnNote?: string): Task[] {
  const dd = String(d).padStart(2, '0');
  return [
    {
      id: `d${dd}-a`, title: 'Block A — Shortlist → apply 5', mins: 50, tag: 'apply',
      steps: [
        'Open the ~9:04 scheduled-task message in Claude (and the FDE_shortlist file it sends).',
        'For each of the 5 marked roles: search Applications by company first — already in? Skip to the next on the list.',
        'Apply with the ONE standard CV + the application note from the record’s Send tab. 10 minutes per application, hard cap.',
        'Log each in Applications: status Applied, Segment = its bucket (P1/P2/P3), posting URL, source. The Day-3 follow-up stamps itself.',
        'At most 2 P3 long-shots count toward today’s 10 — never more.',
      ],
      note: '/notes/playbooks/application-playbook/',
    },
    {
      id: `d${dd}-b`, title: 'Block B — LinkedIn & boards → apply 5', mins: 60, tag: 'apply',
      steps: [
        'Run the saved searches in order (note has all five), newest-first, posted ≤14 days.',
        'Apply to 5 with the standard CV; log each like Block A.',
        'For each application, send ONE connect note to the recruiter or hiring manager (copy "Opener" from the record).',
        'Stop at 5. More browsing is procrastination with a clean conscience.',
      ],
      note: '/notes/playbooks/linkedin-sourcing/',
    },
    {
      id: `d${dd}-c`, title: 'Block C — Inbox & follow-ups', mins: 20, tag: 'pipeline',
      steps: [
        'Read every reply (email, LinkedIn, Naukri, WhatsApp). Answer the same day, from the scripts.',
        'Anyone warm: offer two concrete slots ("tomorrow 7–9pm IST or Thursday same window"), never "sometime".',
        'Applications → "Follow-ups due": send every Day-3 and Day-7 nudge it lists.',
        'Update each replier’s status (Replied / Interviewing).',
      ],
    },
    {
      id: `d${dd}-d`, title: `Block D — Learn: ${learn}`, mins: 45, tag: 'learn',
      steps: learnSteps,
      note: learnNote || '/notes/learning/learning-plan/',
    },
    {
      id: `d${dd}-e`, title: 'Block E — Log the four numbers & stop', mins: 5, tag: 'review',
      steps: [
        'Say today’s numbers out loud: applied / replies / interviews booked / offers.',
        'Tick the blocks here. 12:00 = Ops time. Hard stop — the jobs block never eats the Ops block.',
      ],
    },
  ];
}

export const PLAN: DayPlan[] = [
  {
    day: 1, theme: 'Loop + reposition everything public',
    tasks: [
      ...loop(1, 'read your own positioning', [
        'Read /notes/plan/positioning/ and /notes/plan/standard-cv/ end to end once.',
        'Reply to Claude in the chat with corrections to the CV draft (facts, numbers, anything missing).',
        'Claude ships the .docx + PDF the same day; until then yesterday’s CV is fine for applying.',
      ], '/notes/plan/standard-cv/'),
      {
        id: 'd01-x1', title: 'LinkedIn repositioned: headline, About, featured', mins: 40, tag: 'build',
        steps: [
          'Headline → the one in the positioning note (AI Architect / FDE — enterprise finance & SAP).',
          'About → paste the 5-line version from the note; add the dunning-engine line.',
          'Set "Open to work": Forward Deployed Engineer, AI Architect, Solutions Architect — Remote only.',
          'Featured: pin the vajrapu.com/cashflow page (it is your live proof until the demo repo exists).',
        ],
        note: '/notes/plan/positioning/',
      },
      {
        id: 'd01-x2', title: 'Create the 5 saved searches + alerts', mins: 20, tag: 'build',
        steps: [
          'LinkedIn: create the five searches from the sourcing note, daily alerts ON.',
          'Naukri + Instahyre: update headline to match LinkedIn; set two alerts (FDE, AI architect remote).',
          'Bookmark fastaijobs.com remote-FDE page, Remotive AI, aijobs.net India-remote on the phone.',
        ],
        note: '/notes/playbooks/linkedin-sourcing/',
      },
    ],
  },
  {
    day: 2, theme: 'Loop + Indian boards & recruiters',
    tasks: [
      ...loop(2, 'Udemy course — module 1', [
        'Start the 20-hour course you shortlisted. 45 minutes, phone in the other room.',
        'One page of notes per module into /notes/learning/ (edit on GitHub from the phone works).',
      ]),
      {
        id: 'd02-x1', title: 'Message 3 SAP-staffing recruiters', mins: 25, tag: 'pipeline',
        steps: [
          'Find 3 recruiters who place SAP/AI architects remote-India (search LinkedIn: "SAP recruiter" + remote).',
          'Send the recruiter opener from the sourcing note; attach nothing yet.',
          'Log each in Applications as its own record (Segment: Referral / recruiter).',
        ],
        note: '/notes/playbooks/linkedin-sourcing/',
      },
    ],
  },
  {
    day: 3, theme: 'Loop + the SAP AI stack',
    tasks: [
      ...loop(3, 'SAP Business AI in one sitting', [
        'learning.sap.com → the free "Generative AI at SAP" / Joule learning journeys — skim for the vocabulary, not completion.',
        'Know what these are and one sentence each: Joule, Joule Studio, Generative AI Hub, BTP AI Core, SAP Knowledge Graph.',
        'Write the 5 sentences into /notes/learning/ — they are interview currency for every P1 role.',
      ]),
    ],
  },
  {
    day: 4, theme: 'Loop + first public proof',
    tasks: [
      ...loop(4, 'Udemy course — module 2', [
        '45 minutes of the course. Notes to the vault.',
      ]),
      {
        id: 'd04-x1', title: 'Write the dunning-engine case story (public)', mins: 60, tag: 'build',
        steps: [
          'One page, sanitized: "I built an AR-collections agent on QuickBooks + n8n that chases invoices and stops on payment."',
          'Structure: the business problem → the system (sync, 4-level escalation, stop-on-payment, owner digest) → what it proves (production AI in a customer environment = FDE work).',
          'Post it on LinkedIn; put the text in /notes/learning/fde-stories/ as Story #2.',
        ],
        note: '/notes/learning/fde-stories/',
      },
    ],
  },
  {
    day: 5, theme: 'Saturday half-day · Week-1 numbers',
    tasks: [
      {
        id: 'd05-a', title: 'Half loop — shortlist → apply 5, follow-ups', mins: 60, tag: 'apply',
        steps: [
          'Block A as normal (5 applications from the shortlist).',
          'Clear every follow-up due; answer every reply.',
        ],
      },
      {
        id: 'd05-r', title: 'Week-1 review: the funnel so far', mins: 30, tag: 'review',
        steps: [
          'Export Applications CSV; count: applied / replies / interviews, by bucket (P1/P2/P3).',
          'Under 50 applied this week? The loop is leaking — find which block got skipped.',
          'Replies under 3%? Flag it for the Day-14 retro; do NOT change the CV mid-sprint.',
        ],
      },
      {
        id: 'd05-x1', title: 'Draft STAR stories #1–2', mins: 45, tag: 'learn',
        steps: [
          'Story #1: the 14-market SAC FP&A transformation (Wipro/Nomad) — situation, task, action, result with numbers.',
          'Story #2: the dunning engine (from yesterday’s case story, STAR-ified).',
          'Both into /notes/learning/fde-stories/.',
        ],
        note: '/notes/learning/fde-stories/',
      },
    ],
  },
  {
    day: 6, theme: 'Sunday · rest (the streak survives on the marker)',
    tasks: [
      { id: 'd06-1', title: 'Rest day — tick this and close the laptop', mins: 5, tag: 'review',
        steps: ['Rest is part of the plan, not a failure of it. If you must do something: read one fde-stories entry out loud.'] },
    ],
  },
  {
    day: 7, theme: 'Loop + referral hunt',
    tasks: [
      ...loop(7, 'Udemy course — module 3', [
        '45 minutes of the course. Notes to the vault.',
      ]),
      {
        id: 'd07-x1', title: 'List 10 warm contacts at target companies, ask 3', mins: 30, tag: 'pipeline',
        steps: [
          'Scan LinkedIn connections at: SAP, Databricks, consultancies (Wipro/TCS alumni count), AI startups.',
          'Ask 3 for a referral to a live posting you applied to this week — name the exact role, attach nothing.',
          'A referral turns a cold application into a warm one; this is the highest-ROI 30 minutes of the week.',
        ],
      },
    ],
  },
  {
    day: 8, theme: 'Loop + agents/RAG/evals drill',
    tasks: [
      ...loop(8, 'FDE technical talking points', [
        'Write crisp 4-sentence answers (you have built all of this): How do you ground an LLM in customer data (RAG)? How do you keep an agent safe in production (guardrails, human review)? How do you know it works (evals)?',
        'Anchor every answer in a thing you shipped: the dunning engine, the LMS, the reminder workflows.',
        'Into /notes/learning/fde-stories/ under "Technical".',
      ], '/notes/learning/fde-stories/'),
    ],
  },
  {
    day: 9, theme: 'Loop + the demo repo',
    tasks: [
      ...loop(9, 'Udemy course — module 4', [
        '45 minutes of the course. Notes to the vault.',
      ]),
      {
        id: 'd09-x1', title: 'Public demo repo: AR-collections agent (sanitized)', mins: 90, tag: 'build',
        steps: [
          'New public GitHub repo: README with the architecture (QBO → n8n → escalation engine → stop-on-payment), sanitized workflow JSON, the 4 email templates.',
          'Reuse the 3-minute cashflow demo video — link it in the README.',
          'Add the repo to LinkedIn Featured and to the CV’s "Selected work" line (one line, Claude updates the docx).',
        ],
      },
    ],
  },
  {
    day: 10, theme: 'Loop + mock interview',
    tasks: [
      ...loop(10, 'FDE case drill: scope a pilot', [
        'Prompt yourself: "A CFO wants AI in collections but trusts nothing. Scope a 2-week pilot." Answer out loud for 15 minutes: discovery questions → smallest useful slice → success metric → rollback plan.',
        'You did exactly this for real clients — say it in that order. Record on the phone; listen once.',
      ], '/notes/learning/fde-stories/'),
    ],
  },
  {
    day: 11, theme: 'Loop + week-1 Day-7 sweep',
    tasks: [
      ...loop(11, 'Udemy course — module 5', [
        '45 minutes of the course. Notes to the vault.',
      ]),
      {
        id: 'd11-x1', title: 'Recruiter round 2 + Day-7 sweep of week 1', mins: 25, tag: 'pipeline',
        steps: [
          '3 more SAP/AI recruiters messaged (fresh names).',
          'Every week-1 application with no reply gets its fu2 (the last nudge) today — then it rests.',
        ],
      },
    ],
  },
  {
    day: 12, theme: 'Saturday half-day · stories done',
    tasks: [
      {
        id: 'd12-a', title: 'Half loop — shortlist → apply 5, follow-ups', mins: 60, tag: 'apply',
        steps: ['Block A as normal; clear follow-ups; answer replies.'],
      },
      {
        id: 'd12-x1', title: 'STAR stories #3–5 finished', mins: 60, tag: 'learn',
        steps: [
          '#3: TCS — pharma budgeting/consolidation (global stakeholders, month-end pressure).',
          '#4: the RAMS sprint — a working outreach system with CRM in 2 weeks, solo.',
          '#5: QuantumRush — shipping an LMS/SaaS end to end as the only engineer.',
          'Read all five out loud once. That is interview prep most candidates never do.',
        ],
        note: '/notes/learning/fde-stories/',
      },
    ],
  },
  {
    day: 13, theme: 'Sunday · rest',
    tasks: [
      { id: 'd13-1', title: 'Rest day — tick this and close the laptop', mins: 5, tag: 'review',
        steps: ['Optional 15 minutes: clear any On-hold records whose retry date passed.'] },
    ],
  },
  {
    day: 14, theme: 'Loop + the Day-14 retro',
    tasks: [
      ...loop(14, 'retro prep', [
        'Export the Applications CSV before the retro task below.',
      ]),
      {
        id: 'd14-x1', title: 'Day-14 retro: numbers, one change, next 14 days', mins: 60, tag: 'review',
        steps: [
          'The funnel, by bucket: applied → replies → interviews → offers. Reply % per bucket.',
          'Diagnosis grid: replies <3% → positioning/CV wrong (fix ONE thing). Replies but no interviews → targeting wrong (shift bucket mix). Interviews but no offers → prep wrong (double the drills).',
          'Also judge the frame itself: did Ops/RAMS/bets fit their blocks? Re-cut /notes/plan/day-frame/ with what 15 Nov decided.',
          'Draft Day 15–28 into src/tasks.config.ts with Claude (new IDs, never reuse old ones). Commit; the site rebuilds; the loop continues.',
        ],
      },
    ],
  },
];

/** Date (YYYY-MM-DD) for a plan day, from the configured start date. */
export function dayDate(startDate: string, day: number): string {
  const d = new Date(startDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + (day - 1));
  return d.toISOString().slice(0, 10);
}

/** Pretty "Mon 9 Nov" for headers. */
export function dayLabel(startDate: string, day: number): string {
  const d = new Date(dayDate(startDate, day) + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
}
