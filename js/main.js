// AnchorEd — main.js · module entry point. Import order mirrors the original script order.
/* ── file contract ─────────────────────────────────────────────────────────
   PURPOSE
   The single <script type="module"> entry loaded by index.html. Every import
   below is a side-effect module (an IIFE that wires up its own DOM behavior);
   nothing is exported and no module imports another.

   RESPONSIBILITIES
   • Load each behavior module exactly once, in a fixed order.

   DOM/CSS CONTRACT
   • None of its own — each module's header documents the IDs/classes it
     reads and the CSS hooks it toggles (.in, .drawn, .is-in-view, …).

   GOTCHAS
   • Import order is load-bearing. These modules were extracted from
     sequential inline <script> blocks, and where two modules touch the same
     elements the original run order is preserved (e.g. core.js creates the
     .reveal → .in observer whose transitions consume the --d stagger delays
     that craft.js seeds). Append new modules at the END; never alphabetize
     or reorder.
   • Module scripts are deferred, so everything here runs after the DOM is
     parsed — no module needs (or waits for) DOMContentLoaded.
   • If any import throws, later imports never run — but the page still
     renders, because the loader/preload scripts stay inline in index.html
     by design (see README).

   Edit me when… you add a new behavior module: import it here, after
   anything it depends on (in practice: last).
   ────────────────────────────────────────────────────────────────────────── */
import './core.js';
import './chat-widget.js';
import './pillars.js';
import './craft.js';
import './parallax.js';
import './feature-reveal.js';
import './video.js';
import './shift-cards.js';
import './brand-carousel.js';
