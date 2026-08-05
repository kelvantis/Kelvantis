(function(){
  'use strict';

  /* payoff-band verdubbelen voor een naadloze loop */
  var band = document.getElementById('band');
  if (band) band.innerHTML = band.innerHTML + band.innerHTML;

  /* rode dot-cursor — los van GSAP, werkt dus ook zonder CDN */
  (function(){
    var cursor = document.getElementById('cursor');
    if (!cursor || !window.matchMedia('(pointer:fine)').matches) return;
    document.body.classList.add('has-cursor');

    var smooth = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    var tx = window.innerWidth / 2, ty = window.innerHeight / 2, cx = tx, cy = ty;

    window.addEventListener('mousemove', function(e){
      tx = e.clientX; ty = e.clientY;
      if (!smooth){ cursor.style.transform = 'translate(' + tx + 'px,' + ty + 'px) translate(-50%,-50%)'; }
    });

    if (smooth) (function loop(){
      cx += (tx - cx) * 0.19; cy += (ty - cy) * 0.19;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();

    /* op donkere vlakken wordt de dot inkt, anders verdwijnt het rood in het rood */
    document.querySelectorAll('a,button,.step,.plate,.stat').forEach(function(el){
      el.addEventListener('mouseenter', function(){
        cursor.classList.add('is-big');
        cursor.classList.toggle('is-dark', !!el.closest('.hero, .ink, .band'));
      });
      el.addEventListener('mouseleave', function(){ cursor.classList.remove('is-big','is-dark'); });
    });
  })();

  /* zonder GSAP blijft de pagina gewoon volledig leesbaar */
  if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);
  var mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function(){

    gsap.set('[data-hero-line] > span', { yPercent:110 });
    gsap.set('[data-hero-fade]', { autoAlpha:0, y:24 });
    gsap.set('.hero__video', { autoAlpha:0, scale:1.06 });
    gsap.set('.vidui', { autoAlpha:0 });
    gsap.set('.nav', { autoAlpha:0 });
    gsap.set('[data-reveal]', { autoAlpha:0, y:28 });

    var intro = gsap.timeline({ defaults:{ ease:'expo.out' } });
    intro.to('.hero__video',   { autoAlpha:1, scale:1, duration:1.8, ease:'power2.out' }, 0)
         .to('.vidui',         { autoAlpha:1, duration:1.4, ease:'power2.out' }, 0.25)
         .to('.nav',           { autoAlpha:1, duration:0.8 }, 0.3)
         .to('[data-hero-line] > span', { yPercent:0, duration:1.2, stagger:0.08 }, 0.15)
         .to('[data-hero-fade]', { autoAlpha:1, y:0, duration:0.9, stagger:0.12 }, '-=0.65');

    ScrollTrigger.batch('[data-reveal]', {
      start:'top 88%',
      onEnter:function(els){ gsap.to(els, { autoAlpha:1, y:0, duration:0.9, stagger:0.08, ease:'expo.out', overwrite:true }); }
    });

    var heroParallax = gsap.timeline({
      scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:true }
    });
    heroParallax.to('.hero__media', { yPercent:12, ease:'none' }, 0);

    return function(){ intro.kill(); heroParallax.kill(); };
  });

  /* horizontaal gepinde werk-sectie, alleen desktop */
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', function(){
    var track = document.getElementById('workTrack');
    var section = document.getElementById('werk');
    var dist = function(){ return Math.max(0, track.scrollWidth - window.innerWidth + 60); };

    var tl = gsap.timeline({
      scrollTrigger:{
        trigger: section,
        start:'top top',
        end: function(){ return '+=' + dist(); },
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });
    tl.to(track, { x: function(){ return -dist(); }, ease:'none' }, 0);

    return function(){
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
      gsap.set(track, { clearProps:'x' });
    };
  });

  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
})();

/* Foto-fallback — zat eerder in inline onerror-attributen; die staan de CSP van
   kelvantis.com niet toe, dus is het hierheen verhuisd. */
(function(){
  'use strict';
  document.querySelectorAll('.studioshot img').forEach(function(img){
    img.addEventListener('error', function(){
      var fig = img.closest('.studioshot');
      if (fig) fig.remove();
    });
  });
  document.querySelectorAll('.plate__img').forEach(function(img){
    img.addEventListener('error', function(){
      var plate = img.closest('.plate');
      if (plate) plate.classList.remove('plate--photo');
      img.remove();
    });
  });
})();
