// /today.json — the plan, exported for the HQ hub (hub.vajrapu.com). Built at deploy time and
// served as a static asset behind this site's Access like every other page; the hub fetches it
// with a Zero Trust service token. Ticks stay live in D1 (the hub binds jobs-db directly), so
// this file only carries the task *definitions* — it goes stale only until the next push.
import { SITE, TARGETS } from '../site.config';
import { PLAN, dayDate } from '../tasks.config';

export async function GET() {
  const days = PLAN.map((d) => ({
    day: d.day,
    date: dayDate(SITE.startDate, d.day),
    theme: d.theme,
    tasks: d.tasks.map((t) => ({ id: t.id, title: t.title, mins: t.mins ?? null, tag: t.tag ?? null })),
  }));
  return new Response(
    JSON.stringify({ generated: new Date().toISOString(), site: SITE.title, startDate: SITE.startDate, targets: TARGETS, days }),
    { headers: { 'content-type': 'application/json; charset=utf-8' } },
  );
}
