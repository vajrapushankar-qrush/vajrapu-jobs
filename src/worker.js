// The Worker: serves the built site from ./dist (the ASSETS binding) and runs the API
// under /api/*. Every API request passes the Cloudflare Access check in src/api/_middleware.js
// before it reaches a handler. Configured in wrangler.jsonc.
import { onRequest as requireAccess } from './api/_middleware.js';
import * as me from './api/me.js';
import * as prospects from './api/prospects.js';
import * as prospect from './api/prospect.js';
import * as ticks from './api/ticks.js';
import * as files from './api/files.js';

const ROUTES = [
  { pattern: /^\/api\/me\/?$/, mod: me },
  { pattern: /^\/api\/ticks\/?$/, mod: ticks },
  { pattern: /^\/api\/prospects\/?$/, mod: prospects },
  { pattern: /^\/api\/prospects\/([^/]+)\/files\/?$/, mod: files, params: ['id'] },
  { pattern: /^\/api\/prospects\/([^/]+)\/?$/, mod: prospect, params: ['id'] },
];

const jsonError = (message, status) =>
  new Response(JSON.stringify({ error: message }), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    for (const route of ROUTES) {
      const m = url.pathname.match(route.pattern);
      if (!m) continue;
      const params = {};
      (route.params || []).forEach((name, i) => { params[name] = decodeURIComponent(m[i + 1]); });
      const method = request.method.toUpperCase();
      const handler = route.mod['onRequest' + method[0] + method.slice(1).toLowerCase()] || route.mod.onRequest;
      if (!handler) return jsonError('Method not allowed.', 405);
      const context = { request, env, params, data: {}, waitUntil: (p) => ctx.waitUntil(p), next: () => handler(context) };
      try {
        return await requireAccess(context);
      } catch (err) {
        return jsonError('Server error: ' + (err && err.message ? err.message : String(err)), 500);
      }
    }
    return jsonError('Not found.', 404);
  },
};
