// The 14-day job sprint, day by day. This file is the single source of truth for tasks;
// check-off state lives in D1 (via /api/ticks) so your phone and laptop stay in sync.
//
// RESTARTED 12 Nov 2026: week 1 slipped to the Remotion detour, so the sprint re-counts from
// Day 1 = Fri 13 Nov, with 12 Nov as Day 0 (applications only). Per the checkout convention the
// slipped days keep their history: the old d01–d14 IDs are retired (their ticks stay in D1,
// orphaned harmlessly) and this plan uses fresh r-prefixed IDs so nothing shows falsely done.
//
// Rules this file follows:
// - Every task either lists its steps in full, or links a note that does.
// - IDs are stable ("r07-c"): renaming a task keeps its tick; deleting one orphans its tick
//   harmlessly. Don't reuse an old ID for a new task.
// - Day numbers count from SITE.startDate in site.config.ts (Day 1 = that date; day 0 = the day before).
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
      id: `r${dd}-a`, title: 'Block A — Shortlist → apply 5', mins: 50, tag: 'apply',
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
      id: `r${dd}-b`, title: 'Block B — LinkedIn & boards → apply 5', mins: 60, tag: 'apply',
      steps: [
        'Run the saved searches in order (note has all five), newest-first, posted ≤14 days.',
        'Apply to 5 with the standard CV; log each like Block A.',
        'For each application, send ONE connect note to the recruiter or hiring manager (copy "Opener" from the record).',
        'Stop at 5. More browsing is procrastination with a clean conscience.',
      ],
      note: '/notes/playbooks/linkedin-sourcing/',
    },
    {
      id: `r${dd}-c`, title: 'Block C — Inbox & follow-ups', mins: 20, tag: 'pipeline',
      steps: [
        'Read every reply (email, LinkedIn, Naukri, WhatsApp). Answer the same day, from the scripts.',
        'Anyone warm: offer two concrete slots ("tomorrow 7–9pm IST or the day after, same window"), never "sometime".',
        'Applications → "Follow-ups due": send every Day-3 and Day-7 nudge it lists.',
        'Update each replier’s status (Replied / Interviewing).',
      ],
    },
    {
      id: `r${dd}-d`, title: `Block D — Learn: ${learn}`, mins: 45, tag: 'learn',
      steps: learnSteps,
      note: learnNote || '/notes/learning/learning-plan/',
    },
    {
      id: `r${dd}-e`, title: 'Block E — Log the four numbers & stop', mins: 5, tag: 'review',
      steps: [
        'Say today’s numbers out loud: applied / replies / interviews booked / offers.',
        'Tick the blocks here. 12:00 = Ops time. Hard stop — the jobs block never eats the Ops block.',
      ],
    },
  ];
}

export const PLAN: DayPlan[] = [
  {
    day: 0, theme: 'Day 0 · Restart — applications only',
    tasks: [
      {
        id: 'r00-a', title: 'Apply to 5 LinkedIn jobs — nothing else today', mins: 75, tag: 'apply',
        steps: [
          'LinkedIn jobs, newest first: "forward deployed engineer" remote, then "AI architect SAP remote India".',
          'Standard CV (GirijaShankar_Vajrapu_CV.pdf) + the 4-sentence note from each record’s Send tab.',
          'Log all 5 in Applications (status Applied). That restarts the streak honestly.',
          'The Remotion week is logged, not judged — the video becomes Day-11 portfolio material. Close the tab; Day 1 starts tomorrow 09:00.',
        ],
        note: '/notes/playbooks/application-playbook/',
      },
    ],
  },
  {
    day: 1, theme: 'Loop + reposition everything public',
    tasks: [
      ...loop(1, 'read your own positioning', [
        'Read /notes/plan/positioning/ and /notes/plan/standard-cv/ end to end once.',
        'Reply to Claude in the chat with corrections to the CV (numbers, naming the products or not).',
        'The v2 PDF regenerates the same day; the LinkedIn URL is already in.',
      ], '/notes/plan/standard-cv/'),
      {
        id: 'r01-x1', title: 'LinkedIn repositioned: headline, About, featured', mins: 40, tag: 'build',
        steps: [
          'Headline → the one in the positioning note (AI Architect / FDE — enterprise finance & SAP).',
          'About → paste the 5-line version from the note; add the dunning-engine line.',
          'Set "Open to work": Forward Deployed Engineer, AI Architect, Solutions Architect — Remote only.',
          'Featured: pin the vajrapu.com/cashflow page (your live proof until the demo repo exists).',
        ],
        note: '/notes/plan/positioning/',
      },
      {
        id: 'r01-x2', title: 'Create the 5 saved searches + alerts', mins: 20, tag: 'build',
        steps: [
          'LinkedIn: create the five searches from the sourcing note, daily alerts ON.',
          'Bookmark fastaijobs.com remote-FDE page, Remotive AI, aijobs.net India-remote on the phone.',
        ],
        note: '/notes/playbooks/linkedin-sourcing/',
      },
    ],
  },
  {
    day: 2, theme: 'Saturday half · Indian boards & recruiters',
    tasks: [
      {
        id: 'r02-a', title: 'Half loop — shortlist → apply 5, follow-ups', mins: 60, tag: 'apply',
        steps: [
          'Block A as normal (5 applications from the shortlist).',
          'Clear every follow-up due; answer every reply.',
        ],
      },
      {
        id: 'r02-x1', title: 'Naukri + Instahyre repositioned, alerts on', mins: 20, tag: 'build',
        steps: [
          'Headline on both → match LinkedIn (AI Architect / FDE — enterprise finance & SAP).',
          'Two alerts each: "forward deployed engineer" and "AI architect remote".',
        ],
      },
      {
        id: 'r02-x2', title: 'Message 3 SAP-staffing recruiters', mins: 25, tag: 'pipeline',
        steps: [
          'Find 3 recruiters who place SAP/AI architects remote-India (LinkedIn: "SAP recruiter" + remote).',
          'Send the recruiter opener from the sourcing note; attach nothing yet.',
          'Log each in Applications as its own record (Segment: Recruiter / referral).',
        ],
        note: '/notes/playbooks/linkedin-sourcing/',
      },
    ],
  },
  {
    day: 3, theme: 'Sunday · rest (the streak survives on the marker)',
    tasks: [
      { id: 'r03-1', title: 'Rest day — tick this and close the laptop', mins: 5, tag: 'review',
        steps: ['Rest is part of the plan, not a failure of it.'] },
    ],
  },
  {
    day: 4, theme: 'Loop · full week begins',
    tasks: [
      ...loop(4, 'Udemy course — module 1', [
        'Start the 20-hour course. 45 minutes, phone in the other room.',
        'One page of notes per module into /notes/learning/ (edit on GitHub from the phone works).',
      ]),
    ],
  },
  {
    day: 5, theme: 'Loop + the SAP AI stack',
    tasks: [
      ...loop(5, 'SAP Business AI in one sitting', [
        'learning.sap.com → the free "Generative AI at SAP" / Joule journeys — skim for vocabulary, not completion.',
        'One sentence each: Joule, Joule Studio, Generative AI Hub, BTP AI Core, SAP Knowledge Graph.',
        'Write the 5 sentences into /notes/learning/ — interview currency for every P1 role.',
      ]),
    ],
  },
  {
    day: 6, theme: 'Loop + first public proof',
    tasks: [
      ...loop(6, 'draft the case story', [
        'One page, sanitized: "I built an AR-collections agent on QuickBooks + n8n that chases invoices and stops on payment."',
        'Structure: business problem → the system (sync, 4-level escalation, stop-on-payment, digest) → what it proves (production AI in a customer environment = FDE work).',
      ], '/notes/learning/fde-stories/'),
      {
        id: 'r06-x1', title: 'Post the dunning-engine case story on LinkedIn', mins: 30, tag: 'build',
        steps: [
          'Post the page from Block D; save the text into /notes/learning/fde-stories/ as Story #2.',
          'If the Remotion cut of the demo is ready, attach it — a video post outperforms text.',
        ],
      },
    ],
  },
  {
    day: 7, theme: 'Loop + referral hunt',
    tasks: [
      ...loop(7, 'Udemy course — module 2', ['45 minutes of the course. Notes to the vault.']),
      {
        id: 'r07-x1', title: 'List 10 warm contacts at target companies, ask 3', mins: 30, tag: 'pipeline',
        steps: [
          'Scan LinkedIn connections at: SAP, Databricks, consultancies (Wipro/TCS alumni count), AI startups.',
          'Ask 3 for a referral to a live posting you applied to this week — name the exact role.',
          'A referral turns a cold application warm; the highest-ROI 30 minutes of the week.',
        ],
      },
    ],
  },
  {
    day: 8, theme: 'Loop + agents/RAG/evals drill',
    tasks: [
      ...loop(8, 'FDE technical talking points', [
        'Write crisp 4-sentence answers (you have built all of this): grounding an LLM in customer data (RAG)? keeping an agent safe in production (guardrails, human review)? knowing it works (evals)?',
        'Anchor every answer in a thing you shipped: the dunning engine, the LMS, the reminder workflows.',
        'Into /notes/learning/fde-stories/ under "Technical".',
      ], '/notes/learning/fde-stories/'),
    ],
  },
  {
    day: 9, theme: 'Saturday half · week-1 numbers + stories',
    tasks: [
      {
        id: 'r09-a', title: 'Half loop — shortlist → apply 5, follow-ups', mins: 60, tag: 'apply',
        steps: ['Block A as normal; clear follow-ups; answer replies.'],
      },
      {
        id: 'r09-r', title: 'Week-1 review: the funnel so far', mins: 30, tag: 'review',
        steps: [
          'Export Applications CSV; count: applied / replies / interviews, by bucket (P1/P2/P3).',
          'Under 50 applied since Day 0? The loop is leaking — find which block got skipped.',
          'Replies under 3%? Flag it for the Day-14 retro; do NOT change the CV mid-sprint.',
        ],
      },
      {
        id: 'r09-x1', title: 'Draft STAR stories #1–2', mins: 45, tag: 'learn',
        steps: [
          'Story #1: the 14-market SAC FP&A transformation — situation, task, action, result with numbers.',
          'Story #2: the dunning engine (from Day 6, STAR-ified).',
          'Both into /notes/learning/fde-stories/.',
        ],
        note: '/notes/learning/fde-stories/',
      },
    ],
  },
  {
    day: 10, theme: 'Sunday · rest',
    tasks: [
      { id: 'r10-1', title: 'Rest day — tick this and close the laptop', mins: 5, tag: 'review',
        steps: ['Optional 15 minutes: clear any On-hold records whose retry date passed.'] },
    ],
  },
  {
    day: 11, theme: 'Loop + the demo repo (your Remotion week pays off)',
    tasks: [
      ...loop(11, 'Udemy course — module 3', ['45 minutes of the course. Notes to the vault.']),
      {
        id: 'r11-x1', title: 'Public demo repo: AR-collections agent (sanitized)', mins: 90, tag: 'build',
        steps: [
          'New public GitHub repo: README with the architecture (QBO → n8n → escalation engine → stop-on-payment), sanitized workflow JSON, the 4 email templates.',
          'Embed the Remotion-produced demo video in the README — this is where last week’s detour becomes an asset.',
          'Add the repo to LinkedIn Featured and tell Claude to add the "Selected work" line to the CV.',
        ],
      },
    ],
  },
  {
    day: 12, theme: 'Loop + mock interview',
    tasks: [
      ...loop(12, 'FDE case drill: scope a pilot', [
        'Prompt yourself: "A CFO wants AI in collections but trusts nothing. Scope a 2-week pilot." Answer out loud 15 minutes: discovery questions → smallest useful slice → success metric → rollback plan.',
        'You did exactly this for real clients — say it in that order. Record on the phone; listen once.',
      ], '/notes/learning/fde-stories/'),
    ],
  },
  {
    day: 13, theme: 'Loop + recruiter round 2 + Day-7 sweep',
    tasks: [
      ...loop(13, 'read the stories aloud', [
        'Read STAR #1–2 and the Technical answers out loud once. Note where you stumble; fix the wording, not yourself.',
      ], '/notes/learning/fde-stories/'),
      {
        id: 'r13-x1', title: 'Recruiter round 2 + Day-7 sweep of week 1', mins: 25, tag: 'pipeline',
        steps: [
          '3 more SAP/AI recruiters messaged (fresh names).',
          'Every week-1 application with no reply gets its fu2 (the last nudge) today — then it rests.',
        ],
      },
    ],
  },
  {
    day: 14, theme: 'Loop + STAR stories done + the Day-14 retro',
    tasks: [
      ...loop(14, 'STAR stories #3–5', [
        '#3: TCS — pharma budgeting/consolidation war story. #4: the RAMS 2-week sprint. #5: shipping the LMS/SaaS solo.',
        'Read all five out loud once. That is interview prep most candidates never do.',
      ], '/notes/learning/fde-stories/'),
      {
        id: 'r14-x1', title: 'Day-14 retro: numbers, one change, next 14 days', mins: 60, tag: 'review',
        steps: [
          'Export the CSV. The funnel, by bucket: applied → replies → interviews → offers. Reply % per bucket.',
          'Diagnosis grid: replies <3% → positioning/CV wrong (fix ONE thing). Replies but no interviews → bucket mix wrong. Interviews but no offers → prep wrong, double the drills.',
          'Judge the frame too: did Ops/RAMS/bets fit their blocks after 15 Nov? Re-cut /notes/plan/day-frame/.',
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
