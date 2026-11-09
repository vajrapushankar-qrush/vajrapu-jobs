// Hydrates task checkboxes from /api/ticks, posts changes back, keeps progress counters
// fresh, and (on the Today page) reveals today's section and the carried-over notice.
// Loaded by / and /tasks/; does nothing on pages without task checkboxes.
(function () {
  var boxes = Array.prototype.slice.call(document.querySelectorAll('input[data-task]'));
  if (!boxes.length) return;
  var $ = function (id) { return document.getElementById(id); };

  function localIso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  var todayIso = localIso(new Date());

  function showAuthProblem(msg, fix) {
    var n = $('authNotice');
    if (!n) return;
    n.innerHTML = '<b>Ticks aren’t syncing.</b> ' + msg + (fix ? ' ' + fix : '') + ' You can still read everything; checkboxes won’t save.';
    n.style.display = '';
  }

  function rowOf(box) { var r = box; while (r && !r.hasAttribute('data-task-row')) r = r.parentElement; return r; }
  function applyRow(box) { var r = rowOf(box); if (r) r.classList.toggle('done', box.checked); }

  function updateProgress() {
    var sections = document.querySelectorAll('section[data-day]');
    var allDone = 0, allTotal = 0;
    Array.prototype.forEach.call(sections, function (sec) {
      var bs = sec.querySelectorAll('input[data-task]');
      var done = 0;
      Array.prototype.forEach.call(bs, function (b) { if (b.checked) done++; });
      allDone += done; allTotal += bs.length;
      var p = sec.querySelector('[data-day-progress]');
      if (p) p.textContent = done + '/' + bs.length;
      sec.classList.toggle('alldone', bs.length > 0 && done === bs.length);
    });
    var fill = document.querySelector('[data-overall-fill]');
    var text = document.querySelector('[data-overall-text]');
    if (fill) fill.style.width = (allTotal ? Math.round((allDone / allTotal) * 100) : 0) + '%';
    if (text) text.textContent = allDone + '/' + allTotal;
  }

  function applyRemainingFilter() {
    var cb = $('remainingOnly');
    if (!cb) return;
    document.body.classList.toggle('remaining-only', cb.checked);
  }

  // ----- Today page: reveal today's section, compute carried-over -----
  var isTodayPage = !!$('carried');
  function revealToday() {
    if (!isTodayPage) return;
    var sections = document.querySelectorAll('section[data-day]');
    var shown = false;
    var carriedIds = [];
    Array.prototype.forEach.call(sections, function (sec) {
      var date = sec.getAttribute('data-date');
      if (date === todayIso) { sec.hidden = false; shown = true; }
      if (date < todayIso) {
        Array.prototype.forEach.call(sec.querySelectorAll('input[data-task]'), function (b) {
          if (!b.checked) carriedIds.push({ sec: sec, box: b });
        });
      }
    });
    var no = $('noToday');
    if (no) no.style.display = shown ? 'none' : '';
    var c = $('carried');
    if (carriedIds.length) {
      var byDay = {};
      carriedIds.forEach(function (x) { var d = x.sec.getAttribute('data-day'); byDay[d] = (byDay[d] || 0) + 1; });
      var days = Object.keys(byDay).sort(function (a, b) { return a - b; });
      c.innerHTML = '<b>' + carriedIds.length + ' task' + (carriedIds.length > 1 ? 's' : '') + ' carried over</b> from ' +
        days.map(function (d) { return '<a href="/tasks/#d' + String(d).padStart(2, '0') + '">Day ' + d + '</a> (' + byDay[d] + ')'; }).join(', ') +
        '. Finish or consciously drop them — don’t let them rot.';
      c.style.display = '';
    } else {
      c.style.display = 'none';
    }
  }

  // ----- Tasks page: highlight today, jump button -----
  function markToday() {
    var jump = $('jumpToday');
    var target = null;
    Array.prototype.forEach.call(document.querySelectorAll('section[data-day]'), function (sec) {
      if (sec.getAttribute('data-date') === todayIso) { sec.classList.add('today'); target = sec; }
    });
    if (jump) {
      jump.style.display = target ? '' : 'none';
      jump.addEventListener('click', function () { if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    }
  }

  // ----- wire the boxes -----
  boxes.forEach(function (b) {
    b.disabled = true; // until the first fetch answers, so a tap can't be lost
    b.addEventListener('change', function () {
      applyRow(b); updateProgress();
      var id = b.dataset.task, done = b.checked;
      fetch('/api/ticks', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: id, done: done }) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status)); }); })
        .catch(function (e) { b.checked = !done; applyRow(b); updateProgress(); showAuthProblem(e.message); });
    });
  });

  fetch('/api/ticks', { credentials: 'same-origin' })
    .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw j; return j; }); })
    .then(function (j) {
      var t = j.ticks || {};
      boxes.forEach(function (b) { b.checked = !!t[b.dataset.task]; b.disabled = false; applyRow(b); });
      updateProgress(); revealToday(); markToday(); applyRemainingFilter();
    })
    .catch(function (e) {
      boxes.forEach(function (b) { b.disabled = false; });
      updateProgress(); revealToday(); markToday(); applyRemainingFilter();
      showAuthProblem((e && e.error) || 'Could not reach /api/ticks.', e && e.fix);
    });

  var cb = $('remainingOnly');
  if (cb) cb.addEventListener('change', applyRemainingFilter);
})();
