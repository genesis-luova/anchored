// AnchorEd — pillars.js · pillars carousel
/*
  Single-card carousel for the "pillars" section: one .pillar visible at a
  time on a fixed-height stage, with slide/blur transitions, dots, arrows,
  keyboard, swipe, and visibility-gated autoplay.

  RESPONSIBILITIES
  • Measure all cards and lock the stage to the tallest one (no reflow jumps).
  • Animate card in/out via the Web Animations API; instant swap otherwise.
  • Build the dot rail; keep dots, counter (01/NN), progress bar, and
    prev/next disabled state in sync.
  • Swipe via pointer events (touch / pen / mouse alike).
  • Autoplay every 5.2s, paused on hover/focus and when scrolled off-screen,
    stopped permanently on any deliberate user navigation.

  DOM/CSS CONTRACT
  Reads (inside #pillarCarousel; whole module no-ops if the id is absent):
    .pcar-stage        card container — gets inline height set here
    .pillar            the cards — get .is-active / .measuring toggled,
                       plus inline visibility & z-index during transitions
    .pcar-dots         dot rail — .pcar-dot buttons appended, .is-active set
    [data-dir="prev"] / [data-dir="next"]   arrow buttons (disabled at ends)
    .pcar-bar          progress bar — inline width %
    .pcar-cur / .pcar-tot                   zero-padded counter text
  CSS in css/30-widgets.css styles these hooks; .is-active also drives the
  card's staggered content reveal, and .measuring makes a card measurable
  (static/visible) without showing it.

  GOTCHAS
  • stopAuto() is PERMANENT (stopped=true) — any click on a dot/arrow, key
    press, or manual go() kills autoplay for the rest of the visit; only
    pauseAuto() (hover/focus/off-screen) is temporary. Deliberate choice:
    a carousel that restarts after the user picked a card feels broken.
  • Autoplay wraps (last → first), but manual next/prev clamps at the ends
    and the arrows disable there — wrap is for ambient motion only.
  • boot() waits for document.fonts.ready before measuring: web-font swap
    changes card heights, so measuring earlier locks in the wrong height.
  • cur is updated BEFORE the animation finishes; the `animating` flag is
    what blocks re-entry, so never early-return on cur alone inside go().
  • commitStyles()+cancel() in try/catch: commitStyles throws on detached
    or display:none elements in some browsers — failure is cosmetic only.
  • reduced-motion (or no WAAPI): go() swaps visibility instantly; autoplay
    never starts at all (startAuto checks `reduce`).
  • Swipe fires on pointerup only — ≥48px horizontal and 1.3× more X than Y,
    so vertical page scrolls over the stage don't trigger navigation.

  Position in js/main.js import order: fourth — self-contained (IIFE, no
  exports); order relative to other modules is not load-bearing.

  Edit me when… you add/remove pillar cards (markup only — counts, dots and
  height adapt), retune autoplay/transition timing, or change swipe feel.
*/
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

  /* ── dot rail ─────────────────────────────────────────────────────────── */
  var dots=cards.map(function(_,i){
    var b=document.createElement('button');
    b.className='pcar-dot'; b.type='button';
    b.setAttribute('aria-label','Show item '+(i+1));
    b.addEventListener('click',function(){ stopAuto(); go(i); });
    dotsWrap.appendChild(b); return b;
  });

  var cur=0, animating=false;

  /* ── stage height ─────────────────────────────────────────────────────
     Cards are absolutely positioned, so the stage has no natural height.
     .measuring temporarily makes each card measurable; the stage is then
     locked to the tallest card so switching never shifts layout below. */
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

  /* ── card transition ──────────────────────────────────────────────────
     dirHint (+1/-1) lets autoplay's wrap (last → first) still animate
     forward; without it direction is inferred from the index delta. */
  function go(to, dirHint){
    to=Math.max(0,Math.min(total-1,to));
    if(to===cur || animating) return;
    var dir=(dirHint!=null)?dirHint:(to>cur?1:-1), sign=dir>=0?1:-1;
    var inc=cards[to], out=cards[cur];

    inc.style.visibility='visible';
    inc.classList.add('is-active');       // staggered content reveal
    out.classList.remove('is-active');

    // Reduced motion / no WAAPI: instant swap, no animation state to manage.
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
      // Bake final keyframe values into inline style, then drop the
      // animations (fill:'both' otherwise pins the elements forever).
      // try/catch: commitStyles can throw if the element went display:none.
      try{ aIn.commitStyles(); aIn.cancel(); }catch(e){}
      try{ aOut.commitStyles(); aOut.cancel(); }catch(e){}
      out.style.visibility='hidden'; out.style.zIndex=''; inc.style.zIndex='';
      animating=false;
    };
    // cur flips immediately (UI stays responsive); `animating` above is the
    // sole guard against overlapping transitions.
    cur=to; updateUI();
  }

  /* ── manual navigation (arrows, keyboard, swipe) ──────────────────────
     All of these call stopAuto() first: user intent permanently ends
     autoplay (see GOTCHAS in the header). */
  function nextCard(){ stopAuto(); go(cur+1,1); }
  function prevCard(){ stopAuto(); go(cur-1,-1); }
  prev.addEventListener('click',prevCard);
  next.addEventListener('click',nextCard);

  car.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'){ e.preventDefault(); nextCard(); }
    else if(e.key==='ArrowLeft'){ e.preventDefault(); prevCard(); }
  });

  // swipe (touch / pen / mouse)
  // Decided entirely on pointerup: ≥48px of X travel and 1.3× more X than Y,
  // so vertical scrolling that starts on the stage never flips cards.
  var dxs=0, dys=0, sw=false;
  stage.addEventListener('pointerdown',function(e){ sw=true; dxs=e.clientX; dys=e.clientY; });
  stage.addEventListener('pointerup',function(e){
    if(!sw) return; sw=false;
    var dx=e.clientX-dxs, dy=e.clientY-dys;
    if(Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.3){ if(dx<0) nextCard(); else prevCard(); }
  });
  stage.addEventListener('pointercancel',function(){ sw=false; });

  // autoplay
  // Two-level control: pauseAuto() is temporary (hover, focus, off-screen);
  // stopAuto() sets `stopped` and nothing restarts after it. startAuto() is
  // a no-op under prefers-reduced-motion.
  var timer=null, stopped=false;
  function adv(){ go(cur>=total-1?0:cur+1,1); }
  function startAuto(){ if(reduce||stopped||timer)return; timer=setInterval(adv,5200); }
  function pauseAuto(){ if(timer){ clearInterval(timer); timer=null; } }
  function stopAuto(){ stopped=true; pauseAuto(); }
  car.addEventListener('pointerenter',pauseAuto);
  car.addEventListener('pointerleave',function(){ if(!stopped) startAuto(); });
  car.addEventListener('focusin',pauseAuto);
  car.addEventListener('focusout',function(){ if(!stopped) startAuto(); });

  /* ── boot ─────────────────────────────────────────────────────────────── */
  function boot(){
    if(totEl) totEl.textContent=pad(total);
    setHeight();
    cards[0].classList.add('is-active'); cards[0].style.visibility='visible';
    updateUI();
  }
  // Measure only after web fonts load — font swap changes card heights.
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(boot); else boot();
  // Re-measure on resize, debounced 150ms.
  var rz; addEventListener('resize',function(){ clearTimeout(rz); rz=setTimeout(setHeight,150); });

  // Autoplay only while the carousel is ≥35% in the viewport. This observer
  // stays live for the page's lifetime (not fire-once): it re-arms autoplay
  // every time the section scrolls back into view — unless the user stopped it.
  if('IntersectionObserver' in window){
    var vio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ if(!stopped) startAuto(); } else pauseAuto(); }); },{threshold:.35});
    vio.observe(car);
  } else startAuto();
})();
