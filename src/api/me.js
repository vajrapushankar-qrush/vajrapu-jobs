import { json, TRADES } from './_lib.js';

export async function onRequestGet({ data, env }) {
  return json({
    email: data.user.email,
    role: data.user.role,
    superuser: (env.SUPERUSER_EMAIL || 'shankar@vajrapu.co.uk').toLowerCase(),
    trades: TRADES,
  });
}
