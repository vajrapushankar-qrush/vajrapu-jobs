// GET  /api/prospects              -> { prospects: [...] }
// GET  /api/prospects?format=csv   -> CSV download
// POST /api/prospects              -> create one  { company, town, ... }
// POST /api/prospects?action=import -> { rows: [...] } bulk insert, skipping duplicates (superuser only)
import { json, ensureSchema, normalise, insertProspect, listProspects, findByCompany, toCsv, fromSheetRow, holdCheck } from './_lib.js';

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ error: 'No D1 binding named DB on this Worker: create the database and add it to wrangler.jsonc (see README).' }, 500);
  await ensureSchema(env.DB);
  const url = new URL(request.url);
  const prospects = await listProspects(env.DB);
  if (url.searchParams.get('format') === 'csv') {
    return new Response(toCsv(prospects), {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="prospects-${new Date().toISOString().slice(0, 10)}.csv"`,
        'cache-control': 'no-store',
      },
    });
  }
  return json({ prospects });
}

export async function onRequestPost({ request, env, data }) {
  if (!env.DB) return json({ error: 'No D1 binding named DB on this Worker: create the database and add it to wrangler.jsonc (see README).' }, 500);
  await ensureSchema(env.DB);
  const url = new URL(request.url);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body must be JSON.' }, 400);
  }

  if (url.searchParams.get('action') === 'import') {
    if (data.user.role !== 'superuser') return json({ error: 'Only the superuser can import.' }, 403);
    const rows = Array.isArray(body?.rows) ? body.rows : [];
    if (!rows.length) return json({ error: 'rows is empty.' }, 400);
    if (rows.length > 500) return json({ error: 'Import at most 500 rows at a time.' }, 400);
    let added = 0, skipped = 0, invalid = 0;
    const errors = [];
    for (const raw of rows) {
      const mapped = fromSheetRow(raw);
      const n = normalise(mapped);
      if (!n.ok) { invalid++; if (errors.length < 10) errors.push(`${mapped.company || '(no company)'}: ${n.errors.join('; ')}`); continue; }
      if (await findByCompany(env.DB, n.value.company, n.value.town)) { skipped++; continue; }
      await insertProspect(env.DB, n.value, data.user.email);
      added++;
    }
    return json({ added, skipped, invalid, errors });
  }

  const n = normalise(body || {});
  if (!n.ok) return json({ error: n.errors.join('; ') }, 400);
  const holdErr = holdCheck(n.value, null);
  if (holdErr) return json({ error: holdErr }, 400);
  const existing = await findByCompany(env.DB, n.value.company, n.value.town);
  if (existing && !body.allowDuplicate) return json({ error: `"${existing.company}" in ${existing.town || 'that town'} is already in the CRM.`, duplicateOf: existing.id }, 409);
  const p = await insertProspect(env.DB, n.value, data.user.email);
  return json({ prospect: p }, 201);
}
