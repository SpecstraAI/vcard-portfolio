# Implementation Plan — Performance: Self-Host Icons, Optimize Images, Remove Cruft (Issue #13)

## Summary

This is a performance-and-hygiene pass on the static vCard portfolio. It has four
independent workstreams, each shippable on its own:

1. **Icons** — Remove the runtime dependency on the unpkg Ionicons CDN
   (`index.html:1215–1216`, two `<script>` tags + per-icon network fetches).
   Replace the 24 `<ion-icon>` usages (14 unique glyphs) with **inline `<svg>`**,
   eliminating the web-component runtime, the offline-blindness landmine
   (CLAUDE.md Gotcha #4), and ~all icon network traffic. A lower-effort
   *self-host* fallback is documented as an alternative.
2. **Images** — Convert the heavy raster images (project/blog `.jpg`/`.png`,
   ~700 KB of the 823 KB total) to **WebP** behind a `<picture>` fallback, and
   add explicit `width`/`height` to **every** `<img>` to eliminate layout shift
   (CLS).
3. **Cruft** — Delete tracked stray files `website-demo-image/Thumbs.db` and
   `index.txt`; add a `.gitignore` so OS junk does not return.
4. **Deploy (optional)** — Add `404.html`, `.nojekyll`, and a GitHub Pages
   deploy workflow so the repo is publishable with zero build step.

There is **no build step** in this project (CLAUDE.md: "The repository files are
the deployable artefacts"). Every artifact below is committed as a static file;
nothing is generated at deploy time.

> **Note on overlap:** The Ionicons CDN tags are currently at `index.html:1215–1216`
> (not `1196–1197` as the issue states — line numbers shifted after the theme-toggle
> merge, PR #5). PRs #16 (`feat/15…`, SVG favicon + hash routing) and #17
> (`plan/14…`, accessibility) are open and also touch `<head>`/`index.html`. Sequence
> this work to land after them, or expect minor merge conflicts in `<head>` and the
> navbar region — see [Risks](#risks-and-mitigations).

## Scope and Assumptions

**In scope**
- Inline-SVG replacement of all `<ion-icon>` glyphs; removal of both Ionicons
  `<script>` tags; migration of the `--ionicon-stroke-width` CSS rules.
- WebP conversion of raster project/blog images with `<picture>` fallback.
- `width`/`height` on all `<img>` elements.
- Deleting `website-demo-image/Thumbs.db` and `index.txt`; adding `.gitignore`.
- `404.html`, `.nojekyll`, and a Pages deploy workflow.
- Updating CLAUDE.md to retire Gotchas #4 (CDN icons) and #5 (`index.txt`).

**Out of scope**
- Changing the page-navigation text-matching logic (`script.js:148`) or the
  `data-selecct-value` typo (CLAUDE.md Gotchas #1, #2).
- Re-architecting CSS, adding a bundler/preprocessor, or introducing npm.
- Touching `assets/images/*.svg` source icons (they are already vector and small;
  `icon-design.svg`, `icon-dev.svg`, etc. are `<img src>`, not `<ion-icon>`).
- Replacing the favicon `logo.ico` (left as-is; PR #16 separately adds an SVG favicon).

**Assumptions**
- Modern browsers are the target. WebP is universally supported in 2026, but a
  `<picture>` + original-format fallback is included for robustness and because it
  is zero-risk. (If the team prefers a hard cutover, drop the `<source>` and swap
  `src` directly — noted inline.)
- Image conversion is performed at implementation time with `cwebp` (libwebp) or
  Squoosh. **These tools are not present in the planning environment** (`which
  cwebp` → not found), so the implementer must install/run them locally; see
  [Step 2](#step-2--convert-raster-images-to-webp-and-pin-dimensions).
- GitHub Pages serves from the repo root of the default branch (no `/docs` move).
  The deploy workflow is **optional** — gate it on whether the team actually wants
  Pages; the issue says "*if* targeting GitHub Pages."
- `index.txt` is safe to delete: CLAUDE.md Gotcha #5 confirms "nothing in the
  project depends on it being current." `website-demo-image/desktop.png` and
  `mobile.png` are **kept** — `README.md:13–14` references them.

## Affected Areas

| File | Change |
| --- | --- |
| `index.html` (`<head>`, ~L1–26) | Remove no head icon tags (Ionicons scripts are at the bottom). Optionally add `<link rel="preload">` for the LCP image. |
| `index.html` (body, 24 `<ion-icon>` sites) | Replace each with an inline `<svg class="icon">…</svg>`. |
| `index.html` (`index.html:1215–1216`) | Delete both Ionicons `<script>` tags. |
| `index.html` (all 33 `<img>` sites) | Add `width`/`height`; wrap raster project/blog images in `<picture>` with a WebP `<source>`. |
| `index.html` (`index.html:259–260`) | Fix the stray newline inside `icon-design.svg`'s `src` while in the file (pre-existing typo, low-cost). |
| `assets/css/style.css` (L195, 272, 773, 1078, 1286, 1331, 1472, 1653) | Re-target the 8 `ion-icon` CSS rules to the new `svg.icon` element, translating `--ionicon-stroke-width` to `stroke-width`. |
| `assets/images/*.webp` (new) | Committed WebP variants of project/blog (and optionally avatar/logo) rasters. |
| `website-demo-image/Thumbs.db` | **Delete** (tracked). |
| `index.txt` | **Delete** (tracked). |
| `.gitignore` (new) | Ignore `Thumbs.db`, `.DS_Store`, `desktop.ini`. |
| `404.html` (new, optional) | Branded not-found page reusing `style.css`. |
| `.nojekyll` (new, optional) | Disable Jekyll processing on Pages. |
| `.github/workflows/pages.yml` (new, optional) | Deploy root to GitHub Pages. |
| `.claude/CLAUDE.md` | Retire Gotchas #4 and #5; update Tech Stack icon row. |

## Icon Inventory (for Step 1)

24 `<ion-icon>` instances across 14 unique glyphs:

| Glyph (`name=`) | Count | Style |
| --- | --- | --- |
| `eye-outline` | 9 | outline (stroke) |
| `book-outline` | 2 | outline |
| `chevron-down` | 2 | filled |
| `calendar-outline` | 1 | outline |
| `close-outline` | 1 | outline |
| `download-outline` | 1 | outline |
| `location-outline` | 1 | outline |
| `mail-outline` | 1 | outline |
| `phone-portrait-outline` | 1 | outline |
| `sunny-outline` | 1 | outline (theme toggle, `index.html:207`) |
| `paper-plane` | 1 | filled |
| `logo-facebook` | 1 | brand (filled) |
| `logo-instagram` | 1 | brand |
| `logo-twitter` | 1 | brand |

`--ionicon-stroke-width` is customized in **6** CSS rules (35px for `.icon-box`,
50px for `.modal-close-btn` and `.project-item-icon-box`); this only affects the
*outline* glyphs and **must** be preserved during inline-SVG migration.

## Implementation Steps

> Order the four workstreams so each commit is independently reviewable. Steps 1–2
> are the substance; 3–4 are quick and low-risk.

### Step 1 — Replace Ionicons with inline SVG

**Recommended approach (best performance):**

1. For each of the 14 unique glyphs, obtain the exact SVG source from the pinned
   Ionicons 5.5.2 package (`node_modules/ionicons/dist/svg/<name>.svg`, or
   `https://unpkg.com/ionicons@5.5.2/dist/svg/<name>.svg`). Copy the inner
   `<path>`/`<rect>` markup verbatim so glyphs render pixel-identically.
2. Define a reusable element shape. Replace
   `<ion-icon name="eye-outline"></ion-icon>` with:
   ```html
   <svg class="icon" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
     <!-- path(s) from eye-outline.svg -->
   </svg>
   ```
   - Outline glyphs use `fill="none" stroke="currentColor"` with `stroke-width`
     on the paths; filled/brand glyphs use `fill="currentColor"`. Keep the
     fill/stroke model the source uses so `color` inheritance still tints them.
   - `aria-hidden="true"` because every icon here is decorative or paired with
     visible text. (If the accessibility pass, PR #17, prefers labeled icons,
     coordinate — do not double-label.)
3. **Migrate the CSS** in `assets/css/style.css`:
   - `L195` `img, ion-icon, a, button, time, span { display: block; }` →
     add `svg.icon` (or change `ion-icon` to `svg.icon`).
   - `L272` `.icon-box ion-icon { --ionicon-stroke-width: 35px; }` →
     `.icon-box svg.icon { stroke-width: 35px; }` (units: Ionicons strokes are in
     a 512 viewBox; `35px` maps to the SVG's own `stroke-width` scale — verify
     visually, adjust to match).
   - `L773` `.modal-close-btn ion-icon { --ionicon-stroke-width: 50px; }` →
     `.modal-close-btn svg.icon { stroke-width: 50px; }`.
   - `L1078` `.project-item-icon-box ion-icon { … 50px; }` → likewise.
   - `L1286`, `L1331`, `L1653` set `ion-icon { font-size: … }` for `.form-btn` /
     `.cv-btn` — `font-size` controls Ionicons glyph size. For SVG, set explicit
     `width`/`height` (e.g. `width: 16px; height: 16px;`) on `svg.icon` instead.
   - `L1472` `.info_more-btn ion-icon { display: none; }` → `svg.icon`.
   - Add a base sizing rule: `svg.icon { width: 1em; height: 1em; }` so icons
     inherit text size where no explicit size is set (Ionicons defaults to `1em`).
4. **Delete** both Ionicons `<script>` tags (`index.html:1215–1216`).
5. Verify no JS references icons by tag/name — confirmed: `script.js` never
   queries `ion-icon`, so removal is behavior-safe.

**Verification for Step 1:** Open `index.html` offline (disconnect network or
DevTools "Offline"). Every glyph must render (this is the whole point — it was
invisible offline before). Diff against a CDN-loaded screenshot per section.

**Lower-effort alternative (self-host, if inline SVG is rejected):** Vendor the
Ionicons dist into `assets/vendor/ionicons/` (the `ionicons.esm.js`,
`ionicons.js`, and `dist/ionicons/svg/` glyph folder), and repoint the two
`<script>` `src` to the local paths. This keeps all `<ion-icon>` markup and the
`--ionicon-stroke-width` rules untouched (no CSS migration), removes the CDN
dependency, but **retains the web-component runtime** and per-icon fetch overhead
— a smaller perf win. Choose this only if the inline-SVG diff is deemed too large.

### Step 2 — Convert raster images to WebP and pin dimensions

Target the heavy rasters (the bulk of the 823 KB). SVG icon files and `logo.ico`
are **not** converted.

| Group | Files | Action |
| --- | --- | --- |
| Projects | `project-1.jpg`…`project-9.png` | → `.webp` (highest payload, ~360 KB) |
| Blog | `blog-1.jpg`…`blog-6.jpg` | → `.webp` (~315 KB) |
| Avatars | `avatar-1..4.png`, `my-avatar.png` | optional → `.webp` (tiny, ~3 KB each — low value) |
| Logos | `logo-1..6-color.png` | optional → `.webp` (tiny) |

1. Convert with libwebp (quality ~80, good for photos):
   ```bash
   for f in assets/images/{project-,blog-}*.{jpg,png}; do
     cwebp -q 80 "$f" -o "${f%.*}.webp"
   done
   ```
   (Squoosh CLI/web is an acceptable substitute. Commit the `.webp` files.)
2. **Record each image's intrinsic pixel dimensions** (`identify file.png`, or
   the converter's output). These are needed for `width`/`height` — the planning
   environment lacks `identify`/`file`, so capture them during conversion.
3. For each raster `<img>`, wrap in `<picture>` and add dimensions. Example
   (`index.html:799`):
   ```html
   <picture>
     <source srcset="./assets/images/project-1.webp" type="image/webp">
     <img src="./assets/images/project-1.jpg" alt="finance"
          width="1080" height="720" loading="lazy">
   </picture>
   ```
   Replace `1080`/`720` with the real intrinsic size. The `width`/`height`
   reserve aspect-ratio space and kill CLS; CSS continues to control rendered
   size (the existing `.project-img img { ... }` rules are unaffected because they
   set `width`/`height` in CSS which overrides the attributes for layout while the
   attributes still seed the aspect ratio).
   - **Hard-cutover variant** (if `<picture>` fallback is unwanted): just
     `<img src="…project-1.webp" width=… height=… loading="lazy">`.
4. Add `width`/`height` to the **non-raster** `<img>` too (avatars, logos, the
   `icon-*.svg` service icons, `icon-quote.svg`) — they already carry some
   `width` attributes but no `height`; add the matching `height` so every image
   has a reserved box. SVGs keep their `.svg` `src`.
5. While editing `index.html:259–260`, fix the stray newline embedded in
   `icon-design.svg`'s `src` (currently `src="./assets/images/icon-design.svg\n"`).
6. **Optional LCP hint:** add `<link rel="preload" as="image"
   href="./assets/images/my-avatar.png">` (or its WebP) in `<head>` if the avatar
   is the LCP element. Keep it minimal.

**Verification for Step 2:** Confirm WebP loads in DevTools Network (Type =
webp), the JPEG/PNG only loads in browsers without WebP, total transfer drops
substantially, and Lighthouse "Cumulative Layout Shift" ≈ 0 with no "image
elements do not have explicit width and height" warning.

### Step 3 — Remove cruft

1. `git rm website-demo-image/Thumbs.db` (tracked Windows thumbnail cache).
2. `git rm index.txt` (manually-maintained content dump; CLAUDE.md Gotcha #5 —
   nothing depends on it).
3. Add `.gitignore`:
   ```gitignore
   # OS / editor junk
   Thumbs.db
   ehthumbs.db
   desktop.ini
   .DS_Store
   ```
4. Update `.claude/CLAUDE.md`: delete Gotcha #5 (about `index.txt`) and the
   `index.txt` row in the Architecture tree; the file no longer exists.

**Verification for Step 3:** `git status` clean; `index.html` still opens (it
never referenced `index.txt` or `Thumbs.db`).

### Step 4 — GitHub Pages deploy config (optional)

Only do this if the team wants Pages hosting. The site is static at repo root, so
no build is required.

1. Add `.nojekyll` (empty file) so Pages serves files/folders starting with `_`
   or `.` verbatim and skips Jekyll.
2. Add `404.html` at repo root — a minimal page that links `./assets/css/style.css`
   and offers a link back to `/`. Reuse the existing color variables for a
   consistent look.
3. Add `.github/workflows/pages.yml` using the official Pages actions:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   permissions:
     contents: read
     pages: write
     id-token: write
   concurrency:
     group: pages
     cancel-in-progress: true
   jobs:
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/configure-pages@v5
         - uses: actions/upload-pages-artifact@v3
           with:
             path: .
         - id: deployment
           uses: actions/deploy-pages@v4
   ```
4. Update CLAUDE.md Gotcha #4: after Step 1, icons no longer require a CDN; revise
   the gotcha to note icons are now inline (and fonts remain the only external
   runtime dependency).

**Verification for Step 4:** Workflow YAML lints; on push to `main`, the Pages
action succeeds; the deployed URL renders the site and a bad path shows `404.html`.
(Repo Settings → Pages → Source must be set to "GitHub Actions" — a one-time
manual toggle, note in the PR.)

## Validation Strategy

No automated test suite exists (CLAUDE.md: "There is no test suite"). Validate
manually, per the project's documented checklist plus performance-specific checks:

1. **Functional smoke test** (CLAUDE.md "Testing" section): click each navbar tab
   (About/Resume/Portfolio/Blog/Contact); mobile sidebar toggle; portfolio
   filter (desktop buttons + mobile dropdown); testimonial modal open/close;
   contact form button enable-on-valid; theme toggle.
2. **Offline icon test:** load with network disabled — all glyphs visible.
3. **Visual diff:** compare each section against `main` (CDN icons + original
   images) at desktop and mobile widths; glyphs and images must look identical.
4. **Lighthouse (Performance + Best Practices):** expect improved LCP, CLS ≈ 0,
   no "explicit width/height" or "serve images in next-gen formats" warnings,
   fewer network requests (two `<script>` + N icon fetches gone).
5. **Transfer-size check:** DevTools Network total bytes for a cold load should
   drop meaningfully versus `main`.
6. Run `playwright` (available in this environment) to script the smoke test +
   screenshots across the two breakpoints if a reproducible artifact is wanted.

## Risks and Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Inline-SVG glyphs render subtly differently (stroke width, sizing) than Ionicons | Medium | Copy SVG source verbatim from the pinned 5.5.2 package; migrate the 6 `--ionicon-stroke-width` rules to `stroke-width`; visual-diff every section. Fall back to the self-host alternative if fidelity is hard to match. |
| Missed an `<ion-icon>` or a CSS `ion-icon` selector | Medium | Grep gate before commit: `grep -rn 'ion-icon' index.html assets/` must return zero hits after migration. |
| Wrong/omitted `width`/`height` → distorted images or residual CLS | Medium | Use **intrinsic** pixel dimensions (from the converter), not rendered size; CSS keeps controlling display size. Verify CLS in Lighthouse. |
| WebP conversion tooling unavailable to implementer | Low | Documented: install libwebp/`cwebp` or use Squoosh; conversion is a one-time local step, output committed. |
| Merge conflicts with open PRs #16 (`<head>`/favicon) and #17 (accessibility/icons) | Medium | Land after they merge, or rebase; both touch `<head>`/navbar/icons. Coordinate icon `aria` handling with #17 to avoid double-labeling. |
| Deleting `index.txt` loses a content reference someone relies on | Low | CLAUDE.md Gotcha #5 confirms nothing depends on it; it is reconstructable from `index.html`. Deletion is reversible via git history. |
| GitHub Pages workflow needs a manual Settings toggle | Low | Note in PR that Source must be set to "GitHub Actions"; mark Step 4 optional. |
| Avatar/logo WebP conversion yields near-zero benefit | Low | Treat as optional; skip if the diff cost outweighs the ~few-KB saving. |

## Success Criteria

- [ ] Zero `ion-icon` references remain (`grep -rn 'ion-icon' index.html assets/`
      is empty); both Ionicons `<script>` tags removed; all 14 glyphs render
      **offline**, pixel-matching the `main` baseline.
- [ ] The 6 `--ionicon-stroke-width` customizations are preserved via `stroke-width`
      on the new `svg.icon` rules; the 3 `font-size`-based icon sizings are
      preserved via explicit SVG `width`/`height`.
- [ ] All project/blog raster images are served as WebP (with original-format
      `<picture>` fallback, unless a hard cutover was chosen); committed `.webp`
      files exist.
- [ ] **Every** `<img>` has `width` and `height`; Lighthouse reports CLS ≈ 0 and no
      missing-dimensions or next-gen-format warnings.
- [ ] Cold-load transfer size and request count are measurably lower than `main`.
- [ ] `website-demo-image/Thumbs.db` and `index.txt` are deleted; `.gitignore`
      prevents OS-junk regression; `README.md` demo images still resolve.
- [ ] (If Pages targeted) `404.html`, `.nojekyll`, and `.github/workflows/pages.yml`
      exist and a Pages deploy succeeds.
- [ ] CLAUDE.md Gotchas #4 and #5 and the Architecture tree are updated to match
      reality.
- [ ] Full manual smoke test (all nav tabs, filters, modal, form, theme toggle)
      passes with no regressions.
