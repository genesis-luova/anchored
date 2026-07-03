// AnchorEd — feature-reveal.js · ISB .is-in-view feature reveals
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
  var featSafety=function(){ feats.forEach(function(f){ if(f.getBoundingClientRect().top < window.innerHeight*0.92) reveal(f); }); };
  window.addEventListener('load', featSafety);
})();
