# Issue #58 — Restyle Portfolio page

**Type:** implementation plan (plan stage). No CSS is changed by this stage — this
document is the contract the *implement* stage follows.
**Base branch:** `epic/53-restyle-vcard-portfolio-to-a-modern-mini` (never `main`).
**Only file the implement stage may change:** `assets/css/style.css`.
**Parent:** #53 (epic). This is child **T5**, the Portfolio section child. It depends
on **T1** (#54, merged) which already defined every token this plan consumes, and
follows **T2** (#55, chrome), **T3** (#56, About), **T4** (#57, Resume) — all merged —
which applied the same literal→token pattern to their sections.

---

## 1. Goal

Convert the `#PORTFOLIO` section — the **filter button row** (desktop), the **mobile
custom `<select>`** (filter-select box + dropdown list), and the **project card grid**
(image tile, hover scrim + accent icon overlay, title/category) — so all
color/radius/shadow/type **resolve from the tokens T1 already defined**, and so the
section reads as one cohesive modern-minimal system in both themes. Because the token
*values* themselves already changed in T1 (cool accent replacing the gold/yellow,
tighter radii, flatter shadows), every Portfolio surface that already references a
token inherits the new look for free; this stage finishes the job by replacing the
remaining **radius literals** and the **one hardcoded hover-scrim color** in
Portfolio-owned selectors with the matching tokens, then verifying the filter behavior,
hover treatment, hierarchy/legibility, and AA contrast in both themes.

**No DOM, no JS, no behavior change.** This is a CSS-only, token-only pass over the
selectors this child owns. The Portfolio tab is the most interaction-heavy of the
section children (button-row filter, mobile custom-select, hover-zoom + overlay
reveal), so the guardrail is: **the filter and select behavior must be pixel-for-pixel
identical after the restyle** — the CSS controls appearance only; the show/hide logic
lives in `assets/js/script.js` and is out of scope and untouched.

---

## 2. Ownership (per epic R2 — by selector, not line range)

T5 owns the **Portfolio** section: the `#PORTFOLIO` banner rules
(`assets/css/style.css:1006-1154`) **and**, per epic R2, the **shared
`#PORTFOLIO, BLOG` responsive rules** (they combine both selectors, so a single owner
edits them to avoid overlap — the Blog child T6/#59 must **not** touch them), plus the
Portfolio filter rules in the `≥580px` responsive block. Only T1 may add or change
token *definitions*; this child only *consumes* tokens. Concretely, the selectors this
child may edit:

- **Filter button row (desktop, shown ≥580px):** `.filter-list`,
  `.filter-item button`, `.filter-item button:hover`, `.filter-item button.active`
  (`:1798-1817`) and the shared grid rule `.project-list, .blog-posts-list`
  (`:1821`, structural).
- **Mobile custom select (shown <580px):** `.filter-select-box`, `.filter-select`,
  `.filter-select.active .select-icon`, `.select-list`,
  `.filter-select.active + .select-list`, `.select-item button`,
  `.select-item button:hover` (`:1006-1061`).
- **Project grid + card:** `.project-list`, `.project-item`, `.project-item.active`
  (+ `@keyframes scaleUp`), `.project-item > a`, `.project-img`,
  `.project-img::before` (hover scrim), `.project-item > a:hover .project-img::before`,
  `.project-item-icon-box` (+ hover reveal), `.project-img img`,
  `.project-item > a:hover img`, `.project-title`, `.project-category`
  (`:1063-1154`).
- **Shared `#PORTFOLIO, BLOG` responsive rules:** `.project-img, .blog-banner-box`
  (`:1444-1445`, `:1703`) — T5-owned per R2. The blog-only line `.blog-posts-list`
  (`:1705`) inside that block is structural (`gap`) and needs no change; leave it for
  T6 to own semantically but it requires no edit here.

> **Shared reused styles consumed by Portfolio but NOT owned here (already tokenized
> by T1 — for QA orientation only):**
> - `.article-title` / `.article-title::after` (`#REUSED STYLE`, ~`:348-368`) — the
>   "Portfolio" heading + its accent underline. Already reads
>   `--text-gradient-yellow` (=accent) and `--radius-sm`. Leave untouched.
> - `.project-item-icon-box svg.icon { --icon-stroke-width: 50; }` (`:322`) —
>   stroke width for the overlay ion-icon; structural, already in `#REUSED STYLE`.

> **Do not touch** the token blocks (`:18-216`), the `#REUSED STYLE` block, the
> `#ABOUT`/`#RESUME`/`#BLOG`/`#CONTACT` section rules, the sidebar/navbar chrome (T2),
> the scrollbar rules, or the `#REDUCED MOTION` block (T7) — its Portfolio overrides
> (`:2107-2122`: cancel image zoom, drop `scaleUp`, hold icon scale) already cover
> this section and stay complete because **no new motion is added**. Do not touch
> `index.html`, `assets/js/script.js`, or `404.html`.

---

## 3. Current state (grounded in the code)

Relevant tokens **already defined by T1** that this stage consumes:

| Token | Dark value | Light value | Source |
| --- | --- | --- | --- |
| `--radius-md` | `8px` | (theme-independent) | `:128` |
| `--radius-lg` | `12px` | (theme-independent) | `:129` |
| `--overlay-scrim` | `hsla(0,0%,0%,0.5)` | (same, theme-independent) | `:85` |
| `--jet` (borders/icon bg) | `hsl(0,0%,22%)` | `hsl(0,0%,80%)` | `:59`, `:179` |
| `--eerie-black-2` (select/menu bg) | `hsl(240,2%,12%)` | light neutral | `:57`-ish, light block |
| `--select-hover-bg` (menu item hover) | `hsl(240,2%,20%)` | `hsl(0,0%,83%)` | `:64`, `:183` |
| `--orange-yellow-crayola` → `--accent` (active filter / overlay icon) | `hsl(213,90%,64%)` | `hsl(213,85%,42%)` | alias of `--accent` (`:` legacy block) |
| `--light-gray` / `--light-gray-70` (select text, filter text, category) | `hsl(0,0%,84%)` / 70% | `hsl(0,0%,30%)` | `:70`, light block |
| `--white-2` (project title) | `hsl(0,0%,98%)` | `hsl(0,0%,20%)` | `:67`, `:186` |

**The Portfolio surfaces already read from tokens for almost everything.** After T1:

- **Active filter indicator** — `.filter-item button.active { color:
  var(--orange-yellow-crayola); }` (`:1817`) already renders the **cool accent** (the
  legacy alias now resolves to `--accent`). Base filter text is `--light-gray`
  (`:1810`), hover `--light-gray-70` (`:1815`). Satisfies "active state clearly
  indicated" via the accent — token-driven, no change needed.
- **Overlay accent icon** — `.project-item-icon-box { color:
  var(--orange-yellow-crayola); background: var(--jet); }` (`:1110-1111`) already
  reveals the cool-accent icon on a neutral chip; hover fades/scales it in (`:1124`).
- **Select control** — `.filter-select` / `.select-list` / `.select-item button`
  already read `--eerie-black-2`, `--jet`, `--light-gray`, `--select-hover-bg`
  (`:1013-1061`) — minimal neutral surfaces already.
- **Card text** — `.project-title` → `--white-2` (`:1143`), `.project-category` →
  `--light-gray-70` (`:1151`) already tokenized.

What still reads as un-minimal / un-tokenized is a set of **`border-radius` literals**
plus **one hardcoded hover-scrim color** — that is the work.

### Literals still present in Portfolio selectors (the work)

Per the T1 radius mapping (`3/4/5→sm`, `8/10→md`, `12/14/15/16/18/20→lg`, `30`/pill→pill,
`50%→circle`) and the orphaned-color tokenization (epic R1 → `--overlay-scrim`):

| Line | Rule | Current | Change to | Note |
| --- | --- | --- | --- | --- |
| `1022` | `.filter-select` | `border-radius: 14px;` | `var(--radius-lg)` | 14→12px, intended tightening |
| `1036` | `.select-list` (dropdown) | `border-radius: 14px;` | `var(--radius-lg)` | 14→12px |
| `1058` | `.select-item button` | `border-radius: 8px;` | `var(--radius-md)` | exact (8px) |
| `1088` | `.project-img` (card image) | `border-radius: 16px;` | `var(--radius-lg)` | 16→12px |
| `1105` | `.project-item > a:hover .project-img::before` (hover scrim) | `background: hsla(0, 0%, 0%, 0.5);` | `var(--overlay-scrim)` | **exact** value match (`:85`) — pure representation change, appearance identical |
| `1118` | `.project-item-icon-box` (overlay chip) | `border-radius: 12px;` | `var(--radius-lg)` | exact (12px) |
| `1703` | `.project-img, .blog-banner-box` (≥768px responsive, **shared**) | `border-radius: 16px;` | `var(--radius-lg)` | 16→12px; T5 edits this shared rule (R2), T6 must not |

After these seven substitutions, **zero** design-value literals remain in
Portfolio-owned selectors.

### Deliberately left as-is (not defects, per epic scope)

| Line | Rule | Value | Why it stays |
| --- | --- | --- | --- |
| `1041` | `.select-list` | `transition: 0.15s ease-in-out;` | A **motion duration**, not a color/radius/shadow/type design value — AC3 does not cover it. Converting to `--transition-1` (0.25s) would **change the dropdown open speed** (a behavior change, forbidden by epic R4/AC6). Leave the existing timing exactly as-is. |
| `1074`, `1077` | `.project-item.active`, `@keyframes scaleUp` | `animation: scaleUp 0.25s …` | Existing filter-entrance animation; **no new motion** may be added and existing motion is preserved. The `#REDUCED MOTION` block already sets `.project-item.active { animation: none }` (`:2114`). Leave. |
| `1105` (transform) / `1116` / `1137` | image-zoom + overlay scale | `transform: scale(1.1)`, `--scale`, `translate(-50%,-50%)` | Existing transform-based hover effects; preserved (epic forbids adding new ones, not keeping old). Reduced-motion overrides (`:2109-2122`) already neutralize them. |
| `1116` | `.project-item-icon-box` | `font-size: 20px;`, `padding: 18px;` | **Icon glyph size + padding are structural**, matching the established precedent — prior merged children left icon `font-size` as literals (`:560`, `:818`, `:1505` all remain `18px`). The type scale (`--fs-*`) is for **text**, not icon-box glyph sizing. Do **not** tokenize; churning it would diverge from the merged sections. |
| `1444-1445`, `1705`, `1821` | `#PORTFOLIO, BLOG` / grid responsive | `height: auto`, `gap`, `grid-template-columns` | All **structural** layout numbers — no color/radius/shadow literal. Leave. |
| `1108`, `1027` | `--scale: 0.8`, `rotate(0.5turn)` | — | Structural transform values. Leave. |

---

## 4. Step-by-step changes

All edits are in `assets/css/style.css` only. Every change is a literal→`var(--token)`
substitution — the only appearance delta is by way of the (already-approved) T1 token
values. The `--overlay-scrim` swap is **exact** (identical `hsla`), so the hover scrim
is pixel-identical; the `14px→lg`/`16px→lg` swaps tighten those corners to 12px (an
intended, minor tightening consistent with the epic's smaller radius scale); the
`8px→md`/`12px→lg` swaps are exact.

**4.1 Mobile custom-select radii → tokens.**
- `:1022` `.filter-select { … border-radius: 14px; }` → `var(--radius-lg)`.
- `:1036` `.select-list { … border-radius: 14px; }` → `var(--radius-lg)`.
- `:1058` `.select-item button { … border-radius: 8px; }` → `var(--radius-md)`.
- Leave `--eerie-black-2`, `--jet` border, `--light-gray`, `--select-hover-bg`, and the
  `0.15s` transition untouched (§3 "left as-is").

**4.2 Project card image radius → token.**
- `:1088` `.project-img { … border-radius: 16px; }` → `var(--radius-lg)`.

**4.3 Hover scrim color → token.**
- `:1105` `.project-item > a:hover .project-img::before { background: hsla(0, 0%, 0%,
  0.5); }` → `background: var(--overlay-scrim);`. Exact value match — appearance
  unchanged; this satisfies the epic's orphaned-literal reconciliation (R1) and AC3.
  Leave the base `.project-img::before { background: transparent; … }` (`:1100`) and
  its `transition: var(--transition-1)` as-is.

**4.4 Overlay chip radius → token.**
- `:1118` `.project-item-icon-box { … border-radius: 12px; }` → `var(--radius-lg)`.
  Leave `color: var(--orange-yellow-crayola)` (accent), `background: var(--jet)`,
  `--scale`, `font-size: 20px`, and `padding: 18px` untouched (§3).

**4.5 Shared responsive image radius → token.**
- `:1703` `.project-img, .blog-banner-box { border-radius: 16px; }` →
  `var(--radius-lg)`. **This is the shared `#PORTFOLIO, BLOG` rule** — T5 owns it per
  R2; the Blog child (#59) must not re-edit it.

**4.6 Nothing else changes.**
- The active-filter accent (`:1817`), overlay accent icon (`:1111`), select surfaces,
  and all card text already read tokens (§3) — no edits.
- No new selector, token, keyframe, or transform hover effect is introduced.

---

## 5. What must NOT change (guardrails)

- **Filter + select behavior is untouched.** The button-row filter, the mobile custom
  `<select>` open/close, and which cards show per category are all driven by
  `assets/js/script.js` (`elementToggleFunc`, the custom-select handler, and the
  `data-category`/`.active` toggling, `:103-159`) and the `index.html` markup — **all
  out of scope**. This stage changes only `border-radius`/scrim *values*; it must not
  alter `display`, `opacity`, `visibility`, `pointer-events`, `z-index`, or the
  `.filter-select.active`/`.project-item.active` selectors that the JS relies on.
- **No re-hardcoding.** Every color/radius/shadow/type must stay a `var(--token)`.
  Introducing any new `hsl`/`hsla`/hex or raw `border-radius`/`box-shadow` design
  literal in a Portfolio selector is a defect (epic R3/AC3).
- **No new motion.** Keep the existing `scaleUp` entrance, the `scale(1.1)` image zoom,
  and the overlay icon scale/fade exactly as-is; reuse existing `--transition-1/2` only
  — add **no** new keyframes and **no** new transform-based hover effects (epic R3), so
  the `#REDUCED MOTION` Portfolio overrides (`:2107-2122`) stay complete without a
  per-section addition.
- **Structural numbers are exempt.** Grid `gap`/`grid-template-columns`, image
  `width`/`height`, chip `padding`/`font-size`, `--scale`, and the `0.15s` select
  transition are layout/motion numbers — do not tokenize or churn them (epic §Scope).
- **Tokens are T1's.** Do not add or redefine any custom property. This child only
  references existing tokens.
- **DOM/JS/theme logic** (`index.html`, `assets/js/script.js`, the inline pre-paint
  theme script, `applyTheme`) and **all other sections/chrome/scrollbar/blog-base rules**
  are out of scope. In the shared `#PORTFOLIO, BLOG` block, edit only the combined
  `.project-img, .blog-banner-box` radius — leave the blog-only `.blog-posts-list`
  declarations for T6.

---

## 6. Acceptance criteria mapping (from issue #58)

| Issue AC | How this plan satisfies it |
| --- | --- |
| Portfolio grid, filter buttons, and custom select match the minimal system in both themes | §3/§4: select + dropdown already read neutral `--eerie-black-2`/`--jet`/`--select-hover-bg`; filter row reads `--light-gray`/accent; §4.1–4.5 tighten every residual radius literal to the T1 `--radius-lg`/`--radius-md` scale, so all three surfaces render flat, cool, tight corners in dark and light. |
| Filtering by category works via both the button row and the mobile select | §5: the show/hide logic (`script.js:103-159`) and the `.active` selectors it toggles are untouched — only radius/scrim *values* change. Verified in §7 steps 2–3 against `web design` / `applications` / `web development`. |
| Active filter state is clearly indicated | `.filter-item button.active` → accent (`--orange-yellow-crayola`=`--accent`, `:1817`), already token-driven and now the cool accent; base/hover text stay `--light-gray`/`--light-gray-70`. No change needed; verified in §7 step 2. |
| Image hover treatment is subtle; images keep lazy-load/WebP fallback | §4.3 swaps the hover scrim to the **identical** `--overlay-scrim` token (appearance unchanged, still a restrained 50%-black darken + accent-icon reveal); `loading="lazy"` and `<picture>`/WebP live in `index.html` and are untouched. Verified §7 steps 4 & 6. |

Epic-level: satisfies **AC1** (accent still single-sourced; no new accent literal —
active filter/overlay icon keep the `--accent` alias), **AC2** (radius values match the
R1 `--radius-lg`/`--radius-md` contract), **AC3** (removes all Portfolio `border-radius`
literals **and** the orphaned hover-scrim `hsla` literal at `:1105` — the last color
literal listed for this section in the epic Background), **AC4** (only radius/scrim
values change; grid/responsive layout numbers untouched), **AC6** (filter/select/modal
behavior unchanged), **AC7** (no new motion; reduced-motion block stays complete),
**AC8** (contrast measured and recorded in the PR).

---

## 7. Verification (manual browser QA — no test runner exists)

Serve with `python3 -m http.server 8000` from repo root, open
`http://localhost:8000/#portfolio` (the Portfolio article, `index.html:749`; activated
via the hash/`activatePage`).

1. **Grep gate (Portfolio subset of AC1/AC3):** after the edit, confirm **no** raw
   `border-radius:` numeric literal and no `hsl(`/`hsla(`/hex remains in the
   Portfolio-owned rules (`:1006-1154` base, the shared `:1703`, and the `:1798-1821`
   responsive filter block; token blocks and `#REUSED STYLE` exempt). Expected: all
   seven rows in §3 now read `var(--…)`; the `0.15s` select transition and the
   `scaleUp`/`scale(1.1)` transforms remain; `font-size: 20px` remains (structural).
2. **Filter button row (desktop ≥580px):** all category buttons render in
   `--light-gray`; clicking one shows only matching `.project-item.active` cards and
   marks the clicked button **accent** (`.active`); hover dims to `--light-gray-70`.
   Cycle `All` → `web design` → `applications` → `web development` and confirm the grid
   updates and the active accent indicator is obvious in both themes.
3. **Mobile custom select (<580px, e.g. 375px):** the `.filter-select` control shows
   with the tightened `--radius-lg` corner and `--jet` border; clicking it rotates the
   chevron and opens `.select-list` (also `--radius-lg`); each `.select-item button`
   (`--radius-md`) highlights `--select-hover-bg` on hover; picking a category filters
   the grid identically to the button row. Confirm open/close and pointer-events are
   unchanged.
4. **Project cards + hover:** each `.project-img` tile renders with the tightened
   `--radius-lg` corner; on hover the **scrim darkens** (identical `--overlay-scrim`)
   and the accent `.project-item-icon-box` (now `--radius-lg`) fades/scales in over it,
   and the image zooms `scale(1.1)`. Confirm the treatment reads as restrained, the
   accent icon is the cool accent, and titles (`--white-2`)/categories
   (`--light-gray-70`) are legible.
5. **Lazy-load / WebP:** in DevTools Network, confirm portfolio images still
   `loading="lazy"` (load as they scroll into view) and the `<picture>`/`source
   type="image/webp"` fallback still resolves — untouched by this CSS-only change.
6. **AA contrast (epic AC8) — record ratios in the PR, both themes:** measure the
   **active filter accent** (`--accent` text on the page surface — ≥4.5:1 for the 15px
   filter label, or ≥3:1 as a UI indicator), **project title** (`--white-2`),
   **project category** (`--light-gray-70`), **select text** (`--light-gray` on
   `--eerie-black-2`), and the **overlay accent icon** vs. its `--jet` chip (≥3:1
   UI/graphical). If the active-filter accent measures below its threshold in either
   theme, the token-only remedy is to point that one declaration at a
   higher-contrast existing token — note it in the PR; do **not** invent a token or
   literal.
7. **Responsive:** check 375 / 768 / 1024 / 1440px. At <580px the select shows and the
   button row hides; at ≥580px the reverse; at ≥768px the grid is 2-col and
   `.project-img`/`.blog-banner-box` use the shared `--radius-lg`. Confirm this matches
   `main` layout exactly with the new radii and there is no layout shift.
8. **Themes:** toggle the theme button; verify the select surfaces, filter row + active
   accent, card tiles, hover scrim + accent icon, and card text all read correctly in
   light and dark (no flash, no wrong-theme surface, accent visible on both).
9. **Reduced motion:** DevTools → Emulate `prefers-reduced-motion: reduce`; confirm the
   image zoom, `scaleUp` entrance, and icon scale-in are neutralized (icon still fades
   in via opacity; scrim still darkens) — the existing `#REDUCED MOTION` overrides
   (`:2107-2122`) cover it unchanged because no new motion was added.

Attach before/after screenshots (dark + light) at 375/768/1024/1440px of the filter
row, open custom select, and the card grid (incl. a hover state) to the implement-stage
PR, per the epic DoD, and record the measured contrast ratios from step 6.

---

## 8. Risk / rollback

CSS-only, single file, **seven** purely mechanical literal→token substitutions: six
`border-radius` swaps (three exact at 8/12px, three intended 14/16→12px tightenings)
and one **exact** color swap (`hsla(0,0%,0%,0.5)` → `--overlay-scrim`). There is **no
non-mechanical decision** — the two judgment calls are both settled toward *no change*:
the `0.15s` select transition stays (avoids a behavior change) and the icon-box
`font-size: 20px` stays a structural literal (matches merged-child precedent). The only
delta with runtime risk is that the changes sit on the app's most interactive tab, so
verification centers on **confirming the filter/select behavior is untouched** (§7
steps 2–3) — which it is, because the JS-relied-upon selectors (`.active`,
`display`/`opacity`/`visibility`) are not edited. The one thing that genuinely needs
eyes is the **AA contrast of the active-filter accent** (§7 step 6). Rollback = revert
the section child's PR; the site still renders on T1's tokens.
