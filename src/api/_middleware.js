// Every /api/* request must carry a valid Cloudflare Access token.
//
// Access protects the whole site at Cloudflare's edge (see README, "Protecting the site").
// This middleware additionally verifies the token Access attaches to each request, so the
// API cannot be called by anything that skipped the login page, and so each change is
// attributed to the signed-in email.
//
// Settings (vars in wrangler.jsonc): ACCESS_TEAM_DOMAIN (yourteam.cloudflareaccess.com, the
// hostname of the login page) and ACCESS_AUD (the application's AUD tag, shown on the Worker's
// Access tab). Optional: SUPERUSER_EMAIL (defaults to shankar@vajrapu.co.uk). For `wrangler dev`
// only, DEV_USER=<email> skips Access.
import { json } from './_lib.js';

const DEFAULT_SUPERUSER = 'shankar@vajrapu.co.uk';
const certCache = { team: '', fetchedAt: 0, keys: [] };

/** Accepts "curly-wind-4b8f", "curly-wind-4b8f.cloudflareaccess.com" or the full login URL. */
export function normaliseTeam(raw) {
  let t = String(raw || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/[/?#].*$/, '');
  if (t && !t.includes('.')) t += '.cloudflareaccess.com';
  return t;
}

function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  s += '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const decodePart = (p) => JSON.parse(new TextDecoder().decode(b64urlToBytes(p)));

async function getKeys(team, force = false) {
  const now = Date.now();
  if (!force && certCache.team === team && certCache.keys.length && now - certCache.fetchedAt < 60 * 60 * 1000) return certCache.keys;
  const r = await fetch(`https://${team}/cdn-cgi/access/certs`, { cf: { cacheTtl: 3600 } });
  if (!r.ok) throw new Error(`Access certs: HTTP ${r.status}`);
  const body = await r.json();
  certCache.team = team;
  certCache.keys = body.keys || [];
  certCache.fetchedAt = now;
  return certCache.keys;
}

/** Returns the verified email, or null. */
export async function verifyAccessJwt(token, team, aud) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  let header, payload;
  try {
    header = decodePart(h);
    payload = decodePart(p);
  } catch {
    return null;
  }
  if (header.alg !== 'RS256') return null;
  let jwk = (await getKeys(team)).find((k) => k.kid === header.kid);
  if (!jwk) jwk = (await getKeys(team, true)).find((k) => k.kid === header.kid); // key rotation
  if (!jwk) return null;
  const key = await crypto.subtle.importKey(
    'jwk',
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(s), new TextEncoder().encode(`${h}.${p}`));
  if (!ok) return null;
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp < now - 60) return null;
  if (typeof payload.nbf === 'number' && payload.nbf > now + 60) return null;
  if (payload.iss !== `https://${team}`) return null;
  const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (aud && !auds.includes(aud)) return null;
  return typeof payload.email === 'string' && payload.email ? payload.email : null;
}

function cookieValue(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return '';
}

export async function onRequest(context) {
  const { request, env } = context;
  const team = normaliseTeam(env.ACCESS_TEAM_DOMAIN);
  const aud = String(env.ACCESS_AUD || '').trim();
  let email = null;

  if (team) {
    const token = request.headers.get('Cf-Access-Jwt-Assertion') || cookieValue(request, 'CF_Authorization');
    if (!token) return json({ error: 'Not signed in through Cloudflare Access. Reload the page to sign in again.' }, 401);
    let problem = 'the token was rejected';
    try {
      email = await verifyAccessJwt(token, team, aud);
    } catch (err) {
      problem = err && err.message ? err.message : String(err);
    }
    if (!email) {
      return json(
        {
          error: `Signed in, but the login could not be verified against ${team} (${problem}).`,
          fix: 'Check ACCESS_TEAM_DOMAIN (the hostname of the login page) and ACCESS_AUD (the AUD tag on the Worker\'s Access tab) under vars in wrangler.jsonc.',
        },
        401,
      );
    }
  } else if (env.DEV_USER) {
    email = env.DEV_USER; // local development only
  } else {
    return json(
      {
        error: 'Cloudflare Access is not configured for the API yet.',
        fix: 'Set ACCESS_TEAM_DOMAIN and ACCESS_AUD under vars in wrangler.jsonc (see README, "Protecting the site").',
      },
      401,
    );
  }

  const superuser = (env.SUPERUSER_EMAIL || DEFAULT_SUPERUSER).toLowerCase();
  const e = email.toLowerCase();
  context.data.user = { email: e, role: e === superuser ? 'superuser' : 'member' };
  return context.next();
}
