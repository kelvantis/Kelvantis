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

  /* Volgorde van de wetten bij binnenkomst via interne navigatie:
     feed (WET 4, 420ms) → stempels (WET 1) → morph (WET 3). Above-the-fold-
     stempels wachten daarom op de feed; bij directe entree is de delay 0. */
  var kvReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var kvFeedDelay = (!kvReduce && document.referrer && document.referrer.indexOf(location.origin + '/') === 0) ? 420 : 0;

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

  /* --- Roterend hero-woord (bewuste override op WET 1/§4.7, zie DESIGN.md).
        Letter-stagger slide/fade in een oranje pill; de pill-breedte animeert
        vloeiend mee via een verborgen meter-span. Alleen op de homepage
        (guard op #kv-rot). reduced-motion: het eerste woord blijft statisch
        staan (uit de HTML), geen interval. --- */
  (function () {
    var rot = document.getElementById('kv-rot');
    if (!rot) return;              // pagina zonder roterende hero
    if (kvReduce) return;          // reduced-motion: laat de statische HTML-tekst staan

    var words = ['groei', 'klanten', 'omzet', 'zichtbaarheid', 'impact'];
    var STAGGER = 28;   // ms per letter
    var ENTER = 650;    // ms enter-duur (letter)
    var HOLD = 2000;    // ms zichtbaar
    var i = 0;

    // Verborgen meter: meet de woordbreedte in exact de rotator-typografie
    // zodat de pill-breedte zonder sprong animeert.
    var cs = getComputedStyle(rot);
    var meter = document.createElement('span');
    meter.setAttribute('aria-hidden', 'true');
    meter.style.cssText = 'position:fixed;top:0;left:-9999px;visibility:hidden;white-space:pre;font-style:italic;' +
      'font-family:' + cs.fontFamily + ';font-weight:' + cs.fontWeight + ';' +
      'letter-spacing:' + cs.letterSpacing + ';font-size:' + cs.fontSize + ';';
    document.body.appendChild(meter);
    function widthOf(w) { meter.textContent = w; return Math.ceil(meter.getBoundingClientRect().width); }

    function build(word) {
      rot.style.width = widthOf(word) + 'px';
      rot.textContent = '';
      var chars = Array.from(word);
      chars.forEach(function (c, k) {
        var s = document.createElement('span');
        s.className = 'ch';
        s.textContent = c;
        s.style.transitionDelay = ((chars.length - 1 - k) * STAGGER) + 'ms'; // stagger vanaf laatste letter
        rot.appendChild(s);
      });
      void rot.offsetWidth; // reflow, dan naar rust
      Array.prototype.forEach.call(rot.children, function (s) {
        s.style.transform = 'translateY(0)';
        s.style.opacity = 1;
      });
    }

    function exit(cb) {
      var kids = Array.prototype.slice.call(rot.children);
      kids.forEach(function (s, k) {
        s.style.transitionDelay = ((kids.length - 1 - k) * STAGGER) + 'ms';
        s.style.transform = 'translateY(-120%)';
        s.style.opacity = 0;
      });
      setTimeout(cb, ENTER + kids.length * STAGGER);
    }

    function tick() {
      exit(function () {
        i = (i + 1) % words.length;
        build(words[i]);
      });
    }

    function startRotation() {
      build(words[0]);
      setInterval(tick, HOLD + ENTER);
      window.addEventListener('resize', function () { rot.style.width = widthOf(words[i]) + 'px'; }, { passive: true });
    }

    // Wacht tot de webfonts geladen zijn voordat we meten en starten. Bij een
    // KOUDE load (fonts nog niet in cache) is Fraunces bij DOMContentLoaded nog
    // niet klaar; dan meet de meter met het fallback-font, wordt de pill te smal
    // en lijkt de rotatie stil te staan tot je herlaadt. fonts.ready lost dat op;
    // een timeout-vangnet start alsnog als fonts.ready onverhoopt blijft hangen.
    if (document.fonts && document.fonts.ready) {
      var started = false;
      var go = function () { if (started) return; started = true; startRotation(); };
      document.fonts.ready.then(go);
      setTimeout(go, 1200);
    } else {
      startRotation();
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
    var t0 = performance.now();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        // above-the-fold (direct bij aankomst in beeld): pas stempelen ná de feed
        var naFeed = (performance.now() - t0 < 450) ? kvFeedDelay : 0;
        el.style.setProperty('--reveal-delay', (delayFor(el) + naFeed) + 'ms');
        el.addEventListener('animationend', function () { el.classList.add('reveal-done'); }, { once: true });
        el.classList.add('is-visible');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* --- Scroll-reveal (systeem A): .reveal/.stagger → .in-view. Eén keer infaden + licht
        omhoog. Gebruikt op /privacybeleid/ en /algemene-voorwaarden/. No-opt waar die classes ontbreken. --- */
  (function () {
    var els = document.querySelectorAll('.reveal, .stagger');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || reduce) {
      els.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var t0 = performance.now();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        // zelfde feed-voorrang als systeem B (alleen losse .reveal-elementen;
        // .stagger-kinderen houden hun CSS-delays)
        if (kvFeedDelay && performance.now() - t0 < 450 && e.target.classList.contains('reveal')) {
          e.target.style.animationDelay = kvFeedDelay + 'ms';
        }
        e.target.classList.add('in-view'); io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* --- Contactflow (PLAN sessie 3, vorm herzien in sessie 9): bevestigings-
        kaart na succesvolle verzending.
        HARDE EIS — nooit dataverlies: de normale POST-route (Formspree,
        _next → /bedankt/) blijft volledig intact en is het pad zonder JS.
        Dit blok probeert de verzending via fetch; ALLEEN bij een geslaagde
        respons wordt de kaart getoond. Bij elke twijfel (netwerkfout,
        niet-2xx, ontbrekende APIs) valt het terug op de native submit.
        AVG: POST-body, geen data in de URL; de kaart is client-side. --- */
  (function () {
    var form = document.querySelector('.contact-form');
    var kaart = document.getElementById('contact-bevestiging');
    if (!form || !kaart || !window.fetch || !window.FormData) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fallback = false, busy = false;

    function showCard(data) {
      var naamEl = document.getElementById('cb-naam');
      var naam = (String(data.get('naam') || '').trim() || '').slice(0, 60);
      if (naamEl && naam) naamEl.textContent = 'Bedankt, ' + naam + '.';
      form.hidden = true;
      kaart.hidden = false;
      // favicon → vinkje (bevestiging in het tabblad)
      var icon = document.querySelector('link[rel="icon"]');
      if (icon) icon.setAttribute('href', '/favicon-check.svg');
      kaart.focus({ preventScroll: true });
      kaart.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }

    form.addEventListener('submit', function (e) {
      if (fallback) return;            // terugvalpoging: native route, niet meer onderscheppen
      e.preventDefault();
      if (busy) return;                // dubbelklik-bescherming
      busy = true;
      var btn = form.querySelector('.contact-submit');
      if (btn) { btn.disabled = true; btn.textContent = 'Versturen…'; }
      var data = new FormData(form);
      fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('status ' + res.status);
          showCard(data);
        })
        .catch(function () {
          // geen dataverlies: alsnog de normale verzendroute (POST → /bedankt/)
          fallback = true; busy = false;
          if (btn) btn.disabled = false;
          form.submit();
        });
    });
  })();

  /* --- Mechanische tellers (PLAN sessie 4): de statistieken tellen stapsgewijs
        op — discrete ticks (14 stappen), geen soepele lerp; pacing is een
        benadering van --ease-mech. De eindwaarde is exact de bestaande,
        gebronde tekst uit de HTML — dit is puur presentatie, geen nieuw
        cijfer. Reduced-motion of geen IntersectionObserver: tekst blijft
        gewoon staan (eindwaarde). --- */
  (function () {
    var values = document.querySelectorAll('.stat-value');
    if (!values.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    var STEPS = 14, DUR = 900;
    function ease(t) { // in-out, mechanisch aanvoelend door de discrete stappen
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
    function fmt(n, dec) {
      return dec > 0 ? n.toFixed(dec).replace('.', ',') : String(Math.round(n));
    }
    function startCount(el) {
      var original = el.textContent;
      var re = /\d+(?:,\d+)?/g;
      if (!re.test(original)) return;
      el.classList.add('counting');
      for (var k = 1; k <= STEPS; k++) {
        (function (k) {
          setTimeout(function () {
            if (k === STEPS) { el.textContent = original; el.classList.remove('counting'); return; }
            var p = ease(k / STEPS);
            el.textContent = original.replace(/\d+(?:,\d+)?/g, function (tok) {
              var dec = tok.indexOf(',') > -1 ? tok.split(',')[1].length : 0;
              var target = parseFloat(tok.replace(',', '.'));
              return fmt(target * p, dec);
            });
          }, Math.round(k * (DUR / STEPS)));
        })(k);
      }
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        startCount(e.target); io.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    values.forEach(function (el) { io.observe(el); });
  })();

  /* --- WET 4: de feed-paginatransitie via klassen (alle browsers). <main>
        voert in met feed-in, uitsluitend bij navigatie binnen de site
        (referrer-check) — nooit een uitgaande animatie die een klik zou
        vertragen of blokkeren. Cross-document View Transitions is bewust
        uitgeschakeld: Chrome (stable, juli 2026) bevriest daarmee de
        inkomende pagina permanent (zie styles.css / PLAN.md). --- */
  (function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    var main = document.getElementById('main');
    if (!main) return;
    var ref = document.referrer;
    if (!ref || ref.indexOf(location.origin + '/') !== 0) return; // directe entree: geen transitie
    main.classList.add('feed-in');
    main.addEventListener('animationend', function () { main.classList.remove('feed-in'); }, { once: true });
  })();

  /* --- Easter egg (PLAN sessie 7): typ "hype" → stempel GEEN HYPE landt via
        WET 1. Eén keer per sessie (sessionStorage); verdwijnt na 1,5s of met
        Escape. KRITIEK: toetsen in input/textarea/select/contenteditable
        worden volledig genegeerd — typen in het contactformulier kan dit
        nooit triggeren. Het stempel blokkeert niets (pointer-events none,
        aria-hidden, geen scroll-lock). --- */
  (function () {
    try { if (sessionStorage.getItem('kv-hype') === '1') return; } catch (e) {}
    var buf = '', stamp = null, timer = null;
    function isTyping(t) {
      return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    }
    function dismiss() {
      if (stamp) { stamp.parentNode && stamp.parentNode.removeChild(stamp); stamp = null; }
      if (timer) { clearTimeout(timer); timer = null; }
      document.removeEventListener('keydown', onEsc);
    }
    function onEsc(e) { if (e.key === 'Escape') dismiss(); }
    function show() {
      document.removeEventListener('keydown', onKey);
      try { sessionStorage.setItem('kv-hype', '1'); } catch (e) {}
      stamp = document.createElement('div');
      stamp.className = 'hype-stamp';
      stamp.setAttribute('aria-hidden', 'true');
      stamp.textContent = 'GEEN HYPE';
      document.body.appendChild(stamp);
      document.addEventListener('keydown', onEsc);
      timer = setTimeout(dismiss, 1500);
    }
    function onKey(e) {
      if (isTyping(e.target)) { buf = ''; return; }
      if (e.key && e.key.length === 1) {
        buf = (buf + e.key.toLowerCase()).slice(-4);
        if (buf === 'hype') show();
      }
    }
    document.addEventListener('keydown', onKey);
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

  /* --- Cookiebanner (§ consent): accepteren/weigeren, sitebreed. Verschijnt
        éénmalig tot er een keuze in localStorage staat; twee gelijkwaardige
        knoppen (AVG: weigeren even makkelijk als accepteren). De banner wordt
        hier in JS gebouwd — geen inline HTML/JS, dus de strikte CSP blijft heel.
        Zonder JS laadt er sowieso geen tracking, dus is er dan geen banner nodig.

        KOPPELPUNT VOOR LATER (GA4 / Meta Pixel / LinkedIn): laad die scripts
        pas als toestemming er is. Luister daarvoor op het window-event
        'kelvantis:consent' — detail = { choice, analytics, marketing }:
          window.addEventListener('kelvantis:consent', function (e) {
            if (e.detail.analytics) { ...GA4 injecteren... }
          });
        Het event vuurt bij een verse keuze én bij elke herbezoek-load (zodat een
        loader weet wat mag). Heropenen kan via window.KelvantisCookies.open()
        of een element met [data-cookie-settings] (toekomstige footerlink). --- */
  (function () {
    var KEY = 'kv-cookie-consent';
    var VERSION = 1;

    function read() {
      try { var v = JSON.parse(localStorage.getItem(KEY)); return (v && v.v === VERSION) ? v : null; }
      catch (e) { return null; }
    }
    function write(choice) {
      var payload = { v: VERSION, choice: choice, analytics: choice === 'accepted', marketing: choice === 'accepted' };
      try { localStorage.setItem(KEY, JSON.stringify(payload)); } catch (e) {}
      return payload;
    }
    function emit(payload) {
      try { window.dispatchEvent(new CustomEvent('kelvantis:consent', { detail: payload })); } catch (e) {}
    }

    var banner = null;
    function close() {
      if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
      banner = null;
    }
    function decide(choice) { emit(write(choice)); close(); }

    function open() {
      if (banner) return;
      banner = document.createElement('section');
      banner.className = 'cc-banner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-labelledby', 'cc-title');
      banner.setAttribute('aria-describedby', 'cc-text');
      banner.tabIndex = -1;
      banner.innerHTML =
        '<span class="cc-label">§ Cookies</span>' +
        '<h2 class="cc-title" id="cc-title">Cookies op kelvantis.com</h2>' +
        '<p class="cc-text" id="cc-text">We gebruiken alleen noodzakelijke cookies om de site te laten werken. ' +
        'Analytische en marketingcookies plaatsen we pas als jij ze accepteert. ' +
        '<a href="/privacybeleid/">Meer info</a>.</p>' +
        '<div class="cc-actions">' +
          '<button type="button" class="btn btn--ghost" data-cc="reject">Weigeren</button>' +
          '<button type="button" class="btn btn--primary" data-cc="accept">Accepteren</button>' +
        '</div>';
      document.body.appendChild(banner);
      banner.querySelector('[data-cc="accept"]').addEventListener('click', function () { decide('accepted'); });
      banner.querySelector('[data-cc="reject"]').addEventListener('click', function () { decide('rejected'); });
      banner.focus({ preventScroll: true });
    }

    // Mini-API voor later (footerlink "Cookie-instellingen", of keuze wissen).
    window.KelvantisCookies = {
      open: open,
      get: read,
      reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} open(); }
    };
    document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });

    var saved = read();
    if (saved) { emit(saved); }   // herbezoek: keuze opnieuw uitzenden voor listeners
    else { open(); }
  })();

});
