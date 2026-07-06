// AnchorEd — brand-carousel.js · center-mode coverflow carousel (#ecosystem).
/* ── file contract ─────────────────────────────────────────────────────────
   PURPOSE
   Turn the brand cards into a coverflow carousel: one focused card centred and
   full-size, neighbours scaled/dimmed/tilted. Arrows, dots, drag/swipe,
   keyboard and visibility-gated autoplay.

   DOM/CSS CONTRACT (inside #brandCarousel; whole module no-ops if absent)
   • Reads : .bcar-viewport, .bcar-track, .bslide (cards), .bcar-dots,
             [data-dir="prev"] / [data-dir="next"]
   • Writes: inline translateX on .bcar-track to centre the focused slide;
             .is-focus / .is-prev / .is-next on slides; .is-active on dots;
             disabled on the end arrow; appends .bcar-dot buttons.
   CSS in css/30-widgets.css styles these hooks and owns all the 3D transforms.

   GOTCHAS
   • Track offset uses slide *offsetWidth* (layout width) not
     getBoundingClientRect (which is post-scale) — the scale is purely visual
     and must not feed back into the centring math.
   • A drag beyond ~10px sets `moved`, which suppresses the click that follows
     pointerup so a swipe never also navigates via the card link or focus-jump.
   • Clicking a NON-focused card focuses it and preventDefault()s so its "Learn
     more" link doesn't fire; the focused card's link works normally.
   • Autoplay wraps (last→first) but manual nav clamps and disables the end
     arrow. stopAuto() is permanent (any deliberate nav) — matches pillars.js.
   • boot() waits for fonts.ready: web-font swap changes card width, so
     measuring earlier centres on the wrong offset.

   Position in js/main.js: last — self-contained IIFE, order not load-bearing.

   Edit me when… brand cards are added/removed (dots/counts adapt), or autoplay
   / tilt feel needs retuning (timing here, transforms in CSS).
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  var car = document.getElementById('brandCarousel');
  if (!car) return;
  var viewport = car.querySelector('.bcar-viewport');
  var track = car.querySelector('.bcar-track');
  var slides = [].slice.call(track.querySelectorAll('.bslide'));
  var dotsWrap = car.querySelector('.bcar-dots');
  var prev = car.querySelector('[data-dir="prev"]');
  var next = car.querySelector('[data-dir="next"]');
  var total = slides.length;
  if (!total) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 0;

  /* ── dot rail ─────────────────────────────────────────────────────────── */
  var dots = slides.map(function (_, i) {
    var b = document.createElement('button');
    b.className = 'bcar-dot'; b.type = 'button';
    b.setAttribute('aria-label', 'Show brand ' + (i + 1));
    b.addEventListener('click', function () { stopAuto(); go(i); });
    dotsWrap.appendChild(b); return b;
  });

  /* ── position + state ─────────────────────────────────────────────────── */
  function layout() {
    var vpW = viewport.clientWidth;
    var sw = slides[0].offsetWidth;
    var cs = getComputedStyle(track);
    var gap = parseFloat(cs.columnGap || cs.gap) || 0;
    var focusCenter = cur * (sw + gap) + sw / 2;
    track.style.transform = 'translateX(' + Math.round(vpW / 2 - focusCenter) + 'px)';
  }
  function updateClasses() {
    slides.forEach(function (s, i) {
      s.classList.toggle('is-focus', i === cur);
      s.classList.toggle('is-prev', i === cur - 1);
      s.classList.toggle('is-next', i === cur + 1);
    });
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === cur); });
    prev.disabled = cur <= 0; next.disabled = cur >= total - 1;
  }
  function go(to) {
    to = Math.max(0, Math.min(total - 1, to));
    if (to === cur) return;
    cur = to; layout(); updateClasses();
  }

  /* ── arrows / keyboard ────────────────────────────────────────────────── */
  prev.addEventListener('click', function () { stopAuto(); go(cur - 1); });
  next.addEventListener('click', function () { stopAuto(); go(cur + 1); });
  car.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); stopAuto(); go(cur + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); stopAuto(); go(cur - 1); }
  });

  /* ── click a side card to focus it (suppress its link) ────────────────── */
  slides.forEach(function (s, i) {
    s.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); return; }   // was a drag, not a tap
      if (i !== cur) { e.preventDefault(); stopAuto(); go(i); }
    });
  });

  /* ── drag / swipe (touch, pen, mouse) ─────────────────────────────────── */
  var dxs = 0, dys = 0, dragging = false, moved = false;
  viewport.addEventListener('pointerdown', function (e) {
    dragging = true; moved = false; dxs = e.clientX; dys = e.clientY;
  });
  window.addEventListener('pointermove', function (e) {
    if (dragging && Math.abs(e.clientX - dxs) > 10) moved = true;
  });
  window.addEventListener('pointerup', function (e) {
    if (!dragging) return; dragging = false;
    var dx = e.clientX - dxs, dy = e.clientY - dys;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      stopAuto(); go(dx < 0 ? cur + 1 : cur - 1);
    }
  });

  /* ── autoplay (paused off-screen / on hover-focus; stopped on nav) ─────── */
  var timer = null, stopped = false;
  function adv() { go(cur >= total - 1 ? 0 : cur + 1); }
  function startAuto() { if (reduce || stopped || timer) return; timer = setInterval(adv, 4600); }
  function pauseAuto() { if (timer) { clearInterval(timer); timer = null; } }
  function stopAuto() { stopped = true; pauseAuto(); }
  car.addEventListener('pointerenter', pauseAuto);
  car.addEventListener('pointerleave', function () { if (!stopped) startAuto(); });
  car.addEventListener('focusin', pauseAuto);
  car.addEventListener('focusout', function () { if (!stopped) startAuto(); });

  /* ── boot ─────────────────────────────────────────────────────────────── */
  function boot() { layout(); updateClasses(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 150); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { if (!stopped) startAuto(); } else pauseAuto(); });
    }, { threshold: 0.3 });
    io.observe(car);
  } else startAuto();
})();
