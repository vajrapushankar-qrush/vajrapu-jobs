// The Today-page KPI strip. Reads the live Applications data (/api/prospects) and the
// targets injected by index.astro as window.OPS_TARGETS, and fills in:
//   applied today vs the 10/day target · applications out & follow-ups due ·
//   interview countdown · offer countdown.
// Status meanings here: sent=Applied, replied=Replied, intake=Interviewing, client=Offer.
// If the API isn't reachable the strip shows em-dashes and leaves the explaining to tasks.js.
(function () {
  var box = document.getElementById('kpis');
  var T = window.OPS_TARGETS;
  if (!box || !T) return;

  function localIso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  var todayIso = localIso(new Date());
  function daysUntil(iso) { return Math.round((new Date(iso + 'T00:00:00') - new Date(todayIso + 'T00:00:00')) / 86400000); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function weekStartIso() { var d = new Date(todayIso + 'T00:00:00'); var dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); return localIso(d); }

  function card(label, value, sub, extraHtml, cls) {
    return '<div class="kpi card' + (cls ? ' ' + cls : '') + '"><p class="klabel">' + esc(label) + '</p><p class="kvalue">' + value + '</p>' +
      (extraHtml || '') + (sub ? '<p class="ksub">' + sub + '</p>' : '') + '</div>';
  }

  function render(ps) {
    var appliedTotal = 0, appliedToday = 0, appliedWeek = 0, replied = 0, interviewing = 0, offers = 0, due = 0;
    var monday = weekStartIso();
    (ps || []).forEach(function (p) {
      if (p.sent_at) {
        appliedTotal++;
        if (p.sent_at === todayIso) appliedToday++;
        if (p.sent_at >= monday) appliedWeek++;
      }
      if (p.status === 'replied') replied++;
      if (p.status === 'intake') interviewing++;
      if (p.status === 'client') offers++;
      if ((p.status === 'sent' || p.status === 'hold') && p.followup_due && p.followup_due <= todayIso) due++;
    });

    var pct = Math.min(100, Math.round((appliedToday / T.appsPerDay) * 100));
    var bar = '<div class="pbar kbar"><div class="pfill" style="width:' + pct + '%"></div></div>';

    var d1 = daysUntil(T.firstInterviewBy);
    var intVal, intSub, intCls = '';
    if (interviewing >= 1) {
      intVal = '✓ ' + interviewing + ' in progress';
      intSub = replied + ' more replied · keep the drills going';
      intCls = 'good';
    } else {
      intVal = d1 >= 0 ? d1 + ' day' + (d1 === 1 ? '' : 's') + ' left' : Math.abs(d1) + 'd overdue';
      intSub = 'first interview by 24 Nov' + (replied ? ' · ' + replied + ' replied — convert them' : '');
      if (d1 < 0) intCls = 'late'; else if (d1 <= 4) intCls = 'warn';
    }

    var d2 = daysUntil(T.offerBy);
    var offVal, offSub, offCls = '';
    if (offers >= 1) {
      offVal = '✓ ' + offers + ' offer' + (offers > 1 ? 's' : '');
      offSub = 'compare, negotiate, decide — the sprint worked';
      offCls = 'good';
    } else {
      offVal = d2 >= 0 ? d2 + ' days left' : Math.abs(d2) + 'd overdue';
      offSub = 'remote offer signed by 16 Jan';
      if (d2 < 0) offCls = 'late'; else if (d2 <= 14) offCls = 'warn';
    }

    box.innerHTML =
      card('Applied today · target ' + T.appsPerDay, appliedToday + '<span class="kunit">/' + T.appsPerDay + '</span>', (appliedToday >= T.appsPerDay ? 'done — stop at the bell' : 'long shots (P3) count ≤' + T.p3DailyCap), bar, appliedToday >= T.appsPerDay ? 'good' : '') +
      card('Applications out', String(appliedTotal), appliedWeek + ' this week · <a href="/crm/">' + due + ' follow-up' + (due === 1 ? '' : 's') + ' due</a>') +
      card('First interview', intVal, intSub, '', intCls) +
      card('Offer', offVal, offSub, '', offCls);
  }

  box.innerHTML = card('Applied today', '—', 'loading…') + card('Applications out', '—', '') + card('First interview', '—', '') + card('Offer', '—', '');

  fetch('/api/prospects', { credentials: 'same-origin' })
    .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw j; return j; }); })
    .then(function (j) { render(j.prospects || []); })
    .catch(function () {
      box.innerHTML = card('Applied today', '—', 'sign in to load KPIs') + card('Applications out', '—', '') + card('First interview', '—', '') + card('Offer', '—', '');
    });
})();
