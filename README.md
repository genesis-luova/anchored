# AnchorEd — Marketing Website

> **Anchored in Truth. Formed for Legacy.**
> A single-file, zero-build marketing site for AnchorEd — a faith-driven house of learning brands.

## What this is

A fully self-contained static website. Everything lives in **`index.html`** — all HTML, CSS, and JavaScript inline, with the AnchorEd logo and several photos embedded directly in the file. There is **no build step, no framework, and no dependencies** to install.

## Deploy to Vercel (via GitHub)

1. Create a new repository on GitHub and push these files to it (see below).
2. Go to [vercel.com](https://vercel.com) → **Add New → Project**.
3. **Import** your GitHub repository.
4. Leave all defaults (Framework Preset: **Other**). Click **Deploy**.
5. You get a live URL in seconds. Every future `git push` to the default branch redeploys automatically.

### Pushing this folder to GitHub

```bash
git init
git add .
git commit -m "Initial commit: AnchorEd website"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(Or use the GitHub web UI: create the repo, then **Add file → Upload files** and drag these in.)

### Custom domain

In the Vercel project, open **Settings → Domains** and add your domain (e.g. `anchored.global`). Vercel will provide the DNS records to point at it.

## Local preview

Just open `index.html` in any browser (double-click it). No server required.

> **Note on photos:** The logo, the testimonial portraits, and the learning-block photo are embedded in the file and always render. The larger family photos load from the web (Unsplash) and Google Fonts loads the typefaces — both work on any live domain or local browser. To make the large photos permanent and on-brand, replace them with your own (see below).

## Customize before launch

Open `index.html` and search for these to swap in real content:

- **Testimonials** — sample quotes/names in the "Stories That Connect Us" section. Search `class="testi"`.
- **Ecosystem brand logos** — currently lettered monograms (`HG`, `V`, `EN`, …). Search `class="mono"`.
- **Photos** — replace the `background-image` URLs (search `scene-photo`) with your own family/student photos. For guaranteed rendering everywhere, embed them as base64 data URIs.
- **Links & contact** — CTA buttons (`#begin`, `#contact`) and the contact email (`info@anchored.global`) / social links in the footer.

## Tech notes

- Pure static HTML/CSS/JS — works on Vercel, Netlify, GitHub Pages, Cloudflare Pages, or any static host.
- Responsive, with reduced-motion support and tasteful scroll/hover animations.
- Photos use CSS `background-image` (so a blocked or missing image fails silently to a brand-colored panel — no broken-image icons).

---

© 2026 AnchorEd. All rights reserved.
