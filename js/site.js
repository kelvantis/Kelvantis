/* Kelvantis — site-brede JavaScript.
 *
 * Geëxternaliseerd uit de inline <script>-blokken zodat de Content-Security-Policy
 * script-src op 'self' kan staan (geen 'unsafe-inline', geen hashes).
 *
 * Eén bestand, sitebreed geladen. Elk onderdeel is feature-guarded: het checkt of
 * de relevante elementen bestaan en doet niets (geen error) op pagina's waar ze
 * ontbreken. Zo is dit bestand veilig op elke pagina.
 *
 * LET OP — laadwijze: dit bestand wordt SYNCHROON in <head> geladen (geen defer).
 * De .js-class moet vóór de eerste paint op <html> staan, omdat de CSS reveal-
 * elementen verbergt via `.js [data-reveal] { opacity: 0 }` e.d. Zou de class via
 * een defer-script ná de eerste paint gezet worden, dan flitsen above-the-fold
 * reveals even zichtbaar (FOUC). De DOM-afhankelijke logica draait daarom in
 * DOMContentLoaded — net als de oude inline blokken die onderaan <body> stonden.
 */

document.documentElement.classList.add('js');

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

});
