/* ────────────────────────────────────────────────────────────────────────────
   AnchorEd — legend.js · location legend <-> map pin hover sync.

   Imported second from js/main.js (after core.js); order is not
   load-bearing — it only wires listeners on existing markup.

   RESPONSIBILITIES
   - Mirror hover/focus between each legend row and its map pin so pointing
     at either highlights both.

   DOM/CSS CONTRACT
   Reads:   .lrow[data-loc] (legend rows) and .pin[data-loc] (map pins);
            a row and a pin pair by carrying the same data-loc value
            (e.g. "sa", "sg", "ph").
   Toggles: .active on both the row and its pin. Row styling lives in
            css/20-brand-layers.css (.lrow.active); pin styling in the
            map layers of css/50-motion.css / 60-isb-unified.css.

   GOTCHAS
   - Pins are optional: a row with no matching pin still highlights itself
     (every pin lookup is null-guarded).
   - focus/blur handlers make the pairing keyboard-accessible — provided
     the row element is focusable (a <button>, or given tabindex).
   - Runs once at load; rows/pins injected later are not wired.
   - The current index.html renders the presence map as SVG .pin groups
     with NO .lrow legend rows, so this module is presently a no-op. It is
     kept (harmless, self-contained) for when legend rows return; new rows
     only need the matching data-loc — no JS changes.

   Edit me when… you change how a location row/pin pair should respond to
   hover or focus. Adding a location itself needs only markup.
   ──────────────────────────────────────────────────────────────────────── */
(function(){
  document.querySelectorAll('.lrow').forEach(function(r){
    var k=r.getAttribute('data-loc');
    var pin=document.querySelector('.pin[data-loc="'+k+'"]');
    function on(){r.classList.add('active'); if(pin)pin.classList.add('active');}
    function off(){r.classList.remove('active'); if(pin)pin.classList.remove('active');}
    r.addEventListener('mouseenter',on); r.addEventListener('mouseleave',off);
    r.addEventListener('focus',on); r.addEventListener('blur',off);
    if(pin){pin.addEventListener('mouseenter',on); pin.addEventListener('mouseleave',off);}
  });
})();
