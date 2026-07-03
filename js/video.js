// AnchorEd — video.js · anchoring-chain film auto-load
/* ── file contract ─────────────────────────────────────────────────────────
   PURPOSE
   "The Anchoring Chain" film: swaps the static poster for a Google Drive
   preview iframe, either on click or automatically as the film scrolls in.

   RESPONSIBILITIES
   • Build the Drive player URL from the frame's data-vid and inject the
     iframe in place of the poster.
   • Pre-inject via IntersectionObserver at 45% visibility so the player is
     already loaded by the time the visitor reaches it.

   DOM/CSS CONTRACT
   • Reads: #avFrame and its data-vid attribute (the Drive file ID), plus
     the .av-poster button inside it (styled in 60-isb-unified.css).
   • Writes: wipes #avFrame's children (innerHTML='') and appends the
     iframe — the poster (and its click handler) are gone after injection.
   • Toggles no classes.

   GOTCHAS
   • SHARING CAVEAT: playback only works if the Drive file is shared
     "Anyone with the link → Viewer"; otherwise visitors get a Google
     sign-in wall inside the iframe. Tracked in README "Known follow-ups"
     (long-term fix: self-hosted MP4 or YouTube source).
   • The `loaded` flag makes inject() idempotent — the click handler and
     the observer can both fire; only the first injection wins.
   • The observer disconnects after its first hit (fire-once): injection is
     destructive, so there is nothing to replay on re-entry.
   • Auto-load is skipped under prefers-reduced-motion and when
     IntersectionObserver is missing — the click path still works, it just
     shows a brief player-load wait.
   • `?autoplay=1` is best-effort: browsers may still demand a user gesture
     for audible playback; the pre-injection mainly removes the loading step.
   • Position in js/main.js import order: last — fully independent.

   Edit me when… swapping the film source: change data-vid in index.html
   for another Drive file, or replace the URL construction in inject() for
   a self-hosted MP4/YouTube embed.
   ────────────────────────────────────────────────────────────────────────── */
(function(){var f=document.getElementById('avFrame');if(!f)return;var b=f.querySelector('.av-poster');if(!b)return;
var loaded=false;
/* one-shot injection — replaces the poster with the Drive preview player
   (requires the file to be link-shared; see GOTCHAS above) */
function inject(){if(loaded)return;loaded=true;var id=f.getAttribute('data-vid');var i=document.createElement('iframe');
i.src='https://drive.google.com/file/d/'+id+'/preview?autoplay=1';i.setAttribute('allow','autoplay; encrypted-media; fullscreen');i.setAttribute('allowfullscreen','');i.title='The Anchoring Chain';f.innerHTML='';f.appendChild(i);}
b.addEventListener('click',inject);
/* auto-load the player as the film scrolls into view, so it is ready to play without a loading step */
if('IntersectionObserver' in window && !(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){
  var vo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){inject();vo.disconnect();}});},{threshold:0.45});
  vo.observe(f);
}})();
