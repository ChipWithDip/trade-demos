/* Irrigation Genies demo. Services come from irrigationgenies.net; the lamp only points to those services. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // The nine services listed on irrigationgenies.net.
  const ICON = {
    eval: '<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>',
    diag: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M11 8v3l2 2"/>',
    design: '<path d="M3 21l3-1 11-11-2-2L4 18z"/><path d="M14 6l2-2 4 4-2 2"/>',
    install: '<path d="M12 22V12"/><path d="M8 12h8"/><path d="M12 12c-3-2-3-6 0-9 3 3 3 7 0 9z"/>',
    revamp: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
    eff: '<path d="M12 2s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/><path d="M9 14a3 3 0 0 0 3 3"/>',
    drip: '<path d="M4 6h16"/><path d="M7 6v3"/><path d="M12 6v3"/><path d="M17 6v3"/><path d="M7 13c0 1.5-1 2.5-1 3.5a1 1 0 0 0 2 0c0-1-1-2-1-3.5zM12 13c0 1.5-1 2.5-1 3.5a1 1 0 0 0 2 0c0-1-1-2-1-3.5zM17 13c0 1.5-1 2.5-1 3.5a1 1 0 0 0 2 0c0-1-1-2-1-3.5z"/>',
    maint: '<path d="M8 2v4M16 2v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M9 15l2 2 4-4"/>',
    repair: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>'
  };
  const SERVICES = {
    eval: ['Complete System Evaluations', 'A full walk of every zone, head and valve, so you know exactly where your system stands.'],
    diag: ['Advanced Diagnostics', 'Tracking down the hard ones: dead zones, wiring faults, hidden leaks and pressure problems.'],
    design: ['Custom System Designing', 'A layout planned around your yard, your plants and your water pressure.'],
    install: ['New Irrigation System Installation', 'A brand new sprinkler system, put in from the ground up.'],
    revamp: ['System Revamps', 'Bringing an older system up to date without starting from scratch.'],
    eff: ['High-Efficiency Conversions', 'Swapping in water-saving heads, nozzles and controls.'],
    drip: ['Drip Irrigation Systems', 'Slow, targeted watering for beds, shrubs and gardens.'],
    maint: ['Irrigation Maintenance', 'Regular care that keeps everything running right, season after season.'],
    repair: ['Irrigation Repairs', 'Broken heads, leaking valves, cracked lines and zones that will not start.']
  };
  const WISHES = [
    {id: 'dry', ico: '🟫', label: 'Brown, dry patches', why: 'Dry spots usually mean some heads are not reaching: blocked, tilted or broken heads, or low pressure in that zone. The genie checks it all.', svc: ['eval', 'diag', 'repair']},
    {id: 'geyser', ico: '⛲', label: 'A head is broken or gushing', why: 'A snapped or gushing head wastes a lot of water fast. This is a straight repair job.', svc: ['repair']},
    {id: 'zone', ico: '⏻', label: "A zone won't turn on", why: 'When a zone stays dry it is often a valve, a wire or the controller. Diagnostics find which one, then it gets fixed.', svc: ['diag', 'repair']},
    {id: 'soggy', ico: '💧', label: 'Soggy spots or a leak', why: 'Puddles and soft ground can mean a cracked line or a valve that will not close. Finding the source comes first.', svc: ['diag', 'repair']},
    {id: 'bill', ico: '💲', label: 'My water bill is too high', why: 'Newer heads, smarter controls and drip lines can water the same yard with less.', svc: ['eff', 'drip', 'eval']},
    {id: 'new', ico: '✨', label: 'I want a new or better system', why: 'Starting fresh or upgrading an old setup, it begins with a design that fits your yard.', svc: ['design', 'install', 'revamp']},
    {id: 'keep', ico: '🗓', label: 'Just keep it running right', why: 'Regular maintenance catches small problems before they turn into big ones.', svc: ['maint', 'eval']}
  ];

  /* services grid */
  $('[data-services]').innerHTML = Object.entries(SERVICES).map(([k, [t, d]]) =>
    `<li class="reveal"><div class="svc__ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg></div><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('');

  /* rub the lamp */
  const box = $('[data-wishes]'), lamp = $('[data-lamp]');
  box.innerHTML = WISHES.map(w => `<button class="wopt" type="button" role="radio" aria-checked="false" data-w="${w.id}"><span class="wopt__ico" aria-hidden="true">${w.ico}</span>${esc(w.label)}</button>`).join('');
  function grant(id, animate) {
    const w = WISHES.find(x => x.id === id); if (!w) return;
    $$('.wopt', box).forEach(b => { const on = b.dataset.w === id; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
    const subject = encodeURIComponent(`Sprinkler help: ${w.label}`);
    const body = encodeURIComponent(`Hi Irrigation Genies,\n\nMy sprinklers: ${w.label.toLowerCase()}.\n\nAddress:\nBest time to reach me:\n`);
    lamp.innerHTML = `<div class="grant">
      <div class="grant__top"><img src="images/genie.webp" alt="" width="74" height="89">
        <div><p class="grant__kicker">Your wish</p><h3>${esc(w.label)}</h3></div></div>
      <p class="grant__why">${esc(w.why)}</p>
      <ul class="grant__list">${w.svc.map((k, i) => `<li><i>${i + 1}</i><div><b>${esc(SERVICES[k][0])}</b><span>${esc(SERVICES[k][1])}</span></div></li>`).join('')}</ul>
      <div class="hero__cta">
        <a class="btn btn--gold" href="tel:+13038816010">Call (303) 881-6010</a>
        <a class="btn btn--line" href="mailto:office@irrigationgenies.com?subject=${subject}&amp;body=${body}">Email this to the genie</a>
      </div></div>`;
    store.set('igWish', id);
    if (animate && !reduce) sparkle();
  }
  function sparkle() {
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      s.className = 'sparkle';
      const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 90;
      s.style.left = '64px'; s.style.top = '52px';
      s.style.setProperty('--dx', `${Math.cos(a) * d}px`); s.style.setProperty('--dy', `${Math.sin(a) * d}px`);
      if (i % 3 === 0) s.style.background = '#4cc3ff';
      lamp.appendChild(s);
      setTimeout(() => s.remove(), 950);
    }
  }
  box.addEventListener('click', e => { const b = e.target.closest('.wopt'); if (b) grant(b.dataset.w, true); });
  box.addEventListener('keydown', e => {
    const keys = {ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1};
    if (!(e.key in keys)) return;
    const bs = $$('.wopt', box), i = Math.max(0, bs.indexOf(document.activeElement));
    const n = bs[(i + keys[e.key] + bs.length) % bs.length];
    n.focus(); grant(n.dataset.w, true); e.preventDefault();
  });
  const saved = store.get('igWish');
  if (saved && WISHES.some(w => w.id === saved)) grant(saved, false);
  else $$('.wopt', box).forEach((b, i) => { b.tabIndex = i ? -1 : 0; });

  /* hours: every day 7 AM to 7 PM, Denver time */
  const band = $('[data-band]');
  const fmt = new Intl.DateTimeFormat('en-US', {timeZone: 'America/Denver', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'});
  function tick() {
    const p = Object.fromEntries(fmt.formatToParts(new Date()).map(x => [x.type, x.value]));
    const min = (+p.hour % 24) * 60 + +p.minute, open = min >= 420 && min < 1140;
    band.classList.toggle('is-open', open); band.classList.toggle('is-closed', !open);
    const t = open ? 'Open now, until 7 PM' : `Closed, opens ${min < 420 ? 'today' : 'tomorrow'} at 7 AM`;
    if (band.lastElementChild.textContent !== t) band.lastElementChild.textContent = t;
  }
  tick(); setInterval(tick, 30000);

  /* nav highlight */
  const links = $$('.nav a');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
  }), {rootMargin: '-45% 0px -50% 0px'});
  ['wish', 'services', 'about', 'area'].forEach(id => spy.observe(document.getElementById(id)));

  /* reveal */
  $$('.head, .wish__head, .lamp, .about__photos, .about__copy, .area__inner > *').forEach(el => el.classList.add('reveal'));
  const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); rv.unobserve(e.target); } }), {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 70}ms`; rv.observe(el); });
})();
