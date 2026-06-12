# Implementation Plan — Fix Dead Links: Social Icons, Project & Blog Cards (Issue #9)

> **Supersedes** closed PR #24 (implementation) and closed PR #26 (previous plan).
> Two things changed since those were written: `main` now gitignores `.orchestra/`
> (commit `433420e` — the implementation PR must contain **only** `index.html` /
> `assets/css/style.css` changes), and the previous plan's second social
> destination, `https://buildorchestra.com`, **fails DNS resolution** — pointing a
> social icon at it would replace one dead link with another. This plan keeps the
> parts of the prior approach that verified clean and fixes those two problems.

## Summary

`index.html` on current `main` (`433420e`) contains **24 placeholder `href="#"`
anchors** — the three groups the issue enumerates plus one more of the same
defect class found during planning:

| Group | Count | Lines (current `main`) |
| --- | --- | --- |
| Sidebar social icons (Facebook / Twitter / Instagram glyphs) | 3 | 189, 195, 201 |
| Clients logo carousel *(not in the issue — same defect)* | 6 | 530–560 |
| Portfolio project cards | 9 | 837, 858, 879, 900, 921, 942, 963, 984, 1005 |
| Blog post cards | 6 | 1050, 1081, 1112, 1143, 1174, 1205 |

The issue sanctions two fixes per link: *point at a real destination* or *remove
the anchor*. "Alex Morgan" is a fictional template persona (email
`alex.morgan@example.com` on `main`; PR #25 changes it to
`hello@alexmorgan.design` — still fictional), so no real social profiles,
project pages, or blog articles exist. Resolution per group:

1. **Social icons** → replace the three placeholder items with **one** verified
   real destination: `https://github.com/SpecstraAI` (HTTP 200, the repo
   owner's org profile), as an icon-only link with `aria-label`. The other two
   items are removed — the org has no registered Twitter handle, and its
   registered blog URL (`buildorchestra.com`) does not resolve, so there is no
   second honest destination to offer.
2. **Project cards** → point each card at its own full-resolution image in
   `assets/images/` — a real destination that exists in-repo, coherent with the
   eye ("view") hover overlay, and requiring **zero CSS changes**.
3. **Blog cards** → remove the anchors (no real articles) and de-interactify the
   cards with a small, fully line-cited CSS rename. **Conditional:** open PR #25
   deletes the entire blog section — see merge-order handling below.
4. **Clients logos** → unwrap the anchors (markup-only; CSS never targets them).
   **Conditional on PR #25 for the same reason.**

`assets/js/script.js` is untouched: it selects exclusively via `data-*`
attributes (verified — no selector in the file references any of these anchors),
so this change carries no JS risk.

### Relationship to in-flight work (read before building)

- **PR #24 and PR #26 are closed.** No open PR exists for issue #9. The build
  stage should branch fresh from current `main` and open a **new** PR. Do not
  resurrect PR #24's approach (platform-root social URLs; href-less anchors
  with `cursor: pointer` — false affordances).
- **PR #25** (issue #8 personalization, open, touches only `index.html`)
  **deletes the blog section, the clients carousel, and the testimonials
  section**, retitles all 9 project cards, and leaves the social links and
  project-card anchors untouched. **Recommended merge order: PR #25 first,
  then this issue** — that shrinks this issue's scope from 24 anchors to 12
  (Steps 3 and 4 become no-ops). Both orderings are handled in
  [Risks](#risks-and-mitigations).

## Scope and Assumptions

**In scope**

- All 24 `href="#"` anchors listed above (12 if PR #25 merges first).
- `aria-label` + `target="_blank" rel="noopener noreferrer"` on the social link.
- The minimal CSS rename/deletion needed by the blog-card de-anchoring (skipped
  if PR #25 lands first).

**Out of scope (Non-Goals)**

- Writing real blog articles or project case-study pages.
- Any change to `assets/js/script.js` (no JS selects these anchors).
- Lightbox/modal viewers for project images.
- Adding placeholder personal-profile URLs (Dribbble/LinkedIn/etc. vanity paths
  for "alexmorgan" are real URLs owned by strangers — worse than removal).
- The `data-selecct-value` typo and every other documented landmine.
- Touching `404.html`, `.gitignore`, or anything under `.orchestra/` / `.claude/`
  (runtime directories; `.orchestra/` is gitignored on `main`, `.claude/` is
  untracked — **neither may appear in the PR diff**).

**Assumptions**

- The persona stays fictional, so the only honest "real profile" is the repo
  owner's. Verified during planning (2026-06-12):
  `https://github.com/SpecstraAI` → HTTP 200;
  `https://buildorchestra.com` → DNS failure (other domains resolve from the
  same environment, so this is the domain, not the network);
  org `twitter_username` is `null`. The social list therefore shrinks from
  3 items to 1 — removal is explicitly sanctioned by the issue.
- Opening a project image in a new tab is an acceptable "view project"
  experience for a demo template; `target="_blank"` keeps the SPA (and its
  hash state) intact.

## Affected Areas

| File | New/Edit | Responsibility |
| --- | --- | --- |
| `index.html` lines 186–206 (`.social-list`) | edit | Replace 3 placeholder social items with 1 real one (GitHub); add `aria-label`, `target`, `rel`; new inline SVG glyph |
| `index.html` lines 837–1005 (`.project-list`) | edit | Set each of 9 project-card `href`s to the card's own fallback image path; add `target`/`rel` |
| `index.html` lines 529–563 (`.clients-list`) | edit (skip if #25 merged) | Unwrap `<a href="#">` from the 6 client `<img>` elements |
| `index.html` lines 1049–1233 (`.blog-posts-list`) | edit (skip if #25 merged) | Replace 6 `<a href="#">`…`</a>` wrappers with `<div class="blog-card">`…`</div>` |
| `assets/css/style.css` lines 1129, 1138 | edit (skip if #25 merged) | Rename selectors `.blog-post-item > a` → `.blog-post-item > .blog-card` |
| `assets/css/style.css` lines 1161, 1192 | delete (skip if #25 merged) | Remove blog hover rules (image zoom, title color) — cards no longer interactive |
| `docs/plans/issue-9-fix-dead-links.md` | new | This plan (lands via the plan PR) |

No other files change. In particular `assets/js/script.js` must show no diff,
and nothing under `.orchestra/` or `.claude/` may be committed.

## Implementation Steps

### Step 1 — Social icons (`index.html:186–206`)

Replace the three `<li class="social-item">` blocks with exactly one:

```html
<li class="social-item">
  <a href="https://github.com/SpecstraAI" class="social-link"
     aria-label="GitHub" target="_blank" rel="noopener noreferrer">
    <svg class="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/>
    </svg>
  </a>
</li>
```

Icon sourcing rules (the repo's documented landmines):

- Inline SVG only, `class="icon"`, `aria-hidden="true" focusable="false"` — no
  icon CDN may be introduced.
- The GitHub mark above is the official Octicons `mark-github` 16×16 path
  (MIT), `fill="currentColor"` — the same solid-glyph style as the three icons
  being removed, so it inherits the existing `.social-item .social-link` color
  and hover (style.css:513–519) with no CSS change.
- Because it is a solid (fill-based) glyph there is no `stroke` child, so the
  `svg.icon [stroke]` stroke-width rule is irrelevant here. Do **not** add a
  `stroke-width` attribute anywhere (landmine #6).

### Step 2 — Project cards (`index.html`, 9 anchors)

For each `<li class="project-item">`, set the anchor's `href` to the same path
as the card's fallback `<img src>` and add
`target="_blank" rel="noopener noreferrer"`. Exact mapping — fallback
extensions differ per card; copy from this table, do not guess. (Titles change
when PR #25 merges; the mapping is keyed by **image number**, which #25 does
not touch.)

| Line | Title on `main` | Title after PR #25 | New `href` |
| --- | --- | --- | --- |
| 837 | Finance | FinTrack Dashboard | `./assets/images/project-1.jpg` |
| 858 | Orizon | Orizon SaaS Platform | `./assets/images/project-2.png` |
| 879 | Fundo | Fundo Brand & Web | `./assets/images/project-3.jpg` |
| 900 | Brawlhalla | Pixel Quest | `./assets/images/project-4.png` |
| 921 | DSM. | DSM Design System | `./assets/images/project-5.png` |
| 942 | MetaSpark | MetaSpark Landing | `./assets/images/project-6.png` |
| 963 | Summary | Summary App | `./assets/images/project-7.png` |
| 984 | Task Manager | Task Flow App | `./assets/images/project-8.jpg` |
| 1005 | Arrival | Arrival Platform | `./assets/images/project-9.png` |

All nine fallback files verified present in `assets/images/`. Nothing else on
these cards changes: `data-filter-item` / `data-category` stay on the `<li>`
(the portfolio filter selects those, not the anchor), and all
`.project-item > a` CSS rules (style.css:1039, 1062, 1081, 1094) keep matching,
so the eye-overlay hover behavior is preserved — and now truthfully opens the
full-size artwork.

### Step 3 — Blog cards (`index.html`, 6 anchors + CSS) — **skip if PR #25 merged first**

If the blog section is absent after rebasing on `main`, this step is a no-op.
Otherwise:

Markup — for each of the 6 `<li class="blog-post-item">` blocks (anchors open
at lines 1050, 1081, 1112, 1143, 1174, 1205 and close at 1077, 1108, 1139,
1170, 1201, 1232 respectively):

- Replace the opening `<a href="#">` with `<div class="blog-card">`.
- Replace the matching closing `</a>` with `</div>`.
- Keep every child element (figure, `.blog-content`, meta, title, text)
  byte-identical.

CSS (`assets/css/style.css`):

- Line 1129: `.blog-post-item > a {` → `.blog-post-item > .blog-card {` (keep
  the whole declaration block — it paints the card's gradient border and shadow).
- Line 1138: `.blog-post-item > a::before {` → `.blog-post-item > .blog-card::before {`
  (structural background panel — keep).
- Line 1161: delete the entire rule
  `.blog-post-item > a:hover .blog-banner-box img { transform: scale(1.1); }`.
- Line 1192: delete the entire rule
  `.blog-post-item > a:hover .blog-item-title { color: var(--orange-yellow-crayola); }`.

Rationale: the cards become non-interactive display content, so hover zoom and
title highlight would be false affordances. (The `<div>` is block-level like
the layout already assumes; no `display` declaration is needed.)

### Step 4 — Clients logos (`index.html:529–563`) — **skip if PR #25 merged first**

If the clients section is absent after rebasing, no-op. Otherwise: in each of
the 6 `<li class="clients-item">` blocks, remove the `<a href="#">` / `</a>`
wrapper and keep the `<img>` as the `<li>`'s direct child. CSS only targets
`.clients-item` and `.clients-item img` (style.css:831–842), so no CSS change;
the grayscale-on-hover effect is on the `img` and survives.

### Step 5 — Open a fresh PR

Branch from current `main`, apply Steps 1–4, and open a **new** PR referencing
`Closes #9`. The diff must contain only `index.html` and (if Step 3 ran)
`assets/css/style.css`. Do not commit anything under `.orchestra/` (gitignored
on `main` since `433420e`) or `.claude/` — stray runtime files are why the
previous PRs for this issue were closed unmerged.

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

# 3. The social anchor is labelled and safe
grep -c 'aria-label="GitHub"' index.html           # expect: 1

# 4. The external destination resolves (re-verify at build time)
curl -s -o /dev/null -w '%{http_code}\n' -L https://github.com/SpecstraAI   # 200

# 5. JS untouched, no runtime files staged
git diff main --name-only | grep -vE '^(index\.html|assets/css/style\.css|docs/plans/)' \
                                                    # expect: no output
```

Browser smoke (Playwright MCP or manual, `python3 -m http.server 8080`):

1. All nav tabs still switch sections; no console errors on load (a throw in
   `script.js` would kill later listeners — none expected since JS is untouched).
2. Portfolio filter buttons and mobile dropdown still show/hide cards
   (`data-filter-item` untouched).
3. Clicking a project card opens its full-size image in a new tab; the original
   tab keeps its `#portfolio` hash state.
4. (If blog section still exists) hovering a blog card produces **no**
   zoom/title-highlight and the cursor stays default; card visuals (border
   gradient, shadow) are intact in dark *and* light theme.
5. The GitHub icon renders in the sidebar at the same size/color as the removed
   icons, links out in a new tab, and is announced as "GitHub" in the
   accessibility tree.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| **PR #25 merges first** (recommended) — blog + clients sections deleted, projects retitled | Steps 3 and 4 become no-ops; Step 2's mapping is keyed by image number, not title, so it survives retitling. Rebase before applying. |
| **This work merges first**, then PR #25 conflicts on `index.html` | PR #25's section deletions trivially win for blog/clients; its conflict resolution must preserve the social-list and project-href hunks. Note this in the implementation PR description. |
| `github.com/SpecstraAI` unreachable at build time | Re-run the curl check (Validation #4). If it fails, fall back to removing all three social items — removal is sanctioned by the issue; do **not** substitute an unverified URL. |
| GitHub SVG accidentally gains a `stroke-width` attribute via copy-paste | The mark is fill-based with no stroke children; landmine #6 only bites stroke icons. Verify visually that sidebar icon weight matches neighbors. |
| Blog CSS rename misses one of the four selectors | All four occurrences are line-cited (1129, 1138, 1161, 1192); after the edit `grep -c '\.blog-post-item > a' assets/css/style.css` must return 0. |
| Runtime files (`.orchestra/`, `.claude/`) leak into the PR again | `.orchestra/` is gitignored on `main`; `.claude/` must stay untracked. Validation #5 catches both. |

## Success Criteria

- [ ] `grep -c 'href="#"' index.html` returns **0**.
- [ ] The single social anchor has `aria-label="GitHub"`, `target="_blank"`,
      `rel="noopener noreferrer"`, and `https://github.com/SpecstraAI` returns
      HTTP 200.
- [ ] Every `href="./assets/images/project-N.*"` in `index.html` resolves to an
      existing file (Validation #2, no output).
- [ ] If the blog section exists: `grep -c '\.blog-post-item > a'
      assets/css/style.css` returns **0** and `grep -c '\.blog-post-item >
      .blog-card' assets/css/style.css` returns **2**.
- [ ] `git diff main --name-only` for the implementation touches only
      `index.html` and (if Step 3 ran) `assets/css/style.css` — no `.orchestra/`
      or `.claude/` paths.
- [ ] Browser smoke checks 1–5 above pass with zero console errors.
