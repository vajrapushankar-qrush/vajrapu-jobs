// API test through the Worker entry point over a fake D1 (node:sqlite). Run: node tests/api.test.mjs
import assert from 'node:assert/strict';
import { makeD1, makeR2, invoke, worker } from './fake-d1.mjs';

const F = new URL('../src/api/', import.meta.url).href;
const middleware = await import(F + '_middleware.js');
const me = await import(F + 'me.js');
const prospects = await import(F + 'prospects.js');
const byId = await import(F + 'prospect.js');

let passed = 0;
const ok = (name, cond, extra) => { if (!cond) { console.log('FAIL ' + name + (extra ? ' -> ' + JSON.stringify(extra) : '')); process.exitCode = 1; } else { passed++; console.log('PASS ' + name); } };

// ---------- auth gate ----------
{
  const DB = makeD1();
  const r = await invoke({ middleware, route: me }, { path: '/api/me', env: { DB } });
  ok('no Access config and no DEV_USER -> 401 with fix text', r.status === 401 && /ACCESS_TEAM_DOMAIN/.test(r.json.fix), r.json);
  const r2 = await invoke({ middleware, route: me }, { path: '/api/me', env: { DB, ACCESS_TEAM_DOMAIN: 'team.cloudflareaccess.com', ACCESS_AUD: 'abc' } });
  ok('Access configured but no token -> 401', r2.status === 401, r2.json);
}

// ---------- JWT verification with a generated key pair ----------
{
  const kp = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', kp.publicKey);
  const kid = 'test-key-1';
  const team = 'team.cloudflareaccess.com';
  const b64u = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const sign = async (payload, header = { alg: 'RS256', kid }) => {
    const h = b64u(JSON.stringify(header)), p = b64u(JSON.stringify(payload));
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', kp.privateKey, new TextEncoder().encode(h + '.' + p));
    return `${h}.${p}.${b64u(sig)}`;
  };
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url) === `https://${team}/cdn-cgi/access/certs`) return new Response(JSON.stringify({ keys: [{ kid, kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', use: 'sig' }] }), { headers: { 'content-type': 'application/json' } });
    return realFetch(url);
  };
  const now = Math.floor(Date.now() / 1000);
  const good = await sign({ email: 'Shankar@vajrapu.co.uk', aud: ['aud-1'], iss: `https://${team}`, exp: now + 600, iat: now });
  const env = { DB: makeD1(), ACCESS_TEAM_DOMAIN: team, ACCESS_AUD: 'aud-1' };
  let r = await invoke({ middleware, route: me }, { path: '/api/me', env, headers: { 'Cf-Access-Jwt-Assertion': good } });
  ok('valid Access JWT -> 200, email lower-cased, superuser role', r.status === 200 && r.json.email === 'shankar@vajrapu.co.uk' && r.json.role === 'superuser', r.json);
  r = await invoke({ middleware, route: me }, { path: '/api/me', env, headers: { cookie: 'CF_Authorization=' + good + '; other=1' } });
  ok('token via CF_Authorization cookie works', r.status === 200, r.json);
  const other = await sign({ email: 'helper@example.com', aud: ['aud-1'], iss: `https://${team}`, exp: now + 600 });
  r = await invoke({ middleware, route: me }, { path: '/api/me', env, headers: { 'Cf-Access-Jwt-Assertion': other } });
  ok('other email -> member role', r.status === 200 && r.json.role === 'member', r.json);
  const expired = await sign({ email: 'x@example.com', aud: ['aud-1'], iss: `https://${team}`, exp: now - 3600 });
  r = await invoke({ middleware, route: me }, { path: '/api/me', env, headers: { 'Cf-Access-Jwt-Assertion': expired } });
  ok('expired token -> 401', r.status === 401);
  const wrongAud = await sign({ email: 'x@example.com', aud: ['someone-else'], iss: `https://${team}`, exp: now + 600 });
  r = await invoke({ middleware, route: me }, { path: '/api/me', env, headers: { 'Cf-Access-Jwt-Assertion': wrongAud } });
  ok('wrong audience -> 401', r.status === 401);
  const tampered = good.slice(0, -4) + 'AAAA';
  r = await invoke({ middleware, route: me }, { path: '/api/me', env, headers: { 'Cf-Access-Jwt-Assertion': tampered } });
  ok('tampered signature -> 401', r.status === 401);
  const kp2 = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const h = b64u(JSON.stringify({ alg: 'RS256', kid })), p = b64u(JSON.stringify({ email: 'x@example.com', aud: ['aud-1'], iss: `https://${team}`, exp: now + 600 }));
  const forged = `${h}.${p}.${b64u(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', kp2.privateKey, new TextEncoder().encode(h + '.' + p)))}`;
  r = await invoke({ middleware, route: me }, { path: '/api/me', env, headers: { 'Cf-Access-Jwt-Assertion': forged } });
  ok('token signed by a different key -> 401', r.status === 401);
  const none = `${b64u(JSON.stringify({ alg: 'none', kid }))}.${p}.`;
  r = await invoke({ middleware, route: me }, { path: '/api/me', env, headers: { 'Cf-Access-Jwt-Assertion': none } });
  ok('alg=none -> 401', r.status === 401);
  // team domain written loosely still verifies
  for (const loose of ['team', ' Team.cloudflareaccess.com ', 'https://team.cloudflareaccess.com/cdn-cgi/access/login/x?kid=1']) {
    r = await invoke({ middleware, route: me }, { path: '/api/me', env: { ...env, ACCESS_TEAM_DOMAIN: loose }, headers: { 'Cf-Access-Jwt-Assertion': good } });
    ok(`ACCESS_TEAM_DOMAIN ${JSON.stringify(loose)} -> 200`, r.status === 200, r.json);
  }
  // wrong team domain: the failure names the domain it checked and what to fix
  r = await invoke({ middleware, route: me }, { path: '/api/me', env: { ...env, ACCESS_TEAM_DOMAIN: 'yourteam.cloudflareaccess.com' }, headers: { 'Cf-Access-Jwt-Assertion': good } });
  ok('wrong team domain -> 401 naming the domain and the fix', r.status === 401 && /yourteam\.cloudflareaccess\.com/.test(r.json.error) && /ACCESS_TEAM_DOMAIN/.test(r.json.fix), r.json);
  r = await invoke({ middleware, route: me }, { path: '/api/me', env: { ...env, ACCESS_AUD: '' }, headers: { 'Cf-Access-Jwt-Assertion': good } });
  ok('no ACCESS_AUD yet -> signature/issuer still checked, request allowed', r.status === 200, r.json);
  ok('normaliseTeam', middleware.normaliseTeam('CURLY-wind-4b8f') === 'curly-wind-4b8f.cloudflareaccess.com' && middleware.normaliseTeam('') === '');
  globalThis.fetch = realFetch;
}

// ---------- CRUD with DEV_USER ----------
{
  const DB = makeD1();
  const env = { DB, DEV_USER: 'shankar@vajrapu.co.uk' };
  const memberEnv = { DB, DEV_USER: 'helper@example.com' };
  const P = { middleware, route: prospects };
  const ID = { middleware, route: byId };

  let r = await invoke(P, { method: 'POST', path: '/api/prospects', env, body: { company: '  Example Roofing Ltd ', town: 'Stockport', ltd: 'Y', website: 'example-roofing.co.uk', first_name: 'Dave', note: 'commercial re-roofs' } });
  ok('create -> 201 with trimmed company, ltd=1, https added', r.status === 201 && r.json.prospect.company === 'Example Roofing Ltd' && r.json.prospect.ltd === 1 && r.json.prospect.website === 'https://example-roofing.co.uk' && r.json.prospect.status === 'new' && r.json.prospect.created_by === 'shankar@vajrapu.co.uk', r.json);
  const id = r.json.prospect.id;

  r = await invoke(P, { method: 'POST', path: '/api/prospects', env, body: { town: 'Bolton' } });
  ok('create without company -> 400', r.status === 400 && /company/.test(r.json.error), r.json);
  r = await invoke(P, { method: 'POST', path: '/api/prospects', env, body: { company: 'example roofing ltd', town: 'stockport' } });
  ok('duplicate company+town -> 409 with duplicateOf', r.status === 409 && r.json.duplicateOf === id, r.json);
  r = await invoke(P, { method: 'POST', path: '/api/prospects', env, body: { company: 'Example Roofing Ltd', town: 'Bolton', status: 'bogus' } });
  ok('invalid status -> 400', r.status === 400, r.json);

  r = await invoke(P, { method: 'GET', path: '/api/prospects', env });
  ok('list -> 1 prospect', r.status === 200 && r.json.prospects.length === 1);

  const today = new Date().toISOString().slice(0, 10);
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + id, env: memberEnv, params: { id }, body: { status: 'sent' } });
  ok('member moves to sent -> sent_at today, follow-up +3 days, updated_by member', r.status === 200 && r.json.prospect.sent_at === today && r.json.prospect.followup_due > today && r.json.prospect.updated_by === 'helper@example.com', r.json);
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + id, env, params: { id }, body: { status: 'replied' } });
  ok('replied -> last_contact stamped, sent_at kept', r.status === 200 && r.json.prospect.last_contact === today && r.json.prospect.sent_at === today, r.json);
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + id, env, params: { id }, body: { followup_due: '31/10/2026' } });
  ok('bad date -> 400', r.status === 400, r.json);
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + id, env, params: { id }, body: { value_gbp: '95', status: 'client' } });
  ok('value and status update', r.status === 200 && r.json.prospect.value_gbp === 95 && r.json.prospect.status === 'client', r.json);
  r = await invoke(ID, { method: 'GET', path: '/api/prospects/' + id, env, params: { id } });
  ok('get one', r.status === 200 && r.json.prospect.company === 'Example Roofing Ltd');
  r = await invoke(ID, { method: 'GET', path: '/api/prospects/nope', env, params: { id: 'nope' } });
  ok('get missing -> 404', r.status === 404);

  // import: sheet columns, duplicates skipped, superuser only
  const rows = [
    { company: 'Example Roofing Ltd', town: 'Stockport', week_trade: 'Roofing' },
    { company: 'Smith & Sons Roofing', town: 'Bolton', ltd_yn: 'N', first_name: 'Gary', week_region: 'Greater Manchester', week_trade: 'Roofing', contact_form_url: 'smithsonsroofing.co.uk/contact', sent_date: '2026-10-27', followup1_date: '2026-10-30', status: 'sent', note: 'sole trader' },
    { company: '', town: 'Nowhere' },
  ];
  r = await invoke(P, { method: 'POST', path: '/api/prospects?action=import', env: memberEnv, body: { rows } });
  ok('member import -> 403', r.status === 403);
  r = await invoke(P, { method: 'POST', path: '/api/prospects?action=import', env, body: { rows } });
  ok('import: 1 added, 1 duplicate skipped, 1 invalid', r.status === 200 && r.json.added === 1 && r.json.skipped === 1 && r.json.invalid === 1, r.json);
  r = await invoke(P, { method: 'GET', path: '/api/prospects', env });
  const smith = r.json.prospects.find((p) => p.company === 'Smith & Sons Roofing');
  ok('imported row mapped from sheet columns', smith && smith.ltd === 0 && smith.region === 'Greater Manchester' && smith.trade === 'Roofing' && smith.status === 'sent' && smith.sent_at === '2026-10-27' && smith.followup_due === '2026-10-30' && smith.contact_form_url === 'https://smithsonsroofing.co.uk/contact', smith);

  r = await invoke(P, { method: 'GET', path: '/api/prospects?format=csv', env });
  ok('csv export has header + 2 rows, quotes the ampersand row', r.status === 200 && r.headers.get('content-type').includes('text/csv') && r.text.split('\r\n').filter(Boolean).length === 3 && r.text.includes('Smith & Sons Roofing'), r.text.slice(0, 200));

  // website status: a fixed set, blank by default, exported and importable
  r = await invoke(P, { method: 'POST', path: '/api/prospects', env, body: { company: 'Millbrook Roofing Ltd', town: 'Bramhall', website: 'millbrookroofers.co.uk', website_status: 'Expired' } });
  ok('website_status stored lower-cased', r.status === 201 && r.json.prospect.website_status === 'expired', r.json.prospect.website_status);
  const mill = r.json.prospect.id;
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + mill, env, params: { id: mill }, body: { website_status: 'parked' } });
  ok('unknown website_status -> 400', r.status === 400 && /website_status/.test(r.json.error), r.json);
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + mill, env, params: { id: mill }, body: { status: 'sent' } });
  ok('other updates keep website_status', r.status === 200 && r.json.prospect.website_status === 'expired');
  r = await invoke(P, { method: 'GET', path: '/api/prospects?format=csv', env });
  ok('csv export carries website_status', r.text.split('\r\n')[0].includes(',website_status,') && r.text.split('\r\n').some((l) => l.startsWith('Millbrook') && l.includes(',expired,')), r.text.split('\r\n').find((l) => l.startsWith('Millbrook')));
  r = await invoke(P, { method: 'POST', path: '/api/prospects?action=import', env, body: { rows: [{ company: 'Parked Roofing', town: 'Sale', website_status: 'REDIRECT' }, { company: 'Bad Status Roofing', town: 'Sale', website_status: 'gone' }] } });
  ok('import maps website_status and rejects a bad value', r.status === 200 && r.json.added === 1 && r.json.invalid === 1, r.json);
  r = await invoke(P, { method: 'GET', path: '/api/prospects', env });
  const parked = r.json.prospects.find((p) => p.company === 'Parked Roofing');
  ok('imported website_status lower-cased', parked && parked.website_status === 'redirect');
  r = await invoke(P, { method: 'GET', path: '/api/prospects', env });
  ok('record without the field reads as blank', r.json.prospects.find((p) => p.company === 'Example Roofing Ltd').website_status === '');
  await invoke(ID, { method: 'DELETE', path: '/api/prospects/' + mill, env, params: { id: mill } });
  await invoke(ID, { method: 'DELETE', path: '/api/prospects/' + parked.id, env, params: { id: parked.id } });

  // on hold: needs a reason; leaving hold clears it; export carries it
  r = await invoke(P, { method: 'POST', path: '/api/prospects', env, body: { company: 'Forged Roofing Limited', town: 'Surrey' } });
  const forged = r.json.prospect.id;
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + forged, env, params: { id: forged }, body: { status: 'hold' } });
  ok('hold without a reason -> 400', r.status === 400 && /hold_reason/.test(r.json.error), r.json);
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + forged, env, params: { id: forged }, body: { status: 'hold', hold_reason: 'Form rejects a non-UK phone', channel: 'phone', followup_due: '2026-11-02' } });
  ok('hold with reason, next channel and date -> 200', r.status === 200 && r.json.prospect.status === 'hold' && r.json.prospect.hold_reason === 'Form rejects a non-UK phone' && r.json.prospect.channel === 'phone' && r.json.prospect.followup_due === '2026-11-02', r.json);
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + forged, env, params: { id: forged }, body: { note: 'x' } });
  ok('other edits keep the hold and its reason', r.json.prospect.status === 'hold' && r.json.prospect.hold_reason === 'Form rejects a non-UK phone');
  r = await invoke(P, { method: 'GET', path: '/api/prospects?format=csv', env });
  ok('csv export carries hold_reason', r.text.split('\r\n')[0].includes(',hold_reason,') && r.text.includes('Form rejects a non-UK phone'));
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + forged, env, params: { id: forged }, body: { status: 'sent' } });
  ok('leaving hold clears the reason and stamps sent', r.json.prospect.status === 'sent' && r.json.prospect.hold_reason === '' && r.json.prospect.sent_at === today, r.json);
  r = await invoke(P, { method: 'POST', path: '/api/prospects', env, body: { company: 'Hold On Create Ltd', town: 'Sale', status: 'hold' } });
  ok('creating straight into hold without a reason -> 400', r.status === 400);
  await invoke(ID, { method: 'DELETE', path: '/api/prospects/' + forged, env, params: { id: forged } });

  // whatsapp number and channel
  r = await invoke(P, { method: 'POST', path: '/api/prospects', env, body: { company: 'AB Roofing Specialists', town: 'Stockport', whatsapp: '07778 869402', channel: 'whatsapp' } });
  ok('whatsapp number and channel stored', r.status === 201 && r.json.prospect.whatsapp === '07778 869402' && r.json.prospect.channel === 'whatsapp', r.json);
  const ab = r.json.prospect.id;
  r = await invoke(P, { method: 'GET', path: '/api/prospects?format=csv', env });
  ok('csv export carries whatsapp', r.text.split('\r\n')[0].includes(',whatsapp,') && r.text.includes('07778 869402'));
  await invoke(ID, { method: 'DELETE', path: '/api/prospects/' + ab, env, params: { id: ab } });

  // trades: any number per firm, canonical spelling, duplicates dropped
  r = await invoke(P, { method: 'POST', path: '/api/prospects', env, body: { company: 'Multi Trade Ltd', town: 'Wigan', trade: 'roofing, Building; ROOFING, wall coatings,  EPDM  flat roofs ' } });
  ok('trades normalised to the list spelling, de-duplicated, custom kept', r.status === 201 && r.json.prospect.trade === 'Roofing, Building, Wall coatings, EPDM flat roofs', r.json.prospect.trade);
  const multi = r.json.prospect.id;
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + multi, env, params: { id: multi }, body: { trade: ['Groundworks', 'groundworks', ''] } });
  ok('trade accepts an array', r.status === 200 && r.json.prospect.trade === 'Groundworks', r.json.prospect.trade);
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + multi, env, params: { id: multi }, body: { trade: Array.from({ length: 30 }, (_, i) => 'Trade ' + i).join(', ') } });
  ok('trades capped at 15', r.status === 200 && r.json.prospect.trade.split(', ').length === 15);
  r = await invoke({ middleware, route: me }, { path: '/api/me', env });
  ok('/api/me lists the trades for the tick-list', r.status === 200 && Array.isArray(r.json.trades) && r.json.trades.includes('P1 FDE + SAP/finance'), r.json.trades);
  await invoke(ID, { method: 'DELETE', path: '/api/prospects/' + multi, env, params: { id: multi } });

  // locations: extra offices with their own phone; the main one stays in town/phone/address
  r = await invoke(P, { method: 'POST', path: '/api/prospects', env, body: { company: 'SWF Roofers and Builders Ltd', town: 'Shropshire', phone: '01948 818417', locations: [{ name: 'Cheshire', phone: '01244 456145' }, { name: 'Warrington', phone: '01925 393164', address: '1 Mersey St' }, { name: '', phone: '', address: '' }, 'junk'] } });
  ok('create with locations -> 201, blanks and junk dropped', r.status === 201 && r.json.prospect.locations.length === 2 && r.json.prospect.locations[1].address === '1 Mersey St' && r.json.prospect.town === 'Shropshire', r.json);
  const swf = r.json.prospect.id;
  r = await invoke(ID, { method: 'GET', path: '/api/prospects/' + swf, env, params: { id: swf } });
  ok('locations round-trip through the database as an array', r.status === 200 && Array.isArray(r.json.prospect.locations) && r.json.prospect.locations[0].phone === '01244 456145', r.json);
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + swf, env, params: { id: swf }, body: { status: 'sent' } });
  ok('partial update leaves locations alone', r.status === 200 && r.json.prospect.locations.length === 2, r.json);
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + swf, env, params: { id: swf }, body: { locations: 'Cheshire | 01244 456145; Warrington | 01925 393164 | 1 Mersey St; Wrexham' } });
  ok('locations accepted as the CSV text form', r.status === 200 && r.json.prospect.locations.length === 3 && r.json.prospect.locations[2].name === 'Wrexham' && r.json.prospect.locations[1].address === '1 Mersey St', r.json);
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + swf, env, params: { id: swf }, body: { locations: [] } });
  ok('locations can be cleared', r.status === 200 && r.json.prospect.locations.length === 0, r.json);
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + swf, env, params: { id: swf }, body: { locations: Array.from({ length: 30 }, (_, i) => ({ name: 'Site ' + i })) } });
  ok('locations capped at 20', r.status === 200 && r.json.prospect.locations.length === 20, r.json.prospect.locations.length);
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + swf, env, params: { id: swf }, body: { locations: [{ name: 'Cheshire', phone: '01244 456145' }, { name: 'Warrington', phone: '01925 393164', address: '1 Mersey St' }] } });
  r = await invoke(P, { method: 'GET', path: '/api/prospects?format=csv', env });
  const csvLine = r.text.split('\r\n').find((l) => l.startsWith('SWF'));
  ok('csv export writes locations as "name | phone | mobile | address; ..."', r.text.split('\r\n')[0].includes(',mobile,') && r.text.split('\r\n')[0].includes(',locations,') && csvLine && csvLine.includes('Cheshire | 01244 456145; Warrington | 01925 393164 |  | 1 Mersey St'), csvLine);
  r = await invoke(ID, { method: 'PUT', path: '/api/prospects/' + swf, env, params: { id: swf }, body: { mobile: '07875 464214', locations: 'Cheshire | 01244 456145 | 07700 900123; Warrington | 01925 393164 | 1 Mersey St; Leigh | 01942 000000 | 07700 900456 | 2 High St' } });
  ok('mobile saved on the record and read from the text form: a 3rd cell that looks like a UK mobile, or the 3rd of 4', r.status === 200 && r.json.prospect.mobile === '07875 464214' && r.json.prospect.locations[0].mobile === '07700 900123' && r.json.prospect.locations[0].address === '' && r.json.prospect.locations[1].mobile === '' && r.json.prospect.locations[1].address === '1 Mersey St' && r.json.prospect.locations[2].mobile === '07700 900456' && r.json.prospect.locations[2].address === '2 High St', JSON.stringify(r.json.prospect.locations));
  r = await invoke(P, { method: 'POST', path: '/api/prospects?action=import', env, body: { rows: [{ company: 'Northgate Ltd', town: 'Bolton', locations: 'Wigan | 01942 000000; Leigh' }] } });
  r = await invoke(P, { method: 'GET', path: '/api/prospects', env });
  const north = r.json.prospects.find((p) => p.company === 'Northgate Ltd');
  ok('import parses the locations column', north && north.locations.length === 2 && north.locations[0].phone === '01942 000000' && north.locations[1].name === 'Leigh', north && north.locations);
  r = await invoke(ID, { method: 'DELETE', path: '/api/prospects/' + swf, env, params: { id: swf } });
  r = await invoke(ID, { method: 'DELETE', path: '/api/prospects/' + north.id, env, params: { id: north.id } });

  r = await invoke(ID, { method: 'DELETE', path: '/api/prospects/' + id, env: memberEnv, params: { id } });
  ok('member delete -> 403', r.status === 403);
  r = await invoke(ID, { method: 'DELETE', path: '/api/prospects/' + id, env, params: { id } });
  ok('superuser delete -> 200', r.status === 200 && r.json.deleted === id, r.json);
  r = await invoke(ID, { method: 'DELETE', path: '/api/prospects/' + id, env, params: { id } });
  ok('delete again -> 404', r.status === 404);
}
{
  // a database created before the locations column exists: ensureSchema adds it, old rows read as []
  const DB = makeD1();
  await DB.exec("CREATE TABLE prospects (id TEXT PRIMARY KEY, company TEXT NOT NULL, town TEXT NOT NULL DEFAULT '', region TEXT NOT NULL DEFAULT '', trade TEXT NOT NULL DEFAULT '', ltd INTEGER NOT NULL DEFAULT 0, first_name TEXT NOT NULL DEFAULT '', website TEXT NOT NULL DEFAULT '', contact_form_url TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', channel TEXT NOT NULL DEFAULT 'form', status TEXT NOT NULL DEFAULT 'new', note TEXT NOT NULL DEFAULT '', sent_at TEXT NOT NULL DEFAULT '', followup_due TEXT NOT NULL DEFAULT '', last_contact TEXT NOT NULL DEFAULT '', value_gbp REAL NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, created_by TEXT NOT NULL DEFAULT '', updated_by TEXT NOT NULL DEFAULT '')");
  await DB.exec("INSERT INTO prospects (id, company, town, created_at, updated_at) VALUES ('old1', 'P&L Roofing', 'Atherton', '2026-10-28T00:00:00Z', '2026-10-28T00:00:00Z')");
  // ensureSchema runs once per isolate and the blocks above already ran it, so use a fresh copy of the module
  const fresh = await import(F + '_lib.js?fresh=migration');
  let cols = (await DB.prepare('PRAGMA table_info(prospects)').all()).results.map((c) => c.name);
  ok('fixture table has no locations column', !cols.includes('locations'));
  await fresh.ensureSchema(DB);
  cols = (await DB.prepare('PRAGMA table_info(prospects)').all()).results.map((c) => c.name);
  ok('ensureSchema adds the locations column to an existing table', cols.includes('locations'), cols);
  await fresh.ensureSchema(DB);
  ok('running it again is harmless', true);
  const lib = fresh;
  const env = { DB, DEV_USER: 'shankar@vajrapu.co.uk' };
  let r = await invoke({ middleware, route: byId }, { path: '/api/prospects/old1', env, params: { id: 'old1' } });
  ok('row from before the column reads with locations []', r.status === 200 && Array.isArray(r.json.prospect.locations) && r.json.prospect.locations.length === 0, r.json);
  const sample = [{ name: 'A', phone: '', mobile: '', address: '' }, { name: '', phone: '1', mobile: '', address: '' }, { name: 'B', phone: '2', mobile: '', address: 'x | y' }, { name: 'C', phone: '', mobile: '07700 900123', address: '' }];
  ok('locations text form round-trips, including a blank name and a pipe in an address', JSON.stringify(lib.cleanLocations(lib.locationsToText(sample))) === JSON.stringify(sample), lib.locationsToText(sample));
}
{
  const env = { DEV_USER: 'shankar@vajrapu.co.uk' };
  let r = await invoke(null, { path: '/plan/', env });
  ok('non-API path goes to assets', r.status === 200 && r.text === 'asset');
  r = await invoke(null, { path: '/api/nope', env });
  ok('unknown API path -> 404 JSON', r.status === 404 && r.json.error);
  r = await invoke(null, { method: 'PATCH', path: '/api/prospects', env });
  ok('unsupported method -> 405', r.status === 405);
  r = await invoke(null, { path: '/api/prospects', env });
  ok('no DB binding -> 500 with wrangler.jsonc hint', r.status === 500 && /wrangler\.jsonc/.test(r.json.error), r.json);
  r = await invoke(null, { path: '/api/prospects/abc', env });
  ok('no DB binding on /:id -> 500 hint too', r.status === 500 && /wrangler\.jsonc/.test(r.json.error), r.json);
}
// ---------- files (screenshots in R2) ----------
{
  const DB = makeD1();
  await (await import(F + '_lib.js?fresh=files')).ensureSchema(DB);
  const FILES = makeR2();
  const env = { DB, FILES, DEV_USER: 'shankar@vajrapu.co.uk' };
  let r = await invoke(null, { method: 'POST', path: '/api/prospects', env, body: { company: 'Shot Manufacturing Ltd', town: 'Hosur' } });
  const id = r.json.prospect.id;
  r = await invoke(null, { path: '/api/prospects/' + id + '/files', env: { DB, DEV_USER: 'shankar@vajrapu.co.uk' } });
  ok('without the bucket the list says so instead of failing', r.status === 200 && r.json.enabled === false && Array.isArray(r.json.files), r.json);
  const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
  const upload = async (type, name, label, bytes = png, who = 'shankar@vajrapu.co.uk') => {
    const fd = new FormData(); fd.append('file', new File([bytes], name, { type })); if (label) fd.append('label', label);
    const req = new Request('https://rams.example/api/prospects/' + id + '/files', { method: 'POST', body: fd });
    const res = await worker.fetch(req, { ASSETS: { fetch: async () => new Response('a') }, ...env, DEV_USER: who }, { waitUntil() {} });
    return { status: res.status, json: await res.json() };
  };
  r = await upload('image/png', 'contact-page.png', 'contact page with the notice');
  ok('a PNG uploads with its label and lands under files/<prospect>/', r.status === 201 && r.json.file.key.startsWith('files/' + id + '/') && r.json.file.label === 'contact page with the notice', r.json);
  const key = r.json.file.key;
  r = await upload('text/plain', 'notes.txt', '');
  ok('other types are refused', r.status === 400);
  r = await upload('image/jpeg', 'big.jpg', '', new Uint8Array(4 * 1024 * 1024 + 1));
  ok('files over 4 MB are refused', r.status === 400 && /4 MB/.test(r.json.error));
  r = await invoke(null, { path: '/api/prospects/' + id + '/files', env });
  ok('the list shows the file with name, label, size and type', r.json.enabled === true && r.json.files.length === 1 && r.json.files[0].name === 'contact-page.png' && r.json.files[0].type === 'image/png' && r.json.files[0].size === png.length, r.json);
  r = await invoke(null, { path: '/api/prospects/' + id + '/files?key=' + encodeURIComponent(key), env });
  ok('the bytes come back inline with the right type', r.status === 200 && r.headers.get('content-type') === 'image/png' && /inline/.test(r.headers.get('content-disposition')));
  r = await invoke(null, { path: '/api/prospects/other-id/files?key=' + encodeURIComponent(key), env });
  ok('a key is only served under its own prospect', r.status === 404);
  r = await invoke(null, { method: 'DELETE', path: '/api/prospects/' + id + '/files?key=' + encodeURIComponent(key), env: { ...env, DEV_USER: 'someone@else.com' } });
  ok('only the superuser deletes a file', r.status === 403);
  r = await invoke(null, { method: 'DELETE', path: '/api/prospects/' + id, env });
  ok('deleting the prospect removes its files from the bucket', r.status === 200 && FILES._store.size === 0, FILES._store.size);
}
console.log(`\n${passed} passed${process.exitCode ? ', with failures' : ''}`);
