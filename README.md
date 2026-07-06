# AnchorEd — Marketing Website

> **Anchored in Truth. Formed for Legacy.**
> The marketing site for AnchorEd — a faith-driven house of learning brands.

## Architecture

Static, **zero-build**, dependency-free. Modern browsers get modularity natively — no bundler required:

```
anchored/
├── index.html            Content markup only (semantic HTML, SEO-friendly)
├── css/                  Stylesheets — numbered, loaded in order (cascade layers)
│   ├── 10-foundation.css     design tokens, base, buttons, nav, hero, sections, footer
│   ├── 20-brand-layers.css   brand gradient panels + aesthetic/background polish
│   ├── 30-widgets.css        chat assistant, anchoring chain, steps/ledger, pillars, map cards
│   ├── 40-loader.css         ISB-style page loader + cinematic hero reveal
│   ├── 50-motion.css         scroll choreography: reveals, stats band, feature motion
│   └── 60-isb-unified.css    unified scroll/effect layer, #about intro, presence map, film
├── js/                   Native ES modules (loaded via <script type="module" src="js/main.js">)
│   ├── main.js               entry point — imports modules in order
│   ├── core.js               nav, reveals, counters, hero slideshow/rotator, tabs, effects
│   ├── chat-widget.js        "Anchor" assistant — grade-aware KB + optional live /api/chat
│   ├── pillars.js            pillars carousel
│   ├── craft.js              stagger choreography + nav scroll-spy
│   ├── parallax.js           hero copy drift + section photo parallax
│   ├── feature-reveal.js     ISB-style .is-in-view feature reveals
│   └── video.js              anchoring-chain film auto-load
├── api/
│   └── chat.js           Vercel serverless function powering the assistant with Claude
├── assets/
│   ├── favicon.png
│   └── img/              Self-hosted photography + brand marks (logos, emblems)
├── vercel.json           Security + cache headers
└── package.json          `npm run dev` → local server on :4599
```

Two small scripts stay intentionally inline in `index.html` (critical path):
the `html.preload` class-setter in `<head>` and the page-loader controller —
they must run before/independently of module loading so content can never be
stuck behind the loader.

**CSS order matters.** The numbered files are cascade layers extracted from the
site's design evolution; always link them in sequence.

## Onboarding — a guided tour

New to the codebase? Read in this order (~30 minutes):

1. **This README** — architecture and deploy model (you are here).
2. **`index.html`** — skim the section landmarks (`<!-- HERO -->`, `<!-- ABOUT -->` …).
   It is intentionally markup-only; every file has a header comment explaining itself.
3. **`js/core.js`** — the workhorse: reveals, hero slideshow, counters, heading
   reveals. Its header documents the DOM/CSS contract (which classes JS toggles
   and CSS animates — `.in`, `.drawn`, `.is-in-view` are the seams between the two).
4. **`css/10-foundation.css`** — design tokens (`:root` custom properties) and
   base components. The other five CSS files are later cascade layers; their
   headers say what each may override.
5. **`js/chat-widget.js` + `api/chat.js`** — the assistant pair (client widget
   with built-in knowledge base; serverless function for live Claude answers).

House conventions worth knowing before your first PR:

- **Motion is opt-in and reversible** — every animation honors
  `prefers-reduced-motion`; new effects must too.
- **CSS link order is load-bearing** — the numbered files are cascade layers;
  never reorder the `<link>` tags or alphabetize the folder.
- **Two scripts stay inline in `index.html`** (preload class + loader
  controller) so the page can never be stuck behind the loader if modules fail.
- **No build step by design** — native ES modules, plain CSS. Don't add a
  bundler without a real need.

## Local development

```bash
npm run dev          # serves on http://localhost:4599 (python3)
```

(Any static server works; opening `index.html` directly via `file://` will NOT
work because ES modules require http.)

## Deploy to Vercel (via GitHub)

1. Push to GitHub; import the repo in Vercel (Framework Preset: **Other**, no build step).
2. Optional — live AI assistant: set `ANTHROPIC_API_KEY` in Vercel → Settings →
   Environment Variables. The widget calls `/api/chat` and falls back to its
   built-in knowledge base automatically when the API is unavailable.
3. Custom domain: Vercel project → **Settings → Domains** (e.g. `anchored.global`).

## Known follow-ups

- The "Anchoring Chain" film is a Google Drive embed; the file must be shared
  "Anyone with the link → Viewer" (or replaced with a self-hosted MP4/YouTube
  source) for visitors to play it without signing in.

---

© 2026 AnchorEd. All rights reserved.
