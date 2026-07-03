// AnchorEd — video.js · anchoring-chain film auto-load
(function(){var f=document.getElementById('avFrame');if(!f)return;var b=f.querySelector('.av-poster');if(!b)return;
var loaded=false;
function inject(){if(loaded)return;loaded=true;var id=f.getAttribute('data-vid');var i=document.createElement('iframe');
i.src='https://drive.google.com/file/d/'+id+'/preview?autoplay=1';i.setAttribute('allow','autoplay; encrypted-media; fullscreen');i.setAttribute('allowfullscreen','');i.title='The Anchoring Chain';f.innerHTML='';f.appendChild(i);}
b.addEventListener('click',inject);
/* auto-load the player as the film scrolls into view, so it is ready to play without a loading step */
if('IntersectionObserver' in window && !(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){
  var vo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){inject();vo.disconnect();}});},{threshold:0.45});
  vo.observe(f);
}})();
