// AnchorEd — craft.js · stagger choreography + nav scroll-spy
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
