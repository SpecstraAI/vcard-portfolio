# Implementation Plan — Performance: Self-Host Icons, Optimize Images, Remove Cruft (Issue #13)

## Current-State Replan — 2026-06-12

This issue was re-triaged after the prior run reached QA and reported an
environment blocker: Playwright/Chrome could not launch because browser binaries
and host libraries were unavailable. The implementation itself has already been
merged to `main` through PR #18, and later PRs #20 and #21 also merged on top of
it. Therefore the next executor must **not re-apply the original implementation
from scratch**. Start from current `origin/main`, verify the landed work against
the contract below, and only make a corrective production edit if one of the
listed checks fails.

### Current Main Evidence

| File / command | Current state to preserve |
| --- | --- |
| `git log --oneline origin/main` | Contains merge PR #18 for issue #13, followed by PR #20 navigation/hash routing and PR #21 contact-form submission. |
| `git grep -n "ion-icon" origin/main -- index.html assets/` | Returns no matches; the CDN/runtime dependency is already removed. |
| `origin/main:index.html:251` | Theme button uses two inline SVGs: `.theme-icon--sun` and `.theme-icon--moon`. |
| `origin/main:assets/js/script.js:178-238` | Theme toggle has no `querySelector('ion-icon')`; page navigation is now centralized in `activatePage` and hash handling from PR #20. Preserve that newer navigation structure. |
| `origin/main:assets/js/script.js:138-176` and `origin/main:index.html:1287` | Contact-form submission/status handling from PR #21 exists. Preserve it while validating issue #13. |
| `origin/main:assets/css/style.css:272-281` | SVG icon sizing, theme-icon visibility, and `--icon-stroke-width` rules are present. |
| `origin/main:index.html:844-1210` | Project/blog images use `<picture>` with `.webp` sources. |
| `git ls-tree -r --name-only origin/main` | Contains `assets/images/project-1.webp` through `project-9.webp`, `assets/images/blog-1.webp` through `blog-6.webp`, `.nojekyll`, and `404.html`; no tracked `index.txt` or `website-demo-image/Thumbs.db`. |
| `origin/main:404.html:10-11,84` | 404 assets and home link use project-absolute `/vcard-portfolio/...` paths. |

### Replan Scope and Assumptions

In scope for the next implementation stage:
- Verify that current `origin/main` satisfies the original issue #13 contract.
- Preserve the merged PR #20 hash-routing/navigation changes in
  `assets/js/script.js` and the merged PR #21 contact-form changes in
  `index.html`, `assets/js/script.js`, and `assets/css/style.css`.
- Patch only concrete gaps found during verification, using the affected-area
  table in the original plan as the contract for any corrective edit.

Out of scope for the next implementation stage:
- Reverting PR #20 or PR #21.
- Replacing the chosen inline-SVG approach with the lower-effort self-hosted
  Ionicons runtime alternative.
- Adding a GitHub Actions Pages workflow. The repo uses legacy Pages branch
  deploys from `main` root.

Assumptions:
- The branch used by the next executor is created from current `origin/main`, not
  from the older `1c11066` commit.
- If browser automation remains unavailable, the executor should still run the
  non-browser checks below and document the exact browser dependency failure
  instead of changing production code to satisfy a tooling limitation.

### Current-State Execution Steps

1. Sync to current `origin/main` before editing. Confirm that `git status` is
   clean and that the files from PR #20 and PR #21 are present:
   `assets/js/script.js` contains `activatePage`, `hashchange`, and
   `[data-form-status]` handling; `index.html` contains `<p class="form-status"
   data-form-status></p>`.
2. Run the static issue #13 gates:
   ```bash
   git grep -n "ion-icon" -- index.html assets/ || true
   git grep -n "unpkg.com/ionicons" -- index.html assets/ || true
   git ls-files | grep -E '(^index\.txt$|Thumbs\.db$)' || true
   git ls-files 'assets/images/*.webp'
   ```
   The first three commands must print no issue #13 regressions; the WebP list
   must include all nine `project-*.webp` and all six `blog-*.webp` files.
3. Confirm all 32 image elements have explicit intrinsic dimensions. Use a DOM
   parser if available; otherwise inspect every `<img` in `index.html` and verify
   each has both `width` and `height`.
4. Confirm CSS still preserves the inline-SVG contract:
   `assets/css/style.css` must contain `svg.icon [stroke]`, `.theme-icon--moon`,
   the two `:root[data-theme="light"]` theme-icon rules, and the three
   `--icon-stroke-width` context rules for `.icon-box`,
   `.modal-close-btn`, and `.project-item-icon-box`.
5. Serve the static site locally, for example:
   ```bash
   python3 -m http.server 8080
   ```
   Manually open `http://127.0.0.1:8080/` if a browser is available. Validate the
   theme toggle, all nav tabs, portfolio filters, testimonial modal, contact
   form enabled/disabled state, and that no console errors appear.
6. If browser automation is available, run a Playwright smoke that checks:
   default page renders, all five nav buttons activate their matching article,
   theme toggle flips `document.documentElement.dataset.theme`, project/blog
   image current requests prefer WebP, and `404.html` links resolve to
   `/vcard-portfolio/`.
7. If any static or browser check fails, make the smallest corrective edit in the
   file named by the failed check, then re-run the relevant checks. Do not modify
   unrelated SEO metadata, contact-form submission, or hash-routing behavior.

### Current-State Validation Strategy

- Static verification: `git grep` gates for `ion-icon`/Ionicons CDN, tracked
  cruft absence, WebP file presence, all `<img>` dimensions, SVG CSS rules, and
  project-absolute 404 paths.
- Manual browser verification: local `python3 -m http.server` smoke across
  desktop and mobile viewport widths.
- Automated browser verification when dependencies allow it: Playwright smoke for
  navigation, theme toggle, modal open/close, portfolio filtering, WebP source
  selection, and 404 path behavior.
- Pages verification after merge: `gh api repos/SpecstraAI/vcard-portfolio/pages`
  should report `status: "built"` and `custom_404: true`; nested missing URL
  `/vcard-portfolio/projects/does-not-exist` should load
  `/vcard-portfolio/assets/css/style.css` with HTTP 200.

### Current-State Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Re-applying the original plan from the old branch overwrites PR #20 hash routing or PR #21 contact-form code. | Start from `origin/main`, verify `activatePage`, `hashchange`, and `data-form-status` before editing, and treat them as preserved behavior. |
| QA fails again because the environment lacks browser dependencies. | Report the browser dependency failure separately from implementation status; still complete static gates and manual checks that the environment supports. |
| A corrective edit accidentally restores the Ionicons runtime. | Keep the zero-hit `git grep -n "ion-icon" -- index.html assets/` and `git grep -n "unpkg.com/ionicons" -- index.html assets/` gates mandatory. |
| 404 validation passes at a shallow URL but fails for nested paths. | Test `/vcard-portfolio/projects/does-not-exist` and verify CSS loads from `/vcard-portfolio/assets/css/style.css`. |

### Current-State Success Criteria

- `origin/main` or the implementation branch has zero `ion-icon` and zero
  `unpkg.com/ionicons` references in `index.html` and `assets/`.
- All nine project WebP files and all six blog WebP files are tracked, and the
  matching project/blog `<img>` elements are inside `<picture>` wrappers with
  WebP `<source>` elements.
- Every `<img>` in `index.html` has both `width` and `height`.
- `index.txt` and `website-demo-image/Thumbs.db` are not tracked.
- `404.html` and `.nojekyll` are tracked; `404.html` uses
  `/vcard-portfolio/assets/css/style.css` and `/vcard-portfolio/`.
- PR #20 navigation/hash routing and PR #21 contact-form submission remain
  present after any corrective edit.
- Manual or automated browser smoke passes; if browser smoke cannot run, the
  implementation report names the missing browser dependency and includes the
  passing static checks.

## Summary

This is a performance-and-hygiene pass on the static vCard portfolio. It has four
independent workstreams, each shippable on its own:

1. **Icons** — Remove the runtime dependency on the unpkg Ionicons CDN
   (`index.html:1215–1216`, two `<script>` tags + per-icon network fetches).
   Replace the 24 `<ion-icon>` usages (15 unique glyphs once the JS-injected
   `moon-outline` is counted) with **inline `<svg>`**, eliminating the
   web-component runtime and the offline-blindness landmine. **This is a
   behavior-changing edit, not pure markup**: `assets/js/script.js` reaches into
   the theme button with `themeBtn.querySelector('ion-icon').setAttribute('name', …)`
   at lines 145, 148, and 156. Removing the `<ion-icon>` node without changing that
   code makes the selector return `null`, throws a `TypeError` during the
   initial-theme IIFE (`script.js:154–157`), and — because that exception aborts
   the rest of `script.js` — **prevents the page-navigation listeners below it
   (`script.js:171–185`) from ever registering**. Step 1 therefore edits
   `script.js` and the theme-button markup together under an explicit replacement
   contract.
2. **Images** — Convert the heavy raster images (project/blog `.jpg`/`.png`) to
   **WebP** behind a `<picture>` fallback, and add explicit `width`/`height` to
   **every** `<img>` to eliminate layout shift (CLS).
3. **Cruft** — Delete tracked stray files `website-demo-image/Thumbs.db` and
   `index.txt`; add a `.gitignore` so OS junk does not return.
4. **GitHub Pages** — Pages **is enabled and live** for this repo (evidence in
   [Step 4](#step-4--github-pages-add-404html--nojekyll-required-no-actions-workflow)).
   Add a custom `404.html` (Pages currently has `custom_404: false`) and a
   `.nojekyll` marker. **Do not** add a GitHub Actions deploy workflow — the repo
   deploys via the *legacy branch* source (`build_type: "legacy"`, `main` / root),
   and introducing an Actions workflow would require flipping the Pages Source and
   could break the working deploy.

There is **no build step** in this project (the project brief states "The
repository files are the deployable artefacts"). Every artifact below is committed
as a static file; nothing is generated at deploy time.

> **Historical line-note:** The Ionicons CDN tags were at
> `index.html:1215–1216` when this plan was first written (not `1196–1197` as
> the issue stated — line numbers shifted after the theme-toggle merge, PR #5).
> On current `main`, PR #18 has already removed those tags, PR #20 has merged
> hash routing, and PR #21 has merged contact-form submission. The
> Current-State Replan above supersedes any old merge-conflict guidance.

## Scope and Assumptions

**In scope**
- Inline-SVG replacement of all 24 `<ion-icon>` glyphs; removal of both Ionicons
  `<script>` tags; migration of the `ion-icon` CSS rules to the new element.
- **Editing `assets/js/script.js`** to remove its three `ion-icon` DOM mutations
  and the now-unnecessary initial-icon IIFE, replacing the theme-toggle icon
  mechanism with a CSS-driven dual-SVG swap (contract in
  [Step 1](#step-1--replace-ionicons-with-inline-svg-touches-indexhtml-stylecss-scriptjs)).
- WebP conversion of raster project/blog images with `<picture>` fallback.
- `width`/`height` on all 32 `<img>` elements.
- Deleting `website-demo-image/Thumbs.db` and `index.txt`; adding `.gitignore`.
- `404.html` (required) and `.nojekyll` (recommended) at repo root for GitHub Pages.

**Out of scope**
- Changing the page-navigation text-matching logic (`script.js:175`) or the
  `data-selecct-value` typo (`script.js:61`).
- Re-architecting CSS, adding a bundler/preprocessor, or introducing npm.
- Touching `assets/images/*.svg` source icons (they are already vector and small;
  `icon-design.svg`, `icon-dev.svg`, etc. are `<img src>`, not `<ion-icon>`).
- Replacing the favicon `logo.ico` (left as-is; PR #16 separately adds an SVG favicon).
- **A GitHub Actions Pages deploy workflow** — explicitly out of scope; see
  [Step 4](#step-4--github-pages-add-404html--nojekyll-required-no-actions-workflow).
- **Project documentation updates** — explicitly out of scope; see the
  *Documentation* note below.

**Documentation (de-scoped, with evidence)**

The previously-rejected plan instructed edits to `CLAUDE.md` / `.claude/CLAUDE.md`.
That is wrong for this checkout. `git ls-files` shows the only tracked
documentation is `README.md` and `docs/plans/*.md`. The `.claude/CLAUDE.md` that
describes the Ionicons-CDN and `index.txt` gotchas is **not tracked by git** — it
is harness-injected tooling context, not a repository artefact, so it is not the
implementer's to edit and changes to it would not ship. `README.md` (44 lines)
**does not mention** the Ionicons CDN, `index.txt`, or any gotcha (`grep -niE
'ionicon|cdn|index\.txt|pages|404|gotcha' README.md` → no matches). Therefore
**there is no committed documentation file that needs updating** when icons go
inline and `index.txt` is deleted. Documentation work is removed from Affected
Areas, Steps, and Success Criteria. (If a maintainer later wants the change
recorded, the only candidate is `README.md`, but it currently says nothing on
these topics, so there is nothing to retire.)

**Assumptions**
- Modern browsers are the target. WebP is universally supported in 2026, but a
  `<picture>` + original-format fallback is included for robustness and because it
  is zero-risk. (If the team prefers a hard cutover, drop the `<source>` and swap
  `src` directly — noted inline.)
- Image conversion is performed at implementation time with `cwebp` (libwebp) or
  Squoosh. **These tools are not present in the planning environment** (`which
  cwebp identify file` → all not found), so the implementer must install/run them
  locally; see [Step 2](#step-2--convert-raster-images-to-webp-and-pin-dimensions).
- `index.txt` is safe to delete: it is a manually-maintained text dump nothing in
  the project loads or references (`grep -rn 'index.txt' index.html assets/` → no
  hits). `website-demo-image/desktop.png` and `mobile.png` are **kept** —
  `README.md` references them.

## Affected Areas

| File | Change |
| --- | --- |
| `index.html` (`<head>`, ~L1–32) | No head icon tags to remove (Ionicons scripts are at the bottom). Optionally add `<link rel="preload">` for the LCP image. |
| `index.html` (theme button, L206–208) | Replace the single `<ion-icon name="sunny-outline">` with **two inline SVGs** (`theme-icon--sun`, `theme-icon--moon`); see Step 1 contract. |
| `index.html` (23 other `<ion-icon>` sites) | Replace each with an inline `<svg class="icon">…</svg>`. Sites: L65, 79, 93, 107, 121, 135, 145, 151, 157, 440, 544, 601, 762, 796, 814, 832, 850, 868, 886, 904, 922, 940, 1188. |
| `index.html` (`index.html:1215–1216`) | Delete both Ionicons `<script>` tags. |
| `index.html` (all 32 `<img>` sites) | Add `width`/`height`; wrap raster project/blog images in `<picture>` with a WebP `<source>`. |
| **`assets/js/script.js` (L142–157)** | **Remove** the three `themeBtn.querySelector('ion-icon').setAttribute('name', …)` calls (L145, L148, L156) and the initial-icon IIFE (L153–157). Keep the `dataset.theme` / `localStorage` logic and the click listener. See Step 1 contract. |
| `assets/css/style.css` (L195, 272, 773, 1078, 1286, 1331, 1472, 1653) | Re-target the 8 `ion-icon` CSS rules to the new `svg.icon`; replace the 3 `--ionicon-stroke-width` rules (L272/773/1078) with the `--icon-stroke-width` strategy in Step 1d; add the base `svg.icon [stroke]` weight rule and the 3 theme-icon visibility rules. |
| `assets/images/*.webp` (new) | Committed WebP variants of project/blog rasters. |
| `website-demo-image/Thumbs.db` | **Delete** (tracked). |
| `index.txt` | **Delete** (tracked). |
| `.gitignore` (new) | Ignore `Thumbs.db`, `.DS_Store`, `desktop.ini`. |
| `404.html` (new, **required**) | Branded not-found page reusing `style.css` via **project-absolute paths** (`/vcard-portfolio/assets/css/style.css`, home link `/vcard-portfolio/`); see Step 4. |
| `.nojekyll` (new, recommended) | Disable Jekyll processing on Pages. |

> No documentation files appear in this table — see the *Documentation* note in
> Scope. No `.github/workflows/*.yml` is added — see Step 4.

## Icon Inventory (for Step 1)

24 `<ion-icon>` instances. **15 unique glyphs** are required as inline SVG — the
14 present in markup **plus `moon-outline`, which never appears in `index.html`
but is set at runtime by `script.js:145` and `:156` for light mode** and so must
also be inlined into the theme button.

| Glyph (`name=`) | Count | Style | Notes |
| --- | --- | --- | --- |
| `eye-outline` | 9 | outline (stroke) | portfolio overlays |
| `book-outline` | 2 | outline | blog (L544, L601) |
| `chevron-down` | 2 | filled | nav + portfolio select (L65, L762) |
| `calendar-outline` | 1 | outline | |
| `close-outline` | 1 | outline | modal close (L440) |
| `download-outline` | 1 | outline | CV button (L135) |
| `location-outline` | 1 | outline | |
| `mail-outline` | 1 | outline | |
| `phone-portrait-outline` | 1 | outline | |
| `sunny-outline` | 1 | outline | **theme toggle, `index.html:207`** |
| `moon-outline` | 0 in HTML | outline | **JS-injected light-mode icon (`script.js:145,156`) — MUST be inlined** |
| `paper-plane` | 1 | filled | contact submit (L1188) |
| `logo-facebook` | 1 | brand (filled) | |
| `logo-instagram` | 1 | brand | |
| `logo-twitter` | 1 | brand | |

`--ionicon-stroke-width` is customized in **3** CSS rules: 35px for `.icon-box`
(`style.css:272`, the **sidebar** contact icons — mail/phone/location/calendar),
50px for `.modal-close-btn` (`style.css:773`, the testimonial **modal-close ×**
icon) and `.project-item-icon-box` (`style.css:1078`, the **project-overlay eye**
icon). This only affects the *outline* glyphs and **must** be preserved during
inline-SVG migration via the single `--icon-stroke-width` CSS strategy specified in
[Step 1d](#step-1--replace-ionicons-with-inline-svg-touches-indexhtml-stylecss-scriptjs)
— **not** by hardcoded child `stroke-width` attributes (those are stripped in 1a,
because an explicit child attribute cannot be overridden from an ancestor rule).

## Implementation Steps

> Order the four workstreams so each commit is independently reviewable. Steps 1–2
> are the substance; 3–4 are quick and low-risk.

### Step 1 — Replace Ionicons with inline SVG (touches index.html, style.css, **script.js**)

**1a. Obtain the 15 glyph SVGs.** For each unique glyph in the inventory (including
`moon-outline`), copy the exact SVG source from the pinned Ionicons 5.5.2 package
(`https://unpkg.com/ionicons@5.5.2/dist/svg/<name>.svg`). Copy the inner
`<path>`/`<rect>`/`<line>`/`<circle>` markup verbatim — **with one required
modification**: the *outline* glyphs ship with a hardcoded `stroke-width="32"`
presentation attribute on each stroked child element. **Strip that
`stroke-width="32"` attribute from every stroked child** so the stroke weight is
controlled entirely from CSS (Step 1d). Leave every other attribute (`d`, `cx`,
`cy`, `x1`, geometry, `fill`/`stroke`) untouched, so glyphs render
pixel-identically once CSS supplies the weight. (Why strip it: an explicit
`stroke-width` attribute on the child wins over any `stroke-width` rule applied to
an *ancestor* selector such as `.icon-box svg.icon`, so leaving it in place would
silently discard the 35px/50px weight customizations — the exact contradiction
this plan resolves.)

**1b. Replace the 23 non-theme `<ion-icon>` tags** with:
```html
<svg class="icon" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
  <!-- path(s) from <name>.svg -->
</svg>
```
- Outline glyphs use `fill="none" stroke="currentColor"` and carry **no**
  `stroke-width` attribute on their children (it was stripped in 1a — the weight is
  supplied by CSS in 1d); filled/brand glyphs use `fill="currentColor"`. Keep the
  fill/stroke model the source uses so `color` inheritance still tints them.
- `aria-hidden="true"` because every icon here is decorative or paired with
  visible text. (If the accessibility pass, PR #17, prefers labeled icons,
  coordinate — do not double-label.)

**1c. Theme button — explicit replacement contract (the behavior-critical part).**

The theme button (`index.html:206–208`) currently holds one `<ion-icon>` whose
`name` is swapped by JS between `sunny-outline` (dark mode active) and
`moon-outline` (light mode active). Replace this mutate-an-attribute mechanism
with a **CSS-driven dual-SVG swap** keyed off the existing
`document.documentElement.dataset.theme`, which the inline `<head>` script
(`index.html:27–32`) already sets to `"light"` before first paint and the toggle
maintains. This removes the JS→DOM-icon coupling entirely (no `querySelector`
that can return `null`), so it is behavior-safe.

1. **Markup** — replace lines 206–208 with both glyphs inlined:
   ```html
   <button class="theme-btn" data-theme-btn aria-label="Toggle light/dark theme">
     <svg class="icon theme-icon theme-icon--sun"  viewBox="0 0 512 512" aria-hidden="true" focusable="false"><!-- sunny-outline paths --></svg>
     <svg class="icon theme-icon theme-icon--moon" viewBox="0 0 512 512" aria-hidden="true" focusable="false"><!-- moon-outline paths --></svg>
   </button>
   ```
2. **CSS** — add visibility rules so the displayed glyph matches the current theme
   (default/dark shows the sun = "switch to light"; `data-theme="light"` shows the
   moon), mirroring the original behavior exactly:
   ```css
   .theme-icon--moon { display: none; }                      /* default = dark → show sun */
   :root[data-theme="light"] .theme-icon--sun  { display: none; }
   :root[data-theme="light"] .theme-icon--moon { display: block; }
   ```
3. **JavaScript** (`assets/js/script.js`) — edit `applyTheme` and delete the IIFE:
   - **Remove** line 145 (`themeBtn.querySelector('ion-icon').setAttribute('name', 'moon-outline');`).
   - **Remove** line 148 (`themeBtn.querySelector('ion-icon').setAttribute('name', 'sunny-outline');`).
   - **Remove** the entire initial-icon IIFE at lines 153–157 (its sole job was to
     sync the Ionicons `name`; CSS now derives the icon from `dataset.theme`, so it
     is dead code and contains the same `null`-deref hazard).
   - **Keep** the rest of `applyTheme` (set/delete `dataset.theme`, write
     `localStorage`) and the click listener at lines 159–162 unchanged.

   After the edit, `applyTheme` reads:
   ```js
   const applyTheme = function (theme) {
     if (theme === 'light') {
       document.documentElement.dataset.theme = 'light';
     } else {
       delete document.documentElement.dataset.theme;
     }
     localStorage.setItem('theme', theme);
   };
   ```
   `script.js` no longer contains the string `ion-icon` anywhere.

**1d. Migrate the 8 `ion-icon` CSS rules** in `assets/css/style.css`:
- `L195` `img, ion-icon, a, button, time, span { display: block; }` → add
  `svg.icon` to the selector list (or change `ion-icon` → `svg.icon`).
- **Stroke-width — the single, coherent strategy (replaces the three
  `--ionicon-stroke-width` rules).** Because the hardcoded child `stroke-width="32"`
  attributes were stripped in 1a, drive the weight from CSS by targeting the
  *stroked child elements* (not the parent `<svg>`) via a custom property, and set
  that property in the existing context selectors:
  ```css
  /* Base rule — applies the default Ionicons weight (32) to every stroked child. */
  svg.icon [stroke] { stroke-width: var(--icon-stroke-width, 32); }

  /* Context overrides — formerly the three --ionicon-stroke-width rules.
     Values are in the 0 0 512 512 viewBox user units, matching the original
     numeric weights (35 and 50). Custom properties inherit, so setting the var
     on svg.icon flows down to the [stroke] children matched by the base rule. */
  .icon-box svg.icon              { --icon-stroke-width: 35; }  /* was L272: 35px, sidebar contact icons */
  .modal-close-btn svg.icon       { --icon-stroke-width: 50; }  /* was L773: 50px, modal-close × icon   */
  .project-item-icon-box svg.icon { --icon-stroke-width: 50; }  /* was L1078: 50px, project-overlay eye */
  ```
  Do **not** put `stroke-width` on the parent `svg.icon` itself and do **not**
  re-add a child `stroke-width` attribute — the `svg.icon [stroke]` rule plus the
  inherited `--icon-stroke-width` var is the one mechanism that actually overrides
  the (now-removed) default. Use unitless values (`32`/`35`/`50`), matching the
  original Ionicons weights, since SVG stroke widths are in viewBox user units.
- `L1286` `.form-btn ion-icon { font-size: 16px; }` and `L1331`
  `.cv-btn ion-icon { font-size: 16px; }` and `L1653` `.form-btn ion-icon
  { font-size: 18px; }` — `font-size` sized the Ionicons glyph; for SVG set
  explicit `width`/`height` (e.g. `width: 16px; height: 16px;`) on `svg.icon`
  within those selectors.
- `L1472` `.info_more-btn ion-icon { display: none; }` → `svg.icon`.
- Add a base sizing rule: `svg.icon { width: 1em; height: 1em; }` so icons inherit
  text size where no explicit size is set (Ionicons defaults to `1em`).

**1e. Delete** both Ionicons `<script>` tags (`index.html:1215–1216`).

**Verification for Step 1:**
- **Grep gate:** `grep -rn 'ion-icon' index.html assets/` returns **zero** hits
  (markup, CSS, *and* JS).
- **Offline render:** load `index.html` with the network disabled (DevTools
  "Offline"). Every glyph renders (it was invisible offline before — the point of
  the change). Diff against a CDN-loaded screenshot per section.
- **No console errors:** open DevTools Console on load — there must be **no
  `TypeError` / "Cannot read properties of null"**. (This is the regression the
  prior plan would have introduced.)
- **Theme toggle both directions:** click the theme button → page switches
  dark→light, the sun SVG hides and the moon SVG shows; click again → light→dark,
  the moon hides and the sun shows. Reload in each state and confirm the correct
  icon persists (driven by `localStorage` + the inline `<head>` script).
- **Navigation still works:** click each navbar tab (About/Resume/Portfolio/Blog/
  Contact) and confirm the section switches — this proves the listeners at
  `script.js:171–185` registered, i.e. nothing earlier in the file threw.
- **Stroke-weight check (proves the 1d strategy preserved the customized weights —
  not just that icons appear):** confirm the three weight-customized icon groups
  render at their intended weight, not the default 32:
  - **Sidebar** `.icon-box` contact icons (mail / phone / location / calendar) →
    weight **35**.
  - **Modal-close ×** icon (`.modal-close-btn`; open a testimonial card) → weight **50**.
  - **Project-overlay eye** icon (`.project-item-icon-box`; hover a portfolio card) →
    weight **50**.
  For each, inspect a stroked child element in DevTools and confirm its *computed*
  `stroke-width` is `35`/`50` (i.e. the `svg.icon [stroke]` rule plus the inherited
  `--icon-stroke-width` resolved), and that these groups read visibly bolder than
  the default-weight outline glyphs elsewhere. If any reverts to 32, a child
  `stroke-width="32"` attribute was left in (re-do 1a) or the var was set on the
  wrong selector.

**Lower-effort alternative (self-host, if inline SVG is rejected):** Vendor the
Ionicons dist into `assets/vendor/ionicons/` and repoint the two `<script>` `src`
to local paths. This keeps all `<ion-icon>` markup, the CSS rules, **and the
existing `script.js` `querySelector('ion-icon')` calls** untouched (no JS edit
needed because the `<ion-icon>` nodes still exist), removes the CDN dependency,
but **retains the web-component runtime** and per-icon fetch overhead — a smaller
perf win. Choose this only if the inline-SVG diff is deemed too large; if chosen,
the theme-button contract in 1c does **not** apply.

### Step 2 — Convert raster images to WebP and pin dimensions

Target the heavy rasters. SVG icon files and `logo.ico` are **not** converted.

| Group | Files | Action |
| --- | --- | --- |
| Projects | `project-1.jpg`, `project-2.png`, `project-3.jpg`, `project-4.png`, `project-5.png`, `project-6.png`, `project-7.png`, `project-8.jpg`, `project-9.png` | → `.webp` (highest payload) |
| Blog | `blog-1.jpg`…`blog-6.jpg` | → `.webp` |
| Avatars | `avatar-1..4.png`, `my-avatar.png` | optional → `.webp` (tiny — low value) |
| Logos | `logo-1..6-color.png` | optional → `.webp` (tiny) |

1. Convert with libwebp (quality ~80, good for photos):
   ```bash
   for f in assets/images/{project-,blog-}*.{jpg,png}; do
     cwebp -q 80 "$f" -o "${f%.*}.webp"
   done
   ```
   (Squoosh CLI/web is an acceptable substitute. Commit the `.webp` files. Some
   globs may not match every extension — convert the explicit file list above.)
2. **Record each image's intrinsic pixel dimensions** (`identify file.png`, or the
   converter's output). These are needed for `width`/`height` — the planning
   environment lacks `identify`/`file`, so capture them during conversion. Do not
   reuse rendered/CSS sizes.
3. For each raster `<img>`, wrap in `<picture>` and add dimensions. Example
   (project card, ~`index.html:796` region):
   ```html
   <picture>
     <source srcset="./assets/images/project-1.webp" type="image/webp">
     <img src="./assets/images/project-1.jpg" alt="finance"
          width="1080" height="720" loading="lazy">
   </picture>
   ```
   Replace `1080`/`720` with the real intrinsic size. The `width`/`height` reserve
   aspect-ratio space and kill CLS; CSS continues to control rendered size (the
   existing `.project-img img { … }` rules still apply for layout while the
   attributes seed the aspect ratio).
   - **Hard-cutover variant** (if `<picture>` fallback is unwanted): just
     `<img src="…project-1.webp" width=… height=… loading="lazy">`.
4. Add `width`/`height` to the **non-raster** `<img>` too (avatars, logos, the
   `icon-*.svg` service icons, `icon-quote.svg`) so every one of the 32 images has
   a reserved box. SVGs keep their `.svg` `src`.
5. **Optional LCP hint:** add `<link rel="preload" as="image"
   href="./assets/images/my-avatar.png">` (or its WebP) in `<head>` if the avatar
   is the LCP element. Keep it minimal.

**Verification for Step 2:** Confirm WebP loads in DevTools Network (Type = webp),
the JPEG/PNG only loads in browsers without WebP, total transfer drops, and
Lighthouse "Cumulative Layout Shift" ≈ 0 with no "image elements do not have
explicit width and height" warning.

### Step 3 — Remove cruft

1. `git rm website-demo-image/Thumbs.db` (tracked Windows thumbnail cache).
2. `git rm index.txt` (manually-maintained content dump; nothing loads it).
3. Add `.gitignore`:
   ```gitignore
   # OS / editor junk
   Thumbs.db
   ehthumbs.db
   desktop.ini
   .DS_Store
   ```

**Verification for Step 3:** `git status` clean; `index.html` still opens (it never
referenced `index.txt` or `Thumbs.db`); `README.md`'s demo images
(`website-demo-image/desktop.png`, `mobile.png`) still resolve.

### Step 4 — GitHub Pages: add 404.html + .nojekyll (required; NO Actions workflow)

**Scope decision (evidence-backed): GitHub Pages IS the deploy target — this work
is required, not optional.** Evidence collected from the live repo:

| Signal | Value | Source |
| --- | --- | --- |
| Pages enabled | `has_pages: true` | `gh api repos/SpecstraAI/vcard-portfolio` |
| Pages status | `status: "built"`, live at `https://specstraai.github.io/vcard-portfolio/` | `gh api repos/SpecstraAI/vcard-portfolio/pages` |
| Deploy source | `source: { branch: "main", path: "/" }`, `build_type: "legacy"` | `gh api …/pages` |
| Custom 404 | `custom_404: false` (none configured yet) | `gh api …/pages` |
| Deploy history | 4 successful `github-pages` deployments (latest sha `4fb8037`, 2026-06-10) | `gh api …/deployments` |

This **resolves the issue's "if targeting GitHub Pages" conditional**: the repo is
demonstrably targeting Pages, so:

1. **Add `404.html` at repo root (required).** Pages reports `custom_404: false`,
   so an unknown path currently shows GitHub's generic 404. Add a minimal branded
   page that reuses the existing CSS color variables for a consistent look.

   **Path contract — use project-absolute paths, NOT relative ones (single chosen
   strategy; do not also add a `<base href>`).** This is a *project* Pages site
   served from `https://specstraai.github.io/vcard-portfolio/`, so the site root is
   **`/vcard-portfolio/`**, not `/`. GitHub serves this same `404.html` for a
   missing URL at *any* depth, and the browser resolves relative hrefs against the
   **requested (missing)** URL — so on a nested miss like
   `/vcard-portfolio/projects/does-not-exist`, a relative `./assets/css/style.css`
   would resolve to `/vcard-portfolio/projects/assets/css/style.css` (404 → the page
   renders **unstyled**), and a home link to `/` would leave the project entirely
   for the org root `https://specstraai.github.io/`. Therefore use absolute paths
   rooted at the project base:
   - **Stylesheet** (and every other asset the page references): set
     `href="/vcard-portfolio/assets/css/style.css"` — leading-slash, project-rooted,
     so it resolves identically regardless of the missing URL's depth.
   - **Home link:** `href="/vcard-portfolio/"` (the portfolio root) — **never** `/`,
     which is the org root.

   Because the site is a single-page app, the 404 only fires for genuinely missing
   paths.
2. **Add `.nojekyll` (empty file, recommended).** The repo deploys via the legacy
   branch source, which runs the files through Jekyll by default. The repo has no
   `_`-prefixed files today so nothing is currently stripped, but `.nojekyll` is
   zero-cost insurance against a future `_`-prefixed asset silently disappearing
   and slightly speeds the build.
3. **Do NOT add `.github/workflows/pages.yml` (explicitly out of scope).** The live
   `build_type` is `"legacy"` — Pages deploys directly from the `main` branch root,
   not from a GitHub Actions artifact. Adding an `actions/deploy-pages` workflow
   would require a maintainer to flip **Settings → Pages → Source** from "Deploy
   from a branch" to "GitHub Actions"; until that toggle is flipped the workflow
   would either no-op or conflict with the working legacy deploy, and flipping it
   risks breaking a deploy that already works. The branch-deploy model needs no
   workflow file — committing `404.html` and `.nojekyll` to `main` is sufficient
   for them to take effect on the next push.

**Verification for Step 4:** After merge to `main`:
1. Confirm the next Pages build succeeds
   (`gh api repos/SpecstraAI/vcard-portfolio/pages` → `status: "built"`) and that
   `gh api …/pages --jq .custom_404` flips to `true`.
2. **Single-segment missing URL:** request
   `https://specstraai.github.io/vcard-portfolio/no-such-page` and confirm the
   branded `404.html` renders (the custom page body, not GitHub's generic 404).
3. **Nested missing URL — the path-bug catch (mandatory):** request a *deeper*
   missing URL, `https://specstraai.github.io/vcard-portfolio/projects/does-not-exist`,
   and confirm **both**:
   - **CSS still loads:** DevTools Network shows
     `/vcard-portfolio/assets/css/style.css` returning **200** and the page is
     **styled** (not bare HTML). A relative `./assets/css/style.css` would instead
     request `/vcard-portfolio/projects/assets/css/style.css` and 404 here.
   - **Home link returns to the portfolio root:** the home link's resolved `href` is
     `https://specstraai.github.io/vcard-portfolio/`, and clicking it lands on the
     portfolio — **not** the org root `https://specstraai.github.io/`.
   This nested case is the one that fails if relative paths slipped in; a
   single-segment check (step 2) alone would pass even with the broken paths.

No repo Settings change is needed because the Source remains "Deploy from a branch".

## Validation Strategy

No automated test suite exists. Validate manually, per the project's documented
checklist plus performance-specific checks:

1. **Functional smoke test:** click each navbar tab (About/Resume/Portfolio/Blog/
   Contact); mobile sidebar toggle; portfolio filter (desktop buttons + mobile
   dropdown); testimonial modal open/close; contact form button enable-on-valid;
   **theme toggle both directions**.
2. **No console errors** on load (specifically guards the icons/theme-toggle
   regression — see Step 1 verification).
3. **Offline icon test:** load with network disabled — all 15 glyphs visible,
   including the theme-button sun/moon.
4. **Visual diff:** compare each section against `main` (CDN icons + original
   images) at desktop and mobile widths; glyphs and images must look identical.
5. **Lighthouse (Performance + Best Practices):** improved LCP, CLS ≈ 0, no
   "explicit width/height" or "serve images in next-gen formats" warnings, fewer
   network requests (two `<script>` + N icon fetches gone).
6. **Transfer-size check:** DevTools Network total bytes for a cold load drops
   versus `main`.
7. `playwright` (available in this environment) can script the smoke test +
   screenshots across the two breakpoints if a reproducible artifact is wanted.

## Risks and Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| **Removing `<ion-icon>` breaks the theme toggle and silently kills navigation** because `script.js:145/148/156` query the (now-absent) node and throw | **High if Step 1c is skipped** | Follow the Step 1c contract: inline both sun/moon SVGs, drive visibility from CSS, and delete the three `setAttribute` calls + the IIFE so `script.js` no longer references `ion-icon`. Verify via the "no console errors" + "navigation still works" checks. |
| Inline-SVG glyphs render subtly differently (stroke width, sizing) than Ionicons | Medium | Copy SVG source verbatim from the pinned 5.5.2 package (stripping only the child `stroke-width="32"`); migrate the 3 `--ionicon-stroke-width` rules to the `--icon-stroke-width` strategy in 1d (`svg.icon [stroke] { stroke-width: var(--icon-stroke-width, 32); }`); run the Step 1 stroke-weight check + visual-diff every section. Fall back to the self-host alternative if fidelity is hard to match. |
| Missed an `<ion-icon>` or a CSS/JS `ion-icon` reference | Medium | Grep gate before commit: `grep -rn 'ion-icon' index.html assets/` must return zero hits. |
| Wrong/omitted `width`/`height` → distorted images or residual CLS | Medium | Use **intrinsic** pixel dimensions (from the converter), not rendered size; CSS keeps controlling display size. Verify CLS in Lighthouse. |
| WebP conversion tooling unavailable to implementer | Low | Documented: install libwebp/`cwebp` or use Squoosh; conversion is a one-time local step, output committed. |
| Merge conflicts with open PRs #16 (`<head>`/favicon) and #17 (accessibility/icons) | Medium | Land after they merge, or rebase; both touch `<head>`/navbar/icons. Coordinate icon `aria` handling with #17 to avoid double-labeling. |
| Adding an Actions Pages workflow would break the working legacy branch deploy | N/A (out of scope) | Workflow explicitly excluded in Step 4; only `404.html` + `.nojekyll` are committed, which the legacy branch deploy picks up with no Settings change. |
| Deleting `index.txt` loses a content reference someone relies on | Low | Nothing loads it; reconstructable from `index.html`; reversible via git history. |

## Success Criteria

- [ ] Zero `ion-icon` references remain anywhere (`grep -rn 'ion-icon' index.html
      assets/` is empty, covering `index.html`, `style.css`, **and `script.js`**);
      both Ionicons `<script>` tags removed; all 15 glyphs render **offline**,
      pixel-matching the `main` baseline.
- [ ] **No console errors on load**; the theme toggle switches both directions with
      the correct sun/moon SVG shown and persists across reloads; **all five navbar
      tabs still switch sections** (proving `script.js` listeners registered).
- [ ] The 3 `--ionicon-stroke-width` customizations are preserved via the single
      `--icon-stroke-width` strategy (Step 1d): child `stroke-width="32"` stripped,
      `svg.icon [stroke] { stroke-width: var(--icon-stroke-width, 32); }` plus
      `--icon-stroke-width: 35/50` on the context selectors — verified by the
      named-icon check: **sidebar `.icon-box` icons compute `stroke-width: 35`**, and
      the **modal-close ×** and **project-overlay eye** icons compute
      `stroke-width: 50`. The 3 `font-size`-based icon sizings are preserved via
      explicit SVG `width`/`height`.
- [ ] All project/blog raster images are served as WebP (with original-format
      `<picture>` fallback, unless a hard cutover was chosen); committed `.webp`
      files exist.
- [ ] **Every** `<img>` (all 32) has `width` and `height`; Lighthouse reports CLS ≈
      0 and no missing-dimensions or next-gen-format warnings.
- [ ] Cold-load transfer size and request count are measurably lower than `main`.
- [ ] `website-demo-image/Thumbs.db` and `index.txt` are deleted; `.gitignore`
      prevents OS-junk regression; `README.md` demo images still resolve.
- [ ] `404.html` and `.nojekyll` exist at repo root; `404.html` references its CSS
      and home link via **project-absolute** `/vcard-portfolio/…` paths (no relative
      `./…` asset hrefs, no `<base href>`); after merge the Pages build stays `built`,
      `gh api …/pages --jq .custom_404` returns `true`, and a **nested** missing URL
      (`/vcard-portfolio/projects/does-not-exist`) renders the **styled** branded
      page (CSS 200) with a home link that returns to `/vcard-portfolio/`, not the
      org root; **no** `.github/workflows/*.yml` Pages workflow was added.
- [ ] Full manual smoke test (all nav tabs, filters, modal, form, theme toggle)
      passes with no regressions.
