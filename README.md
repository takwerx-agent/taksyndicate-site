# The TAK Syndicate — website

Source for [www.thetaksyndicate.org](https://www.thetaksyndicate.org), an advocacy site for the
Team Awareness Kit. Static site built with [Astro](https://astro.build), hosted as a Cloudflare
Worker (static assets). No server, no database, no CMS.

Working with Claude Code? See [CLAUDE.md](CLAUDE.md) for the site rules and conventions.

## Pages

| File | Page |
|---|---|
| `src/pages/index.astro` | Home (hero, cards, videos) |
| `src/pages/faq.md` | FAQ |
| `src/pages/who-is-using-tak.astro` | Organizations using TAK (map embed) |
| `src/pages/takwerx.astro` | TAKwerx hub: infra-TAK, plugins, CloudTAK plugins, issue picker |
| `src/pages/infra-tak.md` | infra-TAK install guide, requirements, video |
| `src/pages/plugins/index.astro` | ATAK plugin catalog |
| `src/pages/plugins/[slug].astro` | One page per plugin (README, manual PDF, APK links) |
| `src/pages/links.astro` | Links: logo cards (`links` array) and YouTube channels (`channels` array) |
| `src/pages/shields.astro` | Shields |
| `src/pages/atak-terminal.astro` | ATAK Terminal (linked from Home and TAKwerx, not in the top menu) |

The top menu is the `links` array in `src/components/Nav.astro`. The site notice bar (for
events) is in `src/layouts/Base.astro`.

### Add a page

Add a `.md` file in `src/pages/` with this frontmatter, then add it to the menu in
`src/components/Nav.astro`:

```
---
layout: ../layouts/Page.astro
title: "Page title"
description: "One line for search engines."
---
```

Use `layout: ../layouts/Docs.astro` for a long page. Docs pages get a sidebar made from their
`##` and `###` headings. A fenced code block on any page gets a **Copy** button.

The menu collapses to a hamburger at 900px wide. The full header needs about 870px, so measure
again if you add a menu item.

## Plugin catalog

`/plugins/` is generated. `scripts/sync-plugins.mjs` reads the live TAKwerx Market catalog
(mapdepot.takwerx.org), sparse-clones each takwerx plugin repo into `.cache/plugins/`, and
writes `src/data/plugins.json`. It also compiles each plugin's Typst user manual to
`public/manuals/<repo>.pdf`, so it needs [`typst`](https://github.com/typst/typst) installed.
Extra per-plugin fields go in `src/data/plugin-meta.json`.

```bash
npm run sync:plugins          # all plugins
node scripts/sync-plugins.mjs lces   # one plugin, by repo name
```

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # syncs plugins, then builds to dist/
npx astro build  # builds without the plugin sync (use if the sync fails locally)
```

## Deploy

Every push to `main` deploys to the live site. `.github/workflows/deploy.yml` also runs every
6 hours to pick up plugin catalog changes.

- The workflow installs `typst`, runs `npm ci` and `npm run build`, then runs
  `wrangler deploy`.
- `wrangler.jsonc` serves `dist/` as static assets on the Worker `taksyndicate-site`, with the
  custom domains `www.thetaksyndicate.org` and `thetaksyndicate.org`.
- Repo secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
- DNS is on Cloudflare. The domain registrar is GoDaddy.

`public/_redirects` keeps the old Google Sites URLs working (for example `/tak-server` goes to
`/infra-tak/`, `/tools` goes to `/takwerx/`). `public/_headers` sets response headers.

## Images

Images are in `public/images/` (WebP where possible); Links-page logos are in
`public/images/links/`. Reference an image as `![alt text](/images/name.webp)` in Markdown.
