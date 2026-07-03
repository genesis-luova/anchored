// AnchorEd — pillars.js · pillars carousel
/* Pillars carousel — single-card stage with rich transitions */
(function(){
  var car=document.getElementById('pillarCarousel');
  if(!car) return;
  var stage=car.querySelector('.pcar-stage');
  var cards=[].slice.call(stage.querySelectorAll('.pillar'));
  var dotsWrap=car.querySelector('.pcar-dots');
  var prev=car.querySelector('[data-dir="prev"]');
  var next=car.querySelector('[data-dir="next"]');
  var bar=car.querySelector('.pcar-bar');
  var curEl=car.querySelector('.pcar-cur');
  var totEl=car.querySelector('.pcar-tot');
  var total=cards.length;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canAnim=!!(window.Element && Element.prototype.animate);
  if(!cards.length) return;

  function pad(n){ return (n<10?'0':'')+n; }

  var dots=cards.map(function(_,i){
    var b=document.createElement('button');
    b.className='pcar-dot'; b.type='button';
    b.setAttribute('aria-label','Show item '+(i+1));
    b.addEventListener('click',function(){ stopAuto(); go(i); });
    dotsWrap.appendChild(b); return b;
  });

  var cur=0, animating=false;

  function setHeight(){
    cards.forEach(function(c){ c.classList.add('measuring'); });
    var max=0; cards.forEach(function(c){ if(c.offsetHeight>max) max=c.offsetHeight; });
    cards.forEach(function(c){ c.classList.remove('measuring'); });
    if(max) stage.style.height=max+'px';
  }
  function updateUI(){
    dots.forEach(function(d,i){ d.classList.toggle('is-active',i===cur); });
    if(curEl) curEl.textContent=pad(cur+1);
    bar.style.width=((cur+1)/total*100)+'%';
    prev.disabled=cur<=0; next.disabled=cur>=total-1;
  }

  function go(to, dirHint){
    to=Math.max(0,Math.min(total-1,to));
    if(to===cur || animating) return;
    var dir=(dirHint!=null)?dirHint:(to>cur?1:-1), sign=dir>=0?1:-1;
    var inc=cards[to], out=cards[cur];

    inc.style.visibility='visible';
    inc.classList.add('is-active');       // staggered content reveal
    out.classList.remove('is-active');

    if(reduce || !canAnim){
      out.style.visibility='hidden';
      cur=to; updateUI(); return;
    }

    animating=true;
    inc.style.zIndex=3; out.style.zIndex=2;
    var ease='cubic-bezier(.22,1,.36,1)', dur=620;
    var aIn=inc.animate([
      {opacity:0, transform:'translateX('+(sign*70)+'px) scale(.9) rotateY('+(sign*10)+'deg)', filter:'blur(9px)'},
      {opacity:1, transform:'translateX(0) scale(1) rotateY(0deg)', filter:'blur(0px)'}
    ], {duration:dur, easing:ease, fill:'both'});
    var aOut=out.animate([
      {opacity:1, transform:'translateX(0) scale(1) rotateY(0deg)', filter:'blur(0px)'},
      {opacity:0, transform:'translateX('+(-sign*70)+'px) scale(.9) rotateY('+(-sign*10)+'deg)', filter:'blur(9px)'}
    ], {duration:dur, easing:ease, fill:'both'});

    aOut.onfinish=function(){
      try{ aIn.commitStyles(); aIn.cancel(); }catch(e){}
      try{ aOut.commitStyles(); aOut.cancel(); }catch(e){}
      out.style.visibility='hidden'; out.style.zIndex=''; inc.style.zIndex='';
      animating=false;
    };
    cur=to; updateUI();
  }

  function nextCard(){ stopAuto(); go(cur+1,1); }
  function prevCard(){ stopAuto(); go(cur-1,-1); }
  prev.addEventListener('click',prevCard);
  next.addEventListener('click',nextCard);

  car.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'){ e.preventDefault(); nextCard(); }
    else if(e.key==='ArrowLeft'){ e.preventDefault(); prevCard(); }
  });

  // swipe (touch / pen / mouse)
  var dxs=0, dys=0, sw=false;
  stage.addEventListener('pointerdown',function(e){ sw=true; dxs=e.clientX; dys=e.clientY; });
  stage.addEventListener('pointerup',function(e){
    if(!sw) return; sw=false;
    var dx=e.clientX-dxs, dy=e.clientY-dys;
    if(Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.3){ if(dx<0) nextCard(); else prevCard(); }
  });
  stage.addEventListener('pointercancel',function(){ sw=false; });

  // autoplay
  var timer=null, stopped=false;
  function adv(){ go(cur>=total-1?0:cur+1,1); }
  function startAuto(){ if(reduce||stopped||timer)return; timer=setInterval(adv,5200); }
  function pauseAuto(){ if(timer){ clearInterval(timer); timer=null; } }
  function stopAuto(){ stopped=true; pauseAuto(); }
  car.addEventListener('pointerenter',pauseAuto);
  car.addEventListener('pointerleave',function(){ if(!stopped) startAuto(); });
  car.addEventListener('focusin',pauseAuto);
  car.addEventListener('focusout',function(){ if(!stopped) startAuto(); });

  function boot(){
    if(totEl) totEl.textContent=pad(total);
    setHeight();
    cards[0].classList.add('is-active'); cards[0].style.visibility='visible';
    updateUI();
  }
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(boot); else boot();
  var rz; addEventListener('resize',function(){ clearTimeout(rz); rz=setTimeout(setHeight,150); });

  if('IntersectionObserver' in window){
    var vio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ if(!stopped) startAuto(); } else pauseAuto(); }); },{threshold:.35});
    vio.observe(car);
  } else startAuto();
})();
