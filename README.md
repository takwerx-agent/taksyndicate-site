# The TAK Syndicate — website

Static site built with [Astro](https://astro.build). Content is plain Markdown; hosting is
Cloudflare Pages. No server, no database, no CMS.

## Edit content

Every page is one Markdown file in `src/pages/`:

| File | Page |
|---|---|
| `index.astro` | Home (hero + cards + videos) |
| `who-we-are.md` | Who we are |
| `who-is-using-tak.md` | Organizations deploying TAK (map embed) |
| `faq.md` | FAQ (auto-generates its sidebar from `###` headings) |
| `california-tak-resources.md` | California resources |
| `links.md` | Link/logo grid |
| `resources.md` | Resources (Drive folder embed) |
| `tak-server.md` | TAK Server guide |
| `mediamtx-video-server.md` | MediaMTX guide |
| `shields.md` | Shields |
| `ahimta-symposium-team.md` | AHIMTA team |

Edit the Markdown, commit, push — the site rebuilds and deploys itself.

### Useful bits

- A fenced code block automatically gets a **Copy** button.
- On a `Docs.astro` page, every `##`/`###` heading automatically appears in the sidebar.
- To add a page: drop a new `.md` in `src/pages/` with the frontmatter below, then add it to
  the `links` array in `src/components/Nav.astro`.

```
---
layout: ../layouts/Page.astro
title: "Page title"
description: "One line for search engines."
---
```

Use `layout: ../layouts/Docs.astro` instead for a long page that should get a sidebar.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output in dist/
```

## Deploy (Cloudflare Pages)

Connect the repo once, then it deploys on every push to `main`.

- Framework preset: **Astro**
- Build command: `npm run build`
- Output directory: `dist`

## Images

Source images are optimized WebP in `public/images/`. To add one, drop it in that folder and
reference it as `![alt text](/images/name.webp)`.
