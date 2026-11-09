// Shared helpers for the CRM API (the Worker in src/worker.js + D1).

// hold = tried, could not reach them this way (reason in hold_reason); not given up, unlike lost.
// lost = said no or went quiet; dnd = asked us to stop (never contact again on any channel).
export const STATUSES = ['new', 'sent', 'replied', 'intake', 'client', 'hold', 'lost', 'dnd'];
// How the contact came across: '' unknown, warm, neutral, cold, hostile (the bomb).
export const MOODS = ['', 'warm', 'neutral', 'cold', 'hostile'];
export const CHANNELS = ['form', 'email', 'phone', 'whatsapp', 'referral'];
// Segments an application can belong to (shown as "Segment" on the page; the column is still called
// `trade` so the API, CSV import/export and tests stay unchanged). A record can carry any number,
// comma-separated, in this spelling; anything not on the list is kept as typed.
// P1/P2/P3 mirror the scheduled shortlist's buckets; the rest are role families.
export const TRADES = [
  'P1 FDE + SAP/finance', 'P2 FDE India-remote', 'P3 restricted long shot',
  'AI Architect', 'SAP ecosystem AI', 'Solutions/engagement architect',
  'Recruiter / referral',
];
export const MAX_TRADES = 15;
// What their website is like, logged while prospecting. Anything but '' and 'ok' is a web-design lead
// for later (see the plan, section 11); it changes nothing in the RAMS loop.
export const WEBSITE_STATUSES = ['', 'ok', 'dated', 'expired', 'broken', 'redirect', 'none'];
export const WEB_LEAD_STATUSES = ['dated', 'expired', 'broken', 'redirect', 'none'];
const TRADE_BY_KEY = new Map(TRADES.map((t) => [t.toLowerCase(), t]));

/** "roofing, Building; roofing" -> ["Roofing", "Building"]. Accepts an array or a comma/semicolon list. */
export function parseTrades(raw) {
  const parts = Array.isArray(raw) ? raw : String(raw ?? '').split(/[,;\n]/);
  const out = [];
  const seen = new Set();
  for (let t of parts) {
    t = String(t ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(TRADE_BY_KEY.get(key) || t.charAt(0).toUpperCase() + t.slice(1));
    if (out.length >= MAX_TRADES) break;
  }
  return out;
}

// Single-line statements: D1's exec() splits on newlines, and batch() wants one statement each.
const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS prospects (id TEXT PRIMARY KEY, company TEXT NOT NULL, town TEXT NOT NULL DEFAULT '', region TEXT NOT NULL DEFAULT '', trade TEXT NOT NULL DEFAULT '', ltd INTEGER NOT NULL DEFAULT 0, first_name TEXT NOT NULL DEFAULT '', website TEXT NOT NULL DEFAULT '', contact_form_url TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', channel TEXT NOT NULL DEFAULT 'form', status TEXT NOT NULL DEFAULT 'new', note TEXT NOT NULL DEFAULT '', sent_at TEXT NOT NULL DEFAULT '', followup_due TEXT NOT NULL DEFAULT '', last_contact TEXT NOT NULL DEFAULT '', value_gbp REAL NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, created_by TEXT NOT NULL DEFAULT '', updated_by TEXT NOT NULL DEFAULT '')",
  'CREATE INDEX IF NOT EXISTS prospects_status ON prospects(status)',
  'CREATE INDEX IF NOT EXISTS prospects_company ON prospects(company)',
];
// Columns added after the first release; ensureSchema adds any that an existing table lacks.
const ADDED_COLUMNS = [
  // Extra offices/depots as JSON: [{ name, phone, mobile, address }]. The main one stays in town/phone/mobile/address.
  ['locations', "TEXT NOT NULL DEFAULT '[]'"],
  // One of WEBSITE_STATUSES.
  ['website_status', "TEXT NOT NULL DEFAULT ''"],
  // The WhatsApp number they publish (often the mobile on their site); blank = none known.
  ['whatsapp', "TEXT NOT NULL DEFAULT ''"],
  // Why the prospect is on hold (form rejects a non-UK phone, site down, ...); required for status=hold.
  ['hold_reason', "TEXT NOT NULL DEFAULT ''"],
  // The mobile they publish beside the landline (the main location's; extra locations carry their own).
  ['mobile', "TEXT NOT NULL DEFAULT ''"],
  // One of MOODS.
  ['mood', "TEXT NOT NULL DEFAULT ''"],
  // The contact's title (Mr, Mrs, Ms, Miss, Dr) and surname; first_name was there from the start.
  ['title', "TEXT NOT NULL DEFAULT ''"],
  ['last_name', "TEXT NOT NULL DEFAULT ''"],
  // Where each contact detail came from, as JSON: [{ kind, url, gave, found_on, note }]. Evidence that the data was public.
  ['sources', "TEXT NOT NULL DEFAULT '[]'"],
  // Social and directory links as JSON: { facebook, instagram, linkedin, linkedin_person, x, youtube, tiktok, google, checkatrade, companies_house }.
  ['links', "TEXT NOT NULL DEFAULT '{}'"],
  // The register entry as JSON: { legal_name, status, incorporated, registered_office, sic, directors: [{ name, role, appointed, note }] }. The number itself is links.companies_house.
  ['legal', "TEXT NOT NULL DEFAULT '{}'"],
  // Any restriction the prospect states on their site ("no marketing enquiries"), quoted; shown as a warning before sending.
  ['notice', "TEXT NOT NULL DEFAULT ''"],
];
export const MAX_LOCATIONS = 20;

export const FIELDS = [
  'company', 'town', 'region', 'trade', 'ltd', 'title', 'first_name', 'last_name', 'website', 'website_status', 'contact_form_url', 'email', 'phone', 'mobile', 'whatsapp',
  'address', 'locations', 'sources', 'links', 'legal', 'notice', 'channel', 'status', 'hold_reason', 'mood', 'note', 'sent_at', 'followup_due', 'last_contact', 'value_gbp',
];
export const COLUMNS = ['id', ...FIELDS, 'created_at', 'updated_at', 'created_by', 'updated_by'];

let schemaReady = false;
export async function ensureSchema(db) {
  if (schemaReady) return;
  await db.batch(SCHEMA.map((s) => db.prepare(s)));
  const { results } = await db.prepare('PRAGMA table_info(prospects)').all();
  const have = new Set((results || []).map((c) => c.name));
  for (const [name, type] of ADDED_COLUMNS) {
    if (!have.has(name)) await db.prepare(`ALTER TABLE prospects ADD COLUMN ${name} ${type}`).run();
  }
  schemaReady = true;
}

/** "Cheshire | 01244 456145 | 07700 900123 | 1 High St; Warrington | 01925 393164" or a JSON array -> [{name, phone, mobile, address}].
 * Three cells is the old form (name | phone | address); a third cell that looks like a UK mobile is read as the mobile. */
export function parseLocations(raw) {
  if (Array.isArray(raw)) return raw;
  const text = String(raw ?? '').trim();
  if (!text) return [];
  if (text.startsWith('[')) {
    try { const j = JSON.parse(text); return Array.isArray(j) ? j : []; } catch { return []; }
  }
  return text.split(';').map((part) => {
    const [name = '', phone = '', ...rest] = part.split('|').map((x) => x.trim());
    if (rest.length >= 2) return { name, phone, mobile: rest[0], address: rest.slice(1).join(' | ') };
    const third = rest[0] || '';
    return /^(\+?44\s*7|07)[\d\s]{8,12}$/.test(third) ? { name, phone, mobile: third, address: '' } : { name, phone, mobile: '', address: third };
  });
}
export function cleanLocations(raw) {
  const out = [];
  for (const l of parseLocations(raw).slice(0, MAX_LOCATIONS)) {
    if (!l || typeof l !== 'object') continue;
    const loc = {
      name: String(l.name ?? l.town ?? '').trim().slice(0, 120),
      phone: String(l.phone ?? '').trim().slice(0, 60),
      mobile: String(l.mobile ?? '').trim().slice(0, 60),
      address: String(l.address ?? '').trim().slice(0, 300),
    };
    if (loc.name || loc.phone || loc.mobile || loc.address) out.push(loc);
  }
  return out;
}
export const LINK_KEYS = ['facebook', 'instagram', 'linkedin', 'linkedin_person', 'x', 'youtube', 'tiktok', 'google', 'checkatrade', 'companies_house'];
/** "facebook=https://…; linkedin=https://…" or a JSON object -> { facebook, … } with only known keys and non-empty values. */
export function parseLinks(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
  const text = String(raw ?? '').trim();
  if (!text) return {};
  if (text.startsWith('{')) { try { const j = JSON.parse(text); return j && typeof j === 'object' ? j : {}; } catch { return {}; } }
  const out = {};
  for (const part of text.split(';')) { const i = part.indexOf('='); if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim(); }
  return out;
}
export function cleanLinks(raw) {
  const src = parseLinks(raw), out = {};
  for (const k of LINK_KEYS) { const v = String(src[k] ?? '').trim().slice(0, 300); if (v) out[k] = v; }
  return out;
}
export function linksToText(links) { return LINK_KEYS.filter((k) => links && links[k]).map((k) => k + '=' + links[k]).join('; '); }

export const LEGAL_STATUSES = ['', 'active', 'dormant', 'liquidation', 'dissolved', 'other'];
/** JSON object, or the CSV text "legal_name=…; status=…; directors=Name/Director/2022-02-10, Name/Secretary" -> clean object. */
export function parseLegal(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
  const text = String(raw ?? '').trim();
  if (!text) return {};
  if (text.startsWith('{')) { try { const j = JSON.parse(text); return j && typeof j === 'object' ? j : {}; } catch { return {}; } }
  const out = {};
  for (const part of text.split(';')) { const i = part.indexOf('='); if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim(); }
  if (typeof out.directors === 'string') out.directors = out.directors.split(',').map((d) => { const [name = '', role = '', appointed = '', ...rest] = d.split('/').map((x) => x.trim()); return { name, role, appointed, note: rest.join('/') }; });
  return out;
}
export function cleanLegal(raw) {
  const l = parseLegal(raw), out = {};
  const str = (k, n) => { const v = String(l[k] ?? '').trim().slice(0, n); if (v) out[k] = v; };
  str('legal_name', 160); str('registered_office', 300); str('sic', 60);
  const st = String(l.status ?? '').trim().toLowerCase(); if (st) out.status = LEGAL_STATUSES.includes(st) ? st : 'other';
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(l.incorporated ?? ''))) out.incorporated = String(l.incorporated);
  const ds = Array.isArray(l.directors) ? l.directors : [];
  const directors = [];
  for (const d of ds.slice(0, 12)) {
    if (!d || typeof d !== 'object') continue;
    const row = { name: String(d.name ?? '').trim().slice(0, 120), role: String(d.role ?? '').trim().slice(0, 60), appointed: /^\d{4}-\d{2}-\d{2}$/.test(String(d.appointed ?? '')) ? String(d.appointed) : '', note: String(d.note ?? '').trim().slice(0, 200) };
    if (row.name || row.note) directors.push(row);
  }
  if (directors.length) out.directors = directors;
  return out;
}
export function legalToText(l) {
  if (!l) return '';
  const parts = ['legal_name', 'status', 'incorporated', 'registered_office', 'sic'].filter((k) => l[k]).map((k) => k + '=' + l[k]);
  if (Array.isArray(l.directors) && l.directors.length) parts.push('directors=' + l.directors.map((d) => [d.name, d.role, d.appointed, d.note].map((x) => String(x || '').replace(/[\/,;]/g, ' ')).join('/').replace(/\/+$/, '')).join(', '));
  return parts.join('; ');
}

export const SOURCE_KINDS = ['website', 'google', 'maps', 'linkedin', 'apollo', 'companies_house', 'directory', 'referral', 'other'];
/** "google | https://… | email | 2026-11-05 | note; …" or a JSON array -> [{kind, url, gave, found_on, note}]. */
export function parseSources(raw) {
  if (Array.isArray(raw)) return raw;
  const text = String(raw ?? '').trim();
  if (!text) return [];
  if (text.startsWith('[')) { try { const j = JSON.parse(text); return Array.isArray(j) ? j : []; } catch { return []; } }
  return text.split(';').map((part) => { const [kind = '', url = '', gave = '', found_on = '', ...rest] = part.split('|').map((x) => x.trim()); return { kind, url, gave, found_on, note: rest.join(' | ') }; });
}
export function cleanSources(raw) {
  const out = [];
  for (const x of parseSources(raw).slice(0, 20)) {
    if (!x || typeof x !== 'object') continue;
    const kind = String(x.kind ?? '').trim().toLowerCase();
    const src = {
      kind: SOURCE_KINDS.includes(kind) ? kind : (kind ? 'other' : ''),
      url: String(x.url ?? '').trim().slice(0, 500),
      gave: String(x.gave ?? '').trim().slice(0, 120),
      found_on: /^\d{4}-\d{2}-\d{2}$/.test(String(x.found_on ?? '')) ? String(x.found_on) : '',
      note: String(x.note ?? '').trim().slice(0, 300),
    };
    if (src.kind || src.url || src.gave || src.note) out.push(src);
  }
  return out;
}
export function sourcesToText(list) {
  return (list || []).map((x) => { const f = [x.kind, x.url, x.gave, x.found_on, x.note].map((v) => String(v ?? '').trim()); while (f.length && !f[f.length - 1]) f.pop(); return f.join(' | '); }).join('; ');
}

/** The CSV form of the locations list; parseLocations reads it back. */
export function locationsToText(locs) {
  return (locs || []).map((l) => {
    const f = [l.name, l.phone, l.mobile, l.address].map((x) => String(x ?? '').trim());
    while (f.length && !f[f.length - 1]) f.pop();
    return f.join(' | ');
  }).join('; ');
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
export function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Normalise and validate a prospect payload. Returns { ok, errors, value }. */
export function normalise(input, { partial = false } = {}) {
  const errors = [];
  const out = {};
  const str = (k, max = 2000) => {
    if (!(k in input)) return;
    out[k] = String(input[k] ?? '').trim().slice(0, max);
  };
  for (const k of ['company', 'town', 'region', 'title', 'first_name', 'last_name', 'website', 'contact_form_url', 'email', 'phone', 'mobile', 'whatsapp', 'address', 'note', 'hold_reason']) str(k);
  if ('trade' in input) out.trade = parseTrades(input.trade).join(', ');
  if ('locations' in input) out.locations = cleanLocations(input.locations);
  if ('sources' in input) out.sources = cleanSources(input.sources);
  if ('links' in input) out.links = cleanLinks(input.links);
  if ('legal' in input) out.legal = cleanLegal(input.legal);
  if ('notice' in input) out.notice = String(input.notice ?? '').trim().slice(0, 500);
  if ('website_status' in input) {
    const w = String(input.website_status ?? '').toLowerCase().trim();
    if (!WEBSITE_STATUSES.includes(w)) errors.push(`website_status must be one of ${WEBSITE_STATUSES.filter(Boolean).join(', ')} or blank`);
    out.website_status = w;
  }
  if ('ltd' in input) out.ltd = input.ltd === true || input.ltd === 1 || /^(1|y|yes|true|ltd)$/i.test(String(input.ltd ?? '')) ? 1 : 0;
  if ('channel' in input) {
    const c = String(input.channel ?? 'form').toLowerCase().trim() || 'form';
    if (!CHANNELS.includes(c)) errors.push(`channel must be one of ${CHANNELS.join(', ')}`);
    out.channel = c;
  }
  if ('mood' in input) {
    const m = String(input.mood ?? '').toLowerCase().trim();
    if (!MOODS.includes(m)) errors.push(`mood must be one of ${MOODS.filter(Boolean).join(', ')} or blank`);
    out.mood = m;
  }
  if ('status' in input) {
    const s = String(input.status ?? 'new').toLowerCase().trim() || 'new';
    if (!STATUSES.includes(s)) errors.push(`status must be one of ${STATUSES.join(', ')}`);
    out.status = s;
  }
  for (const k of ['sent_at', 'followup_due', 'last_contact']) {
    if (!(k in input)) continue;
    const v = String(input[k] ?? '').trim();
    if (v && !DATE.test(v)) errors.push(`${k} must be YYYY-MM-DD`);
    out[k] = v;
  }
  if ('value_gbp' in input) {
    const n = Number(input.value_gbp);
    if (Number.isNaN(n) || n < 0) errors.push('value_gbp must be a number');
    out.value_gbp = Number.isNaN(n) ? 0 : n;
  }
  if (!partial || 'company' in input) {
    if (!out.company) errors.push('company is required');
  }
  if (out.website && !/^https?:\/\//i.test(out.website)) out.website = 'https://' + out.website;
  if (out.contact_form_url && !/^https?:\/\//i.test(out.contact_form_url)) out.contact_form_url = 'https://' + out.contact_form_url;
  return { ok: errors.length === 0, errors, value: out };
}

/** The loop's date rules: moving to Sent stamps the date and a 3-day follow-up; a reply stamps last contact. */
export function applyStatusRules(next, prev, now = today()) {
  const status = next.status ?? prev?.status ?? 'new';
  if (status === 'sent') {
    if (!(next.sent_at ?? prev?.sent_at)) next.sent_at = now;
    if (!(next.followup_due ?? prev?.followup_due)) next.followup_due = addDays(next.sent_at ?? prev?.sent_at ?? now, 3);
  }
  if (['replied', 'intake', 'client'].includes(status) && prev?.status !== status && !next.last_contact) next.last_contact = now;
  // leaving hold clears the reason, so a later hold starts clean
  if (prev?.status === 'hold' && status !== 'hold' && !('hold_reason' in next)) next.hold_reason = '';
  return next;
}

/** A prospect goes on hold only with a reason; returns an error string or ''. */
export function holdCheck(next, prev) {
  const status = next.status ?? prev?.status ?? 'new';
  if (status !== 'hold') return '';
  const reason = (next.hold_reason ?? prev?.hold_reason ?? '').trim();
  return reason ? '' : 'hold_reason is required when status is hold: say why they could not be reached.';
}

export function rowToProspect(r) {
  if (!r) return null;
  return { ...r, ltd: r.ltd ? 1 : 0, value_gbp: Number(r.value_gbp || 0), locations: cleanLocations(r.locations), sources: cleanSources(r.sources), links: cleanLinks(r.links), legal: cleanLegal(r.legal) };
}
const bindValue = (col, v) => (col === 'locations' ? JSON.stringify(cleanLocations(v)) : col === 'sources' ? JSON.stringify(cleanSources(v)) : col === 'links' ? JSON.stringify(cleanLinks(v)) : col === 'legal' ? JSON.stringify(cleanLegal(v)) : v);

export async function getProspect(db, id) {
  const r = await db.prepare('SELECT * FROM prospects WHERE id = ?').bind(id).first();
  return rowToProspect(r);
}

export async function insertProspect(db, value, user) {
  const now = new Date().toISOString();
  const p = {
    id: crypto.randomUUID(),
    company: '', town: '', region: '', trade: '', ltd: 0, title: '', first_name: '', last_name: '', website: '', website_status: '', contact_form_url: '', email: '',
    phone: '', mobile: '', whatsapp: '', address: '', hold_reason: '', mood: '', locations: [], sources: [], links: {}, legal: {}, notice: '', channel: 'form', status: 'new', note: '', sent_at: '', followup_due: '', last_contact: '',
    value_gbp: 0, ...value, created_at: now, updated_at: now, created_by: user, updated_by: user,
  };
  p.locations = cleanLocations(p.locations);
  applyStatusRules(p, null);
  const cols = COLUMNS;
  await db
    .prepare(`INSERT INTO prospects (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`)
    .bind(...cols.map((c) => bindValue(c, p[c])))
    .run();
  return p;
}

export async function updateProspect(db, prev, value, user) {
  const patch = applyStatusRules({ ...value }, prev);
  const next = { ...prev, ...patch, updated_at: new Date().toISOString(), updated_by: user };
  next.locations = cleanLocations(next.locations);
  next.sources = cleanSources(next.sources);
  next.links = cleanLinks(next.links);
  next.legal = cleanLegal(next.legal);
  const cols = [...FIELDS, 'updated_at', 'updated_by'];
  await db
    .prepare(`UPDATE prospects SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`)
    .bind(...cols.map((c) => bindValue(c, next[c])), prev.id)
    .run();
  return next;
}

export async function listProspects(db) {
  const { results } = await db.prepare('SELECT * FROM prospects ORDER BY updated_at DESC').all();
  return (results || []).map(rowToProspect);
}

export async function findByCompany(db, company, town) {
  const r = await db
    .prepare('SELECT * FROM prospects WHERE lower(company) = lower(?) AND lower(town) = lower(?) LIMIT 1')
    .bind(company, town || '')
    .first();
  return rowToProspect(r);
}

const CSV_HEADER = ['company', 'town', 'region', 'trade', 'ltd', 'title', 'first_name', 'last_name', 'website', 'website_status', 'contact_form_url', 'email', 'phone', 'mobile', 'whatsapp', 'address', 'locations', 'sources', 'links', 'legal', 'notice', 'channel', 'status', 'hold_reason', 'mood', 'sent_at', 'followup_due', 'last_contact', 'value_gbp', 'note', 'created_at', 'updated_at'];
export function toCsv(rows) {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const cell = (r, k) => (k === 'locations' ? locationsToText(r.locations) : k === 'sources' ? sourcesToText(r.sources) : k === 'links' ? linksToText(r.links) : k === 'legal' ? legalToText(r.legal) : r[k]);
  return [CSV_HEADER.join(','), ...rows.map((r) => CSV_HEADER.map((k) => esc(cell(r, k))).join(','))].join('\r\n') + '\r\n';
}

/** Map a prospects.csv row (the sheet's column names) or a CRM export row onto API fields. */
export function fromSheetRow(row) {
  const g = (...keys) => {
    for (const k of keys) if (row[k] != null && String(row[k]).trim() !== '') return String(row[k]).trim();
    return '';
  };
  const statusRaw = g('status').toLowerCase();
  const status = STATUSES.includes(statusRaw) ? statusRaw : statusRaw === 'email-wk3' ? 'new' : statusRaw ? 'new' : 'new';
  return {
    company: g('company'),
    town: g('town'),
    region: g('region', 'week_region'),
    trade: g('trade', 'week_trade'),
    ltd: g('ltd', 'ltd_yn'),
    title: g('title'),
    first_name: g('first_name'),
    last_name: g('last_name'),
    website: g('website'),
    website_status: g('website_status').toLowerCase(),
    contact_form_url: g('contact_form_url'),
    email: g('email'),
    phone: g('phone'),
    mobile: g('mobile'),
    whatsapp: g('whatsapp'),
    address: g('address'),
    locations: g('locations'),
    sources: g('sources'),
    links: g('links'),
    legal: g('legal'),
    notice: g('notice'),
    channel: g('channel') || 'form',
    status,
    hold_reason: g('hold_reason'),
    mood: g('mood'),
    note: g('note'),
    sent_at: g('sent_at', 'sent_date'),
    followup_due: g('followup_due', 'followup1_date'),
    last_contact: g('last_contact'),
    value_gbp: g('value_gbp') || 0,
  };
}
