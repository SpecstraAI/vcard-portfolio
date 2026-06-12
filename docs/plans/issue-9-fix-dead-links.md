# Implementation Plan — Fix Dead Links: Social Icons, Project & Blog Cards (Issue #9)

## Summary

`index.html` contains **24 placeholder `href="#"` anchors** (the issue enumerates
three groups; planning found a fourth of the same defect class):

| Group | Count | Lines (current `main`) |
| --- | --- | --- |
| Sidebar social icons (Facebook / Twitter / Instagram glyphs) | 3 | 189, 195, 201 |
| Clients logo carousel *(not enumerated in the issue — same defect)* | 6 | 530–560 |
| Portfolio project cards | 9 | 837, 858, 879, 900, 921, 942, 963, 984, 1005 |
| Blog post cards | 6 | 1050, 1081, 1112, 1143, 1174, 1205 |

The issue offers two sanctioned fixes per link: *point at a real destination* or
*remove the anchor*. The persona "Alex Morgan" is fictional, so no real social
profiles, project pages, or blog articles exist for it. This plan resolves each
group accordingly:

1. **Social icons** → repoint at the two *real, verified* owner destinations
   (`https://github.com/SpecstraAI`, `https://buildorchestra.com`), swapping the
   demo platform glyphs for matching icons, with `aria-label`s (icon-only links).
2. **Project cards** → point each card at its own full-resolution image in
   `assets/images/` — a real destination that exists in-repo, coherent with the
   eye ("view") hover overlay, and requiring **zero CSS changes**.
3. **Blog cards** → remove the anchors (no real articles exist) and de-interactify
   the cards: `<a href="#">` becomes `<div class="blog-card">`, with a small,
   fully-specified CSS selector rename.
4. **Clients logos** → unwrap the anchors (generic placeholder logos, no real
   client sites). CSS never targets these anchors, so this is markup-only.

`assets/js/script.js` is untouched: it selects exclusively via `data-*` attributes
(verified — no selector in the file references any of these anchors), so this
change carries no JS risk.

### Relationship to in-flight PRs (read before building)

- **PR #24** (`feat/9-…`, open) already attempts this issue. This plan
  **supersedes its approach** in two places:
  - *Social*: PR #24 points the icons at platform **root** URLs
    (`facebook.com`, `x.com`, `instagram.com`). Those resolve, but they are not
    "real profiles" as the issue asks and tell the visitor nothing about the
    owner. This plan uses the owner's verified destinations instead.
  - *Project/blog cards*: PR #24 keeps `<a>` elements without `href` and adds
    `cursor: pointer` CSS. An href-less anchor is neither focusable nor
    activatable, so the cards *look* clickable (cursor + hover overlay/zoom) but
    do nothing — the eye overlay becomes a false affordance. This plan gives
    project cards a true destination and strips interactivity styling from blog
    cards.

  The build stage should **push amendments to PR #24's branch** (one PR per
  issue) rather than open a competing PR.
- **PR #25** (`feat/8-…`, open, issue #8 personalization) **deletes the blog and
  clients sections entirely** and retitles all project cards. Merge-order
  handling is in [Risks](#risks-and-mitigations).

## Scope and Assumptions

**In scope**

- All 24 `href="#"` anchors listed above.
- `aria-label` + `target="_blank" rel="noopener noreferrer"` on the social links.
- The minimal CSS rename/deletion needed by the blog-card de-anchoring.

**Out of scope (Non-Goals)**

- Writing real blog articles or project case-study pages.
- Any change to `assets/js/script.js` (no JS selects these anchors).
- Lightbox/modal viewers for project images.
- The `data-selecct-value` typo and every other documented landmine.
- Touching `404.html` or `index.txt`.

**Assumptions**

- "Alex Morgan" stays a fictional demo persona (issue #8 / PR #25 may rename
  content, but no real third-party social profiles will ever exist for it), so
  the only honest "real profiles" are the repo owner's. Verified live during
  planning: `https://github.com/SpecstraAI` (the org) and
  `https://buildorchestra.com` (the org's registered blog URL on GitHub). The
  org has no registered Twitter handle, so the social list shrinks from 3 items
  to 2 — removal is explicitly sanctioned by the issue.
- Opening a project image in a new tab is an acceptable "view project"
  experience for a demo template; `target="_blank"` keeps the SPA (and its hash
  state) intact.

## Affected Areas

| File | New/Edit | Responsibility |
| --- | --- | --- |
| `index.html` lines 186–206 (`.social-list`) | edit | Replace 3 placeholder social items with 2 real ones (GitHub, Website); add `aria-label`, `target`, `rel`; new inline SVG glyphs |
| `index.html` lines 529–563 (`.clients-list`) | edit | Unwrap `<a href="#">` from the 6 client `<img>` elements |
| `index.html` lines 837–1005 (`.project-list`) | edit | Set each of 9 project-card `href`s to the card's own fallback image path; add `target`/`rel` |
| `index.html` lines 1049–1233 (`.blog-posts-list`) | edit | Replace 6 `<a href="#">`…`</a>` wrappers with `<div class="blog-card">`…`</div>` |
| `assets/css/style.css` lines 1129, 1138 | edit | Rename selectors `.blog-post-item > a` → `.blog-post-item > .blog-card` |
| `assets/css/style.css` lines 1161, 1192 | delete | Remove blog hover rules (image zoom, title color) — cards are no longer interactive |
| `docs/plans/issue-9-fix-dead-links.md` | new | This plan |

No other files change. In particular `assets/js/script.js` must show no diff.

## Implementation Steps

### Step 1 — Social icons (`index.html:186–206`)

Replace the three `<li class="social-item">` blocks with exactly two:

```html
<li class="social-item">
  <a href="https://github.com/SpecstraAI" class="social-link"
     aria-label="GitHub profile" target="_blank" rel="noopener noreferrer">
    <!-- GitHub mark: Octicons "mark-github" path (MIT), solid fill -->
    <svg class="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="..."/>  <!-- official mark-github path data -->
    </svg>
  </a>
</li>

<li class="social-item">
  <a href="https://buildorchestra.com" class="social-link"
     aria-label="Website" target="_blank" rel="noopener noreferrer">
    <!-- Globe: Ionicons "globe-outline" paths, stroke-based -->
    <svg class="icon" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
      <!-- circle + meridian paths with fill="none" stroke="currentColor",
           NO stroke-width attribute (CSS variable pattern supplies it) -->
    </svg>
  </a>
</li>
```

Icon sourcing rules (these are the repo's documented landmines):

- Inline SVG only, `class="icon"`, `aria-hidden="true" focusable="false"` — no
  icon CDN may be introduced.
- GitHub mark: use the official Octicons `mark-github` 16×16 solid path with
  `fill="currentColor"` (same solid-glyph style as the icons being removed).
- Globe: use Ionicons `globe-outline` path data with `fill="none"
  stroke="currentColor"` on each child and **no `stroke-width` attribute** —
  weight comes from the `svg.icon [stroke] { stroke-width: var(--icon-stroke-width, 32) }`
  rule; an attribute would silently break the documented per-context overrides.

No CSS change: `.social-item .social-link` (style.css:513–519) styles whatever
anchors remain.

### Step 2 — Project cards (`index.html`, 9 anchors)

For each `<li class="project-item">`, set the anchor's `href` to the same path as
the card's fallback `<img src>` and add `target="_blank" rel="noopener noreferrer"`.
Exact mapping (fallback extensions differ per card — copy from this table, do not
guess):

| Line | Card title | New `href` |
| --- | --- | --- |
| 837 | Finance | `./assets/images/project-1.jpg` |
| 858 | Orizon | `./assets/images/project-2.png` |
| 879 | Fundo | `./assets/images/project-3.jpg` |
| 900 | Brawlhalla | `./assets/images/project-4.png` |
| 921 | DSM. | `./assets/images/project-5.png` |
| 942 | MetaSpark | `./assets/images/project-6.png` |
| 963 | Summary | `./assets/images/project-7.png` |
| 984 | Task Manager | `./assets/images/project-8.jpg` |
| 1005 | Arrival | `./assets/images/project-9.png` |

Nothing else on these cards changes: `data-filter-item` / `data-category` stay on
the `<li>` (the portfolio filter selects those, not the anchor), and all
`.project-item > a` CSS rules (style.css:1039, 1062, 1081, 1094) keep matching, so
the eye-overlay hover behavior is preserved — and now truthfully opens the
full-size artwork. If PR #25 (which retitles the cards but keeps the same image
files and anchor structure) merges first, this mapping still applies by line
position/image number, not by title.

### Step 3 — Blog cards (`index.html`, 6 anchors + CSS)

Markup — for each of the 6 `<li class="blog-post-item">` blocks (anchors open at
lines 1050, 1081, 1112, 1143, 1174, 1205 and close at 1077, 1108, 1139, 1170,
1201, 1232 respectively):

- Replace the opening `<a href="#">` with `<div class="blog-card">`.
- Replace the matching closing `</a>` with `</div>`.
- Keep every child element (figure, `.blog-content`, meta, title, text) byte-identical.

CSS (`assets/css/style.css`):

- Line 1129: `.blog-post-item > a {` → `.blog-post-item > .blog-card {` (keep the
  whole declaration block — it paints the card's gradient border and shadow).
- Line 1138: `.blog-post-item > a::before {` → `.blog-post-item > .blog-card::before {`
  (structural background panel — keep).
- Line 1161: delete the entire rule
  `.blog-post-item > a:hover .blog-banner-box img { transform: scale(1.1); }`.
- Line 1192: delete the entire rule
  `.blog-post-item > a:hover .blog-item-title { color: var(--orange-yellow-crayola); }`.

Rationale: the cards become non-interactive display content, so hover zoom and
title highlight would be false affordances. (The `<div>` is block-level like the
layout already assumes; no `display` declaration is needed.)

### Step 4 — Clients logos (`index.html:529–563`)

In each of the 6 `<li class="clients-item">` blocks, remove the `<a href="#">` /
`</a>` wrapper and keep the `<img>` as the `<li>`'s direct child. CSS only targets
`.clients-item` and `.clients-item img` (style.css:831–842), so no CSS change. The
logos are generic placeholders with no real client sites; the existing
grayscale-on-hover effect is on the `img` and survives.

### Step 5 — Reconcile with PR #24

Apply Steps 1–4 as commits on PR #24's branch (`feat/9-fix-dead-links-social-icons-project-blog`),
reverting that PR's `cursor: pointer` CSS addition and href-less-anchor markup
where this plan differs. Do not open a second implementation PR for issue #9.

## Validation Strategy

There is no build step or test suite; validation is grep + manual/Playwright
smoke per the project's documented checklist.

```bash
# 1. No placeholder links remain anywhere in the document
grep -c 'href="#"' index.html                      # expect: 0

# 2. Every project href points at a file that exists
grep -o 'href="\./assets/images/project-[^"]*"' index.html \
  | sed 's/href="\.\///; s/"$//' \
  | while read f; do test -f "$f" || echo "MISSING $f"; done   # expect: no output

# 3. Social anchors are labelled and safe
grep -A1 'class="social-link"' index.html | grep -c 'aria-label'   # expect: 2 links, both labelled

# 4. External destinations resolve (planning already verified both)
curl -s -o /dev/null -w '%{http_code}\n' -L https://github.com/SpecstraAI    # 200
curl -s -o /dev/null -w '%{http_code}\n' -L https://buildorchestra.com      # 200/30x→200

# 5. JS untouched
git diff --name-only | grep -c 'script.js'         # expect: 0
```

Browser smoke (Playwright MCP or manual, `python3 -m http.server 8080`):

1. All five nav tabs still switch sections; no console errors on load (a throw in
   `script.js` would kill later listeners — none expected since JS is untouched).
2. Portfolio filter buttons and mobile dropdown still show/hide cards
   (`data-filter-item` untouched).
3. Clicking a project card opens its full-size image in a new tab; the original
   tab keeps its `#portfolio` state.
4. Hovering a blog card produces **no** zoom/title-highlight and the cursor stays
   default; card visuals (border gradient, shadow) are intact in dark *and* light
   theme.
5. The two social icons render at sidebar weight, link out in new tabs, and are
   announced by their `aria-label`s.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| **PR #25 merges first** and deletes the blog + clients sections and retitles projects | Steps 3 and 4 become no-ops — skip whatever sections no longer exist after rebasing; Step 2's mapping is by image number, not title, so it survives retitling. Rebase PR #24's branch on `main` before applying. |
| **This work merges first**, then PR #25 conflicts | PR #25's deletions trivially win for blog/clients; the social-list and project-href hunks must be preserved during its conflict resolution. Note this in the PR description. |
| New globe SVG accidentally carries a `stroke-width` attribute (copy-paste from Ionicons source includes one) | Documented landmine #6: strip the attribute; verify visually that sidebar icon weight matches neighbors. |
| Blog CSS rename misses one of the four selectors | All four occurrences are enumerated by line (1129, 1138, 1161, 1192); after the edit `grep -c '\.blog-post-item > a' assets/css/style.css` must return 0. |
| `buildorchestra.com` ownership changes / link rots | It is the org's registered GitHub blog URL — the same maintenance surface as the repo itself; acceptable for a demo template. |

## Success Criteria

- [ ] `grep -c 'href="#"' index.html` returns **0**.
- [ ] `grep -c '\.blog-post-item > a' assets/css/style.css` returns **0**, and
      `grep -c '\.blog-post-item > .blog-card' assets/css/style.css` returns **2**.
- [ ] Every `href="./assets/images/project-N.*"` in `index.html` resolves to an
      existing file (script in Validation, no output).
- [ ] Both social anchors have non-empty `aria-label`, `target="_blank"`, and
      `rel="noopener noreferrer"`; both URLs return HTTP 200 (after redirects).
- [ ] `git diff main --name-only` for the implementation touches only
      `index.html` and `assets/css/style.css` (plus `.orchestra/outcome.json` /
      plan docs per pipeline convention).
- [ ] Browser smoke checks 1–5 above pass with zero console errors.
