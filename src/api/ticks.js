// Task check-offs, shared across devices (the tasks themselves live in src/tasks.config.ts).
//
// GET  /api/ticks            -> { ticks: { "d01-1": { at: "2026-11-03T05:40:00.000Z", by: "you@…" }, … } }
// POST /api/ticks            -> { id: "d01-1", done: true|false } -> { id, done }
//
// A row's presence means done; unticking deletes the row. IDs are free-form strings (the
// task ids from tasks.config.ts), capped at 80 chars so a bug can't fill the table with junk.
import { json } from './_lib.js';

const NO_DB = () => json({ error: 'No D1 binding named DB on this Worker: create the database and add it to wrangler.jsonc (see README).' }, 500);

let ready = false;
async function ensure(db) {
  if (ready) return;
  await db.prepare("CREATE TABLE IF NOT EXISTS ticks (id TEXT PRIMARY KEY, done_at TEXT NOT NULL, done_by TEXT NOT NULL DEFAULT '')").run();
  ready = true;
}

export async function onRequestGet({ env }) {
  if (!env.DB) return NO_DB();
  await ensure(env.DB);
  const { results } = await env.DB.prepare('SELECT id, done_at, done_by FROM ticks').all();
  const ticks = {};
  for (const r of results || []) ticks[r.id] = { at: r.done_at, by: r.done_by };
  return json({ ticks });
}

export async function onRequestPost({ request, env, data }) {
  if (!env.DB) return NO_DB();
  await ensure(env.DB);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body must be JSON.' }, 400);
  }
  const id = String(body?.id ?? '').trim();
  if (!id || id.length > 80) return json({ error: 'id is required (at most 80 characters).' }, 400);
  const done = body?.done !== false; // default: tick it
  if (done) {
    await env.DB.prepare('INSERT INTO ticks (id, done_at, done_by) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET done_at = excluded.done_at, done_by = excluded.done_by')
      .bind(id, new Date().toISOString(), data.user.email).run();
  } else {
    await env.DB.prepare('DELETE FROM ticks WHERE id = ?').bind(id).run();
  }
  return json({ id, done });
}
