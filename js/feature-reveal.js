// AnchorEd — feature-reveal.js · ISB .is-in-view feature reveals
/* ── file contract ─────────────────────────────────────────────────────────
   PURPOSE
   Drives the replayable, ISB-style feature reveals: a section's choreography
   plays every time it scrolls into view, not just once.

   RESPONSIBILITIES
   • Observe .xform-feature, .believe-feature, .mv-grid, and
     .section--ever .stats.four.
   • Toggle .is-in-view on BOTH enter and exit so the CSS stagger replays.
   • featSafety: after window load, force-reveal anything already in view.

   DOM/CSS CONTRACT
   • Toggles exactly one hook: .is-in-view. The animations live in CSS —
     50-motion.css (#transform .xform-feature visual/copy stagger) and
     60-isb-unified.css sections (E) per-stat rise and (F) mv-grid pair.
   • These elements intentionally do NOT ride the fire-once .reveal → .in
     pipeline (their wrappers dropped .reveal; see the notes in
     60-isb-unified.css) — .is-in-view is their sole animation driver.
     Headings inside them stay owned by core.js's headIO (.drawn).

   GOTCHAS
   • Unlike core.js's reveal observer (adds .in once, then unobserves), this
     observer uses classList.toggle(…, e.isIntersecting): the class comes
     OFF when the element leaves, which is what makes the reveal replay.
   • The trigger is threshold 0.15 + rootMargin '0px 0px -12% 0px'. A
     feature already partially visible at load can sit just under that bar
     and stay hidden until the first scroll — featSafety (on window load)
     reveals anything whose top is above 92% of the viewport so nothing is
     stuck invisible on first paint.
   • featSafety and the no-IntersectionObserver fallback only ADD the class
     (reveal without replay) — degraded, never broken.
   • No prefers-reduced-motion check here, on purpose: every .is-in-view
     consumer has an !important reduced-motion guard in the CSS that forces
     the content visible, so the class toggle is inert for those users.

   Edit me when… a new section should replay its reveal — add its selector
   to the feats query here and its .is-in-view rules to the CSS layer.
   ────────────────────────────────────────────────────────────────────────── */
/* ISB-style section scroll reveal: toggle .is-in-view as the feature enters/leaves (replays) */
(function(){
  var feats=[].slice.call(document.querySelectorAll('.xform-feature, .believe-feature, .mv-grid, .section--ever .stats.four'));
  if(!feats.length) return;
  var reveal=function(f){ f.classList.add('is-in-view'); };
  if(!('IntersectionObserver' in window)){ feats.forEach(reveal); return; }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ e.target.classList.toggle('is-in-view', e.isIntersecting); });
  },{threshold:0.15, rootMargin:'0px 0px -12% 0px'});
  feats.forEach(function(f){ io.observe(f); });
  /* safety net: reveal features already sitting in the viewport at load that
     the -12% rootMargin / 0.15 threshold would leave hidden until a scroll */
  var featSafety=function(){ feats.forEach(function(f){ if(f.getBoundingClientRect().top < window.innerHeight*0.92) reveal(f); }); };
  window.addEventListener('load', featSafety);
})();
