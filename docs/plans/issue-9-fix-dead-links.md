# Implementation Plan — Fix Dead Links: Social Icons, Project & Blog Cards (Issue #9)

## Summary

`index.html` contains **24 placeholder `href="#"` anchors** in four groups: the 3
sidebar social icons, the 6 client logos, the 9 portfolio project cards, and the
6 blog cards. The issue enumerates the social/project/blog groups; the clients
group is the same defect class and is included in scope (see Assumptions).

These links are not merely inert — they are **actively harmful**. `script.js:238`
registers `window.addEventListener('hashchange', handleHash)`. Clicking any
`href="#"` anchor changes the URL hash to empty, `handleHash` (script.js:229)
finds no matching `data-page`, and falls back to `pages[0]` — **the user is
yanked from the Portfolio or Blog tab back to the About page** and scrolled to
top. So every project card, blog card, client logo, and social icon currently
breaks SPA navigation when clicked.

The fix, per group: give the social list one real, resolving destination (the
repository's GitHub organization), point each project card at its own full-size
screenshot (a real, in-repo destination that matches the eye-icon "view"
affordance), and remove the anchors where no destination exists (client logos,
blog cards) — exactly the "point them at real destinations or remove the
anchors" latitude the issue grants. No JavaScript changes are needed; only
`index.html` and a small selector rename in `assets/css/style.css`.

This approach was previously implemented and manually verified in (closed,
test-artifact) PR #29; this plan re-establishes it against current `main`
(`433420e`) with every decision spelled out so it can be executed from scratch.

## Scope and Assumptions

**In scope**

- All 24 `href="#"` anchors in `index.html` (social ×3, clients ×6, projects ×9,
  blog ×6). After this change `grep -c 'href="#"' index.html` must return 0.
- A selector rename in `assets/css/style.css` required by the blog-card change.

**Out of scope (Non-Goals)**

- No JavaScript changes. `assets/js/script.js` never selects any of these
  anchors (verified by grep: no `social`, `project-item`, or `blog-post`
  references in the file) — navigation, filtering, and the modal are untouched.
- `404.html` contains zero `href="#"` anchors (verified) — untouched.
- No new pages, no per-project detail pages, no real blog backend.
- The `data-selecct-value` typo, SVG `stroke-width` rules, and all other
  documented landmines in `.claude/CLAUDE.md` are untouched.
- Do not commit the untracked `.claude/` directory if it appears in the
  workspace.

**Assumptions**

- The persona "Alex Morgan" is fictional (this is a customizable template), so
  no real Facebook/Twitter/Instagram profiles exist to point at. The only
  verified-live destination associated with this repository is its GitHub
  organization, `https://github.com/SpecstraAI` (confirmed resolving via the
  GitHub API: org exists, name "Orchestra"). The three placeholder social icons
  are therefore **replaced by a single GitHub icon link** to that URL. A future
  site owner customizing the template adds their own profiles here.
- Demo projects have no case-study pages; the most honest real destination is
  the project's own full-size screenshot already shipped in
  `assets/images/` (all 9 fallback files verified present on disk).
- Demo blog posts have no articles; their anchors are removed rather than
  pointed at content the persona didn't write.
- Client logos are decorative; their anchors are removed. CSS is safe: the only
  selectors are `.clients-item` and `.clients-item img`
  (`assets/css/style.css:831–842`) — no `a`-dependent rule exists.

## Affected Areas

| File | New/Edit | Responsibility |
|---|---|---|
| `index.html` (sidebar social list, lines 186–206) | edit | Replace 3 placeholder social `<li>` items with 1 real GitHub link |
| `index.html` (clients list, lines 527–565) | edit | Unwrap 6 `<a href="#">` around client logo `<img>`s |
| `index.html` (project list, lines 834–1030) | edit | Point 9 project-card anchors at their screenshot assets |
| `index.html` (blog list, lines 1047–1230) | edit | Replace 6 blog-card `<a href="#">` with `<div class="blog-card">` |
| `assets/css/style.css` (lines 1129, 1138, 1161, 1192) | edit | Rename `.blog-post-item > a` selectors to `.blog-post-item > .blog-card`; drop 2 link-hover rules |

(Line numbers are against `main` at `433420e`.)

## Implementation Steps

### Step 1 — Sidebar social icons (`index.html:186–206`)

The `social-list` currently holds three `<li class="social-item">` entries whose
inline SVGs are Facebook, Twitter, and Instagram glyphs, each wrapped in
`<a href="#" class="social-link">` with **no accessible name** (the SVGs are
`aria-hidden="true"`).

Replace all three `<li>` blocks with this single item (keep the surrounding
`<ul class="social-list">` and `<div class="separator">` as-is):

```html
<li class="social-item">
  <a href="https://github.com/SpecstraAI" class="social-link"
     aria-label="GitHub" target="_blank" rel="noopener noreferrer">
    <svg class="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>
  </a>
</li>
```

Pattern notes (per `.claude/CLAUDE.md` icon conventions): the SVG is a **solid**
brand glyph, so it uses `fill="currentColor"` like the existing
Facebook/Twitter/Instagram glyphs — do **not** add `stroke-width` anywhere. The
accessible name lives on the `<a aria-label="GitHub">`, satisfying the issue's
aria-label requirement; the SVG stays `aria-hidden="true" focusable="false"`.
No CSS change: `.social-item .social-link` (`style.css:513–519`) styles each
item independently, and `.social-list` is a flex row that renders fine with one
item.

### Step 2 — Client logos (`index.html:527–565`)

For each of the 6 `<li class="clients-item">` entries, delete the wrapping
`<a href="#">` / `</a>` and keep the bare `<img>`:

```html
<li class="clients-item">
  <img src="./assets/images/logo-1-color.png" alt="client logo" width="209" height="131">
</li>
```

Same for `logo-2-color.png` … `logo-6-color.png`. Keep the existing `width`,
`height`, and `alt` attributes exactly (CLS guard). No CSS change (verified: no
`.clients-item a` selector exists).

### Step 3 — Portfolio project cards (`index.html:834–1030`)

Each of the 9 `<li class="project-item …">` cards wraps its content in
`<a href="#">`. Change only the opening tag of each anchor to point at that
card's full-size fallback image, opened in a new tab:

```html
<a href="./assets/images/project-1.jpg" target="_blank" rel="noopener noreferrer">
```

Exact per-card mapping — the href is always the same file as the card's own
`<img src>` fallback (all verified present in `assets/images/`):

| Card (project-title) | href |
|---|---|
| Finance | `./assets/images/project-1.jpg` |
| Orizon | `./assets/images/project-2.png` |
| Fundo | `./assets/images/project-3.jpg` |
| Brawlhalla | `./assets/images/project-4.png` |
| DSM. | `./assets/images/project-5.png` |
| MetaSpark | `./assets/images/project-6.png` |
| Summary | `./assets/images/project-7.png` |
| Task Manager | `./assets/images/project-8.jpg` |
| Arrival | `./assets/images/project-9.png` |

Everything inside each anchor (figure, eye-icon SVG, `<picture>`, title,
category) stays byte-identical. This keeps all `.project-item > a` hover rules
(`style.css:1039–1094`) working, preserves keyboard focusability, gives the
eye-icon overlay a true "view" meaning, and — because the link now navigates
away instead of mutating the hash — eliminates the reset-to-About bug.
`target="_blank"` keeps the SPA (and its active tab/filter state) open.

### Step 4 — Blog cards, HTML (`index.html:1047–1230`)

For each of the 6 `<li class="blog-post-item">` entries, replace the wrapping
`<a href="#">` … `</a>` with `<div class="blog-card">` … `</div>`. All inner
content (banner `<picture>`, `.blog-content`, meta, title, text) stays
byte-identical.

### Step 5 — Blog cards, CSS (`assets/css/style.css`)

The card's visual box is styled on the anchor, so the selector must follow the
markup change. Four edits, all in the blog section (lines against `433420e`):

1. Line 1129: `.blog-post-item > a {` → `.blog-post-item > .blog-card {`
   (keeps the gradient border, radius, shadow, `height: 100%`).
2. Line 1138: `.blog-post-item > a::before {` →
   `.blog-post-item > .blog-card::before {` (keeps the inset background layer).
3. Line 1161: **delete** the rule
   `.blog-post-item > a:hover .blog-banner-box img { transform: scale(1.1); }` —
   the card is no longer interactive, so the hover zoom is a false affordance.
4. Line 1192: **delete** the rule
   `.blog-post-item > a:hover .blog-item-title { color: var(--orange-yellow-crayola); }` —
   same reason.

No other `.blog-post-item > a` selectors exist (verified by grep). Do not touch
any other rule in the file.

### Step 6 — Smoke test (manual, no build step)

Run `python3 -m http.server 8080` from the repo root and walk the checks in the
Validation Strategy below. There is no build/bundler; the edited files are the
deployable artifacts.

## Validation Strategy

Static checks (scriptable):

- `grep -c 'href="#"' index.html` → `0`.
- `grep -c 'href="#"' 404.html` → `0` (already true; confirms no regression).
- `grep -n 'blog-post-item > a' assets/css/style.css` → no matches.
- Every `href="./assets/images/project-N.*"` in `index.html` names a file that
  exists: `for f in $(grep -o 'assets/images/project-[0-9]\.[a-z]*' index.html | sort -u); do test -f "$f" || echo "MISSING $f"; done` prints nothing.
- `curl -s -o /dev/null -w '%{http_code}' https://github.com/SpecstraAI` → `200`.

Behavioral checks (serve locally; Playwright MCP is available and all sections
are in the DOM simultaneously — target the active `<article>` by `data-page`):

1. Navigate to `http://127.0.0.1:8080/#portfolio`. Click the "Finance" card →
   `project-1.jpg` opens in a new tab; the original tab still shows the
   Portfolio section with hash `#portfolio` (regression test for the
   hashchange reset bug).
2. Navigate to `#blog`. Click anywhere on a blog card → nothing navigates, the
   Blog section stays active, hash stays `#blog`.
3. Sidebar: exactly one social icon (GitHub); it has `aria-label="GitHub"` and
   opens `https://github.com/SpecstraAI` in a new tab.
4. Clients row on About still renders all 6 logos, grayscale→color on hover.
5. Full CLAUDE.md smoke list still passes: all five nav tabs switch sections,
   portfolio filter buttons and mobile dropdown still work (`data-filter-item`
   lives on the `<li>`, not the anchor — unaffected), testimonial modal opens
   and closes, theme toggle persists across reload.
6. Zero console errors on load (an early throw in `script.js` would kill all
   listeners — this change touches no JS, so any new console error is a defect).

## Risks and Mitigations

- **Blog cards lose their hover/cursor affordance.** Intended: with no
  destination, an interactive affordance is a lie. The two hover rules are
  deleted (Step 5) so the card reads as static content. When real posts exist,
  restore `<a>` wrappers and the two hover rules (follow-up, out of scope).
- **CSS selector rename drift.** If Step 4 ships without Step 5, blog cards
  render unstyled (gradient box and padding live on the anchor selector). Steps
  4 and 5 must land in the same commit; the grep check in Validation catches a
  partial rename.
- **GitHub Pages path resolution.** All new project hrefs are relative
  (`./assets/images/…`) exactly like the existing `<img src>` values, so they
  resolve identically under the `/vcard-portfolio/` project path. Only
  `404.html` requires project-absolute paths, and it is untouched.
- **Single social icon looks sparse.** Accepted trade-off versus shipping dead
  or fake profile links; the template owner replaces/extends the list when
  customizing. Layout verified safe: `.social-list` is a flex row.

## Success Criteria

- [ ] `grep -c 'href="#"' index.html` returns `0`.
- [ ] `grep -c 'blog-post-item > a' assets/css/style.css` returns `0`, and
      `grep -c 'blog-post-item > .blog-card' assets/css/style.css` returns `2`.
- [ ] The sidebar social link has `aria-label="GitHub"`,
      `target="_blank"`, `rel="noopener noreferrer"`, and
      `https://github.com/SpecstraAI` returns HTTP 200.
- [ ] All 9 project-card hrefs resolve to existing files in `assets/images/`
      (script in Validation Strategy prints nothing).
- [ ] With the site served locally at `#portfolio`, clicking a project card
      does not change the active `<article data-page>` in the original tab.
- [ ] No changes to `assets/js/script.js`, `404.html`, or any file outside
      `index.html` and `assets/css/style.css`.
- [ ] No console errors on page load; all five nav tabs still switch sections.
