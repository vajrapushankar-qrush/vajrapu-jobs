// Screenshots and other evidence attached to a prospect, stored in R2 under files/<prospect>/<uuid>.
// POST   /api/prospects/:id/files        multipart (field "file", optional "label") -> { file }
// GET    /api/prospects/:id/files        -> { files: [{ key, name, label, size, type, uploaded }] }
// GET    /api/prospects/:id/files?key=…  -> the bytes (inline), only for that prospect's keys
// DELETE /api/prospects/:id/files?key=…  -> superuser only
import { json, ensureSchema, getProspect } from './_lib.js';

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' };
const prefix = (id) => `files/${id}/`;

export async function onRequestGet({ params, request, env }) {
  if (!env.DB) return json({ error: 'No D1 binding named DB on this Worker.' }, 500);
  if (!env.FILES) return json({ error: 'No R2 bucket bound as FILES: create "ops-files" and keep the r2_buckets entry in wrangler.jsonc.', files: [], enabled: false }, 200);
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (key) {
    if (!key.startsWith(prefix(params.id))) return json({ error: 'Not found.' }, 404);
    const obj = await env.FILES.get(key);
    if (!obj) return json({ error: 'Not found.' }, 404);
    return new Response(obj.body, { headers: { 'content-type': obj.httpMetadata?.contentType || 'application/octet-stream', 'content-disposition': `inline; filename="${(obj.customMetadata?.name || 'file').replace(/["\r\n]/g, '')}"`, 'cache-control': 'private, max-age=3600' } });
  }
  const list = await env.FILES.list({ prefix: prefix(params.id) });
  const files = (list.objects || []).map((o) => ({ key: o.key, name: o.customMetadata?.name || o.key.split('/').pop(), label: o.customMetadata?.label || '', size: o.size, type: o.httpMetadata?.contentType || '', uploaded: o.uploaded }));
  files.sort((a, b) => String(b.uploaded).localeCompare(String(a.uploaded)));
  return json({ files, enabled: true });
}

export async function onRequestPost({ params, request, env, data }) {
  if (!env.DB) return json({ error: 'No D1 binding named DB on this Worker.' }, 500);
  if (!env.FILES) return json({ error: 'No R2 bucket bound as FILES.' }, 500);
  await ensureSchema(env.DB);
  const p = await getProspect(env.DB, params.id);
  if (!p) return json({ error: 'Not found.' }, 404);
  let form;
  try { form = await request.formData(); } catch { return json({ error: 'Send the file as multipart form data.' }, 400); }
  const file = form.get('file');
  if (!file || typeof file === 'string') return json({ error: 'No file.' }, 400);
  const ext = TYPES[file.type];
  if (!ext) return json({ error: 'Only JPEG, PNG, WebP or PDF.' }, 400);
  if (file.size > MAX_BYTES) return json({ error: 'Too big: keep files under 4 MB (the CRM shrinks screenshots before upload).' }, 400);
  const key = prefix(params.id) + crypto.randomUUID() + '.' + ext;
  const name = String(file.name || 'screenshot.' + ext).slice(0, 120);
  const label = String(form.get('label') || '').slice(0, 200);
  await env.FILES.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type }, customMetadata: { name, label, by: data.user.email, prospect: p.company.slice(0, 120) } });
  return json({ file: { key, name, label, size: file.size, type: file.type, uploaded: new Date().toISOString() } }, 201);
}

export async function onRequestDelete({ params, request, env, data }) {
  if (!env.FILES) return json({ error: 'No R2 bucket bound as FILES.' }, 500);
  if (data.user.role !== 'superuser') return json({ error: 'Only the superuser can delete a file.' }, 403);
  const key = new URL(request.url).searchParams.get('key') || '';
  if (!key.startsWith(prefix(params.id))) return json({ error: 'Not found.' }, 404);
  await env.FILES.delete(key);
  return json({ ok: true });
}

/** Called when a prospect is deleted: drop its files too. */
export async function deleteAllFor(env, id) {
  if (!env.FILES) return;
  const list = await env.FILES.list({ prefix: prefix(id) });
  for (const o of list.objects || []) await env.FILES.delete(o.key);
}
