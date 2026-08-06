(function(){
  'use strict';

  /* payoff-band verdubbelen voor een naadloze loop */
  var band = document.getElementById('band');
  if (band) band.innerHTML = band.innerHTML + band.innerHTML;

  /* dunne lijn onder de header zodra je scrollt */
  var site = document.getElementById('site');
  if (site) {
    var onScroll = function(){
      site.classList.toggle('is-stuck', window.scrollY > 24);
      /* het woordmerk in de balk pas tonen als het neonbord uit beeld is */
      site.classList.toggle('is-past-hero', window.scrollY > window.innerHeight * .62);
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  /* Een cel zonder foto valt terug op het --panel-vlak. Het onerror-attribuut
     haalt de <img> weg; deze regel zet de klasse zodat de gloed-overlay en de
     hover-schaal uitgaan. Bij een geladen foto gebeurt het omgekeerde. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-cell]'), function(cell){
    var img = cell.querySelector('.cell__img');
    if (!img) return;
    var mark = function(){ cell.classList.add('cell--photo'); };
    if (img.complete) { if (img.naturalWidth > 0) mark(); }
    else { img.addEventListener('load', mark); }
  });

  /* het neon licht op zodra de pagina er is en neemt daarna zijn eigen
     CSS-flikkering over. Zonder JS staat het bord gewoon stabiel aan. */
  var sign = document.getElementById('sign');

  if (!window.gsap || !window.ScrollTrigger) {
    if (sign) sign.classList.add('is-lit');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function(){

    /* ── hero ── */
    gsap.set('[data-hero-line]', {yPercent:110});
    gsap.set('[data-hero-fade]', {autoAlpha:0, y:18});
    gsap.set('#sign', {autoAlpha:0});

    var tl = gsap.timeline({delay:.15});
    tl.from('.hero__video', {scale:1.08, duration:1.8, ease:'power2.out'}, 0)
      .to('#sign', {autoAlpha:1, duration:1.2, ease:'power2.out',
                    onComplete:function(){ if (sign) sign.classList.add('is-lit'); }}, .2)
      .to('[data-hero-line]', {yPercent:0, duration:1.1, stagger:.08, ease:'expo.out'}, .5)
      .to('[data-hero-fade]', {autoAlpha:1, y:0, duration:.9, stagger:.1, ease:'power2.out'}, 1.1);

    /* ── parallax op de hero-foto ── */
    gsap.to('.hero__video', {
      yPercent:12, ease:'none',
      scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:true}
    });

    /* ── secties ── */
    var reveals = gsap.utils.toArray('[data-reveal]');
    gsap.set(reveals, {autoAlpha:0, y:30});
    ScrollTrigger.batch(reveals, {
      start:'top 88%',
      onEnter:function(batch){
        gsap.to(batch, {autoAlpha:1, y:0, duration:.85, stagger:.07, ease:'power2.out', overwrite:true});
      }
    });

    /* ── werkraster: van onderen dichtgeschoven open, past bij de zwaarte ── */
    var cells = gsap.utils.toArray('[data-cell]');
    gsap.set(cells, {clipPath:'inset(100% 0 0 0)'});
    ScrollTrigger.batch(cells, {
      start:'top 90%',
      onEnter:function(batch){
        gsap.to(batch, {clipPath:'inset(0% 0 0 0)', duration:1, stagger:.07, ease:'power3.out', overwrite:true});
      }
    });

    return function(){
      gsap.set(['[data-hero-line]','[data-hero-fade]','#sign'].concat(reveals, cells),
               {clearProps:'all'});
      if (sign) sign.classList.add('is-lit');
    };
  });

  /* bij reduced motion staat alles stil en volledig zichtbaar */
  mm.add('(prefers-reduced-motion: reduce)', function(){
    if (sign) sign.classList.add('is-lit');
  });

  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
})();

/* Beeld-fallback — zat in de losse versie in inline onerror-attributen. Die staan
   de CSP van kelvantis.com niet toe, dus staat het hier. Ontbreekt een werkfoto,
   dan valt de cel terug op het egale --panel-vlak met het stijlnummer in
   neon-outline, in plaats van een gebroken beeld. Zodra de klant de foto
   aanlevert en die in media/ staat, vult de cel zichzelf. */
(function(){
  'use strict';
  document.querySelectorAll('.cell__img').forEach(function(img){
    img.addEventListener('error', function(){ img.remove(); });
  });
})();
