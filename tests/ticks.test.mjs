// Ticks API through the Worker entry point over a fake D1. Run: node tests/ticks.test.mjs
import { makeD1, invoke } from './fake-d1.mjs';

let passed = 0;
const ok = (name, cond, extra) => { if (!cond) { console.log('FAIL ' + name + (extra ? ' -> ' + JSON.stringify(extra) : '')); process.exitCode = 1; } else { passed++; console.log('PASS ' + name); } };

const env = { DB: makeD1(), DEV_USER: 'shankar@vajrapu.co.uk' };
const T = {};

{
  let r = await invoke(T, { path: '/api/ticks', env });
  ok('empty table -> empty ticks map', r.status === 200 && r.json.ticks && Object.keys(r.json.ticks).length === 0, r.json);

  r = await invoke(T, { method: 'POST', path: '/api/ticks', env, body: { id: 'd01-1' } });
  ok('tick d01-1 -> done true', r.status === 200 && r.json.id === 'd01-1' && r.json.done === true, r.json);

  r = await invoke(T, { method: 'POST', path: '/api/ticks', env, body: { id: 'd01-2', done: true } });
  r = await invoke(T, { path: '/api/ticks', env });
  ok('both ticks listed with who and when', r.status === 200 && r.json.ticks['d01-1'] && r.json.ticks['d01-2'] && r.json.ticks['d01-1'].by === 'shankar@vajrapu.co.uk' && /^\d{4}-\d{2}-\d{2}T/.test(r.json.ticks['d01-1'].at), r.json);

  r = await invoke(T, { method: 'POST', path: '/api/ticks', env, body: { id: 'd01-1', done: true } });
  r = await invoke(T, { path: '/api/ticks', env });
  ok('re-ticking is idempotent', Object.keys(r.json.ticks).length === 2, r.json);

  r = await invoke(T, { method: 'POST', path: '/api/ticks', env, body: { id: 'd01-1', done: false } });
  ok('untick answers done false', r.status === 200 && r.json.done === false, r.json);
  r = await invoke(T, { path: '/api/ticks', env });
  ok('unticked row is gone', !r.json.ticks['d01-1'] && r.json.ticks['d01-2'], r.json);

  r = await invoke(T, { method: 'POST', path: '/api/ticks', env, body: {} });
  ok('missing id -> 400', r.status === 400, r.json);
  r = await invoke(T, { method: 'POST', path: '/api/ticks', env, body: { id: 'x'.repeat(81) } });
  ok('over-long id -> 400', r.status === 400, r.json);
  r = await invoke(T, { method: 'POST', path: '/api/ticks', env: { DB: env.DB }, body: { id: 'd01-3' } });
  ok('no auth -> 401', r.status === 401, r.json);
  r = await invoke(T, { method: 'DELETE', path: '/api/ticks', env });
  ok('DELETE -> 405', r.status === 405, r.json);
  r = await invoke(T, { method: 'POST', path: '/api/ticks', env: { DEV_USER: 'x@y.z' }, body: { id: 'a' } });
  ok('no D1 binding -> helpful 500', r.status === 500 && /wrangler\.jsonc/.test(r.json.error), r.json);
}

console.log(passed + ' ticks checks passed' + (process.exitCode ? ' (with failures)' : ''));
