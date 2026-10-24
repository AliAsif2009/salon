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
const STAFF = ['Any available', 'Amelia Hart', 'Jordan Reyes', 'Sophia Lane', 'Maya Brooks'];
const ALL = Object.values(SERVICES).flat();
const $ = (s, r = document) => r.querySelector(s);
const money = n => '$' + n.toLocaleString('en-US');
const mins = m => (m >= 60 ? Math.floor(m / 60) + ' hr ' : '') + (m % 60 ? (m % 60) + ' min' : '');

/* ========= INTRO + LOGO ANIMATION ========= */
// The logo animation itself (blades flying in, snipping, sparkle) is CSS: see "LOGO ANIMATION" in style.css.
function siteReady() { document.documentElement.classList.add('ready'); }
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
    <button class="btn" data-pk="${k.id}">Book this package</button>
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
  $('#sTot').textContent = money(c.p);
}

$('#bookForm').addEventListener('submit', e => {
  e.preventDefault();
  const err = $('#err'), c = chosen();
  const name = $('#name').value.trim(), email = $('#email').value.trim(), phone = $('#phone').value.trim();
  const fail = m => { err.textContent = m; };
  if (!c.names.length) return fail('Choose a package or at least one service.');
  if (!state.date) return fail('Pick a date.');
  if (!state.time) return fail('Pick a time.');
  if (name.length < 2) return fail('Enter your full name.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Enter a valid email address.');
  if (phone.replace(/\D/g, '').length < 10) return fail('Enter a 10-digit phone number.');
  err.textContent = '';

  const ref = 'SLN-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  const booking = { ref, ...c, staff: state.staff, date: state.date, time: state.time, name, email, phone, notes: $('#notes').value.trim() };
  // TODO: send `booking` to your backend / email service / booking API here.
  try { const all = JSON.parse(localStorage.getItem('salon-bookings') || '[]'); all.push(booking); localStorage.setItem('salon-bookings', JSON.stringify(all)); } catch (_) { }

  $('#bookForm').style.display = 'none';
  const ok = $('#ok'); ok.style.display = 'block';
  $('#okMsg').textContent = `Thanks, ${name.split(' ')[0]}. Your ${c.names.join(', ')} appointment is set for ${$('#sDate').textContent} at ${state.time}. A confirmation will be sent to ${email}. Reference: ${ref}.`;
  ok.focus(); ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  const HOT = 'a,button,.chip,.tab,input,select,textarea,label,.pk,.svc,.mem,.gal > div,.rev blockquote,.hero-art,.summary';
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
