// GET    /api/prospects/:id -> { prospect }
// PUT    /api/prospects/:id -> partial update { status, note, ... } -> { prospect }
// DELETE /api/prospects/:id -> superuser only
import { json, ensureSchema, normalise, getProspect, updateProspect, holdCheck } from './_lib.js';
import { deleteAllFor } from './files.js';

const NO_DB = () => json({ error: 'No D1 binding named DB on this Worker: create the database and add it to wrangler.jsonc (see README).' }, 500);

export async function onRequestGet({ params, env }) {
  if (!env.DB) return NO_DB();
  await ensureSchema(env.DB);
  const p = await getProspect(env.DB, params.id);
  return p ? json({ prospect: p }) : json({ error: 'Not found.' }, 404);
}

export async function onRequestPut({ params, request, env, data }) {
  if (!env.DB) return NO_DB();
  await ensureSchema(env.DB);
  const prev = await getProspect(env.DB, params.id);
  if (!prev) return json({ error: 'Not found.' }, 404);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body must be JSON.' }, 400);
  }
  const n = normalise(body || {}, { partial: true });
  if (!n.ok) return json({ error: n.errors.join('; ') }, 400);
  const holdErr = holdCheck(n.value, prev);
  if (holdErr) return json({ error: holdErr }, 400);
  const next = await updateProspect(env.DB, prev, n.value, data.user.email);
  return json({ prospect: next });
}

export async function onRequestDelete({ params, env, data }) {
  if (!env.DB) return NO_DB();
  await ensureSchema(env.DB);
  if (data.user.role !== 'superuser') return json({ error: 'Only the superuser can delete.' }, 403);
  const r = await env.DB.prepare('DELETE FROM prospects WHERE id = ?').bind(params.id).run();
  const changes = r?.meta?.changes ?? r?.changes ?? 0;
  if (changes) await deleteAllFor(env, params.id);
  return changes ? json({ deleted: params.id }) : json({ error: 'Not found.' }, 404);
}
