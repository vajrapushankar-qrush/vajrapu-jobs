// Browser test: serves src/crm.html at /crm/ and routes /api/* through the real Worker over a fake D1 (node:sqlite).
// Run from the repo root: node tests/page.test.mjs   (needs `npm i -D playwright` + chromium)
import http from 'node:http';
import fs from 'node:fs';
const { chromium } = await (async () => { try { return await import('playwright'); } catch { return import('/opt/npm-tools/node_modules/playwright/index.mjs'); } })();
import { makeD1, makeR2 } from './fake-d1.mjs';

const F = new URL('../src/api/', import.meta.url).href;
const middleware = await import(F + '_middleware.js');
const me = await import(F + 'me.js');
const prospects = await import(F + 'prospects.js');
const worker = (await import(new URL('../src/worker.js', import.meta.url).href)).default;
const html = fs.readFileSync(new URL('../src/crm.html', import.meta.url), 'utf8');

const DB = makeD1();
const FILES = makeR2();
let env = { DB, FILES, DEV_USER: 'shankar@vajrapu.co.uk' };

async function handleApi(req, res) {
  const url = new URL(req.url, 'http://x');
  let body = ''; for await (const c of req) body += c;
  const request = new Request('https://rams.example' + url.pathname + url.search, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body });
  const r = await worker.fetch(request, { ASSETS: { fetch: async () => new Response('asset') }, ...env }, { waitUntil() {} });
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
}
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) return handleApi(req, res).catch((e) => { res.writeHead(500); res.end(String(e)); });
  if (req.url.startsWith('/crm')) { res.writeHead(200, { 'content-type': 'text/html' }); res.end(html); return; }
  if (req.url === '/messages.js') { res.writeHead(200, { 'content-type': 'text/javascript' }); res.end(fs.readFileSync(new URL('../public/messages.js', import.meta.url))); return; }
  res.writeHead(200, { 'content-type': 'text/html' }); res.end('<title>x</title>other page');
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const results = []; const errors = [];
const today = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
const check = (n, ok, extra) => results.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${extra ? '  -> ' + extra : ''}`);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/status of (401|409)/.test(m.text())) errors.push(m.text()); });
page.on('dialog', (d) => d.accept());

try {
// 1. unauthenticated state shows the setup message
env = { DB };
await page.goto(base + '/crm/');
await page.waitForSelector('#authNotice', { state: 'visible' });
check('without Access config the page explains what to set', (await page.textContent('#authNotice')).includes('ACCESS_TEAM_DOMAIN'));
env = { DB, FILES, DEV_USER: 'shankar@vajrapu.co.uk' };
await page.goto(base + '/crm/');
await page.waitForFunction(() => document.getElementById('me').textContent.includes('@'));
check('signed-in email + superuser shown', (await page.textContent('#me')).includes('shankar@vajrapu.co.uk · superuser'));
check('empty state shown', await page.locator('#emptyList').isVisible());

// 2. add a prospect through the form
await page.click('#addBtn');
await page.fill('input[name=company]', 'Northgate Roofing & Cladding Ltd');
await page.fill('input[name=town]', 'Bolton');
await page.selectOption('select[name=title]', 'Mr');
await page.fill('input[name=first_name]', 'Lee');
await page.fill('input[name=last_name]', 'Hartley');
await page.fill('input[name=contact_form_url]', 'northgate-example.co.uk/contact');
check('a new record opens on the Details tab', await page.locator('section.tab[data-tab=details]').isVisible() && !(await page.locator('section.tab[data-tab=send]').isVisible()));
await page.click('#tabs [data-tab=send]');
await page.fill('textarea[name=note]', 'commercial re-roofs for housing associations, CHAS badge');
check('message preview uses the first name, leaves the note out while the first line is off', (await page.textContent('#m_form')).startsWith('Hi Lee,\n\nI’ve applied for the Bolton role at Northgate') && !(await page.textContent('#m_form')).includes('CHAS badge') && (await page.textContent('#m_jobType')).includes('opening at Northgate Roofing & Cladding Ltd'));
check('form link points at their contact form', (await page.getAttribute('#openSite', 'href')) === 'https://northgate-example.co.uk/contact');
await page.click('#saveBtn');
await page.waitForFunction(() => !document.getElementById('modal').classList.contains('open'));
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 1);
check('prospect appears in the list with the full name', (await page.textContent('#rows')).includes('Northgate Roofing & Cladding Ltd') && (await page.textContent('#rows')).includes('Mr Lee Hartley'));
check('stats count it', (await page.textContent('#stats')).includes('1'));

// 2a. the live "already in the CRM" hint while typing a new record
await page.click('#addBtn');
await page.fill('input[name=company]', 'Northgate Roof');
check('typing a name that is already here shows the hint with role and status', (await page.locator('#dupHint').isVisible()) && /Already in Applications: Northgate Roofing & Cladding Ltd \(Bolton · Found · same name\)/.test((await page.textContent('#dupHint')).replace(/\s+/g, ' ')), await page.textContent('#dupHint'));
await page.fill('input[name=company]', 'Totally Different Ltd');
check('a different name clears it', !(await page.locator('#dupHint').isVisible()));
await page.fill('input[name=website]', 'https://www.northgate-example.co.uk/');
check('the same website domain is caught even under another name', /same website/.test(await page.textContent('#dupHint')));
await page.fill('input[name=website]', '');
await page.fill('input[name=phone]', '+44 1204 000001');
check('an unknown phone does not match', !(await page.locator('#dupHint').isVisible()));
await page.fill('input[name=company]', 'northgate roofing');
await page.locator('#dupHint a').click();
check('clicking the name in the hint opens that record instead', (await page.textContent('#formTitle')) === 'Northgate Roofing & Cladding Ltd' && (await page.inputValue('input[name=company]')) === 'Northgate Roofing & Cladding Ltd');
check('editing a record does not flag itself', !(await page.locator('#dupHint').isVisible()));
await page.locator('#moods button', { hasText: '💣' }).click();
check('the mood picker marks the chosen face', (await page.inputValue('input[name=mood]')) === 'hostile' && (await page.locator('#moods button.on').textContent()) === '💣');
await page.click('#tabs [data-tab=send]');
await page.selectOption('select[name=status]', 'dnd');
check('Do not contact shows the red line above the tabs', (await page.locator('#holdLine').isVisible()) && /Do not contact: they asked us to stop/.test(await page.textContent('#holdLine')));
await page.click('#saveBtn');
await page.waitForFunction(() => !document.getElementById('modal').classList.contains('open'));
await page.waitForFunction(() => /💣/.test(document.getElementById('rows').textContent));
check('the bomb shows beside the name in the list, with the Do not contact status', /💣\s*Northgate Roofing & Cladding Ltd/.test((await page.textContent('#rows')).replace(/\s+/g, ' ')) && (await page.locator('#rows tr.row').first().locator('select').inputValue()) === 'dnd');
const bombed = (await (await fetch(base + '/api/prospects')).json()).prospects.find((p) => /Northgate/.test(p.company));
check('server stored mood and dnd', bombed && bombed.mood === 'hostile' && bombed.status === 'dnd', JSON.stringify(bombed && { m: bombed.mood, s: bombed.status }));
await page.locator('#rows tr.row').first().locator('td').first().click();
await page.waitForSelector('#modal.open');
check('the form title carries the face', (await page.textContent('#formTitle')) === '💣 Northgate Roofing & Cladding Ltd');
await page.locator('#moods button').first().click();
await page.click('#tabs [data-tab=send]');
await page.selectOption('select[name=status]', 'new');
await page.click('#saveBtn');
await page.waitForFunction(() => !document.getElementById('modal').classList.contains('open'));
await page.waitForFunction(() => !/💣/.test(document.getElementById('rows').textContent));

// duplicate add -> 409 -> confirm dialog accepted -> allowDuplicate
await page.click('#addBtn');
await page.fill('input[name=company]', 'northgate roofing & cladding ltd');
await page.fill('input[name=town]', 'Bolton');
await page.click('#saveBtn');
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 2);
check('duplicate warned, then added after confirm', (await page.locator('#rows tr.row').count()) === 2);

// 2a1. sources and the contact notice
await page.locator('#rows tr.row', { hasText: 'Northgate' }).first().locator('td').first().click();
await page.waitForSelector('#modal.open');
await page.click('#tabs [data-tab=sources]');
await page.click('#addSrc');
await page.selectOption('#srcs .srcrow select', 'google');
await page.fill('#srcs .srcrow [data-f=url]', 'https://www.google.com/search?q=northgate+email');
await page.fill('#srcs .srcrow [data-f=gave]', 'email');
await page.fill('#srcs .srcrow [data-f=note]', 'AI overview; not on their site');
check('a source row defaults its date to today', (await page.inputValue('#srcs .srcrow [data-f=found_on]')) === today);
// attach a screenshot: a 2400px PNG is shrunk to a 1600px JPEG in the browser before upload
const bigPng = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 2400; c.height = 1200; const g = c.getContext('2d'); g.fillStyle = '#4a7'; g.fillRect(0, 0, 2400, 1200); return c.toDataURL('image/png'); });
await page.setInputFiles('#shotFile', { name: 'contact-page.png', mimeType: 'image/png', buffer: Buffer.from(bigPng.split(',')[1], 'base64') });
await page.fill('#shotLabel', 'contact page with the notice');
await page.click('#shotBtn');
await page.waitForFunction(() => document.querySelectorAll('#shots .shot').length === 1);
const shot = [...FILES._store.entries()][0];
check('the screenshot is stored as a shrunk JPEG with its label', shot && shot[0].endsWith('.jpg') && shot[1].httpMetadata.contentType === 'image/jpeg' && shot[1].customMetadata.label === 'contact page with the notice' && shot[1].buf.byteLength < 200000, shot && [shot[0], shot[1].buf.byteLength]);
check('the thumbnail links to the file through the API', (await page.locator('#shots .shot a.img').getAttribute('href')).includes('/files?key=files%2F'));
await page.fill('input[data-link=facebook]', 'https://www.facebook.com/sdkroofing');
await page.fill('input[data-link=linkedin_person]', 'linkedin.com/in/daniel-kilbride');
await page.click('#tabs [data-tab=legal]');
await page.fill('input[data-link=companies_house]', '09669467');
await page.fill('input[data-legal=legal_name]', 'REGAL ROOFING (LEEDS) LTD');
await page.selectOption('select[data-legal=status]', 'active');
await page.fill('input[data-legal=incorporated]', '2022-02-10');
await page.click('#addDir');
await page.fill('#dirs .dirrow [data-f=name]', 'CARRICK, Thomas Jake');
await page.fill('#dirs .dirrow [data-f=role]', 'Director');
await page.fill('#dirs .dirrow [data-f=appointed]', '2022-02-10');
await page.locator('#dirs .dirrow .use').click();
check('Use as contact turns the register name into First / Last name', (await page.inputValue('input[name=first_name]')) === 'Thomas' && (await page.inputValue('input[name=last_name]')) === 'Carrick' && (await page.inputValue('select[name=title]')) === 'Mr');
check('the Legal tab holds the company number now, not the social grid', (await page.locator('#socialGrid input[data-link=companies_house]').count()) === 0 && (await page.locator('#socialGrid input[data-link]').count()) === 9);
await page.click('#tabs [data-tab=sources]');
check('the tab is called Other and has the social grid', (await page.textContent('#tabs [data-tab=sources]')) === 'Other' && (await page.locator('#socialGrid input[data-link]').count()) === 9);
await page.evaluate(() => { window.__opened = []; window.open = (u, t) => { window.__opened.push(u); return null; }; });
await page.click('#tabs [data-tab=legal]');
await page.locator('input[data-link=companies_house]').locator('xpath=..').locator('button.fopen').click();
await page.click('#tabs [data-tab=sources]');
check('a bare company number opens its Companies House page', (await page.evaluate(() => window.__opened))[0] === 'https://find-and-update.company-information.service.gov.uk/company/09669467');
await page.fill('textarea[name=notice]', 'contact page: "no SEO or marketing enquiries"');
check('typing a notice shows the red warning line', (await page.locator('#holdLine').isVisible()) && /Their notice: contact page/.test(await page.textContent('#holdLine')) && (await page.locator('#holdLine.notice').count()) === 1);
await page.click('#saveBtn');
await page.waitForFunction(() => !document.getElementById('modal').classList.contains('open'));
const withSrc = (await (await fetch(base + '/api/prospects')).json()).prospects.find((p) => p.notice);
check('server stored the register entry and the director', withSrc && withSrc.legal && withSrc.legal.legal_name === 'REGAL ROOFING (LEEDS) LTD' && withSrc.legal.status === 'active' && withSrc.legal.incorporated === '2022-02-10' && withSrc.legal.directors.length === 1 && withSrc.legal.directors[0].name === 'CARRICK, Thomas Jake' && withSrc.legal.directors[0].appointed === '2022-02-10', JSON.stringify(withSrc && withSrc.legal));
check('server stored the links, dropping blanks', withSrc && withSrc.links && withSrc.links.facebook === 'https://www.facebook.com/sdkroofing' && withSrc.links.linkedin_person === 'linkedin.com/in/daniel-kilbride' && withSrc.links.companies_house === '09669467' && !('instagram' in withSrc.links), JSON.stringify(withSrc && withSrc.links));
check('server stored the source and the notice', withSrc && withSrc.sources.length === 1 && withSrc.sources[0].kind === 'google' && withSrc.sources[0].gave === 'email' && withSrc.sources[0].found_on === today && withSrc.notice.startsWith('contact page'), JSON.stringify(withSrc && { s: withSrc.sources, n: withSrc.notice }));
check('the row shows a notice tag', (await page.locator('#rows tr.row', { hasText: 'Northgate' }).first().locator('.tag', { hasText: 'notice' }).count()) === 1);
const csvSrc = await (await fetch(base + '/api/prospects?format=csv')).text();
check('export carries the register entry as text', /,legal,/.test(csvSrc.split('\r\n')[0]) && /legal_name=REGAL ROOFING \(LEEDS\) LTD; status=active; incorporated=2022-02-10; directors=CARRICK  Thomas Jake\/Director\/2022-02-10/.test(csvSrc), (csvSrc.match(/legal_name=[^,"]*/) || [''])[0]);
check('export carries links as key=value pairs', /,links,/.test(csvSrc.split('\r\n')[0]) && /facebook=https:\/\/www\.facebook\.com\/sdkroofing; linkedin_person=linkedin\.com\/in\/daniel-kilbride; companies_house=09669467/.test(csvSrc), csvSrc.slice(0, 100));
check('export carries sources as text and the notice', /,sources,links,legal,notice,/.test(csvSrc.split('\r\n')[0]) && /google \| https:\/\/www\.google\.com\/search\?q=northgate\+email \| email \| \d{4}-\d{2}-\d{2} \| AI overview/.test(csvSrc));
await page.locator('#rows tr.row', { hasText: 'Northgate' }).first().locator('td').first().click();
await page.waitForSelector('#modal.open');
await page.click('#tabs [data-tab=sources]');
check('reopening shows the director row', (await page.locator('#dirs .dirrow').count()) === 1 && (await page.inputValue('#dirs .dirrow [data-f=name]')) === 'CARRICK, Thomas Jake');
check('reopening shows the saved links', (await page.inputValue('input[data-link=facebook]')) === 'https://www.facebook.com/sdkroofing' && (await page.inputValue('input[data-link=instagram]')) === '');
check('reopening shows the saved source row', (await page.locator('#srcs .srcrow').count()) === 1 && (await page.inputValue('#srcs .srcrow [data-f=gave]')) === 'email');
await page.fill('textarea[name=notice]', '');
await page.locator('#srcs .srcrow .x').click();
await page.click('#saveBtn');
await page.waitForFunction(() => !document.getElementById('modal').classList.contains('open'));

// 2a2. the next new record defaults to the last saved region
await page.click('#addBtn');
await page.fill('input[name=company]', 'Leeds Example Roofing');
await page.fill('input[name=region]', 'West Yorkshire');
await page.click('#saveBtn');
await page.waitForFunction(() => !document.getElementById('modal').classList.contains('open'));
await page.click('#addBtn');
check('a new record defaults to the region last saved', (await page.inputValue('input[name=region]')) === 'West Yorkshire');
await page.click('#cancelBtn');
await page.locator('#rows tr.row', { hasText: 'Leeds Example' }).locator('td').first().click();
await page.waitForSelector('#modal.open');
await page.click('#deleteBtn');
await page.waitForFunction(() => !/Leeds Example/.test(document.getElementById('rows').textContent));

// 2b. a company with several offices: extra location rows, shown in the list, editable, removable
await page.click('#addBtn');
await page.fill('input[name=company]', 'SWF Roofers and Builders Ltd');
await page.fill('input[name=website]', 'swf-example.co.uk');
await page.fill('input[name=town]', 'Shropshire');
await page.fill('input[name=phone]', '01948 818417');
await page.click('#addLoc');
await page.fill('#locs .extra:nth-of-type(2) [data-f=name]', 'Cheshire');
await page.fill('#locs .extra:nth-of-type(2) [data-f=phone]', '01244 456145');
await page.click('#addLoc');
await page.fill('#locs .extra:nth-of-type(3) [data-f=name]', 'Warrington');
await page.fill('#locs .extra:nth-of-type(3) [data-f=phone]', '01925 393164');
await page.fill('#locs .extra:nth-of-type(3) [data-f=address]', '1 Mersey Street, Warrington');
await page.fill('#locs .extra:nth-of-type(3) [data-f=mobile]', '07700 900123');
await page.fill('input[name=mobile]', '07875 464214');
check('two extra location rows in the form', (await page.locator('#locs .extra').count()) === 2);
check('Manufacturing ticked by default on a new record', (await page.locator('#tradeChips .chip.on').allTextContents()).join() === 'Manufacturing');
await page.locator('#tradeChips .chip', { hasText: 'Retail' }).first().click();
await page.fill('#tradeOther', 'Exports');
await page.press('#tradeOther', 'Enter');
check('ticking Retail and adding Exports gives three segments', (await page.inputValue('input[name=trade]')) === 'Manufacturing, Retail, Exports' && (await page.locator('#tradeChips .chip.on').count()) === 3, await page.inputValue('input[name=trade]'));
check('Enter in the segment box did not submit the form', await page.locator('#modal.open').count() === 1);
await page.click('#saveBtn');
await page.waitForFunction(() => !document.getElementById('modal').classList.contains('open'));
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 3);
const swfRow = page.locator('#rows tr.row', { hasText: 'SWF Roofers' });
const swfText = (await swfRow.textContent()).replace(/\s+/g, ' ');
check('list line shows all three segments', /Manufacturing · Retail · Exports/.test(swfText), swfText.slice(0, 120));
await page.selectOption('#tradeFilter', 'Exports');
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 1);
check('Trade filter narrows to the firms offering it', (await page.textContent('#rows')).includes('SWF Roofers'));
check('filter options carry counts', /Manufacturing \(3\)/.test(await page.textContent('#tradeFilter')), await page.textContent('#tradeFilter'));
await page.selectOption('#tradeFilter', '');
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 3);
await page.locator('#rows tr.row', { hasText: 'SWF Roofers' }).locator('td').first().click();
await page.waitForSelector('#modal.open');
check('reopening shows the three segments ticked, custom one included', (await page.locator('#tradeChips .chip.on').allTextContents()).join() === 'Manufacturing,Retail,Exports', (await page.locator('#tradeChips .chip.on').allTextContents()).join());
await page.click('#cancelBtn');
await page.waitForFunction(() => !document.getElementById('modal').classList.contains('open'));
check('list shows "+2 locations" and the other phones', /\+2 locations/.test(swfText) && /Cheshire 01244 456145/.test(swfText) && /Warrington 01925 393164/.test(swfText), swfText.slice(0, 200) + ' || ' + (await swfRow.evaluate((tr) => tr.children[0].innerHTML + ' ## ' + tr.children[1].innerHTML)) + ' || ' + JSON.stringify((await (await fetch(base + '/api/prospects')).json()).prospects.find((p) => /SWF/.test(p.company))));
await page.fill('#q', '01925');
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 1);
check('search finds a prospect by a secondary phone number', (await page.textContent('#rows')).includes('SWF Roofers'));
await page.fill('#q', '');
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 3);
await page.locator('#rows tr.row', { hasText: 'SWF Roofers' }).locator('td').first().click();
await page.waitForSelector('#modal.open');
check('reopening shows the saved extra locations', (await page.locator('#locs .extra').count()) === 2 && (await page.inputValue('#locs .extra:nth-of-type(3) [data-f=address]')) === '1 Mersey Street, Warrington');
check('an existing record opens on the Details tab, Details is the first tab button', (await page.locator('section.tab[data-tab=details]').isVisible()) && !(await page.locator('section.tab[data-tab=send]').isVisible()) && (await page.locator('#tabs button').first().getAttribute('data-tab')) === 'details');
await page.waitForFunction(() => document.activeElement && document.activeElement.name === 'website', null, { timeout: 2000 }).catch(() => {});
check('with no contact-form link the website is focused and selected, ready to copy', await page.evaluate(() => { const a = document.activeElement; return a && a.name === 'website' && a.selectionEnd - a.selectionStart === a.value.length && a.value === 'https://swf-example.co.uk'; }), await page.evaluate(() => { const a = document.activeElement; return a && [a.name, a.value, a.selectionStart, a.selectionEnd].join('|'); }));
await page.evaluate(() => { window.__opened = []; window.open = (u, t) => { window.__opened.push([u, t]); return null; }; });
await page.locator('input[name=website]').locator('xpath=..').locator('button.fopen').click();
const opened = await page.evaluate(() => window.__opened);
check('the ↗ icon beside Website opens it in a new tab with https', opened.length === 1 && opened[0][0] === 'https://swf-example.co.uk' && opened[0][1] === '_blank', JSON.stringify(opened));
await page.locator('input[name=contact_form_url]').locator('xpath=..').locator('button.fopen').click();
check('an empty link says so instead of opening', /No link yet/.test(await page.textContent('#toast')));
await page.click('#tabs [data-tab=send]');
check('the Send tab shows the phones and mobiles in the header', /01948 818417 · 07875 464214 · Cheshire 01244 456145 · Warrington 01925 393164 \/ 07700 900123/.test(await page.textContent('#sendContact')), await page.textContent('#sendContact'));
await page.click('#tabs [data-tab=details]');
await page.click('#locs .extra:nth-of-type(2) .x');
check('× removes a location row', (await page.locator('#locs .extra').count()) === 1);
await page.click('#saveBtn');
await page.waitForFunction(() => !document.getElementById('modal').classList.contains('open'));
await page.waitForFunction(() => /\+1 location(?!s)/.test(document.getElementById('rows').textContent));
check('after removing one, list says "+1 location"', true);
const swfApi = (await (await fetch(base + '/api/prospects')).json()).prospects.find((p) => p.company === 'SWF Roofers and Builders Ltd');
check('server kept the remaining location', swfApi && swfApi.locations.length === 1 && swfApi.locations[0].name === 'Warrington', JSON.stringify(swfApi && swfApi.locations));
await page.locator('#rows tr.row', { hasText: 'SWF Roofers' }).locator('td').first().click();
await page.waitForSelector('#modal.open');
await page.click('#deleteBtn');
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 2);

// 2b2. WhatsApp: number on Details, one-click button on Send with the message pre-filled
await page.click('#addBtn');
await page.fill('input[name=company]', 'AB Roofing Specialists');
await page.fill('input[name=town]', 'Stockport');
await page.fill('input[name=whatsapp]', '07778 869402');
await page.click('#tabs [data-tab=send]');
await page.fill('textarea[name=note]', 'family-run, 15 years across Manchester and Stockport');
const waHref = await page.getAttribute('#openWa', 'href');
check('Open WhatsApp link targets wa.me with the first-contact text', await page.locator('#openWa').isVisible() && waHref.startsWith('https://wa.me/447778869402?text=') && decodeURIComponent(waHref.split('text=')[1]).startsWith('Hi — Shankar here'), waHref.slice(0, 80));
await page.selectOption('select[name=status]', 'sent');
check('once Applied, the WhatsApp link carries the nudge instead', decodeURIComponent((await page.getAttribute('#openWa', 'href')).split('text=')[1]).startsWith('Hi — Shankar again'));
await page.selectOption('select[name=status]', 'new');
await page.click('#saveBtn');
await page.waitForFunction(() => !document.getElementById('modal').classList.contains('open'));
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 3);
const abRow = page.locator('#rows tr.row', { hasText: 'AB Roofing' });
check('list row has a WhatsApp link', (await abRow.locator('a', { hasText: 'WhatsApp' }).getAttribute('href')) === 'https://wa.me/447778869402');
await abRow.locator('td').first().click();
await page.waitForSelector('#modal.open');
await page.click('#tabs [data-tab=send]');
check('a number: no hint, button says the message is pre-filled', !(await page.locator('#waHint').isVisible()) && /with the message/.test(await page.textContent('#openWa')));
await page.click('#tabs [data-tab=details]');
await page.fill('input[name=whatsapp]', 'https://api.whatsapp.com/message/DP4X7B2TCFCGB1?autoload=1&app_absent=0');
await page.click('#tabs [data-tab=send]');
await page.click('#tabs [data-tab=details]');
await page.locator('input[name=whatsapp]').locator('xpath=..').locator('button.fcopy').click();
check('the copy icon beside a field copies its value', (await page.evaluate(() => navigator.clipboard.readText())) === 'https://api.whatsapp.com/message/DP4X7B2TCFCGB1?autoload=1&app_absent=0');
await page.locator('input[name=email]').locator('xpath=..').locator('button.fcopy').click();
check('an empty field says so instead of copying', /Nothing to copy/.test(await page.textContent('#toast')));
await page.click('#tabs [data-tab=send]');
check('a business message link opens as given, with the paste hint', (await page.getAttribute('#openWa', 'href')) === 'https://api.whatsapp.com/message/DP4X7B2TCFCGB1?autoload=1&app_absent=0' && (await page.locator('#waHint').isVisible()) && /their WhatsApp/.test(await page.textContent('#openWa')));
await page.click('#saveBtn');
await page.waitForFunction(() => !document.getElementById('modal').classList.contains('open'));
check('list link uses the message link too', (await page.locator('#rows tr.row', { hasText: 'AB Roofing' }).locator('a', { hasText: 'WhatsApp' }).getAttribute('href')) === 'https://api.whatsapp.com/message/DP4X7B2TCFCGB1?autoload=1&app_absent=0');
await page.locator('#rows tr.row', { hasText: 'AB Roofing' }).locator('td').first().click();
await page.waitForSelector('#modal.open');
await page.click('#deleteBtn');
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 2);

// 2b3. on hold: the inline status select opens the reason popup; cancel reverts; confirm schedules the retry
const forgedSel = page.locator('#rows tr.row', { hasText: 'Northgate' }).first().locator('select');
await forgedSel.selectOption('hold');
await page.waitForSelector('#holdModal.open');
check('choosing On hold opens the reason popup', /northgate/i.test(await page.textContent('#holdTitle')));
await page.click('#holdCancel');
await page.waitForFunction(() => !document.getElementById('holdModal').classList.contains('open'));
check('cancel puts the select back', (await forgedSel.inputValue()) === 'new');
await forgedSel.selectOption('hold');
await page.waitForSelector('#holdModal.open');
await page.locator('#holdChips .chip', { hasText: 'Recruiter gone quiet' }).click();
await page.selectOption('#holdNext', 'phone');
await page.click('#holdOk');
await page.waitForFunction(() => !document.getElementById('holdModal').classList.contains('open'));
await page.waitForFunction(() => /Recruiter gone quiet/.test(document.getElementById('rows').textContent));
const held = (await (await fetch(base + '/api/prospects')).json()).prospects.find((p) => /northgate/i.test(p.company) && p.status === 'hold');
check('server has hold + reason + phone channel + a retry date', !!held && held.hold_reason === 'Recruiter gone quiet' && held.channel === 'phone' && /^\d{4}-\d{2}-\d{2}$/.test(held.followup_due) && held.followup_due > today, JSON.stringify(held && { s: held.status, r: held.hold_reason, c: held.channel, d: held.followup_due }));
check('row shows the reason and the retry', /Recruiter gone quiet · phone/.test((await page.locator('#rows tr.row', { hasText: 'Northgate' }).first().textContent()).replace(/\s+/g, ' ')));
check('chips count the hold', /On hold\s*1/.test((await page.textContent('#chips')).replace(/\s+/g, ' ')));
check('the reason row is hidden until On hold is chosen', !(await page.locator('#holdChipsBar').isVisible()));
await page.locator('#chips .chip', { hasText: 'On hold' }).click();
check('choosing On hold shows a reason chip with its count', (await page.locator('#holdChipsBar').isVisible()) && /Recruiter gone quiet\s*1/.test((await page.textContent('#holdChipsBar')).replace(/\s+/g, ' ')), await page.textContent('#holdChipsBar'));
await page.locator('#holdChipsBar .chip', { hasText: 'Recruiter gone quiet' }).click();
check('the reason chip filters the list to that reason', (await page.locator('#rows tr.row').count()) === 1 && /northgate/i.test(await page.textContent('#rows')), (await page.locator('#rows tr.row').count()) + ' rows');
await page.locator('#chips .chip', { hasText: 'All' }).first().click();
check('leaving On hold clears the reason filter and hides the row', !(await page.locator('#holdChipsBar').isVisible()) && (await page.locator('#rows tr.row').count()) > 1);
await page.locator('#rows tr.row', { hasText: 'Northgate' }).first().locator('td').first().click();
await page.waitForSelector('#modal.open');
check('the hold line shows above the tabs, on Details too', (await page.locator('#holdLine').isVisible()) && (await page.locator('section.tab[data-tab=details]').isVisible()));
await page.click('#tabs [data-tab=send]');
check('the Send tab shows the hold line', (await page.locator('#holdLine').isVisible()) && /On hold: Recruiter gone quiet/.test(await page.textContent('#holdLine')));
// the reason can be changed from the row without reopening the record
await page.click('#cancelBtn');
await page.locator('#rows tr.row', { hasText: 'Northgate' }).first().locator('a.change').click();
await page.waitForSelector('#holdModal.open');
check('change on the row reopens the popup with the current reason', (await page.inputValue('#holdReason')) === 'Recruiter gone quiet');
await page.locator('#holdChips .chip', { hasText: 'Assessment pending' }).click();
await page.selectOption('#holdNext', 'email');
await page.click('#holdOk');
await page.waitForFunction(() => /Assessment pending/.test(document.getElementById('rows').textContent));
check('the new reason and retry saved from the row', /Assessment pending.*email/.test((await page.locator('#rows tr.row', { hasText: 'Northgate' }).first().textContent()).replace(/\s+/g, ' ')));
await page.locator('#rows tr.row', { hasText: 'Northgate' }).first().locator('td').first().click();
await page.waitForSelector('#modal.open');
await page.click('#holdChange');
await page.waitForSelector('#holdModal.open');
await page.waitForFunction(() => /Assessment pending/.test(document.getElementById('holdReason').value));
await page.fill('#holdReason', 'Recruiter gone quiet');
await page.waitForFunction(() => document.getElementById('holdReason').value === 'Recruiter gone quiet');
await page.selectOption('#holdNext', 'phone');
await page.click('#holdOk');
check('change on the form updates the line, pending Save', /On hold: Recruiter gone quiet/.test(await page.textContent('#holdLine')), await page.textContent('#holdLine'));
await page.click('#tabs [data-tab=send]');
await page.selectOption('select[name=status]', 'new');
check('leaving hold in the form hides the hold line', !(await page.locator('#holdLine').isVisible()));
await page.click('#saveBtn');
await page.waitForFunction(() => !document.getElementById('modal').classList.contains('open'));
await page.waitForFunction(() => !/Recruiter gone quiet · phone/.test(document.getElementById('rows').textContent));
check('back to Found, reason gone', true);

// 2c. website status: a tag on the row and a Web leads filter
await page.click('#addBtn');
await page.fill('input[name=company]', 'Millbrook Roofing Ltd');
await page.fill('input[name=town]', 'Bramhall');
await page.fill('input[name=website]', 'millbrookroofers.co.uk');
await page.selectOption('select[name=website_status]', 'expired');
await page.click('#saveBtn');
await page.waitForFunction(() => !document.getElementById('modal').classList.contains('open'));
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 3);
const millRow = page.locator('#rows tr.row', { hasText: 'Millbrook' });
check('row shows a "posting closed" tag', (await millRow.locator('.tag.web').textContent()) === 'posting closed');
check('stats count stale links', /1 stale link\b/.test((await page.textContent('#stats')).replace(/\s+/g, ' ')), await page.textContent('#stats'));
await page.click('#webBtn');
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 1);
check('Stale links button filters to applications with a dead posting link', (await page.textContent('#rows')).includes('Millbrook') && /Stale links \(1\)/.test(await page.textContent('#webBtn')));
await page.click('#webBtn');
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 3);
await millRow.locator('td').first().click();
await page.waitForSelector('#modal.open');
check('reopening shows the saved website status', (await page.inputValue('select[name=website_status]')) === 'expired');
await page.click('#deleteBtn');
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 2);

// 3. inline status change in the list stamps dates
const sel = page.locator('#rows tr.row').first().locator('select');
await sel.selectOption('sent');
await page.waitForFunction(() => /\d+d ago/.test(document.getElementById('rows').textContent));
const row = await page.locator('#rows tr.row').first().textContent();
check('moving to Applied stamps the date and follow-up', /0d ago/.test(row) && /Follow-up|[A-Z][a-z]{2}/.test(row), row.replace(/\s+/g, ' ').slice(0, 160));
check('chips show Applied 1', /Applied\s*1/.test((await page.textContent('#chips')).replace(/\s+/g, ' ')));

// 4. search and status filter
await page.fill('#q', 'northgate');
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 2);
await page.fill('#q', 'zzz');
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 0);
await page.fill('#q', '');
await page.locator('#chips .chip', { hasText: 'Applied' }).click();
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 1);
check('status chip filters to 1', true);
await page.locator('#chips .chip', { hasText: 'All' }).click();

// 5. board view + drag and drop between columns
await page.click('#viewSeg button[data-view=board]');
await page.waitForSelector('#boardView .col');
check('board has 8 columns', (await page.locator('#boardView .col').count()) === 8);
const card = page.locator('#boardView .col[data-status=sent] .kcard').first();
check('card sits in Contacted column', (await card.count()) === 1);
await card.dragTo(page.locator('#boardView .col[data-status=replied]'));
await page.waitForFunction(() => document.querySelectorAll('#boardView .col[data-status=replied] .kcard').length === 1);
check('drag to Replied moved the card', true);
const viaApi = await (await fetch(base + '/api/prospects')).json();
const moved = viaApi.prospects.find((p) => p.status === 'replied');
check('server has status=replied and last_contact stamped', !!moved && moved.last_contact === today, JSON.stringify(moved && { s: moved.status, lc: moved.last_contact }));
check('board view remembered', await page.evaluate(() => localStorage.getItem('opscrm.view') === 'board'));

// 6. edit modal: copy form message uses the record
await page.locator('#boardView .kcard').first().click();
await page.waitForSelector('#modal.open');
await page.click('#tabs [data-tab=send]');
await page.click('button[data-copy=form]');
const clip = await page.evaluate(() => navigator.clipboard.readText());
check('application note filled from the record, paragraphs, signature, note left out', clip.startsWith('Hi Lee,\n\nI’ve applied for the Bolton role') && clip.includes('India-based, remote-ready') && !clip.includes('CHAS badge') && clip.includes('at Northgate Roofing & Cladding Ltd') && clip.endsWith('vajrapushankar@gmail.com') && !/\[WhatsApp\]/.test(clip), clip.slice(-80));
await page.click('button[data-copy=email]');
check('copying from inside a closed details block does not open it', !(await page.locator('#d_email').evaluate((d) => d.open)));
check('cold email has no WhatsApp placeholder either', !/\[WhatsApp\]/.test(await page.evaluate(() => navigator.clipboard.readText())));
await page.click('button[data-copy=sample]');
check('the CV filename is the one standard file, never per-role', (await page.evaluate(() => navigator.clipboard.readText())) === 'GirijaShankar_Vajrapu_CV.pdf');
check('superuser sees Delete', await page.locator('#deleteBtn').isVisible());
await page.click('#cancelBtn');

// 7. import a prospects.csv through the file input
await page.click('#viewSeg button[data-view=list]');
const csv = fs.readFileSync(new URL('./fixtures/prospects.csv', import.meta.url), 'utf8');
const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('#importBtn')]);
await chooser.setFiles({ name: 'prospects.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length === 4);
check('import added the 2 sheet rows', (await page.textContent('#rows')).includes('Smith & Sons Textiles'));
check('toast reported the import', (await page.textContent('#toast')).includes('Imported 2'));

// 8. follow-ups due filter (sheet row is sent on 27 Oct with follow-up 30 Oct)
await page.click('#dueBtn');
const dueRows = await page.locator('#rows tr.row').count();
check('due filter shows the overdue imported row', dueRows >= 1 && (await page.textContent('#rows')).includes('Smith & Sons Textiles'), String(dueRows));
await page.click('#dueBtn');

// 9. member cannot delete; export link present
env = { DB, FILES, DEV_USER: 'helper@example.com' };
await page.goto(base + '/crm/');
await page.waitForFunction(() => document.getElementById('me').textContent.includes('helper'));
await page.locator('#rows tr.row').first().locator('td').first().click();
await page.waitForSelector('#modal.open');
check('member does not see Delete', !(await page.locator('#deleteBtn').isVisible()));
await page.click('#cancelBtn');
const exp = await fetch(base + '/api/prospects?format=csv');
check('export endpoint serves CSV', exp.headers.get('content-type').includes('text/csv'));

// 10. phone width, no horizontal scroll
const m = await ctx.newPage(); await m.setViewportSize({ width: 390, height: 844 });
await m.goto(base + '/crm/'); await m.waitForFunction(() => document.querySelectorAll('#rows tr.row').length >= 1);
check('no horizontal scroll at 390px (list)', !(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
await m.click('#addBtn'); await m.waitForSelector('#modal.open'); await m.click('#addLoc'); await m.click('#addLoc');
check('form with location rows fits at 390px', !(await m.evaluate(() => { const d = document.querySelector('.dialog'); return d.scrollWidth > d.clientWidth + 1 || document.documentElement.scrollWidth > innerWidth + 1; })));
await m.screenshot({ path: 'tests/out/crm-390-form.png', fullPage: false });
await m.click('#cancelBtn');
await m.click('#viewSeg button[data-view=board]');
check('board scrolls horizontally inside its own box only', !(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
await m.screenshot({ path: 'tests/out/crm-390.png', fullPage: false });
await page.goto(base + '/crm/'); await page.waitForFunction(() => document.getElementById('me').textContent.includes('@')); await page.click('#viewSeg button[data-view=list]'); await page.waitForFunction(() => document.querySelectorAll('#rows tr.row').length >= 1);
await page.screenshot({ path: 'tests/out/crm-1280-list.png', fullPage: true });
await page.click('#viewSeg button[data-view=board]'); await page.waitForSelector('#boardView .col');
await page.screenshot({ path: 'tests/out/crm-1280-board.png', fullPage: true });

} catch (e) { console.log('CRASH', e.message); console.log(results.join('\n')); console.log('page errors:', errors.join(' | ')); await page.screenshot({ path: 'tests/out/crash.png' }).catch(()=>{}); await browser.close(); server.close(); process.exit(1); }
await browser.close(); server.close();
console.log(results.join('\n'));
const fails = results.filter((r) => r.startsWith('FAIL')).length;
console.log(`\n${results.length - fails} passed, ${fails} failed, ${errors.length} page errors`);
if (errors.length) console.log(errors.join('\n'));
process.exit(fails || errors.length ? 1 : 0);
