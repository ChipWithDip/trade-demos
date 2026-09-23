/* Turf Talent demo. Facts: turftalentlawnandlandscape.com; photos and reviews: Turf Talent's Google profile. */
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

  /* ---------- real job photos ---------- */
  const JOBS = [
    {f: 'job-02', w: 2400, h: 2400, cap: 'Fresh sod across a new backyard', tags: ['sod'], size: 'big'},
    {f: 'job-08', w: 2400, h: 1800, cap: 'A rock-lined xeriscape front yard', tags: ['rock'], size: 'w'},
    {f: 'job-03', w: 2400, h: 1166, cap: 'A full lawn with fresh mulch beds', tags: ['sod', 'beds'], size: 'w'},
    {f: 'job-04', w: 1800, h: 2400, cap: 'New sod down a side yard', tags: ['sod'], size: 't'},
    {f: 'job-01', w: 1490, h: 1112, cap: 'A river-rock bed with young trees', tags: ['rock', 'beds'], size: ''},
    {f: 'job-10', w: 1800, h: 2400, cap: 'River rock and gravel border', tags: ['rock'], size: 't'},
    {f: 'job-07', w: 1800, h: 2400, cap: 'Sod framed in fresh mulch', tags: ['sod', 'beds'], size: 't'},
    {f: 'job-11', w: 1800, h: 2400, cap: 'New lawn and mulch along the fence', tags: ['sod', 'beds'], size: 't'},
    {f: 'job-09', w: 1800, h: 2400, cap: 'A curved lawn edged in mulch', tags: ['sod', 'beds'], size: 't'},
    {f: 'job-06', w: 1800, h: 2400, cap: 'A bare new-build yard, ready for work', tags: [], size: 't'}
  ];
  const gal = $('[data-gallery]');
  gal.innerHTML = JOBS.map((j, i) => `<button class="tile reveal${j.size ? ' tile--' + j.size : ''}" type="button" data-i="${i}" data-tags="${j.tags.join(' ')}" aria-label="Open photo: ${esc(j.cap)}">
    <img src="images/${j.f}-900.webp" alt="${esc(j.cap)}" loading="lazy" width="${j.w}" height="${j.h}"><span>${esc(j.cap)}</span></button>`).join('');
  const filters = $('[data-filters]');
  filters.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', filters).forEach(x => x.setAttribute('aria-selected', String(x === b)));
    const f = b.dataset.f;
    $$('.tile', gal).forEach(t => {
      const show = f === 'all' || t.dataset.tags.split(' ').includes(f);
      t.classList.toggle('is-out', !show);
      if (show && !reduce) t.animate([{opacity: 0, transform: 'scale(.97)'}, {opacity: 1, transform: 'none'}], {duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)'});
    });
  });

  /* lightbox over the visible photos */
  const lb = $('[data-lightbox]'), lbImg = $('[data-lb-img]'), lbCap = $('[data-lb-cap]');
  let order = [], at = 0, back = null;
  const show = k => {
    at = (k + order.length) % order.length;
    const j = JOBS[order[at]];
    lbImg.src = `images/${j.f}.webp`; lbImg.alt = j.cap;
    lbCap.textContent = `${j.cap} · ${at + 1} of ${order.length}`;
  };
  gal.addEventListener('click', e => {
    const t = e.target.closest('.tile'); if (!t) return;
    order = $$('.tile:not(.is-out)', gal).map(x => +x.dataset.i);
    back = t; show(order.indexOf(+t.dataset.i));
    lb.hidden = false; document.body.classList.add('locked'); $('[data-lb-close]').focus();
  });
  const close = () => { lb.hidden = true; document.body.classList.remove('locked'); back?.focus(); };
  $('[data-lb-close]').addEventListener('click', close);
  $('[data-lb-prev]').addEventListener('click', () => show(at - 1));
  $('[data-lb-next]').addEventListener('click', () => show(at + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(at - 1);
    if (e.key === 'ArrowRight') show(at + 1);
    if (e.key === 'Tab') { const f = $$('button', lb), i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
  });
  let sx = null;
  lb.addEventListener('pointerdown', e => { sx = e.clientX; });
  lb.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 50) show(at + (e.clientX < sx ? 1 : -1)); sx = null; });

  /* ---------- services (lists from turftalentlawnandlandscape.com) ---------- */
  const SERVICES = [
    {t: 'Lawn Maintenance', img: 'mower', real: false, wide: true, alt: 'An orange lawn mower on a freshly cut lawn',
      p: 'Trained crews keep your lawn healthy and neat all season, on a professional, regular schedule.',
      li: ['Residential & commercial mowing', 'Fertilization programs', 'Pruning & shaping shrubs', 'Core aeration', 'Power raking', 'Over seeding', 'Tilling', 'Spring & fall clean-up']},
    {t: 'Landscape Design & Build', img: 'job-02', real: true, wide: true, alt: 'A new backyard lawn behind a gray house, installed by Turf Talent',
      p: 'A unique design for your lifestyle, maintenance needs and budget, installed on the date promised and fully guaranteed.',
      li: ['Design & installation', 'Irrigation systems', 'Decorative patios & walkways', 'Bobcat work', 'Sodding & over seeding', 'Topsoil, mulch & decorative rock', 'Drainage systems', 'Seasonal floral displays', 'Tree planting, removal or moving']},
    {t: 'Sprinklers', img: 'sprinkler', real: false, alt: 'A sprinkler spraying water across green grass',
      p: 'Systems designed and installed right, so the right amount of water lands where it should.',
      li: ['Design & install', 'Residential & commercial', 'Drip irrigation', 'Maintenance & repairs', 'Spring start-up & winterization', 'Hunter, Rain Bird & Irritrol']},
    {t: 'Fertilization', img: 'grass', real: false, alt: 'Close-up of thick green grass',
      p: 'One of the few still using strictly granular fertilizer: a slow, steady feed through the roots that will not mow away or drift.',
      li: ['6-step lawn care program', 'Weed & crabgrass control', 'Pest control']},
    {t: 'Garden Maintenance', img: 'flower-beds', real: false, alt: 'Beds of pansies and daffodils in bloom',
      p: 'Planting beds that stay fresh and flourishing, so your free time goes to enjoying them.',
      li: ['Annual & perennial design', 'Mulching', 'Deadheading', 'Weed removal', 'Seasonal clean-ups']},
    {t: 'Xeriscaping', img: 'job-08', real: true, wide: true, alt: 'A rock-lined xeriscape front yard by Turf Talent',
      p: 'Water-wise landscapes made for our semi-arid climate: smart plants, less grass, patios and walkways, and far less upkeep.',
      li: ['Water-wise plants', 'Decorative rock', 'Patios & walkways', 'Low maintenance']},
    {t: 'Snow Removal', img: 'snow-plow', real: false, wide: true, alt: 'A tractor plowing deep snow',
      p: 'Commercial snow and ice removal since 1999, on call 24 hours a day, 7 days a week. Fully insured, from shopping centers to small offices.',
      li: ['Plowing', 'Deicing', 'Snow blowers & loaders', 'On call 24/7']}
  ];
  $('[data-services]').innerHTML = SERVICES.map(s => `<article class="card reveal${s.wide ? ' card--wide' : ''}">
    <div class="card__img"><img src="images/${s.img}-900.webp" alt="${esc(s.alt)}" loading="lazy"><span class="card__tag${s.real ? ' card__tag--real' : ''}">${s.real ? 'Turf Talent job' : 'Sample photo'}</span></div>
    <div class="card__body"><h3>${esc(s.t)}</h3><p>${esc(s.p)}</p><ul>${s.li.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></article>`).join('');

  /* ---------- seasons (fertilizer steps and months from their 6-step program) ---------- */
  const SEASONS = [
    {id: 'spring', name: 'Spring', months: 'Mar – May', start: 2, img: 'flower-beds', intro: 'Wake the yard up, feed it early and get ahead of the weeds.',
      items: [['Fertilizer & pre-emergent', 'Step 1 · Feb – Apr. Early green-up and crabgrass protection.'], ['Late spring weed & feed', 'Step 2 · Mar – May. Slow-release feed with iron, plus broadleaf control.'], ['Sprinkler start-up', 'Turned on and adjusted for the season.'], ['Spring clean-up', 'Beds, edges and debris cleared out.'], ['Core aeration & power raking', 'Let water and air reach the roots.'], ['Seasonal floral displays', 'Annuals and perennials planted.']]},
    {id: 'summer', name: 'Summer', months: 'Jun – Aug', start: 5, img: 'mower', intro: 'Peak season. Keep it cut, fed, watered and looking sharp.',
      items: [['Summer feeding', 'Step 3 · Apr – Jun. Balanced slow-release feed that defends against summer disease.'], ['Late summer weed & feed', 'Step 4 · Jun – Aug. Drought and disease tolerance, plus a full inspection.'], ['Mowing', 'Residential and commercial, on a regular schedule.'], ['Shrub pruning & shaping', 'Clean lines all summer.'], ['Garden maintenance', 'Deadheading, weeding and mulching.'], ['Sprinkler repairs', 'Fixes when a head or zone acts up.']]},
    {id: 'fall', name: 'Fall', months: 'Sep – Nov', start: 8, img: 'garden-path', intro: 'Roots grow most in the fall. Set the lawn up for next spring.',
      items: [['Fall feeding', 'Step 5 · Aug – Oct. High-potassium feed for root growth.'], ['Winterizer', 'Step 6 · Oct – Dec. The most important feeding of the year.'], ['Sprinkler winterization', 'Blown out and ready for the freeze.'], ['Fall clean-up', 'Leaves and beds cleared before winter.'], ['Over seeding', 'Thicken thin spots.'], ['Tree planting or moving', 'A good window for new trees.']]},
    {id: 'winter', name: 'Winter', months: 'Dec – Feb', start: 11, img: 'snow-plow', intro: 'When the snow flies, the crew is already out.',
      items: [['Commercial snow plowing', 'Plows, loaders and snow blowers.'], ['Deicing', 'Cuts the risk of slip-and-fall accidents.'], ['On call 24/7', 'Every day of the week, all winter.'], ['Fully insured', 'Serving properties since 1999.'], ['Plan next year', 'The best time to design a spring project.']]}
  ];
  const tabs = $('[data-season-tabs]'), panel = $('[data-season-panel]'), bg = $('[data-season-bg]');
  const ICO = {spring: '🌱', summer: '☀️', fall: '🍂', winter: '❄️'};
  tabs.innerHTML = SEASONS.map(s => `<button type="button" role="tab" id="st-${s.id}" aria-controls="season-panel" aria-selected="false" tabindex="-1" data-s="${s.id}"><span aria-hidden="true">${ICO[s.id]}</span>${s.name}</button>`).join('');
  panel.id = 'season-panel';
  bg.innerHTML = SEASONS.map(s => `<img src="images/${s.img}.webp" alt="" data-bg="${s.id}" loading="lazy">`).join('');
  const arc = $('[data-arc]'), C = 2 * Math.PI * 86, M = C / 12;
  arc.style.strokeDasharray = `${M * 3 - 6} ${C}`;
  function season(id, focus) {
    const s = SEASONS.find(x => x.id === id) || SEASONS[0];
    $$('button', tabs).forEach(b => { const on = b.dataset.s === s.id; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    panel.setAttribute('aria-labelledby', `st-${s.id}`);
    panel.innerHTML = `<p class="intro">${esc(s.intro)}</p><ul class="slist">${s.items.map(([t, d], i) => `<li><i>${i + 1}</i><div><b>${esc(t)}</b><span>${esc(d)}</span></div></li>`).join('')}</ul>`;
    $$('img', bg).forEach(im => { const on = im.dataset.bg === s.id; if (on) im.loading = 'eager'; im.classList.toggle('on', on); });
    arc.style.strokeDashoffset = String(-(s.start * M) + 3);
    $('[data-season-name]').textContent = s.name;
    $('[data-season-months]').textContent = s.months;
    store.set('ttSeason', s.id);
  }
  tabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) season(b.dataset.s); });
  tabs.addEventListener('keydown', e => {
    const k = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[e.key]; if (!k) return;
    const i = SEASONS.findIndex(s => s.id === document.activeElement.dataset.s);
    season(SEASONS[(i + k + 4) % 4].id, true); e.preventDefault();
  });
  // start on the current Colorado season unless the visitor picked one
  const m = new Date().getMonth();
  const current = m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'fall' : 'winter';
  season(store.get('ttSeason') || current);

  /* ---------- reviews (Google, verbatim apart from three typo fixes) ---------- */
  const REVIEWS = [
    {n: 'Shaley Lingle', when: '3 months ago', c: '#2f6b3f', q: 'Turf Talent installed our sprinkler system, sod, mulch, and crushed rock, and we are very happy with the results. As first-time homeowners, we appreciated their affordable pricing and professionalism. They were wonderful to work with, and we highly recommend them!'},
    {n: 'Mrs Burns', when: 'a month ago', c: '#b0862a', q: 'We can’t say enough positive comments about our experience with these polite and hard working young men. They were prompt and communicated where we were in the queue. They did our landscaping right and corrected our poorly designed sprinkler system. They did it right and made it right. They have ALL of our future business!'},
    {n: 'Jerilyn', when: '2 months ago', c: '#5a8f3c', q: 'Turf Talent is our go-to for lawn service. They do an excellent job mowing, trimming and blowing off the walk areas when done! A great team to work with!!'},
    {n: 'Lauren O’Grady', when: '4 months ago', c: '#1f5f4a', q: 'We had a great experience working with Garrett & Shea on our backyard landscaping. We moved into a new construction home with a challenging yard that they completely transformed. They both had communication, attention to detail, and completed the work timely. We highly recommend!'},
    {n: 'Bethany McHugh', when: '6 months ago', c: '#7a5a2f', q: 'Shea and his team did an amazing job on our yard! Great prices and exceptional work. We will be utilizing their services again in the future! Thank you Turf Talent Lawn and Landscape! Looking forward to beautiful green grass this summer!'}
  ];
  $('[data-reviews]').innerHTML = REVIEWS.map(r => `<figure class="review reveal">
    <div class="review__head"><span class="avatar" style="--c:${r.c}" aria-hidden="true">${esc(r.n[0])}</span>
      <div class="review__who"><b>${esc(r.n)}</b><span>${esc(r.when)} on Google</span></div><span class="g" aria-hidden="true">G</span></div>
    <span class="stars" style="--r:5" role="img" aria-label="5 out of 5 stars"></span>
    <blockquote>${esc(r.q)}</blockquote></figure>`).join('');

  const LETTERS = [
    ['I have had Turf Talent work on my irrigation system for the past eight years, and I highly recommend them. They are totally reliable, skilled and honest.', 'Natalie R.'],
    ['Have used Brett on numerous occasions. Has always shown professionalism in all dealings with him. Extremely happy with the work he has done.', 'Dennis S.'],
    ['I received quick and polite service within hours of calling Brett… you just can’t get that kind of response from most companies, especially the big ones.', 'Karen S.']
  ];
  $('[data-letters]').innerHTML = LETTERS.map(([q, n]) => `<figure class="letter reveal"><p>“${esc(q)}”</p><cite>${esc(n)}</cite></figure>`).join('');

  /* ---------- header + nav ---------- */
  const top = $('#top');
  const onScroll = () => top.classList.toggle('is-solid', scrollY > innerHeight * 0.6 || (innerWidth < 860 && scrollY > 40));
  addEventListener('scroll', onScroll, {passive: true}); onScroll();
  const links = $$('.nav a');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
  }), {rootMargin: '-45% 0px -50% 0px'});
  ['work', 'services', 'seasons', 'reviews', 'contact'].forEach(id => spy.observe(document.getElementById(id)));

  /* ---------- reveal ---------- */
  $$('.head, .about__photo, .about__copy, .reviews__top, .contact__inner > *, .seasons__copy').forEach(el => el.classList.add('reveal'));
  const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); rv.unobserve(e.target); } }), {threshold: 0.1, rootMargin: '0px 0px -40px 0px'});
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; rv.observe(el); });
})();
