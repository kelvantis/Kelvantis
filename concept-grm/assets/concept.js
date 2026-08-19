/* GRM Steigerverhuur — conceptontwerp.
   Los bestand (niet inline): de CSP van kelvantis.com is script-src 'self',
   dus een inline blok zou geblokkeerd worden zonder eigen sha256-hash. */

gsap.registerPlugin(ScrollTrigger);

const projects=[[4,"Projectsteiger","Limburg"],[10,"Renovatie","Maastricht"],[11,"Schilderwerk","Maastricht"],[12,"Gevelsteiger","Limburg"]];
document.getElementById('grid').innerHTML = projects.map(([n,t,p])=>`
  <div class="p-card"><div class="ph"><img loading="lazy" src="media/projecten${n}.jpg" alt="${t}"></div>
  <div class="meta"><span>${t}</span><span>${p}</span></div></div>`).join('');

gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {

  gsap.timeline({ defaults:{ ease:"power3.out" } })
    .fromTo(".hero-bg img", { scale:1.16 }, { scale:1.06, duration:2.6, ease:"power2.out" }, 0)
    .from(".scaffold line.v", { scaleY:0, transformOrigin:"top", duration:1.1, stagger:.08, ease:"power2.inOut" }, .2)
    .from(".nodes rect", { scale:0, transformOrigin:"center", autoAlpha:0, duration:.45, stagger:.07, ease:"back.out(2.5)" }, "-=.4")
    .from(".hero-tag", { autoAlpha:0, y:14, duration:.7 }, "-=.85")
    .from(".hero h1 .l > span", { yPercent:105, duration:.95, stagger:.1, ease:"power4.out" }, "-=.55")
    .from(".hero .lede", { autoAlpha:0, y:16, duration:.7 }, "-=.5")
    .from(".hero-cue", { autoAlpha:0, y:14, duration:.7 }, "-=.35")
    .from(".factbar span", { autoAlpha:0, y:12, stagger:.07, duration:.55 }, "-=.3");

  gsap.from(".split .pane", { y:26, autoAlpha:0, duration:.8, stagger:.11, ease:"power3.out",
    scrollTrigger:{ trigger:".keuze", start:"top 80%" } });

  if (window.matchMedia("(min-width: 881px)").matches) {
    gsap.to(".hero-bg img", { yPercent:10, ease:"none",
      scrollTrigger:{ trigger:".hero", start:"top top", end:"bottom top", scrub:true } });
  }

  document.querySelectorAll('[data-pane]').forEach(pane => {
    const tl = gsap.timeline({ paused:true, defaults:{ ease:"power3.out" } })
      .to(pane.querySelector('.pane-fill'), { yPercent:0, duration:.5 })
      .to(pane.querySelector('.pane-img'), { autoAlpha:.45, scale:1, duration:1 }, 0);
    pane.addEventListener('mouseenter', ()=>{ pane.classList.add('on'); tl.play(); });
    pane.addEventListener('mouseleave', ()=>{ pane.classList.remove('on'); tl.reverse(); });
  });

  /* signature: de constructie bouwt zich op terwijl de stappen langskomen */
  const con = gsap.timeline({ defaults:{ ease:"power2.inOut" },
    scrollTrigger:{ trigger:".stap-grid", start:"top 82%", end:"bottom 60%", scrub:.8 } });
  con.from(".constructie .c-v", { scaleY:0, transformOrigin:"top", stagger:.3, duration:1 })
     .from(".constructie .c-h", { scaleX:0, transformOrigin:"left", stagger:.35, duration:1 }, .5)
     .from(".constructie .c-b", { scaleX:0, scaleY:0, transformOrigin:"left center", autoAlpha:0, stagger:.2, duration:.7 }, 1.4);

    gsap.from(".claim-h", { y:30, autoAlpha:0, duration:.9, ease:"power3.out",
    scrollTrigger:{ trigger:".claim", start:"top 78%" } });

  ScrollTrigger.batch(".huur, .stap, .p-card, .prijs-box, .plaatsen span", { start:"top 90%",
    onEnter: els => gsap.from(els,{ y:24, autoAlpha:0, duration:.7, stagger:.07, ease:"power3.out" }) });

  gsap.utils.toArray(".sec-head, .gebied-map").forEach(el=>{
    gsap.from(el,{ y:22, autoAlpha:0, duration:.8, ease:"power3.out",
      scrollTrigger:{ trigger:el, start:"top 88%" } });
  });

  gsap.from(".contact .c-grid > *",{ y:24, autoAlpha:0, duration:.8, stagger:.12, ease:"power3.out",
    scrollTrigger:{ trigger:".contact", start:"top 72%" } });

  return () => {};
});

window.addEventListener("load", () => ScrollTrigger.refresh());
