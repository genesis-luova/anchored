// AnchorEd — parallax.js · hero copy drift + section photo focal parallax
/* ===================== v15: scroll parallax (section transitions + hero depth) =====================
   Heading reveals are wired via the existing headIO (adds .drawn). This adds motion depth:
   - hero copy drifts up as you scroll past it
   - section photos shift their focal point at a slower rate (true parallax, no edge reveal) */
(function(){
  if(!window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var heroInner = document.querySelector('.hero-inner');
  var photos = Array.prototype.slice.call(document.querySelectorAll('.jr .scene-photo, .final .scene-photo'));
  var ticking = false;
  function update(){
    ticking = false;
    var vh = window.innerHeight, y = window.scrollY;
    if(heroInner && y < vh * 1.15){
      heroInner.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0)';
    }
    for(var i = 0; i < photos.length; i++){
      var p = photos[i], r = p.getBoundingClientRect();
      if(r.bottom < -60 || r.top > vh + 60) continue;
      var prog = (r.top + r.height / 2 - vh / 2) / vh;      // ~ -0.6 (below) .. 0.6 (above)
      p.style.backgroundPositionY = (50 - prog * 16).toFixed(1) + '%';
    }
  }
  window.addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } }, {passive:true});
  window.addEventListener('resize', function(){ requestAnimationFrame(update); }, {passive:true});
  update();
})();
