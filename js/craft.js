/* ────────────────────────────────────────────────────────────────────────────
   AnchorEd — craft.js · reveal stagger choreography + nav scroll-spy.

   Imported AFTER core.js in js/main.js — order matters: core.js has
   already registered its .reveal IntersectionObserver, but observer
   callbacks are asynchronous, so the --d values written here are always
   in place before the first reveal fires. Keep this file in the same
   synchronous import graph; loading it lazily would break that guarantee.

   RESPONSIBILITIES
   - Copy each .reveal element's data-d attribute into its --d custom
     property, which CSS turns into a transition-delay
     (.reveal[data-d]{transition-delay:calc(var(--d,0)*1ms)} in
     css/10-foundation.css).
   - Auto-stagger grid children that carry no data-d of their own.
   - Scroll-spy: light the nav link for the section nearest a "reading
     line" at 40% of the viewport height.

   DOM/CSS CONTRACT
   Reads:   .reveal[data-d] · children of .jr-grid, .steps-grid,
            .focus-grid, .testi-grid, .locs · .nav-links a[href^="#"]
            (excluding .btn) and the sections those hashes point to.
   Toggles: .active on nav links (styled in css/50-motion.css).
   Writes:  --d (delay in ms, unitless number) on reveal elements; also
            sets data-d on auto-staggered cards so the DOM self-documents
            the delay it received.

   GOTCHAS
   - data-d attributes are inert without this file: CSS reads only the --d
     custom property, never the attribute itself.
   - Auto-stagger caps the index at 7 (max 595ms) so long grids don't
     develop a sluggish tail; it skips children that already have data-d
     or lack .reveal.
   - Scroll-spy tracks ALL currently intersecting sections and picks the
     one closest to the 40%-viewport line — a short section can win the
     highlight even while a tall neighbor is also on screen. The -15%
     rootMargin keeps barely-visible edges from competing.
   - Without IntersectionObserver the spy silently no-ops (early return);
     the stagger wiring above it still runs.

   Edit me when… you add a grid that should cascade (append its selector
   to the auto-stagger list) or tune reveal rhythm / scroll-spy feel.
   Adding a nav section needs no JS: the spy discovers any nav link whose
   #hash matches a section id.
   ──────────────────────────────────────────────────────────────────────── */
/* ===================== CRAFT LAYER (v14): activate choreography + scroll-spy ===================== */
(function(){
  /* 1) The markup carries data-d stagger values, but nothing ever fed them to the CSS
        (transition-delay:calc(var(--d)*1ms)). Wire them up so reveals actually cascade. */
  document.querySelectorAll('.reveal[data-d]').forEach(function(el){
    el.style.setProperty('--d', parseInt(el.getAttribute('data-d'), 10) || 0);
  });

  /* 2) Grids that had no stagger now cascade their cards in sequence (capped so tails stay tight). */
  document.querySelectorAll('.jr-grid,.steps-grid,.focus-grid,.testi-grid,.locs').forEach(function(g){
    Array.prototype.forEach.call(g.children, function(el, i){
      if(el.classList.contains('reveal') && !el.hasAttribute('data-d')){
        var d = Math.min(i, 7) * 85;
        el.setAttribute('data-d', String(d));
        el.style.setProperty('--d', d);
      }
    });
  });

  /* 3) Scroll-spy: keep the current section lit in the nav (a crafted, non-templated touch). */
  if(!('IntersectionObserver' in window)) return;
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]:not(.btn)'));
  var map = {};
  links.forEach(function(a){ var id = a.getAttribute('href').slice(1); var s = document.getElementById(id); if(s) map[id] = a; });
  var sections = Object.keys(map).map(function(id){ return document.getElementById(id); });
  if(!sections.length) return;
  var visible = new Set(), current = null;
  var spy = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
    var best = null, bestDist = Infinity, line = window.innerHeight * 0.4;
    visible.forEach(function(s){ var d = Math.abs(s.getBoundingClientRect().top - line); if(d < bestDist){ bestDist = d; best = s; } });
    var id = best ? best.id : null;
    if(id !== current){
      current = id;
      links.forEach(function(l){ l.classList.remove('active'); });
      if(id && map[id]) map[id].classList.add('active');
    }
  }, { rootMargin:'-15% 0px -15% 0px', threshold:[0, .2, .5, 1] });
  sections.forEach(function(s){ spy.observe(s); });
})();
