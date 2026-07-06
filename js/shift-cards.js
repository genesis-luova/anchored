// AnchorEd — shift-cards.js · "See the shifts" flip cards (#transform).
/* ── file contract ─────────────────────────────────────────────────────────
   PURPOSE
   Make the From→To flip cards in #transform interactive on devices without a
   hover pointer (touch) and for keyboard users. Desktop pointer hover and the
   one-time auto-peek are pure CSS (css/50-motion.css); this module only adds
   the click/tap/keyboard toggle.

   DOM/CSS CONTRACT
   • Reads  : #transform .shift  (each card; already has tabindex + role=button)
   • Toggles: .flipped on a card — CSS rotates .shift-inner 180° to show the TO
     face. Hover/:focus-visible flip via CSS independently; both resolve to the
     same 180° so they never fight.

   GOTCHAS
   • Click toggles a *sticky* flip (survives pointer-leave); hover is temporary.
     That's intentional — a tap on touch should latch the transformation open.
   • Space/Enter mirror a click for keyboard users; we preventDefault on Space
     so the page doesn't scroll.

   Edit me when… the card markup class names change, or the flip should latch
   differently (e.g. single-open accordion behavior).
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  var cards = document.querySelectorAll('#transform .shift');
  if (!cards.length) return;
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.toggle('flipped');
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });
})();
