/* Smoke shop layout: age gate, mobile menu, RGB smoke hero, shop filters, contact form. No dependencies. */
(function () {
    'use strict';
    var body = document.body;

    /* Image fallback: a photo that fails to load swaps to a free stand-in (demo only). */
    function fallback(img) {
        if (img.dataset.fb) return;
        img.dataset.fb = '1';
        var seed = (img.getAttribute('alt') || img.src || 'demo').replace(/[^a-z0-9]/gi, '').slice(0, 24) || 'demo';
        img.src = 'https://picsum.photos/seed/' + seed + '/' + (img.getAttribute('width') || 900) + '/' + (img.getAttribute('height') || 700);
    }
    document.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('error', function () { fallback(img); });
        if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fallback(img);
    });

    /* Age gate: native <dialog>, asked once per browser session. */
    var gate = document.getElementById('age-gate');
    var GATE_KEY = 'vm-age-ok';
    function gateOk() {
        try { return sessionStorage.getItem(GATE_KEY) === '1'; } catch (e) { return false; }
    }
    var noGate = (location.search + location.hash).indexOf('nogate') !== -1;   /* screenshots and the template gallery skip the gate */
    document.documentElement.setAttribute('data-nogate', noGate ? '1' : '0');
    if (gate && noGate) { gate.remove(); }
    else if (gate && typeof gate.showModal === 'function' && !gateOk()) {
        body.classList.add('gated');
        gate.showModal();
        gate.addEventListener('cancel', function (e) { e.preventDefault(); });
        gate.querySelector('[data-gate-yes]').addEventListener('click', function () {
            try { sessionStorage.setItem(GATE_KEY, '1'); } catch (e) {}
            gate.close(); gate.style.display = 'none'; gate.remove(); body.classList.remove('gated');
        });
    }

    /* Mobile menu with inert background */
    var menuBtn = document.querySelector('.menu-btn');
    var nav = document.getElementById('nav');
    var closeBtn = nav ? nav.querySelector('.close-btn') : null;
    function setMenu(open) {
        nav.classList.toggle('open', open);
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        body.style.overflow = open ? 'hidden' : '';
        var main = document.getElementById('main'), foot = document.querySelector('.site-footer'), brand = document.querySelector('.brand');
        [main, foot, brand, menuBtn].forEach(function (el) { if (el) el.inert = open; });
        if (open && closeBtn) closeBtn.focus(); else if (!open) menuBtn.focus();
    }
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
        if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); });
        nav.addEventListener('click', function (e) { if (e.target.closest('a') && nav.classList.contains('open')) setMenu(false); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false); });
        window.addEventListener('resize', function () { if (window.innerWidth > 820 && nav.classList.contains('open')) setMenu(false); });
    }

    /* RGB smoke: soft additive particles that follow the pointer and cycle through the spectrum.
       An idle emitter keeps the hero alive on load and on touch devices. Pauses off-screen. */
    var hero = document.querySelector('[data-smoke]');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (hero && !reduce && window.requestAnimationFrame) {
        var canvas = document.createElement('canvas');
        canvas.className = 'smoke';
        canvas.setAttribute('aria-hidden', 'true');
        hero.insertBefore(canvas, hero.firstChild);
        var ctx = canvas.getContext('2d');
        var W = 0, H = 0, dpr = 1, parts = [], last = null, hue = 0, running = false, t0 = performance.now();
        var MAX = window.innerWidth < 700 ? 80 : 160;
        var sprites = [];
        for (var b = 0; b < 36; b++) {
            var s = document.createElement('canvas'); s.width = s.height = 128;
            var g = s.getContext('2d'), grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
            grad.addColorStop(0, 'hsla(' + (b * 10) + ',100%,62%,0.9)');
            grad.addColorStop(0.35, 'hsla(' + (b * 10) + ',100%,55%,0.35)');
            grad.addColorStop(1, 'hsla(' + (b * 10) + ',100%,50%,0)');
            g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
            sprites.push(s);
        }
        function size() {
            dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            W = hero.clientWidth; H = hero.clientHeight;
            canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
        }
        function emit(x, y, vx, vy, n) {
            for (var i = 0; i < n; i++) {
                hue = (hue + 1.5) % 360;
                parts.push({ x: x + (Math.random() - 0.5) * 14, y: y + (Math.random() - 0.5) * 14, vx: vx * 0.12 + (Math.random() - 0.5) * 0.9, vy: vy * 0.12 - 0.35 - Math.random() * 0.5,
                             r: 34 + Math.random() * 40, life: 1, decay: 0.004 + Math.random() * 0.005, h: hue, seed: Math.random() * 6.283 });
            }
            if (parts.length > MAX) parts.splice(0, parts.length - MAX);
        }
        function frame(now) {
            if (!running) return;
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(0, 0, W, H);
            ctx.globalCompositeOperation = 'lighter';
            for (var i = parts.length - 1; i >= 0; i--) {
                var p = parts[i];
                p.life -= p.decay;
                if (p.life <= 0) { parts.splice(i, 1); continue; }
                p.seed += 0.025;
                p.x += p.vx + Math.sin(p.seed + p.y * 0.008) * 0.4;
                p.y += p.vy;
                p.vx *= 0.985; p.vy *= 0.985; p.r += 0.7;
                ctx.globalAlpha = p.life * p.life * 0.2;
                ctx.drawImage(sprites[(p.h / 10) | 0], p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
            }
            ctx.globalAlpha = 1;
            if (!last || now - last.t > 1200) {
                var t = (now - t0) * 0.00035;
                emit(W * (0.5 + 0.34 * Math.sin(t * 1.3) * Math.cos(t * 0.4)), H * (0.5 + 0.26 * Math.cos(t * 0.9)), Math.cos(t * 1.3) * 3, Math.sin(t * 0.9) * 2, 2);
            }
            requestAnimationFrame(frame);
        }
        function start() {
            if (running) return;
            running = true; size();
            for (var k = 0; k < 35; k++) emit(W * (0.2 + Math.random() * 0.6), H * (0.25 + Math.random() * 0.5), (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, 1);   /* opening burst so the hero is never empty */
            requestAnimationFrame(frame);
        }
        function stop() { running = false; }
        hero.addEventListener('pointermove', function (e) {
            var r = canvas.getBoundingClientRect();
            var x = e.clientX - r.left, y = e.clientY - r.top, vx = 0, vy = 0;
            if (last) { vx = x - last.x; vy = y - last.y; }
            last = { x: x, y: y, t: performance.now() };
            emit(x, y, vx, vy, Math.min(7, 2 + ((Math.sqrt(vx * vx + vy * vy) / 5) | 0)));
        }, { passive: true });
        hero.addEventListener('pointerdown', function (e) {
            var r = canvas.getBoundingClientRect();
            emit(e.clientX - r.left, e.clientY - r.top, 0, 0, 12);
        }, { passive: true });
        window.addEventListener('resize', function () { if (running) size(); });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) { if (entries[0].isIntersecting) start(); else stop(); }, { threshold: 0.05 }).observe(hero);
        } else {
            start();
        }
        document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    } else if (hero) {
        hero.classList.add('no-motion');
    }

    /* Shop filters (managed tier; also honours ?category= and #slug) */
    var filters = document.querySelector('[data-filters]');
    if (filters) {
        var cards = document.querySelectorAll('[data-grid] .product');
        var apply = function (key) {
            filters.querySelectorAll('.chip').forEach(function (c) { var on = c.getAttribute('data-filter') === key; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
            cards.forEach(function (c) { c.classList.toggle('is-hidden', key !== 'all' && c.getAttribute('data-category') !== key); });
        };
        filters.addEventListener('click', function (e) { var c = e.target.closest('.chip'); if (c) apply(c.getAttribute('data-filter')); });
        var want = new URLSearchParams(location.search).get('category') || location.hash.replace('#', '');
        if (want && filters.querySelector('[data-filter="' + want + '"]')) apply(want);
    }

    /* Contact form (managed tier): prefill item/intent from the URL, validate, post to Netlify. */
    var form = document.querySelector('[data-form]');
    if (form) {
        var S = JSON.parse(document.getElementById('contact-strings').textContent);
        var params = new URLSearchParams(location.search);
        var item = form.querySelector('[data-item]'), intent = form.querySelector('[data-intent]'), msg = form.querySelector('#f-message');
        if (params.get('item') && item) item.value = params.get('item');
        if (params.get('intent') === 'reserve') { intent.value = 'reserve'; if (msg && !msg.value) msg.value = 'Please hold this item for in-store pickup: ' + (params.get('item') || '') + '\n'; }
        var status = form.querySelector('[data-status]'), submit = form.querySelector('[data-submit]');
        var setErr = function (field, text) {
            var wrap = field.closest('.field'); var old = wrap.querySelector('.err'); if (old) old.remove();
            wrap.classList.toggle('is-invalid', !!text); field.setAttribute('aria-invalid', text ? 'true' : 'false');
            if (text) { var p = document.createElement('p'); p.className = 'err'; p.textContent = text; wrap.appendChild(p); }
        };
        var validate = function () {
            var ok = true;
            form.querySelectorAll('[required]').forEach(function (f) {
                var bad = f.type === 'checkbox' ? !f.checked : !f.value.trim();
                var text = bad ? S.required : (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value) ? S.invalid_email : '');
                setErr(f, text); if (text) ok = false;
            });
            return ok;
        };
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!validate()) { form.querySelector('.is-invalid input, .is-invalid textarea').focus(); return; }
            submit.disabled = true;
            fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() })
                .then(function (r) { if (!r.ok) throw new Error(r.status); status.className = 'form-status'; status.innerHTML = '<strong>' + S.ok_h + '</strong> ' + S.ok_p; status.hidden = false; form.reset(); })
                .catch(function () { status.className = 'form-status is-error'; status.innerHTML = '<strong>' + S.err_h + '</strong> ' + S.err_p; status.hidden = false; })
                .then(function () { submit.disabled = false; status.setAttribute('tabindex', '-1'); status.focus(); });
        });
    }
})();
