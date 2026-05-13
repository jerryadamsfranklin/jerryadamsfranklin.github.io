# Portfolio — Jerry Adams Franklin

Personal portfolio and professional site, published with **GitHub Pages**.

**Live site:** [www.jerryadamsfranklin.com](https://www.jerryadamsfranklin.com/)

## About this project

Single-page layout: **`index.html`** for structure and content, **`assets/css/site.css`** for presentation, **`assets/js/site.js`** for light interactivity (nav, scroll reveal). No bundler or framework—edit files and push to deploy.

## Contents

- Hero, about, skills, experience, education, achievements  
- Speaking, featured work, projects, and contact  

## Run locally

Serve the repository root with any static file server (relative paths assume the site root):

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy

Push to the branch configured under the repository **Settings → Pages** (typically `main`). GitHub Pages serves the site from the repository root.

The **`CNAME`** file should list the same hostname as **Settings → Pages → Custom domain** (here, `www`). If you switch the custom domain to the apex only, update **`CNAME`**, **`robots.txt`**, **`sitemap.xml`**, and the canonical or Open Graph URLs in **`index.html`** so they stay consistent.

## Repository layout

| Path | Description |
| --- | --- |
| `index.html` | Page structure, meta tags, content |
| `assets/css/site.css` | Site styles |
| `assets/js/site.js` | Nav and scroll-reveal behavior |
| `assets/profile.png` | Hero photo |
| `assets/favicon.svg` | Favicon (SVG) |
| `CNAME` | Custom domain for GitHub Pages |
| `robots.txt` | Crawler rules; references `sitemap.xml` |
| `sitemap.xml` | Single-URL sitemap for the homepage |
| `LICENSE` | MIT |

---

© Jerry Adams Franklin
