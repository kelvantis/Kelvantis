/* Kelvantis — site-brede JavaScript.
 *
 * Geëxternaliseerd uit de inline <script>-blokken zodat de Content-Security-Policy
 * script-src strikt blijft: 'self' plus één sha256-hash voor de anti-FOUC bootstrap
 * (geen 'unsafe-inline').
 *
 * Eén bestand, sitebreed geladen. Elk onderdeel is feature-guarded: het checkt of
 * de relevante elementen bestaan en doet niets (geen error) op pagina's waar ze
 * ontbreken. Zo is dit bestand veilig op elke pagina.
 *
 * LET OP — laadwijze: dit bestand wordt met DEFER geladen. De .js-class wordt
 * gezet door een piepklein inline bootstrap-script in <head> (whitelisted via een
 * sha256-hash in de CSP, zie vercel.json), zodat de class vóór de eerste paint op
 * <html> staat en above-the-fold reveals niet flitsen (FOUC). De DOM-afhankelijke
 * logica draait in DOMContentLoaded; defer-scripts draaien daar gegarandeerd vóór.
 */

document.addEventListener('DOMContentLoaded', function () {

  /* --- Navigatie: balk → floating pill bij scroll (>60px, rAF) + aria-sync mobiel
        menu + diensten-dropdown. (Voorheen inline op alle hoofd-/tekstpagina's.) --- */
  (function () {
    var nav = document.getElementById('nav');
    if (!nav) return; // pagina zonder navbar: niets te doen
    var ticking = false;
    function applyNavState() { nav.classList.toggle('scrolled', window.scrollY > 60); ticking = false; }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(applyNavState); ticking = true; }
    }, { passive: true });
    applyNavState(); // juiste begin-staat (ook na refresh mid-pagina)

    var cb = document.getElementById('nav-toggle-cb');
    var toggle = document.querySelector('.nav-toggle');
    function sync() {
      var open = cb.checked;
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
      if (!open && dd) {  // dropdown resetten als hamburger sluit
        dd.classList.remove('open');
        dd.querySelector('.nav-dd-trigger').setAttribute('aria-expanded', 'false');
      }
    }
    if (cb && toggle) {
      cb.addEventListener('change', sync);
      // Toetsenbordbediening van de label-knop
      toggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cb.checked = !cb.checked; sync(); }
      });
      // Sluit het menu na klik op een link
      document.querySelectorAll('.nav-links a').forEach(function (a) {
        a.addEventListener('click', function () { cb.checked = false; sync(); });
      });
    }

    // Diensten-dropdown
    var dd = document.querySelector('.nav-dd');
    if (dd) {
      var ddTrigger = dd.querySelector('.nav-dd-trigger');
      function closeDD() { dd.classList.remove('open'); ddTrigger.setAttribute('aria-expanded', 'false'); }
      function openDD()  { dd.classList.add('open');    ddTrigger.setAttribute('aria-expanded', 'true'); }

      ddTrigger.addEventListener('click', function (e) {
        e.stopPropagation();
        dd.classList.contains('open') ? closeDD() : openDD();
      });
      document.addEventListener('click', function (e) {
        if (!dd.contains(e.target)) closeDD();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && dd.classList.contains('open')) { closeDD(); ddTrigger.focus(); }
      });
      dd.querySelectorAll('.nav-dd-item').forEach(function (a) {
        a.addEventListener('click', closeDD);
      });
    }
  })();

  /* --- Scroll-reveal v2 (systeem B): [data-reveal]-varianten + group-stagger, één keer
        afspelen. Gebruikt op alle hoofdpagina's. No-opt waar geen [data-reveal] staat. --- */
  (function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // reduced-motion: CSS toont alles in eindtoestand
    var els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible', 'reveal-done'); });
      return;
    }
    function delayFor(el) {
      var group = el.closest('[data-reveal-group]');
      if (!group) return 0;
      var items = group.querySelectorAll('[data-reveal]');
      var i = Array.prototype.indexOf.call(items, el);
      return Math.min(i, 6) * 80; // var(--reveal-step), gecapt op 6 stappen
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.style.setProperty('--reveal-delay', delayFor(el) + 'ms');
        el.addEventListener('animationend', function () { el.classList.add('reveal-done'); }, { once: true });
        el.classList.add('is-visible');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* --- Scroll-reveal (systeem A): .reveal/.stagger → .in-view. Eén keer infaden + licht
        omhoog. Gebruikt op /privacy/ en /voorwaarden/. No-opt waar die classes ontbreken. --- */
  (function () {
    var els = document.querySelectorAll('.reveal, .stagger');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || reduce) {
      els.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* --- FAQ scroll-spy: markeer in de sidebar welke categorie in beeld is. Alleen op
        /faq/ (degradeert netjes). No-opt waar geen .faq-cat bestaat. --- */
  (function () {
    var links = document.querySelectorAll('.faq-cat-link');
    var cats = document.querySelectorAll('.faq-cat');
    if (!('IntersectionObserver' in window) || !cats.length) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('active'); l.removeAttribute('aria-current'); });
        var a = map[e.target.id];
        if (a) { a.classList.add('active'); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    cats.forEach(function (c) { spy.observe(c); });
  })();

  /* --- "Onze aanpak": robot stijgt als raket op (CSS-gedreven via --kv-p) en de
        actieve stap krijgt zijn coral tijdlijn-segment + open bullets. Alleen op de
        homepage (.kv-approach). Twee modi, beide progressive enhancement:
          • DESKTOP (breed, geen reduced-motion): sticky-pin, rAF-scroll → --kv-p
            continu (1-op-1 met de scroll). Klasse .kv-launch + .kv-pinned.
          • MOBIEL (≤880px, geen reduced-motion): geen pin/scroll-hijack. Sticky
            robot-stage bovenaan, stappen scrollen native; een IntersectionObserver
            bepaalt de actieve stap, --kv-p wordt discreet per stap gezet en de
            CSS-transitions animeren de beats. Klasse .kv-launch + .kv-mobile.
        Reduced-motion: geen van beide → toegankelijke basisstaat. --- */
  (function () {
    var section = document.querySelector('.kv-approach');
    if (!section) return;                         // niet de homepage: niets te doen
    var pin = section.querySelector('.kv-pin');
    var steps = section.querySelectorAll('.kv-step');
    if (!pin || !steps.length) return;

    var LAST = steps.length - 1;
    // representatieve --kv-p per stap voor de mobiele (discrete) beats
    var STEP_P = [0.12, 0.42, 0.66, 1];
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var small  = window.matchMedia('(max-width: 880px)');
    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

    var mode = 'none', ticking = false, io = null;

    function setActive(i) {
      steps.forEach(function (s, idx) {
        var on = idx === i;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-current', on ? 'step' : 'false');
      });
      section.dataset.kvStep = i;   // stuurt de robot-expressie (CSS [data-kv-step])
    }

    /* DESKTOP — rAF-scroll → continue --kv-p */
    function update() {
      ticking = false;
      if (mode !== 'desktop') return;
      var rect = pin.getBoundingClientRect();
      var total = pin.offsetHeight - window.innerHeight;
      var p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
      section.style.setProperty('--kv-p', p.toFixed(4));
      setActive(Math.min(LAST, Math.floor(p * steps.length)));
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

    /* MOBIEL — IntersectionObserver wekt ons; kies de stap het dichtst bij de
       detectielijn (~60% viewport) en zet de discrete beat. Geen scroll-listener. */
    function pickActive() {
      var line = window.innerHeight * 0.6;
      var best = 0, bestDist = Infinity;
      steps.forEach(function (s, i) {
        var r = s.getBoundingClientRect();
        var c = r.top + r.height / 2;
        var d = Math.abs(c - line);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      setActive(best);
      section.style.setProperty('--kv-p', String(STEP_P[best]));
    }

    // sticky-stage offset = werkelijke navbar-hoogte + marge (mobiel)
    function setTop() {
      var nav = document.getElementById('nav');
      var h = nav ? nav.getBoundingClientRect().height : 56;
      section.style.setProperty('--kv-top', Math.round(h + 18) + 'px');
    }

    function teardown() {
      window.removeEventListener('scroll', onScroll);
      if (io) { io.disconnect(); io = null; }
      section.classList.remove('kv-launch', 'kv-pinned', 'kv-mobile');
      section.style.removeProperty('--kv-p');
      section.style.removeProperty('--kv-top');
      delete section.dataset.kvStep;   // terug naar basis-expressie (face--0)
      steps.forEach(function (s) { s.classList.remove('is-active'); s.setAttribute('aria-current', 'false'); });
    }

    function applyMode() {
      var want = reduce.matches ? 'none' : (small.matches ? 'mobile' : 'desktop');
      if (want === mode) return;
      teardown();
      mode = want;
      if (mode === 'desktop') {
        section.classList.add('kv-launch', 'kv-pinned');
        window.addEventListener('scroll', onScroll, { passive: true });
        update();
      } else if (mode === 'mobile') {
        section.classList.add('kv-launch', 'kv-mobile');
        setTop();       // sticky-stage onder de navbar
        io = new IntersectionObserver(pickActive, {
          threshold: [0, 0.25, 0.5, 0.75, 1]
        });
        steps.forEach(function (s) { io.observe(s); });
        pickActive();   // begintoestand
      }
      // mode 'none' → niets: CSS toont de toegankelijke basisstaat
    }

    applyMode();
    window.addEventListener('resize', function () {
      applyMode();
      if (mode === 'desktop') onScroll();
      if (mode === 'mobile') { setTop(); pickActive(); }
    }, { passive: true });
    if (reduce.addEventListener) { reduce.addEventListener('change', applyMode); }
    if (small.addEventListener)  { small.addEventListener('change', applyMode); }
  })();

});
