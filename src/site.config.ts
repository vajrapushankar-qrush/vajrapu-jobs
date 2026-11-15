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
  appsPerDay: 5,           // SPRINT RE-CUT 15 Nov: shortlist-only while the Ops cash blitz runs; back to 10 on 3 Dec if the retro says so
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
// The day frame: the one shared truth across ALL projects (master copy: vajrapu-hub
// src/sites.js). SPRINT RE-CUT 15 Nov → 2 Dec: the jobs sprint owns 09:00–10:00 only;
// the Ops cash blitz owns the rest of the morning; Zerollet testing owns 17:00–19:00.
export const FRAME = [
  { slot: '09:00–10:00', what: 'Jobs — Block A + C (sprint maintenance, 5 apps)', tag: 'jobs' },
  { slot: '10:00–14:30', what: 'Ops · Cash Flow Autopilot blitz (sell 10–12 · close/deliver 12:30–14:30)', tag: 'ops' },
  { slot: '14:30–16:30', what: 'RAMS loop (UK morning window)', tag: 'rams' },
  { slot: '17:00–19:00', what: 'Zerollet testing (bets rotation paused till 2 Dec)', tag: 'bets' },
  { slot: 'Evening', what: 'Booked calls only — recruiter or Ops prospect (19:30–22:30 IST); else off', tag: 'calls' },
];
