/* ────────────────────────────────────────────────────────────────────────────
   AnchorEd — core.js · the workhorse module: nav chrome, scroll reveals,
   hero animation, and the page-wide decorative effects.

   Imported FIRST from js/main.js. Order note: craft.js (imported later in
   the same synchronous module graph) writes the --d stagger values used by
   the .reveal observer registered here — that is safe because
   IntersectionObserver callbacks never fire until the whole graph has run.

   RESPONSIBILITIES
   - Nav: .scrolled state on #nav + width of the #progress scroll bar.
   - Mobile menu (#mobileMenu) open/close.
   - .reveal enter-viewport observer + .steps-grid connector line.
   - Count-up counters on [data-target] stat elements.
   - Hero slideshow (.slide + generated #dots buttons) and #rotator word
     cycler with measured box width.
   - Tabs (.tab <-> .tab-panel via data-tab).
   - Ambient hero particles (generated <i> inside .particles).
   - .scene-img error fallback (hide broken photo, show CSS art behind).
   - Clip-wipe reveal for .scene.clip.
   - Hover tilt on .jr / .loc cards; split-media photo parallax.
   - h2.head heading underline reveal (observer + scroll safety net).
   - Injected back-to-top button (.totop).
   - Cursor spotlight (.spotlight) + magnetic .btn-gold buttons.

   DOM/CSS CONTRACT
   Reads:   #nav #progress #menuBtn #mobileClose #mobileMenu · .reveal ·
            .steps-grid · [data-target] · .slide #dots · #rotator span ·
            .tab[data-tab] .tab-panel · .particles · .scene-img ·
            .scene.clip · .jr .loc · .split-media .scene · h2.head · .btn-gold
   Toggles: .scrolled (#nav) · .open (#mobileMenu) · .in (.reveal) ·
            .in-line (.steps-grid) · .active (slides/dots/tabs/panels) ·
            .on/.off (rotator words) · .shown (.scene.clip) ·
            .drawn/.cu (h2.head) · .show (.totop)
   Writes:  --rw on #rotator (measured word width) · inline transforms on
            tilt cards, the split-media scene, and magnetic buttons ·
            inline position/size/timing styles on particle <i>s.
   Creates: #dots buttons · a hidden measuring <span> · particle <i>s ·
            button.totop · div.spotlight.
   The CSS half of each hook lives mainly in css/20-brand-layers.css,
   css/50-motion.css and css/60-isb-unified.css — a class toggled here with
   no matching CSS rule does nothing.

   GOTCHAS
   - Every IntersectionObserver here is fire-once (unobserve after first
     intersect): reveals never replay, counters never re-count.
   - `reduce` (prefers-reduced-motion) gates ALL looping/pointer-driven
     motion — slideshow, rotator cycle, particles, tilt, parallax,
     spotlight, magnetic buttons. New effects must honor the same flag.
   - The rotator measures word widths only after document.fonts.ready;
     measuring before the display font loads yields wrong widths.
   - No DOMContentLoaded wrapper needed: module scripts are deferred, so
     the DOM is fully parsed before this runs. #nav, #progress, #menuBtn,
     #mobileClose, #mobileMenu and #dots are REQUIRED — removing any from
     index.html throws here and kills the rest of this module.
   - h2.head reveal uses threshold:0 plus a scroll safety net — see the
     inline comments at headIO/headSafety for why.

   Edit me when… you add or change a page-wide scroll/hover/hero effect
   (section-specific choreography lives in craft.js, parallax.js and
   feature-reveal.js instead).
   ──────────────────────────────────────────────────────────────────────── */

/* ── nav: scrolled state + scroll-progress bar ── */
const nav=document.getElementById('nav'),prog=document.getElementById('progress');
  const onScroll=()=>{nav.classList.toggle('scrolled',window.scrollY>60);const h=document.documentElement.scrollHeight-window.innerHeight;prog.style.width=(h>0?(window.scrollY/h)*100:0)+'%';};
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});

  /* ── mobile menu ── */
  const mm=document.getElementById('mobileMenu');
  document.getElementById('menuBtn').addEventListener('click',()=>mm.classList.add('open'));
  document.getElementById('mobileClose').addEventListener('click',()=>mm.classList.remove('open'));
  mm.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mm.classList.remove('open')));

  // Single reduced-motion check, shared by every effect below.
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── reveal-on-scroll (.reveal → .in) + steps-grid connector line ── */
  // -8% bottom rootMargin: elements must clear the fold slightly before revealing.
  const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  // The steps-grid connector line (.in-line) draws separately from its card
  // reveals; without IntersectionObserver support it is simply shown.
  (function(){var g=document.querySelector('.steps-grid');if(!g)return;if(!('IntersectionObserver' in window)){g.classList.add('in-line');return;}var lo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in-line');lo.unobserve(e.target);}})},{threshold:0.2});lo.observe(g);})();

  /* ── count-up counters ([data-target] → animated textContent) ── */
  // Cubic ease-out over 1.5s; threshold 0.6 waits until the stat is well in view.
  const ac=(el)=>{const t=+el.dataset.target,d=1500,s=performance.now();const tick=(n)=>{const p=Math.min((n-s)/d,1);el.textContent=Math.round((1-Math.pow(1-p,3))*t);if(p<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);};
  const cio=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){ac(e.target);cio.unobserve(e.target);}})},{threshold:0.6});
  document.querySelectorAll('[data-target]').forEach(el=>cio.observe(el));

  /* ── hero slideshow (.slide + generated #dots buttons) ── */
  const slides=[...document.querySelectorAll('.slide')],dots=document.getElementById('dots');
  let si=0;
  slides.forEach((_,i)=>{const b=document.createElement('button');if(i===0)b.classList.add('active');b.addEventListener('click',()=>go(i));dots.appendChild(b);});
  const dotsEls=[...dots.children];
  function go(i){slides[si].classList.remove('active');dotsEls[si].classList.remove('active');si=i;slides[si].classList.add('active');dotsEls[si].classList.add('active');}
  if(!reduce && slides.length>1){setInterval(()=>go((si+1)%slides.length),6000);}

  /* ── hero word rotator (#rotator) ── */
  // Box width tracks the active word (measured), so "in Truth." stays flush.
  const rot=document.getElementById('rotator');
  if(rot){
    const words=[...rot.querySelectorAll('span')];
    let widths=[], wi=0;
    // hidden ruler that mirrors the rotator's font so we can measure each word's true width
    const ruler=document.createElement('span');
    ruler.style.cssText='position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;pointer-events:none';
    document.body.appendChild(ruler);
    const measure=()=>{
      const c=getComputedStyle(words[0]);
      ruler.style.fontFamily=c.fontFamily;ruler.style.fontSize=c.fontSize;
      ruler.style.fontWeight=c.fontWeight;ruler.style.fontStyle=c.fontStyle;
      ruler.style.letterSpacing=c.letterSpacing;
      widths=words.map(w=>{ruler.textContent=w.textContent;return Math.ceil(ruler.getBoundingClientRect().width)+2;});
    };
    const apply=(animate)=>{
      if(!widths.length)return;
      if(!animate)rot.style.transition='none';
      rot.style.setProperty('--rw',widths[wi]+'px');
      // Forced reflow flushes the no-transition width so re-enabling the
      // transition afterwards doesn't animate the jump.
      if(!animate){void rot.offsetWidth;rot.style.transition='';}
    };
    const setup=()=>{measure();apply(false);};
    (document.fonts&&document.fonts.ready)?document.fonts.ready.then(setup):setup();
    let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{measure();apply(false);},150);});
    if(!reduce && words.length>1){
      setInterval(()=>{
        words[wi].classList.remove('on');words[wi].classList.add('off');
        const prev=wi;wi=(wi+1)%words.length;
        apply(true);                                   // grow/shrink the box to the new word
        words[wi].classList.remove('off');words[wi].classList.add('on');
        // 600ms outlasts the .55s CSS word transition; keep in sync with
        // .rotator span in css/10-foundation.css.
        setTimeout(()=>words[prev].classList.remove('off'),600);
      },2400);
    }
  }

  /* ── tabs (.tab ↔ .tab-panel via data-tab) ── */
  document.querySelectorAll('.tab').forEach(t=>{t.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');document.getElementById(t.dataset.tab).classList.add('active');
  });});

  /* ── ambient particles (16 <i>s per .particles container) ── */
  // Negative animation-delay scatters starting phases so particles drift
  // mid-flight from the first frame instead of popping in together.
  if(!reduce){document.querySelectorAll('.particles').forEach(p=>{for(let i=0;i<16;i++){const s=document.createElement('i');const sz=Math.random()*2+1.5;s.style.left=Math.random()*100+'%';s.style.bottom=Math.random()*45+'%';s.style.width=s.style.height=sz+'px';s.style.animationDuration=(Math.random()*8+9)+'s';s.style.animationDelay=(-Math.random()*14)+'s';p.appendChild(s);}});}

  /* ── scene-img fallback: hide a broken photo so the CSS illustration behind it shows ── */
  document.querySelectorAll('.scene-img').forEach(img=>{img.addEventListener('error',()=>{img.style.display='none';});});

  /* ── clip-wipe reveal (.scene.clip → .shown) ── */
  const clipIO=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('shown');clipIO.unobserve(e.target);}})},{threshold:0.2});
  document.querySelectorAll('.scene.clip').forEach(el=>clipIO.observe(el));

  /* ── card tilt (.jr, .loc) ── */
  // (hover:hover) skips touch devices, where pointermove would leave a card
  // stuck mid-tilt with no pointerleave to reset it.
  if(!reduce && window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.jr,.loc').forEach(el=>{
      el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(900px) rotateX('+(-py*3.4).toFixed(2)+'deg) rotateY('+(px*3.4).toFixed(2)+'deg) translateY(-6px)';});
      el.addEventListener('pointerleave',()=>{el.style.transform='';});
    });
  }
  /* ── split-media photo parallax ── */
  // tk is a rAF "ticking" flag: it coalesces bursts of scroll events into at
  // most one transform write per animation frame.
  if(!reduce){const sm=document.querySelector('.split-media .scene');if(sm){let tk=false;window.addEventListener('scroll',()=>{if(!tk){requestAnimationFrame(()=>{const r=sm.getBoundingClientRect();const off=(r.top+r.height/2-innerHeight/2)/innerHeight;sm.style.transform='translateY('+(off*-16).toFixed(1)+'px)';tk=false;});tk=true;}},{passive:true});}}

  /* ── heading underline reveal (h2.head → .drawn) ── */
  // .cu switches the underline draw to center-out for centered headings
  // (h2.head::after in css/20-brand-layers.css).
  const drawHead=(el)=>{if(el.classList.contains('drawn'))return;if(getComputedStyle(el).textAlign==='center')el.classList.add('cu');el.classList.add('drawn');};
  const headEls=[...document.querySelectorAll('h2.head')];
  // threshold:0 + bottom rootMargin fires as soon as a heading enters view — works for headings
  // TALLER than the viewport (a ratio threshold like 0.55 could never fire for those, leaving them hidden).
  const headIO=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){drawHead(e.target);headIO.unobserve(e.target);}})},{threshold:0,rootMargin:'0px 0px -12% 0px'});
  headEls.forEach(el=>headIO.observe(el));
  // Safety net: never allow a heading to stay hidden if the observer misses it
  // (e.g. anchor jumps or restored scroll positions). 0.92 mirrors the
  // observer's -12% bottom rootMargin. drawHead's .drawn guard makes both
  // paths idempotent, so double-firing is harmless.
  const headSafety=()=>{headEls.forEach(el=>{if(!el.classList.contains('drawn')&&el.getBoundingClientRect().top<window.innerHeight*0.92)drawHead(el);});};
  window.addEventListener('scroll',headSafety,{passive:true});
  window.addEventListener('load',headSafety);headSafety();

  /* ===== ultimate effects (v12) ===== */
  /* ── back-to-top button — injected so index.html stays content-only ── */
  (function(){
    const t=document.createElement('button');t.className='totop';t.setAttribute('aria-label','Back to top');
    t.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(t);
    t.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
    window.addEventListener('scroll',()=>{t.classList.toggle('show',window.scrollY>700);},{passive:true});
  })();
  /* ── cursor spotlight + magnetic gold buttons — fine-pointer devices only ── */
  if(!reduce && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    const sp=document.createElement('div');sp.className='spotlight';document.body.appendChild(sp);
    let sx=innerWidth/2,sy=innerHeight/2,tx=sx,ty=sy,raf=false;
    // Lerp toward the cursor each frame; the rAF loop parks itself
    // (raf=false) once within 0.4px so nothing runs while the mouse is idle.
    const tick=()=>{sx+=(tx-sx)*0.16;sy+=(ty-sy)*0.16;sp.style.left=sx+'px';sp.style.top=sy+'px';if(Math.abs(tx-sx)>0.4||Math.abs(ty-sy)>0.4){requestAnimationFrame(tick);}else{raf=false;}};
    window.addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;sp.style.opacity='1';if(!raf){raf=true;requestAnimationFrame(tick);}});
    document.addEventListener('mouseleave',()=>{sp.style.opacity='0';});
    document.querySelectorAll('.btn-gold').forEach(b=>{
      b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();const mx=e.clientX-(r.left+r.width/2),my=e.clientY-(r.top+r.height/2);b.style.transform='translate('+(mx*0.16).toFixed(1)+'px,'+(my*0.26).toFixed(1)+'px)';});
      b.addEventListener('pointerleave',()=>{b.style.transform='';});
    });
  }
