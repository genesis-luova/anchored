// AnchorEd — parallax.js · hero copy drift + section photo focal parallax
/* ── file contract ─────────────────────────────────────────────────────────
   PURPOSE
   Scroll-linked motion depth: the hero copy drifts upward as it scrolls out,
   and section photos shift their background focal point at a slower rate
   than the page (classic parallax, no edge reveal).

   RESPONSIBILITIES
   • On scroll/resize (rAF-coalesced), write an inline translate3d transform
     on .hero-inner and an inline background-position-y on section photos.

   DOM/CSS CONTRACT
   • Reads: .hero-inner; .jr .scene-photo and .final .scene-photo.
   • Writes: element.style.transform (.hero-inner) and
     element.style.backgroundPositionY (photos) — inline styles that
     deliberately override the stylesheets' static background-position:center
     (20-brand-layers.css / 50-motion.css). Don't try to re-center these
     photos from CSS; the inline value wins while this module runs.
   • Toggles no classes. Heading reveals (.drawn) belong to core.js's headIO,
     not this file.

   GOTCHAS
   • The whole module bails at the top under prefers-reduced-motion — no
     listeners are attached at all, so reduced-motion users get a fully
     static page (per the house rule in README).
   • The hero transform is only written while scrollY < 1.15 × viewport
     height: past that the hero is offscreen, so we stop touching style on
     every scroll frame for nothing.
   • Photos more than 60px outside the viewport are skipped each frame.
   • Position in js/main.js import order: after craft.js, before
     feature-reveal.js — it shares no elements' classes with other modules,
     so its slot is convention, not a dependency.

   Edit me when… tuning parallax intensity (hero drift factor 0.16, photo
   focal swing ±16% around center) or adding new parallax surfaces.
   ────────────────────────────────────────────────────────────────────────── */
/* ===================== v15: scroll parallax (section transitions + hero depth) =====================
   Heading reveals are wired via the existing headIO (adds .drawn). This adds motion depth:
   - hero copy drifts up as you scroll past it
   - section photos shift their focal point at a slower rate (true parallax, no edge reveal) */
(function(){
  if(!window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var heroInner = document.querySelector('.hero-inner');
  var photos = Array.prototype.slice.call(document.querySelectorAll('.jr .scene-photo, .final .scene-photo'));
  var ticking = false;
  /* ── per-frame update (rAF-coalesced: many scroll events → one write pass) ── */
  function update(){
    ticking = false;
    var vh = window.innerHeight, y = window.scrollY;
    if(heroInner && y < vh * 1.15){
      heroInner.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0)';
    }
    for(var i = 0; i < photos.length; i++){
      var p = photos[i], r = p.getBoundingClientRect();
      if(r.bottom < -60 || r.top > vh + 60) continue;   // offscreen (±60px slack): skip the style write
      var prog = (r.top + r.height / 2 - vh / 2) / vh;      // ~ -0.6 (below) .. 0.6 (above)
      p.style.backgroundPositionY = (50 - prog * 16).toFixed(1) + '%';
    }
  }
  window.addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } }, {passive:true});
  window.addEventListener('resize', function(){ requestAnimationFrame(update); }, {passive:true});
  update();
})();
