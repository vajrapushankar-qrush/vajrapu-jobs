// The only file you should need to edit to personalise the site.

export const SITE = {
  title: 'Vajrapu Jobs',
  description: 'The remote-job sprint, run from one place: the daily loop, learning, applications.',

  // Day 1 of the 14-day sprint. Format YYYY-MM-DD. Everything on the Today and
  // Tasks pages counts from this date; change it and the whole plan shifts.
  // Restarted 12 Nov (the Remotion week): 12 Nov = Day 0 (5 applications only), 13 Nov = Day 1.
  startDate: '2026-11-13',

  // Your GitHub repo URL. When set, every note gets an "Edit this page on GitHub"
  // link (works on the phone too). Leave '' to hide.
  repoUrl: 'https://github.com/vajrapushankar-qrush/vajrapu-jobs',
  branch: 'main',

  // How long the current plan runs (shown as "Day x of N").
  planDays: 14,
};

// The sprint's commitments, shown as KPIs on the Today page and read by Claude
// sessions before any strategy talk (see CLAUDE.md). Dates YYYY-MM-DD.
export const TARGETS = {
  appsPerDay: 10,          // 5 from the scheduled shortlist + 5 sourced on LinkedIn/boards
  p3DailyCap: 2,           // location-restricted long shots never crowd out real ones
  firstInterviewBy: '2026-11-27', // two weeks from the restarted Day 1
  offerBy: '2027-01-16',   // a signed remote offer ends the sprint
};

// Week focus, shown on the Today page. Week 1 = the week containing startDate (Fri 13 Nov).
export const ROTATION = [
  { week: 1, focus: 'Volume + reposition', detail: '10 applications/day on the one standard CV; LinkedIn/Naukri repositioned to AI Architect / FDE' },
  { week: 2, focus: 'Proof + interviews', detail: 'Public case story + demo repo (with the Remotion video) live; referral asks; first interviews' },
  { week: 3, focus: 'Convert', detail: 'Interview loops; Day-14 retro decides what changes (one variable only)' },
];

// ---------------------------------------------------------------------------
// The day frame: the one shared truth across ALL projects. Each project plans
// only inside its own block — the jobs sprint owns 09:00–12:00 and nothing else.
// Change it here and on paper nowhere else; the strip on Today renders this.
export const FRAME = [
  { slot: '09:00–12:00', what: 'Jobs — this loop (Blocks A→E)', tag: 'jobs' },
  { slot: '12:30–14:30', what: 'Ops · Cash Flow Autopilot (client by 15 Nov)', tag: 'ops' },
  { slot: '14:30–16:30', what: 'RAMS loop (UK morning window)', tag: 'rams' },
  { slot: '17:00–18:00', what: 'Rotating bet — Mon ShubhSankalpa · Wed Zerollet · Fri TringRX', tag: 'bets' },
  { slot: 'Evening', what: 'Booked US/EU recruiter calls only (19:30–22:30 IST); else off', tag: 'calls' },
];
