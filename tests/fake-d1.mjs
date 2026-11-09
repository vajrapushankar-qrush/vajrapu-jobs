// A D1-shaped wrapper over node:sqlite, enough for the CRM functions.
import { DatabaseSync } from 'node:sqlite';

export function makeD1() {
  const db = new DatabaseSync(':memory:');
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    all: async () => ({ success: true, results: db.prepare(sql).all(...args) }),
    first: async () => db.prepare(sql).get(...args) ?? null,
    run: async () => { const r = db.prepare(sql).run(...args); return { success: true, meta: { changes: Number(r.changes) } }; },
  });
  return {
    prepare: (sql) => stmt(sql),
    batch: async (stmts) => Promise.all(stmts.map((s) => s.run())),
    exec: async (sql) => db.exec(sql),
  };
}

/** Run a request through the Worker's fetch (router + Access middleware + handler). */
export const worker = (await import(new URL('../src/worker.js', import.meta.url).href)).default;
export async function invoke(_mods, { method = 'GET', path, body, headers = {}, env }) {
  const request = new Request('https://rams.example' + path, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
  const fullEnv = { ASSETS: { fetch: async () => new Response('asset') }, ...env };
  const res = await worker.fetch(request, fullEnv, { waitUntil() {} });
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text, headers: res.headers };
}

/** An R2-shaped bucket in memory: put/get/list/delete with the metadata the files endpoint reads. */
export function makeR2() {
  const store = new Map();
  return {
    async put(key, body, opts = {}) { const buf = body instanceof ArrayBuffer ? body : new TextEncoder().encode(String(body)).buffer; store.set(key, { buf, httpMetadata: opts.httpMetadata || {}, customMetadata: opts.customMetadata || {}, uploaded: new Date() }); },
    async get(key) { const o = store.get(key); return o ? { body: new Blob([o.buf]).stream(), httpMetadata: o.httpMetadata, customMetadata: o.customMetadata, size: o.buf.byteLength } : null; },
    async delete(key) { store.delete(key); },
    async list({ prefix = '' } = {}) { return { objects: [...store.entries()].filter(([k]) => k.startsWith(prefix)).map(([key, o]) => ({ key, size: o.buf.byteLength, uploaded: o.uploaded, httpMetadata: o.httpMetadata, customMetadata: o.customMetadata })) }; },
    _store: store,
  };
}
