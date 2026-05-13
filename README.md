# Portfolio — Jerry Adams Franklin

Personal portfolio and professional site, published with **GitHub Pages**.

**Live site:** [www.jerryadamsfranklin.com](https://www.jerryadamsfranklin.com/)

## About this project

Single-page experience: one `index.html` with embedded CSS and vanilla JavaScript. No bundler, framework, or build step—easy to edit and deploy from any branch push.

## Contents

- Hero, about, skills, experience, education, achievements  
- Speaking, featured work, projects, and contact  

## Run locally

Open `index.html` in a browser, or serve the folder with any static file server, for example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy

Push to the branch configured under the repository **Settings → Pages** (typically `main`). GitHub Pages serves the site from the repository root.

The **`CNAME`** file should list the same hostname as **Settings → Pages → Custom domain** (here, `www`). If you switch the custom domain to the apex only, update `CNAME` to match.

## Repository layout

| Path        | Description                    |
| ----------- | ------------------------------ |
| `index.html` | Full site: markup, styles, scripts |
| `CNAME`     | Custom domain for GitHub Pages |
| `assets/`   | Images and static assets       |

---

© Jerry Adams Franklin
