---
title: "Site setup (one-time)"
description: "D1, Access, deploy — the same 10-minute sequence as the RAMS and Ops sites."
order: 1
---

Same architecture as the other two hubs; the README has the full version. The short list:

1. **Lockfile (before the first Cloudflare build):** `npx npm@10.9.2 install` → commit `package-lock.json` → push.
2. **Worker:** Workers & Pages → Create → connect `vajrapu_jobs`. Build `npm run build`, deploy `npx wrangler deploy`, root `/`. Custom domain if wanted: e.g. `jobs.vajrapu.com`.
3. **Access:** the Worker's Access tab → scope *All traffic* → reuse the existing Team policy + One-time PIN. Copy the **AUD** into `wrangler.jsonc` → `ACCESS_AUD`. (Team domain is already filled in.)
4. **D1:** Storage & databases → D1 → create **`jobs-db`** → paste its ID into the `d1_databases` block in `wrangler.jsonc` and uncomment. Tables create themselves on first use.
5. *(Optional)* R2 bucket **`jobs-files`** for screenshots; uncomment its block.
6. Open `/` → PIN → Today. Install as PWA on the phone (teal **J** icon — third hub on the home screen).

**Living with it:** the plan is `src/tasks.config.ts` (IDs stable, never reused); notes are markdown under `src/content/notes/`; message wording is `public/messages.js`; segments are `TRADES` in `src/api/_lib.js`. Push to `main` → live in ~a minute.
