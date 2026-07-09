# Implementation Plan — Add robots.txt and sitemap.xml for Crawler Discoverability (Issue #47)

## Summary

Add two new static files at the **repo root** so search crawlers can discover and
correctly index the GitHub Pages site:

1. **`robots.txt`** — allow all crawlers and point them at the sitemap.
2. **`sitemap.xml`** — a well-formed sitemap listing the single crawlable document,
   `https://specstraai.github.io/vcard-portfolio/`.

This is a pure static-file addition. There is **no JS or CSS coupling**, no build step,
no bundler, and no new runtime dependency — consistent with the plain HTML/CSS/JS nature
of this repo (`CLAUDE.md`, "What This Project Does" / "Development"). The change is
low-risk and self-contained.

This document is the **plan only**; the two files themselves are authored in the
implement stage.

## Current State (Evidence)

- **Neither file exists yet.** `ls robots.txt sitemap.xml` at the repo root returns
  "No such file or directory" for both (confirmed in this run's working tree, branch
  `plan/47-add-robots-txt-and-sitemap-xml-for-crawl`).
- **The site already has SEO metadata** in `index.html`'s `<head>`, all keyed to the
  same base URL:
  - Canonical link — `index.html:13`:
    `<link rel="canonical" href="https://specstraai.github.io/vcard-portfolio/">`
  - Open Graph `og:url` / `og:image` — `index.html:21,25`
  - Twitter Card image — `index.html:33`
  - JSON-LD `Person` schema — `index.html:61-78` (per `CLAUDE.md`)
  All use the absolute base `https://specstraai.github.io/vcard-portfolio/`.
- **The site is a single crawlable document.** All five "pages" (About, Resume,
  Portfolio, Blog, Contact) live in one `index.html` and are shown/hidden client-side by
  hash-based navigation — `handleHash()` reads `location.hash` and calls `activatePage()`
  (`assets/js/script.js:276-283`). There are no separate HTML documents to crawl other
  than `index.html` (served as `/`) and the GitHub Pages `404.html`. Therefore the
  sitemap needs exactly **one** `<url>` entry: the site root.
- **Absolute-URL convention already in the repo.** `404.html` hardcodes the
  `/vcard-portfolio/` GitHub Pages path prefix in three places — favicon
  (`404.html:10`), stylesheet (`404.html:11`), and the "Back to portfolio" link
  (`404.html:84`, `href="/vcard-portfolio/"`). `index.html` uses relative `./assets/...`
  paths for local assets but **absolute** `https://specstraai.github.io/vcard-portfolio/`
  URLs for canonical/OG/Twitter. `robots.txt` and `sitemap.xml` must use absolute URLs
  (the sitemap protocol requires fully-qualified `<loc>` URLs; a robots `Sitemap:`
  directive must be an absolute URL), so they should reuse the exact base already in
  `index.html:13`.
- **Jekyll is already disabled.** An empty `.nojekyll` file exists at the repo root
  (confirmed via `ls -la`), so GitHub Pages serves `robots.txt` and `sitemap.xml`
  verbatim from the root with no Jekyll processing (satisfies acceptance criterion 3).

## Files to Add / Touch

| File | Action | Why |
| --- | --- | --- |
| `robots.txt` | **create** at repo root | Allow-all crawl policy + `Sitemap:` pointer |
| `sitemap.xml` | **create** at repo root | Well-formed sitemap listing the site root URL |
| `docs/plans/issue-47-robots-and-sitemap.md` | **create** (this file) | Record the plan per the repo's `docs/plans/issue-N-*.md` convention |

No edits to `index.html`, `assets/css/style.css`, or `assets/js/script.js` are required
or intended. The `README.md` and honeypot work are **sibling epic tasks (#46, #48)** and
are explicitly out of scope here (`.orchestra/context/parent_epic.md`).

## Proposed File Contents

These are the concrete artifacts for the implement stage to write verbatim (or with
trivial adjustment). Both are deliberately minimal — this static site has exactly one
crawlable URL.

### `robots.txt` (repo root)

```
User-agent: *
Allow: /

Sitemap: https://specstraai.github.io/vcard-portfolio/sitemap.xml
```

Notes:
- `User-agent: *` + `Allow: /` is the standard allow-all policy. (An empty `Disallow:`
  is the traditional "allow everything" spelling; `Allow: /` is equivalent and more
  explicit — either is acceptable. Pick one; do not add both conflicting directives.)
- The `Sitemap:` directive **must be an absolute URL** and must resolve to the deployed
  location. Because GitHub Pages serves this project site under the `/vcard-portfolio/`
  path prefix, the sitemap URL is
  `https://specstraai.github.io/vcard-portfolio/sitemap.xml`, matching the base in
  `index.html:13` and the `/vcard-portfolio/` prefix convention in `404.html`.
- End the file with a trailing newline (POSIX text-file convention; avoids some linters
  flagging "no newline at end of file").

### `sitemap.xml` (repo root)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://specstraai.github.io/vcard-portfolio/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

Notes:
- The XML declaration and the `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`
  namespace on `<urlset>` are **required** by the sitemaps.org protocol; without the
  namespace the file is not a valid sitemap.
- `<loc>` must be the fully-qualified site root and must **exactly** match the canonical
  URL in `index.html:13` (including the trailing slash) so crawlers treat the sitemap
  entry and the canonical tag as the same URL.
- `<changefreq>` and `<priority>` are **optional** hints. Include the single-URL entry at
  `priority 1.0`; `changefreq monthly` is a reasonable low-churn default for a personal
  portfolio. If the implementer prefers the leanest valid file, `<changefreq>`/
  `<priority>` may be omitted — only `<loc>` is required.
- **Do not add a `<lastmod>` unless it is a real, valid W3C-datetime value.** A stale or
  malformed `<lastmod>` is worse than none; omit it rather than hardcoding a guessed date
  (the sandbox has no reliable "now", so leaving it out is the safe choice).
- Only **one** `<url>` entry is correct here: the hash-routed sections
  (`#about`, `#resume`, …) are **not** separate crawlable URLs — fragment identifiers are
  never sent to the server and are ignored by crawlers, so listing them would be invalid
  padding (`assets/js/script.js:276-283`).

## Implementation Steps (for the implement stage)

1. Create `robots.txt` at the repo root with the allow-all + `Sitemap:` content above.
2. Create `sitemap.xml` at the repo root with the well-formed single-URL content above.
3. Do **not** touch `index.html`, CSS, or JS — there is no wiring needed; GitHub Pages
   serves root files directly and `.nojekyll` already prevents Jekyll from interfering.
4. Optionally cross-check that the base URL string
   `https://specstraai.github.io/vcard-portfolio/` is byte-for-byte identical to
   `index.html:13`'s canonical href (guards against a typo'd host/path).

## Validation Strategy

Per `CLAUDE.md` (no CI, no automated tests — verification is manual/browser-based):

- **Local serve:** from the repo root run `python3 -m http.server 8000`, then:
  - `curl -s http://localhost:8000/robots.txt` returns the allow-all body including the
    `Sitemap:` line.
  - `curl -s http://localhost:8000/sitemap.xml` returns the XML with the correct `<loc>`.
- **Well-formedness:** validate `sitemap.xml` parses as XML, e.g.
  `python3 -c "import xml.dom.minidom,sys; xml.dom.minidom.parse('sitemap.xml')"`
  (exits 0 on well-formed input) or open it in a browser's XML viewer. Optionally check
  the `<loc>` against the sitemaps.org schema.
- **URL match:** confirm the sitemap `<loc>` and the robots `Sitemap:` URL both use the
  exact base from `index.html:13` (`grep canonical index.html` to compare).
- **Post-deploy (out of this stage's control, note for the reviewer):** once merged and
  deployed, `GET https://specstraai.github.io/vcard-portfolio/robots.txt` and
  `.../sitemap.xml` should return the files verbatim (200, correct content-type), and the
  sitemap can be submitted to / fetched by Google Search Console.

## Acceptance Criteria — How This Plan Satisfies Them

1. **"robots.txt exists at the repo root, allows all crawlers, and references the correct
   sitemap.xml URL"** — ✅ Covered by the `robots.txt` artifact above
   (`User-agent: *` / `Allow: /` + absolute `Sitemap:` URL under `/vcard-portfolio/`).
2. **"sitemap.xml exists at the repo root, is well-formed XML per the sitemap protocol,
   and lists https://specstraai.github.io/vcard-portfolio/ as a URL entry"** — ✅ Covered
   by the `sitemap.xml` artifact (required XML decl + sitemaps.org namespace + single
   `<loc>` matching `index.html:13`).
3. **"Both files are served verbatim once deployed (no Jekyll interference, consistent
   with the existing .nojekyll file)"** — ✅ `.nojekyll` already exists at the repo root;
   root-level `robots.txt`/`sitemap.xml` are served directly by GitHub Pages.

## Scope and Assumptions

**In scope:** two new root static files (`robots.txt`, `sitemap.xml`) and this plan doc.

**Out of scope (per epic #45 / this issue):**
- README rewrite (sibling task #46, already merged) and contact-form honeypot (sibling
  task #48) — do not touch here.
- No new pages, no additional sitemap URLs (the site is a single hash-routed document),
  no analytics, no backend/serverless code, no change to the Web3Forms key.

**Assumptions:**
- The deployed base URL is `https://specstraai.github.io/vcard-portfolio/`, matching
  `index.html:13` and the `/vcard-portfolio/` prefix in `404.html`. If the repo is ever
  renamed or moved to a custom domain, both new files (like `404.html`'s three hardcoded
  paths) would need manual updating — this is the same known trade-off already documented
  in `CLAUDE.md` ("Gotchas / Landmines").
- GitHub Pages is the deploy target (`CLAUDE.md`, "Deploy"), so root-served
  `robots.txt`/`sitemap.xml` are honored at `/robots.txt` and `/sitemap.xml` under the
  project path.

## Risks and Mitigations

- **Risk: wrong base URL / missing `/vcard-portfolio/` prefix** → crawlers can't fetch
  the sitemap or index a 404. *Mitigation:* reuse the exact string from `index.html:13`;
  the validation step greps and compares it.
- **Risk: malformed XML** (missing namespace, unescaped chars, stray `<lastmod>`) →
  sitemap rejected by validators/Search Console. *Mitigation:* use the exact template
  above, run the XML well-formedness check, and omit `<lastmod>` rather than guessing.
- **Risk: listing hash routes as separate URLs** → invalid entries crawlers ignore.
  *Mitigation:* exactly one `<loc>` (the root); documented rationale above.
- **Risk: Jekyll swallowing the files** → not applicable; `.nojekyll` already present.

## Success Criteria

- `robots.txt` and `sitemap.xml` exist at the repo root after the implement stage, with
  the content specified above.
- `sitemap.xml` is well-formed and lists `https://specstraai.github.io/vcard-portfolio/`.
- `robots.txt` allows all crawlers and references
  `https://specstraai.github.io/vcard-portfolio/sitemap.xml`.
- This plan is present under `docs/plans/` and the PR references `Closes #47`, targeting
  the epic base branch `epic/45-epic-readme-accuracy-crawler-discoverabi`.
