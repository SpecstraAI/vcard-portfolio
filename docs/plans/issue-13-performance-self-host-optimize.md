# Implementation Plan — Performance: Self-Host Icons, Optimize Images, Remove Cruft (Issue #13)

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

> **Note on overlap:** The Ionicons CDN tags are at `index.html:1215–1216` (not
> `1196–1197` as the issue states — line numbers shifted after the theme-toggle
> merge, PR #5). PRs #16 (`feat/15…`, SVG favicon + hash routing) and #17
> (`plan/14…`, accessibility) are open and also touch `<head>`/the navbar/icons.
> Sequence this work to land after them, or expect minor merge conflicts in
> `<head>` and the navbar region — see [Risks](#risks-and-mitigations).

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
| `assets/css/style.css` (L195, 272, 773, 1078, 1286, 1331, 1472, 1653) | Re-target the 8 `ion-icon` CSS rules to the new `svg.icon`; add the 3 theme-icon visibility rules. |
| `assets/images/*.webp` (new) | Committed WebP variants of project/blog rasters. |
| `website-demo-image/Thumbs.db` | **Delete** (tracked). |
| `index.txt` | **Delete** (tracked). |
| `.gitignore` (new) | Ignore `Thumbs.db`, `.DS_Store`, `desktop.ini`. |
| `404.html` (new, **required**) | Branded not-found page reusing `style.css`. |
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
(`style.css:272`), 50px for `.modal-close-btn` (`style.css:773`) and
`.project-item-icon-box` (`style.css:1078`). This only affects the *outline*
glyphs and **must** be preserved during inline-SVG migration (translated to
`stroke-width` on the paths).

## Implementation Steps

> Order the four workstreams so each commit is independently reviewable. Steps 1–2
> are the substance; 3–4 are quick and low-risk.

### Step 1 — Replace Ionicons with inline SVG (touches index.html, style.css, **script.js**)

**1a. Obtain the 15 glyph SVGs.** For each unique glyph in the inventory (including
`moon-outline`), copy the exact SVG source from the pinned Ionicons 5.5.2 package
(`https://unpkg.com/ionicons@5.5.2/dist/svg/<name>.svg`). Copy the inner
`<path>`/`<rect>` markup verbatim so glyphs render pixel-identically.

**1b. Replace the 23 non-theme `<ion-icon>` tags** with:
```html
<svg class="icon" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
  <!-- path(s) from <name>.svg -->
</svg>
```
- Outline glyphs use `fill="none" stroke="currentColor"` with `stroke-width` on
  the paths; filled/brand glyphs use `fill="currentColor"`. Keep the fill/stroke
  model the source uses so `color` inheritance still tints them.
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
- `L272` `.icon-box ion-icon { --ionicon-stroke-width: 35px; }` →
  `.icon-box svg.icon { stroke-width: 35px; }` (Ionicons strokes use the 512
  viewBox; verify the value visually and adjust to match).
- `L773` `.modal-close-btn ion-icon { --ionicon-stroke-width: 50px; }` →
  `.modal-close-btn svg.icon { stroke-width: 50px; }`.
- `L1078` `.project-item-icon-box ion-icon { … 50px; }` → likewise.
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
   page that links `./assets/css/style.css` and offers a link back to `/`. Reuse
   the existing CSS color variables for a consistent look. Because the site is a
   single-page app, the 404 only fires for genuinely missing paths.
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

**Verification for Step 4:** After merge to `main`, confirm the next Pages build
succeeds (`gh api repos/SpecstraAI/vcard-portfolio/pages` → `status: "built"`),
that `https://specstraai.github.io/vcard-portfolio/<nonexistent-path>` serves the
new `404.html`, and that `gh api …/pages --jq .custom_404` flips to `true`. No
repo Settings change is needed because the Source remains "Deploy from a branch".

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
| Inline-SVG glyphs render subtly differently (stroke width, sizing) than Ionicons | Medium | Copy SVG source verbatim from the pinned 5.5.2 package; migrate the 3 `--ionicon-stroke-width` rules to `stroke-width`; visual-diff every section. Fall back to the self-host alternative if fidelity is hard to match. |
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
- [ ] The 3 `--ionicon-stroke-width` customizations are preserved via `stroke-width`
      on the new `svg.icon` rules; the 3 `font-size`-based icon sizings are
      preserved via explicit SVG `width`/`height`.
- [ ] All project/blog raster images are served as WebP (with original-format
      `<picture>` fallback, unless a hard cutover was chosen); committed `.webp`
      files exist.
- [ ] **Every** `<img>` (all 32) has `width` and `height`; Lighthouse reports CLS ≈
      0 and no missing-dimensions or next-gen-format warnings.
- [ ] Cold-load transfer size and request count are measurably lower than `main`.
- [ ] `website-demo-image/Thumbs.db` and `index.txt` are deleted; `.gitignore`
      prevents OS-junk regression; `README.md` demo images still resolve.
- [ ] `404.html` and `.nojekyll` exist at repo root; after merge the Pages build
      stays `built` and `gh api …/pages --jq .custom_404` returns `true`; **no**
      `.github/workflows/*.yml` Pages workflow was added.
- [ ] Full manual smoke test (all nav tabs, filters, modal, form, theme toggle)
      passes with no regressions.
