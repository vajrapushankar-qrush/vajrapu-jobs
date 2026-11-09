// The application messages, built from an Applications record. One file, used by the
// Applications page (loaded as /messages.js). Edit the wording here; the copy buttons update live.
//
// Field meanings on this site: town = role title · trade = bucket/segment (P1/P2/P3…) ·
// first_name/last_name = the recruiter or hiring manager · contact_form_url = the job posting URL.
(function (root) {
  // linkedin: your public profile URL (fill it once; it goes into every message that wants it).
  // cvFile: the one standard CV's filename — the same file every time, never tailored per role.
  var CONFIG = { name: 'Girija Shankar Vajrapu', shortName: 'Shankar', email: 'vajrapushankar@gmail.com', phone: '+91 73963 13939', linkedin: '', cvFile: 'GirijaShankar_Vajrapu_CV.pdf', whatsapp: '', firstLine: false };

  function slug(s) { return String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
  /** "98765 43210" -> "919876543210", "07778 869402" -> "447778869402", "+44…"/"+91…" kept, for wa.me links. */
  function waDigits(n) {
    var d = String(n || '').replace(/\D/g, '');
    if (d.indexOf('00') === 0) d = d.slice(2);
    if (d.indexOf('0') === 0 && d.length === 11) d = '44' + d.slice(1); // UK mobile written 07…
    else if (d.indexOf('0') === 0) d = '91' + d.slice(1);               // Indian number written with a leading 0
    else if (d.length === 10) d = '91' + d;                             // bare Indian mobile
    return d;
  }

  /** p: an Applications record or form values (company, title, first_name, last_name, town=role, trade=bucket, note). */
  function build(p, cfg) {
    var c = cfg || CONFIG;
    var company = (p.company || '').trim() || '[Company]';
    var role = (p.town || '').trim() || 'Forward Deployed Engineer';
    var firstName = (p.first_name || '').trim();
    var formal = [(p.title || '').trim(), (p.last_name || '').trim()].filter(Boolean).join(' ');
    var greet = firstName ? 'Hi ' + firstName : ((p.title || '').trim() && (p.last_name || '').trim() ? 'Hi ' + formal : 'Hi');
    var bucket = String(p.trade || '').split(',')[0].trim();
    var isP1 = /sap|erp|finance|P1/i.test(bucket);
    var line = c.firstLine ? ((p.note || '').trim().replace(/[.\s]+$/, '') || '[one line about the role]') : '';
    var Line = line.charAt(0).toUpperCase() + line.slice(1);
    var contact = [c.phone, c.email].filter(Boolean).join(' · ');
    var sig = c.name + '\n' + contact + (c.linkedin ? '\n' + c.linkedin : '');

    // The spine of every message: 15 years at one intersection, said in one breath.
    var pitch = isP1
      ? 'I’m a 15-year enterprise-finance technologist: ~12 years architecting SAP FICO / SAP Analytics Cloud FP&A systems for global companies (a 14-market SAC transformation among them), and the last 3 years shipping production GenAI end to end — RAG, multi-agent orchestration, MCP tool-use — including an AR-collections agent that runs live against accounting ledgers. The role sits exactly on that overlap: AI deployed into enterprise finance systems that I already speak natively.'
      : 'I’m a 15-year enterprise technologist who spent the last 3 years shipping production GenAI end to end — RAG, multi-agent orchestration, MCP tool-use — including an AR-collections agent running live against accounting ledgers, built and operated solo. Before that: ~12 years deploying mission-critical systems (SAP) inside large, messy customer environments, which is the actual job of a forward-deployed engineer.';

    var jobType = greet + ' — I’ve applied for the ' + role + ' opening at ' + company + '. 15 years in enterprise systems (SAP finance) + 3 years building production AI agents; deploying AI into customer environments is the work I already do. Keen to connect. — ' + c.shortName;

    var form = greet + ',\n\nI’ve applied for the ' + role + ' role at ' + company + (line ? ' — ' + line + '.' : '.') + ' ' + pitch + '\n\nI’m India-based, remote-ready across UK/US hours, and can start within two weeks. CV attached; happy to walk through any of the systems live.\n\n' + sig;

    var email = 'Subject: Application — ' + role + ', ' + company + ' · ' + c.name + '\n\n' + greet + ',\n\n' + (Line ? Line + '. ' : '') + 'I’ve just applied for the ' + role + ' role and wanted to put a face on the application. ' + pitch + '\n\nThe standard CV is attached (' + c.cvFile + '). If it’s worth a conversation, I keep 19:30–22:30 IST free for US/EU time zones — happy to take any slot in that window.\n\n' + sig;

    var fu1 = greet + ' — following up on my application for the ' + role + ' role at ' + company + ' a few days ago. The short version: 15 years in SAP enterprise finance + 3 years shipping production AI agents, remote from India, start within two weeks. Happy to share a 3-minute demo of a collections agent I built and run in production. ' + c.shortName + ' · ' + c.email;

    var fu2 = greet + ' — last note from me on the ' + role + ' application. If the timing isn’t right at ' + company + ', no problem at all; if a similar role opens later, I’d be glad to hear about it. ' + c.shortName + ' · ' + (c.linkedin || c.email);

    var reply = greet + ',\n\nThanks for coming back to me — glad the profile landed. Two concrete slots that work across time zones: tomorrow 19:30–21:30 IST, or the day after in the same window (that’s 2–4pm UK / 9–11am ET). If neither fits, name a time and I’ll make it work.\n\nBefore we speak, the 3-minute demo of the collections agent I built and operate is the fastest way to see how I work: happy to send it here.\n\n' + sig;

    var wa = greet + ' — ' + c.shortName + ' here, about the ' + role + ' role at ' + company + '. 15 yrs SAP enterprise finance + 3 yrs production AI agents, applying from India for remote. My application is in — happy to share my CV and a 3-min demo here if useful. ' + c.email;

    var waNudge = greet + ' — ' + c.shortName + ' again, about the ' + role + ' role at ' + company + ' from a few days back. Still very interested; CV and a 3-minute demo are one message away if helpful.';

    return {
      jobType: jobType,
      wa: wa,
      waNudge: waNudge,
      form: form,
      email: email,
      fu1: fu1,
      fu2: fu2,
      reply: reply,
      sample: c.cvFile,
    };
  }

  root.OPS_CONFIG = CONFIG;
  root.OPS_MESSAGES = build;
  /**
   * What is in the WhatsApp field -> how to open it.
   * A number -> wa.me/<digits>, and the message can be pre-filled.
   * A link (wa.me/message/CODE, api.whatsapp.com/message/CODE, wa.me/qr/…, a username link) -> opened
   * as given; those links cannot carry a pre-filled message, so the text is copied instead.
   * Returns null when the field is empty.
   */
  function waLink(raw, text) {
    var s = String(raw || '').trim();
    if (!s) return null;
    var looksLikeLink = /^(https?:\/\/|www\.)/i.test(s) || /(^|\/)(wa\.me|api\.whatsapp\.com|whatsapp\.com|chat\.whatsapp\.com)\b/i.test(s) || /^@[\w.]+$/.test(s);
    if (!looksLikeLink) {
      var d = waDigits(s);
      if (d.length < 10) return null;
      return { href: 'https://wa.me/' + d + (text ? '?text=' + encodeURIComponent(text) : ''), prefilled: !!text, kind: 'number' };
    }
    if (/^@[\w.]+$/.test(s)) s = 'wa.me/' + s;
    var m = s.match(/wa\.me\/(\d{10,15})(?:[/?#]|$)/i) || s.match(/[?&]phone=(\d{10,15})/i);
    if (m) return { href: 'https://wa.me/' + m[1] + (text ? '?text=' + encodeURIComponent(text) : ''), prefilled: !!text, kind: 'number' };
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
    return { href: s, prefilled: false, kind: 'link' };
  }

  root.OPS_SLUG = slug;
  root.OPS_WA_DIGITS = waDigits;
  root.OPS_WA_LINK = waLink;
})(typeof globalThis !== 'undefined' ? globalThis : this);
