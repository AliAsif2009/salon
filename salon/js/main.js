/* ========= DATA (edit prices/services here) ========= */
const SERVICES = {
  Hair: [
    { id: 'cut-w', name: "Women's cut & style", d: 'Consultation, wash, precision cut, blow-dry', p: 75, m: 60 },
    { id: 'cut-m', name: "Men's cut", d: 'Clipper or scissor cut with finish', p: 45, m: 40 },
    { id: 'color', name: 'Full color', d: 'Single-process color with gloss', p: 130, m: 120 },
    { id: 'bal', name: 'Balayage', d: 'Hand-painted highlights, toner and style', p: 220, m: 180 },
    { id: 'kera', name: 'Keratin smoothing', d: 'Frizz control that lasts up to 4 months', p: 250, m: 150 },
    { id: 'blow', name: 'Blowout', d: 'Wash and salon-quality blow-dry', p: 50, m: 45 }
  ],
  Skin: [
    { id: 'face', name: 'Signature facial', d: 'Cleanse, exfoliate, extract, mask', p: 95, m: 60 },
    { id: 'hydra', name: 'Hydrating facial', d: 'Deep moisture for dry or dull skin', p: 120, m: 75 },
    { id: 'peel', name: 'Chemical peel', d: 'Brightens tone and smooths texture', p: 140, m: 45 },
    { id: 'wax', name: 'Waxing (face)', d: 'Brow, lip or chin', p: 25, m: 20 }
  ],
  Nails: [
    { id: 'mani', name: 'Classic manicure', d: 'Shape, cuticle care, polish', p: 35, m: 35 },
    { id: 'gel', name: 'Gel manicure', d: 'Chip-resistant color for 2 to 3 weeks', p: 55, m: 50 },
    { id: 'pedi', name: 'Spa pedicure', d: 'Soak, scrub, massage, polish', p: 65, m: 60 },
    { id: 'acr', name: 'Acrylic or gel extensions', d: 'Full set with shape and design', p: 90, m: 90 }
  ],
  Makeup: [
    { id: 'mu', name: 'Event makeup', d: 'Full-face application for any occasion', p: 85, m: 60 },
    { id: 'lash', name: 'Lash lift & tint', d: 'Natural curl and definition', p: 80, m: 60 },
    { id: 'brow', name: 'Brow shaping & tint', d: 'Shape, tint and clean-up', p: 45, m: 30 }
  ]
};
const PACKAGES = [
  { id: 'p-glow', name: 'Glow Up', p: 160, m: 120, items: ["Women's cut & style", 'Signature facial', 'Brow shaping'], svc: ['cut-w', 'face', 'brow'], save: 'Save $20' },
  { id: 'p-color', name: 'Color & Care', p: 330, m: 240, items: ['Balayage', 'Deep conditioning', 'Blowout'], svc: ['bal', 'blow'], pop: true, save: 'Most popular' },
  { id: 'p-hands', name: 'Hands & Feet', p: 105, m: 100, items: ['Gel manicure', 'Spa pedicure', 'Paraffin treat'], svc: ['gel', 'pedi'], save: 'Save $15' },
  { id: 'p-bride', name: 'Bridal Day', p: 480, m: 270, items: ['Bridal hair styling', 'Bridal makeup', 'Gel manicure', 'Trial session'], svc: ['blow', 'mu', 'gel'], save: 'Includes trial' }
];
const PROMOS = { WELCOME10: 0.10 }; // add more codes here, e.g. SUMMER15: 0.15
const STAFF = ['Any available', 'Amelia Hart', 'Jordan Reyes', 'Sophia Lane', 'Maya Brooks'];
const ALL = Object.values(SERVICES).flat();
const $ = (s, r = document) => r.querySelector(s);
const money = n => '$' + n.toLocaleString('en-US');
const mins = m => (m >= 60 ? Math.floor(m / 60) + ' hr ' : '') + (m % 60 ? (m % 60) + ' min' : '');

/* ========= INTRO + LOGO ANIMATION ========= */
// The logo animation itself (blades flying in, snipping, sparkle) is CSS: see "LOGO ANIMATION" in style.css.
let readyDone = false;
function siteReady() {
  document.documentElement.classList.add('ready');
  if (!readyDone) { readyDone = true; document.dispatchEvent(new Event('salon:ready')); }
}
(function intro() {
  const el = $('#intro'), cnt = $('#count');
  const finish = () => { el.classList.add('done'); document.body.classList.remove('lock'); siteReady(); };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return finish();
  const dur = 3300, t0 = performance.now();
  let started = false;
  function tick(t) {
    const p = Math.min((t - t0) / dur, 1);
    cnt.textContent = String(Math.round(p * 100)).padStart(3, '0');
    if (p < 1) return requestAnimationFrame(tick);
    if (started) return; started = true;
    el.classList.add('zoom');
    setTimeout(siteReady, 450);   // hero zooms in while the logo dissolves
    setTimeout(finish, 1250);
  }
  requestAnimationFrame(tick);
  el.addEventListener('click', () => { started = true; finish(); });
  setTimeout(finish, 7000); // safety net
})();

/* ========= NAV ========= */
const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 30), { passive: true });
burger.addEventListener('click', () => {
  const o = menu.classList.toggle('open');
  burger.classList.toggle('open', o);
  burger.setAttribute('aria-expanded', o);
});
menu.addEventListener('click', e => { if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });
$('#yr').textContent = new Date().getFullYear();

/* ========= SERVICES ========= */
const state = { pkg: null, svc: new Set(), staff: STAFF[0], date: '', time: '' };
let cat = Object.keys(SERVICES)[0];
function renderTabs() {
  $('#tabs').innerHTML = Object.keys(SERVICES).map(c =>
    `<button class="tab" role="tab" aria-selected="${c === cat}" data-c="${c}">${c}</button>`).join('');
  $('#svcList').innerHTML = SERVICES[cat].map(s =>
    `<div class="svc"><div><h4>${s.name}</h4><p>${s.d}</p></div><div class="price">${money(s.p)}<small style="display:block;color:var(--muted);font-weight:400">${mins(s.m)}</small><button class="book" data-b="${s.id}">Book this</button></div></div>`).join('');
}
$('#tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) { cat = b.dataset.c; renderTabs(); } });
$('#svcList').addEventListener('click', e => {
  const b = e.target.closest('[data-b]'); if (!b) return;
  state.pkg = null; state.svc = new Set([b.dataset.b]);
  renderBooking(); updateSummary();
  $('#booking').scrollIntoView({ behavior: 'smooth' });
});

/* ========= PACKAGES ========= */
$('#pkGrid').innerHTML = PACKAGES.map(k => `
  <article class="pk ${k.pop ? 'pop' : ''}">
    ${k.pop ? '<span class="tag">Most popular</span>' : ''}
    <h3>${k.name}</h3>
    <div class="pr">${money(k.p)}</div>
    <div class="dur">${mins(k.m)}${k.pop ? '' : ' · ' + k.save}</div>
    <ul>${k.items.map(i => `<li>${i}</li>`).join('')}</ul>
    <div class="pk-actions"><button class="btn" data-pk="${k.id}">Book this package</button><button class="lnk" type="button" data-pd="${k.id}">View details</button></div>
  </article>`).join('');
$('#pkGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-pk]'); if (!b) return;
  state.pkg = b.dataset.pk; state.svc = new Set();
  renderBooking(); updateSummary();
  $('#booking').scrollIntoView({ behavior: 'smooth' });
});

/* ========= BOOKING ========= */
function renderBooking() {
  $('#bPk').innerHTML = PACKAGES.map(k =>
    `<button type="button" class="chip" data-pk="${k.id}" aria-pressed="${state.pkg === k.id}">${k.name}<small>${money(k.p)} · ${mins(k.m)}</small></button>`).join('');
  $('#bSvc').innerHTML = ALL.map(s =>
    `<button type="button" class="chip" data-s="${s.id}" aria-pressed="${state.svc.has(s.id)}">${s.name}<small>${money(s.p)} · ${mins(s.m)}</small></button>`).join('');
  $('#bSt').innerHTML = STAFF.map(n =>
    `<button type="button" class="chip" data-st="${n}" aria-pressed="${state.staff === n}">${n}</button>`).join('');
  renderTimes();
}
$('#bPk').addEventListener('click', e => {
  const b = e.target.closest('[data-pk]'); if (!b) return;
  state.pkg = state.pkg === b.dataset.pk ? null : b.dataset.pk; state.svc = new Set();
  renderBooking(); updateSummary();
});
$('#bSvc').addEventListener('click', e => {
  const b = e.target.closest('[data-s]'); if (!b) return;
  state.pkg = null;
  state.svc.has(b.dataset.s) ? state.svc.delete(b.dataset.s) : state.svc.add(b.dataset.s);
  renderBooking(); updateSummary();
});
$('#bSt').addEventListener('click', e => {
  const b = e.target.closest('[data-st]'); if (!b) return;
  state.staff = b.dataset.st; state.time = ''; renderBooking(); updateSummary();
});

const dateEl = $('#date');
const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
dateEl.min = iso(new Date());
dateEl.addEventListener('change', () => { state.date = dateEl.value; state.time = ''; renderTimes(); updateSummary(); });

// Demo availability: deterministic "booked" slots. Replace with a real backend call.
function slotsFor(dateStr) {
  const d = new Date(dateStr + 'T12:00:00'), dow = d.getDay();
  const open = dow === 0 ? 10 : 9, close = dow === 0 ? 16 : dow === 6 ? 18 : 19;
  const out = [];
  for (let h = open; h < close; h++) for (const m of [0, 30]) {
    if (h === close - 1 && m === 30) continue;
    out.push({ h, m });
  }
  const seed = [...(dateStr + state.staff)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return out.map((s, i) => ({ ...s, taken: (seed * (i + 3)) % 7 === 0 }));
}
const fmt = ({ h, m }) => `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
function renderTimes() {
  const box = $('#bTime');
  if (!state.date) { box.innerHTML = ''; $('#dateNote').textContent = ''; $('#dateNote').style.color = '#8f8296'; $('#dateNote').textContent = 'Pick a date to see available times.'; return; }
  $('#dateNote').textContent = '';
  box.innerHTML = slotsFor(state.date).map(s => {
    const t = fmt(s);
    return `<button type="button" class="chip" data-t="${t}" ${s.taken ? 'disabled' : ''} aria-pressed="${state.time === t}">${t}</button>`;
  }).join('');
}
$('#bTime').addEventListener('click', e => {
  const b = e.target.closest('[data-t]'); if (!b || b.disabled) return;
  state.time = b.dataset.t; renderTimes(); updateSummary();
});

function chosen() {
  if (state.pkg) { const k = PACKAGES.find(x => x.id === state.pkg); return { names: [k.name + ' package'], p: k.p, m: k.m }; }
  const l = [...state.svc].map(id => ALL.find(s => s.id === id));
  return { names: l.map(s => s.name), p: l.reduce((a, s) => a + s.p, 0), m: l.reduce((a, s) => a + s.m, 0) };
}
function updateSummary() {
  const c = chosen();
  $('#sSvc').textContent = c.names.length ? c.names.join(', ') : 'None selected';
  $('#sSt').textContent = state.staff;
  $('#sDate').textContent = state.date ? new Date(state.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '-';
  $('#sTime').textContent = state.time || '-';
  $('#sDur').textContent = c.m ? mins(c.m) : '-';
  const pct = state.promo ? (PROMOS[state.promo] || 0) : 0, off = Math.round(c.p * pct);
  $('#sDiscRow').classList.toggle('on', off > 0);
  if (off > 0) { $('#sDiscLbl').textContent = 'Discount (' + state.promo + ')'; $('#sDisc').textContent = '-' + money(off); }
  $('#sTot').textContent = money(c.p - off);
}

$('#bookForm').addEventListener('submit', async e => {
  e.preventDefault();
  const err = $('#err'), c = chosen();
  const name = $('#name').value.trim(), email = $('#email').value.trim(), phone = $('#phone').value.trim();
  const fail = m => { err.textContent = m; };
  if (!c.names.length) return fail('Choose a package or at least one service.');
  if (!state.date) return fail('Pick a date.');
  if (!state.time) return fail('Pick a time.');
  if (name.length < 2) return fail('Enter your full name.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Enter a valid email address.');
  if (phone.replace(/\D/g, '').length < 10) return fail('Enter a valid phone number.');
  const submit = $('#bookForm').querySelector('button[type="submit"]');
  submit.disabled = true;
  const previousText = submit.textContent;
  submit.textContent = 'Saving booking…';
  err.textContent = '';
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package_id: state.pkg || null,
        services: c.names,
        stylist: state.staff,
        appointment_date: state.date,
        appointment_time: state.time,
        name, email, phone,
        notes: $('#notes').value.trim(),
        promo: state.promo || ''
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Booking could not be saved. Please try again.');
    $('#bookForm').style.display = 'none';
    const ok = $('#ok'); ok.style.display = 'block';
    $('#okMsg').textContent = `Thanks, ${name.split(' ')[0]}. Your ${c.names.join(', ')} booking request for ${$('#sDate').textContent} at ${state.time} has been received. Reference: ${result.ref}. Please contact the salon to confirm your appointment.`;
    ok.focus(); ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (window.salonConfetti) salonConfetti();
    if (window.salonToast) salonToast('Booking request received. Reference ' + result.ref);
  } catch (error) {
    fail(error.message || 'Unable to save booking. Please try again.');
  } finally {
    submit.disabled = false;
    submit.textContent = previousText;
  }
});
$('#again').addEventListener('click', () => {
  Object.assign(state, { pkg: null, svc: new Set(), staff: STAFF[0], date: '', time: '' });
  $('#bookForm').reset(); $('#bookForm').style.display = ''; $('#ok').style.display = 'none';
  renderBooking(); updateSummary();
});

renderTabs(); renderBooking(); updateSummary();

/* ========= SCROLL ZOOM-IN REVEAL ========= */
(function reveal() {
  const groups = ['.sec-head', '.tabs', '.pk', '.gal > div', '.mem', '.rev blockquote', '.panel', '.summary', '.contact > div'];
  const els = [];
  groups.forEach(sel => document.querySelectorAll(sel).forEach((el, i) => { el.classList.add('rv'); el.style.setProperty('--d', (i % 4) * 0.09 + 's'); els.push(el); }));
  if (!('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('in'));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  els.forEach(e => io.observe(e));
})();

/* ========= MOUSE CIRCLE CURSOR ========= */
(function cursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = document.createElement('div'), ring = document.createElement('div');
  dot.className = 'cur-dot'; ring.className = 'cur-ring';
  document.body.append(dot, ring); document.body.classList.add('has-cursor');
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
  const HOT = 'a,button,.chip,.tab,input,select,textarea,label,.pk,.svc,.mem,.gal > div,.rev blockquote,.hero-art,.summary,.ft,.qa';
  addEventListener('mousemove', e => {
    x = e.clientX; y = e.clientY; document.body.classList.add('cur-on');
    const hot = !!e.target.closest(HOT);
    ring.classList.toggle('hot', hot); dot.classList.toggle('hot', hot);
  }, { passive: true });
  document.addEventListener('mouseleave', () => document.body.classList.remove('cur-on'));
  addEventListener('mousedown', () => ring.classList.add('down'));
  addEventListener('mouseup', () => ring.classList.remove('down'));
  (function loop() {
    rx += (x - rx) * .16; ry += (y - ry) * .16;
    dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    requestAnimationFrame(loop);
  })();
})();


/* ================================================================
   POLISH: smart nav, progress, counters, glitter, tilt, popups...
   ================================================================ */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const onReady = fn => document.documentElement.classList.contains('ready') ? fn() : document.addEventListener('salon:ready', fn, { once: true });
const safeStore = { get: k => { try { return sessionStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) { } } };

/* ----- toasts ----- */
function salonToast(msg) {
  const box = $('#toasts'), t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg; box.append(t);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 450); }, 3200);
}
window.salonToast = salonToast;

/* ----- confetti (booking success) ----- */
window.salonConfetti = function () {
  if (reduceMotion) return;
  const c = document.createElement('canvas');
  c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1900';
  document.body.append(c);
  const dpr = Math.min(devicePixelRatio || 1, 2); c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  const g = c.getContext('2d'); g.scale(dpr, dpr);
  const cols = ['#c9a45c', '#e9c8c4', '#a8679a', '#f6e0b0', '#ffffff', '#e58fa6'];
  const ps = Array.from({ length: 150 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .55, vx: (Math.random() - .5) * 16, vy: -Math.random() * 16 - 6, w: 6 + Math.random() * 7, h: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cols[(Math.random() * cols.length) | 0] }));
  const t0 = performance.now();
  (function f(t) {
    const el = t - t0; g.clearRect(0, 0, innerWidth, innerHeight);
    ps.forEach(p => { p.vy += .32; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.r += p.vr; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - el / 3200); g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore(); });
    if (el < 3200) requestAnimationFrame(f); else c.remove();
  })(t0);
};

/* ----- scroll effects: progress bar, smart nav, back-to-top, mobile CTA ----- */
(function scrollFx() {
  const bar = $('#progress'), navEl = $('#nav'), topBtn = $('#toTop'), cta = $('#mCta'), booking = $('#booking'), hero = $('#hero');
  let last = scrollY, queued = false;
  function update() {
    queued = false;
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    const d = y - last;
    if (Math.abs(d) > 5) {
      const hide = d > 0 && y > 500 && !$('#menu').classList.contains('open') && !navEl.matches(':focus-within');
      navEl.classList.toggle('hide', hide); last = y;
    }
    if (y < 80) navEl.classList.remove('hide');
    topBtn.classList.toggle('show', y > 700);
    const bk = booking.getBoundingClientRect(), inBooking = bk.top < innerHeight * .6 && bk.bottom > 0;
    cta.classList.toggle('show', y > hero.offsetHeight * .7 && !inBooking && !document.body.classList.contains('modal-open'));
  }
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  topBtn.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  update();
})();

/* ----- active menu link while scrolling ----- */
(function scrollSpy() {
  const links = [...document.querySelectorAll('.menu a[href^="#"]:not(.btn)')];
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(l => l.classList.remove('active'));
    const l = map.get(e.target.id); if (l) l.classList.add('active');
  }), { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
})();

/* ----- hero: count-up numbers, glitter, mouse-follow glow ----- */
onReady(() => {
  if (reduceMotion) return;
  document.querySelectorAll('[data-count]').forEach(el => {
    const end = +el.dataset.count, dec = +el.dataset.dec || 0, suf = el.dataset.suffix || '', comma = el.dataset.comma;
    const t0 = performance.now() + 500, dur = 1800;
    (function f(t) {
      const p = Math.min(Math.max((t - t0) / dur, 0), 1), v = end * (1 - Math.pow(1 - p, 3));
      el.textContent = (comma ? Math.round(v).toLocaleString('en-US') : v.toFixed(dec)) + suf;
      if (p < 1) requestAnimationFrame(f);
    })(performance.now());
  });
});
(function glitter() {
  const box = $('#sparkles'); if (!box || reduceMotion) return;
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('i');
    el.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;--s:${6 + Math.random() * 12}px;--t:${3 + Math.random() * 4}s;--dl:${Math.random() * 6}s`;
    box.append(el);
  }
})();
(function heroGlow() {
  const hero = $('#hero'); if (!finePointer || reduceMotion) return;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3));
    hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3));
  }, { passive: true });
})();

/* ----- marquee: repeat content so the loop is seamless on any screen ----- */
(function marquee() {
  const mq = $('#mq'); if (!mq) return;
  const base = mq.innerHTML, w = mq.scrollWidth || 1, n = Math.max(1, Math.ceil(innerWidth / w));
  mq.innerHTML = base.repeat(n * 2);
})();

/* ----- 3D tilt + glow on package cards, magnetic hero buttons ----- */
(function tilt() {
  if (!finePointer || reduceMotion) return;
  document.querySelectorAll('.pk').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', ((px - .5) * 9).toFixed(2) + 'deg');
      el.style.setProperty('--rx', (-(py - .5) * 9).toFixed(2) + 'deg');
      el.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    });
    el.addEventListener('mouseleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });
  document.querySelectorAll('.hero-cta .btn').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.translate = ((e.clientX - r.left - r.width / 2) * .22) + 'px ' + ((e.clientY - r.top - r.height / 2) * .35) + 'px';
    });
    b.addEventListener('mouseleave', () => { b.style.translate = ''; });
  });
})();

/* ----- button click ripple ----- */
document.addEventListener('click', e => {
  const b = e.target.closest('.btn'); if (!b || reduceMotion) return;
  const r = b.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2, sp = document.createElement('span');
  sp.className = 'ripple'; sp.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
  b.append(sp); setTimeout(() => sp.remove(), 750);
});

/* ----- FAQ accordion ----- */
$('#acc').addEventListener('click', e => {
  const q = e.target.closest('.q'); if (!q) return;
  const item = q.parentElement, wasOpen = item.classList.contains('open');
  document.querySelectorAll('.qa.open').forEach(o => { o.classList.remove('open'); o.querySelector('.q').setAttribute('aria-expanded', 'false'); });
  if (!wasOpen) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
});

/* ----- popup engine (open/close, Esc, focus trap, scroll lock) ----- */
const Modal = (function () {
  let active = null, lastFocus = null;
  function open(el) {
    if (active && active !== el) close(active, true);
    clearTimeout(el._t); lastFocus = document.activeElement;
    el.hidden = false; document.body.classList.add('modal-open'); void el.offsetWidth; el.classList.add('open'); active = el;
    setTimeout(() => { const f = el.querySelector('.btn,.lb-nav,.m-x'); if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function close(el, quick) {
    if (!el) return;
    el.classList.remove('open');
    if (quick) el.hidden = true; else el._t = setTimeout(() => { el.hidden = true; }, 450);
    if (active === el) { active = null; document.body.classList.remove('modal-open'); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  }
  document.addEventListener('click', e => { const c = e.target.closest('[data-close]'); if (c) close(c.closest('.modal')); });
  document.addEventListener('keydown', e => {
    if (!active) return;
    if (e.key === 'Escape') return close(active);
    if (e.key === 'Tab') {
      const f = [...active.querySelectorAll('button,[href],input')].filter(x => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], lastEl = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    }
  });
  return { open, close, get active() { return active; } };
})();

/* ----- promo codes ----- */
function applyPromo(raw) {
  const code = (raw || '').trim().toUpperCase(), msg = $('#promoMsg');
  if (!code) { state.promo = ''; msg.className = 'full promo-msg bad'; msg.textContent = 'Enter a code first.'; updateSummary(); return false; }
  if (PROMOS[code]) {
    state.promo = code; $('#promo').value = code;
    msg.className = 'full promo-msg good'; msg.textContent = 'Code applied: ' + Math.round(PROMOS[code] * 100) + '% off your booking.';
    updateSummary(); return true;
  }
  state.promo = ''; msg.className = 'full promo-msg bad'; msg.textContent = "That code isn't valid. Check the spelling and try again.";
  updateSummary(); return false;
}
$('#applyPromo').addEventListener('click', () => applyPromo($('#promo').value));
$('#promo').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); applyPromo($('#promo').value); } });
$('#again').addEventListener('click', () => { state.promo = ''; const m = $('#promoMsg'); m.textContent = ''; m.className = 'full promo-msg'; updateSummary(); });

/* ----- welcome offer popup (once per visit) ----- */
(function offer() {
  const modal = $('#offerModal'); let shown = !!safeStore.get('salon-offer');
  function show() {
    if (shown || Modal.active) return;
    const bk = $('#booking').getBoundingClientRect(); if (bk.top < innerHeight * .6 && bk.bottom > 0) return;
    shown = true; safeStore.set('salon-offer', '1'); Modal.open(modal);
  }
  onReady(() => setTimeout(show, 9000));
  if (finePointer) document.addEventListener('mouseout', e => { if (!e.relatedTarget && e.clientY <= 0 && document.documentElement.classList.contains('ready')) show(); });
  $('#copyCode').addEventListener('click', async e => {
    const b = e.currentTarget;
    try { await navigator.clipboard.writeText($('#offerCode').textContent); } catch (_) { }
    b.textContent = 'Copied'; salonToast('Code WELCOME10 copied'); setTimeout(() => { b.textContent = 'Copy'; }, 1600);
  });
  $('#claimOffer').addEventListener('click', () => {
    applyPromo('WELCOME10'); Modal.close(modal);
    setTimeout(() => $('#booking').scrollIntoView({ behavior: 'smooth' }), 250);
    salonToast('10% off applied. Choose your service below.');
  });
})();

/* ----- package details popup ----- */
(function pkgDetails() {
  const INFO = {
    'p-glow': 'A fresh start for hair and skin in one relaxed visit. Leave with a new cut, glowing skin and perfectly shaped brows.',
    'p-color': 'Our most requested color service, finished with a deep conditioning treatment and a smooth blowout.',
    'p-hands': 'The ultimate hands and feet reset: long-lasting gel color, a spa pedicure and a warm paraffin treat.',
    'p-bride': 'Everything for your big day, including a trial session, so your hair and makeup are exactly how you imagined.'
  };
  const modal = $('#pkgModal'), body = $('#pkgBody');
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-pd]'); if (!b) return;
    const k = PACKAGES.find(x => x.id === b.dataset.pd); if (!k) return;
    body.innerHTML = `<h3 id="pkgTitle">${k.name}</h3><div class="pm-price">${money(k.p)}</div><div class="pm-meta">${mins(k.m)} · ${k.save}</div><p class="pm-desc">${INFO[k.id] || ''}</p><ul>${k.items.map(i => `<li>${i}</li>`).join('')}</ul><button class="btn" id="pkgBook" type="button">Book this package</button>`;
    Modal.open(modal);
    $('#pkgBook').addEventListener('click', () => {
      state.pkg = k.id; state.svc = new Set(); renderBooking(); updateSummary(); Modal.close(modal);
      setTimeout(() => $('#booking').scrollIntoView({ behavior: 'smooth' }), 250);
      salonToast(k.name + ' package added to your booking');
    });
  });
})();

/* ----- toasts when something is added to the booking ----- */
$('#pkGrid').addEventListener('click', e => { const b = e.target.closest('[data-pk]'); if (b) { const k = PACKAGES.find(x => x.id === b.dataset.pk); salonToast(k.name + ' package added to your booking'); } });
$('#svcList').addEventListener('click', e => { const b = e.target.closest('[data-b]'); if (b) salonToast(ALL.find(x => x.id === b.dataset.b).name + ' added to your booking'); });
$('#bPk').addEventListener('click', e => { const b = e.target.closest('[data-pk]'); if (b && state.pkg === b.dataset.pk) salonToast(PACKAGES.find(x => x.id === b.dataset.pk).name + ' package selected'); });

/* ----- gallery lightbox ----- */
(function lightbox() {
  const lb = $('#lightbox'), img = $('#lbImg'), cap = $('#lbCap'), items = [...document.querySelectorAll('.gal div')];
  let idx = 0;
  function show(i, anim) {
    idx = (i + items.length) % items.length;
    const it = items[idx], im = it.querySelector('img');
    img.src = im.src; img.alt = im.alt; cap.textContent = it.dataset.l + ', ' + (idx + 1) + ' of ' + items.length;
    if (anim) { img.classList.remove('swap'); void img.offsetWidth; img.classList.add('swap'); }
    fit();
  }
  function fit() {
    const r = (img.naturalWidth / img.naturalHeight) || 1, w = Math.min(innerWidth * .92, innerHeight * .74 * r, 920);
    img.style.width = w + 'px'; img.style.height = (w / r) + 'px';
  }
  img.addEventListener('load', fit); addEventListener('resize', fit);
  items.forEach((it, i) => {
    it.tabIndex = 0; it.setAttribute('role', 'button'); it.setAttribute('aria-label', 'View ' + it.dataset.l);
    const go = () => { show(i, false); Modal.open(lb); };
    it.addEventListener('click', go);
    it.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  $('#lbPrev').addEventListener('click', () => show(idx - 1, true));
  $('#lbNext').addEventListener('click', () => show(idx + 1, true));
  document.addEventListener('keydown', e => { if (Modal.active !== lb) return; if (e.key === 'ArrowLeft') show(idx - 1, true); if (e.key === 'ArrowRight') show(idx + 1, true); });
  let sx = 0;
  lb.addEventListener('touchstart', e => { sx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1), true); }, { passive: true });
})();
