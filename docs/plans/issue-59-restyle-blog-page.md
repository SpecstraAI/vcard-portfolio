# Issue #59 — Restyle Blog page

**Type:** implementation plan (plan stage). No CSS is changed by this stage — this
document is the contract the *implement* stage follows.
**Base branch:** `epic/53-restyle-vcard-portfolio-to-a-modern-mini` (never `main`).
**Only file the implement stage may change:** `assets/css/style.css`.
**Parent:** #53 (epic). This is child **T6**, the Blog section child. It depends on
**T1** (#54, merged) which already defined every token this plan consumes, and follows
**T2** (#55, chrome), **T3** (#56, About), **T4** (#57, Resume), **T5** (#58,
Portfolio) — all merged — which applied the same literal→token pattern to their
sections.

---

## 1. Goal

Convert the `#BLOG` section — the **post card** (gradient-border card shell, lazy-loaded
banner image, meta row with category/date, title, excerpt) — so all
color/radius/shadow/type **resolve from the tokens T1 already defined**, and so the
section reads as one cohesive modern-minimal system in both themes. Because the token
*values* themselves already changed in T1 (cool accent replacing the gold/yellow,
tighter radii, flatter shadows), every Blog surface that already references a token
inherits the new look for free; this stage finishes the job by replacing the **three
remaining `border-radius` literals** in Blog-owned selectors with the matching radius
tokens, then verifying card readability, the (subtle, transform-free) hover behavior,
hierarchy/legibility, lazy-load/WebP integrity, and AA contrast in both themes.

**No DOM, no JS, no behavior change.** This is a CSS-only, token-only pass over the
selectors this child owns. The blog banner images keep `loading="lazy"` and the
`<picture>`/`<source type="image/webp">` fallback — both live in `index.html` and are
out of scope and untouched. The card shell keeps its `--border-gradient-onyx` +
`::before` inset idiom (the shared site-wide card pattern, already tokenized by T1);
"adopting the minimal system" here means the same tokenized flat-shadow/tight-radius
treatment the other card sections already received, **not** ripping out the gradient
border (that idiom is site-wide and out of scope — see §5).

---

## 2. Ownership (per epic R2 — by selector, not line range)

T6 owns the **Blog** section: the `#BLOG` base rules (`assets/css/style.css:1160-1240`)
**and** the Blog-only responsive rules. Only T1 may add or change token *definitions*;
this child only *consumes* tokens. Concretely, the selectors this child may edit:

- **Card shell:** `.blog-posts`, `.blog-posts-list`, `.blog-post-item > .blog-card`,
  `.blog-post-item > .blog-card::before` (`:1164-1189`).
- **Banner + content:** `.blog-banner-box`, `.blog-banner-box img`, `.blog-content`
  (`:1190-1204`).
- **Meta / title / text:** `.blog-meta`, `.blog-meta :is(.blog-category, time)`,
  `.blog-meta .dot`, `.blog-item-title`, `.blog-text` (`:1206-1237`).
- **Blog-only responsive rules:** `.blog-posts-list` gap (`:1705`), `.blog-content`
  padding (`:1707`), and `.blog-banner-box { height: 230px }` (`:1933`) — all
  **structural** (gap/padding/height), so they need **no edit** (see §3), but they are
  T6-owned semantically per R2.

> **Shared `#PORTFOLIO, BLOG` responsive rules are NOT owned here** (epic R2 assigns the
> combined-selector rules to **T5 / #58**, already merged). Do **not** touch:
> - `.project-img, .blog-banner-box { height: auto }` (`:1444-1445`) — combined selector,
>   T5-owned, structural.
> - `.project-img, .blog-banner-box { border-radius: var(--radius-lg) }` (`:1703`) —
>   combined selector, **already tokenized by T5**. Leave it exactly as-is.
> - `.project-list, .blog-posts-list { grid-template-columns: 1fr 1fr }` (`:1821`) —
>   combined selector, structural, T5-owned.

> **Shared reused styles consumed by Blog but NOT owned here (already tokenized by T1 —
> for QA orientation only):**
> - `.h2, .h3, .h4, .h5 { color: var(--white-2) }` and `.h3 { font-size: var(--fs-2) }`
>   (`#REUSED STYLE`, `:336-346`) — the blog post title inherits its color/size from
>   `.h3`. Already token-driven. Leave untouched.
> - `.article-title` / `.article-title::after` (`#REUSED STYLE`) — the "Blog" heading +
>   its accent underline; already reads the accent + `--radius-sm`. Leave untouched.

> **Do not touch** the token blocks (`:18-216`), the `#REUSED STYLE` block, the
> `#ABOUT`/`#RESUME`/`#PORTFOLIO`/`#CONTACT` section rules, the sidebar/navbar chrome
> (T2), the scrollbar rules, the shared `#PORTFOLIO, BLOG` responsive rules (T5), or the
> `#REDUCED MOTION` block (T7). Do not touch `index.html`, `assets/js/script.js`, or
> `404.html`.

---

## 3. Current state (grounded in the code)

Relevant tokens **already defined by T1** that this stage consumes:

| Token | Dark value | Light value | Source |
| --- | --- | --- | --- |
| `--radius-sm` | `4px` | (theme-independent) | `:127` |
| `--radius-lg` | `12px` | (theme-independent) | `:129` |
| `--border-gradient-onyx` (card border) | onyx gradient | light gradient | `:46`, `:171` |
| `--eerie-black-1` (card `::before` fill) | `hsl(240,2%,13%)` | `hsl(0,0%,91%)` | `:61`, `:181` |
| `--shadow-4` (card elevation) | `0 8px 24px hsla(0,0%,0%,0.14)` | `…0.05` | `:140`, `:213` |
| `--white-2` (post title, via `.h3`) | `hsl(0,0%,98%)` | `hsl(0,0%,20%)` | `:336-340`, light block |
| `--light-gray` (excerpt text) | `hsl(0,0%,84%)` | `hsl(0,0%,30%)` | light block |
| `--light-gray-70` (meta text + dot) | 70%-alpha light-gray | light | light block |
| `--fs-2` / `--fs-6` (title / meta+excerpt) | `20px` / `13px` | (theme-independent) | `:` type block |

**The Blog surfaces already read from tokens for everything except radius.** After T1:

- **Card shell** — `.blog-post-item > .blog-card { background: var(--border-gradient-onyx);
  box-shadow: var(--shadow-4); }` (`:1174-1176`) already reads the tokenized shared card
  border + the T1-flattened `--shadow-4`; its `::before` inset fill is
  `var(--eerie-black-1)` (`:1186`). No color/shadow literal here — inherits the minimal
  flat look for free.
- **Banner image** — `.blog-banner-box img` reads `transition: var(--transition-1)`
  (`:1201`); the box clips with `overflow: hidden`. No color literal.
- **Meta / title / excerpt** — `.blog-meta :is(.blog-category, time)` → `--light-gray-70`
  + `--fs-6` (`:1215-1217`); `.blog-meta .dot` → `background: var(--light-gray-70)`
  (`:1221`); `.blog-item-title` inherits `--white-2`/`--fs-2` from `.h3`; `.blog-text` →
  `--light-gray` + `--fs-6` (`:1234-1236`). All tokenized.

A grep of the Blog base block (`:1160-1240`) confirms **zero** `hsl`/`hsla`/hex color
literals remain — the only design-value literals are three `border-radius` numbers.

### Literals still present in Blog selectors (the work)

Per the T1 radius mapping (`3/4/5→sm`, `8/10→md`, `12/14/15/16/18/20→lg`, `30`/pill→pill,
`50%→circle`):

| Line | Rule | Current | Change to | Note |
| --- | --- | --- | --- | --- |
| `1177` | `.blog-post-item > .blog-card` | `border-radius: 16px;` | `var(--radius-lg)` | 16→12px, intended tightening |
| `1193` | `.blog-banner-box` | `border-radius: 12px;` | `var(--radius-lg)` | **exact** (12px) — pure representation change |
| `1224` | `.blog-meta .dot` | `border-radius: 4px;` | `var(--radius-sm)` | **exact** (4px) — pure representation change |

The `border-radius: inherit;` on `.blog-card::before` (`:1185`) is **not** a design-value
literal (it references the parent's radius) and stays as-is. After these three
substitutions, **zero** design-value literals remain in Blog-owned selectors.

### Deliberately left as-is (not defects, per epic scope)

| Line | Rule | Value | Why it stays |
| --- | --- | --- | --- |
| `1176` | `.blog-card` | `box-shadow: var(--shadow-4);` | **Already a token** (no literal). T1 flattened its *value*; the *choice* of `--shadow-4` is the existing card elevation and needs no change to satisfy AC3. Do **not** swap to another shadow token — that would be an un-requested visual change and diverges from the sibling pure-literal→token precedent. |
| `1164`, `1204`, `1167-1169`, `1207-1211` | `.blog-posts`, `.blog-content`, grid `gap`, flex `.blog-meta` | `margin-bottom`, `padding`, `gap`, `display/justify/align` | **Structural** layout numbers — no color/radius/shadow/type design value. Leave (epic §Scope exempts structural numbers). |
| `1201`, `1230` | `.blog-banner-box img`, `.blog-item-title` | `transition: var(--transition-1);` | Existing (reused) transition tokens — **not** new motion. See §5 for why these must stay and why no `:hover` rule is added. |
| `1220-1225` | `.blog-meta .dot` | `width: 4px; height: 4px;` | Structural glyph size. Only the `border-radius` (`:1224`) is tokenized. |
| `1445`, `1703`, `1705`, `1707`, `1821`, `1933` | responsive blog/shared rules | `height`, `border-radius` (already token), `gap`, `padding`, `grid-template-columns` | `:1703` is already `var(--radius-lg)` and **T5-owned** (leave); all others are structural or T5-owned combined selectors. **No responsive edit is required or permitted here.** |

---

## 4. Step-by-step changes

All edits are in `assets/css/style.css` only, all within the `#BLOG` base block. Every
change is a literal→`var(--token)` substitution — the only appearance delta is by way of
the (already-approved) T1 token values. Two swaps are **exact** (12px, 4px → identical
token values, pixel-identical); one tightens 16px→12px (an intended, minor tightening
consistent with the epic's smaller radius scale, matching the same 16→12 change T5 made
on the sibling `.project-img`).

**4.1 Card shell radius → token.**
- `:1177` `.blog-post-item > .blog-card { … border-radius: 16px; }` → `var(--radius-lg)`.
  Leave `background: var(--border-gradient-onyx)`, `box-shadow: var(--shadow-4)`,
  `position`, `height`, `z-index`, and the `::before { … border-radius: inherit;
  background: var(--eerie-black-1); }` untouched (§3).

**4.2 Banner box radius → token.**
- `:1193` `.blog-banner-box { … border-radius: 12px; }` → `var(--radius-lg)`. Exact value
  match — appearance unchanged. Leave `width`, `height`, `overflow: hidden` and the
  child `img` rule (`:1197-1202`, incl. `transition: var(--transition-1)`) untouched.

**4.3 Meta dot radius → token.**
- `:1224` `.blog-meta .dot { … border-radius: 4px; }` → `var(--radius-sm)`. Exact value
  match. Leave `background: var(--light-gray-70)`, `width: 4px`, `height: 4px` untouched.

**4.4 Nothing else changes.**
- The card border/shadow/fill, meta/title/excerpt colors and type sizes already read
  tokens (§3) — no edits.
- No new selector, token, keyframe, `:hover` rule, or transform hover effect is
  introduced (§5).

---

## 5. What must NOT change (guardrails)

- **No new hover motion; the blog card stays as it is.** The current Blog markup wraps
  each post in a `<div class="blog-card">` — there is **no `<a>` wrapper**
  (`index.html:1027-1057`), so, unlike Portfolio, there is no hover-target to hang an
  image-zoom or scrim on, and the section currently has **no `:hover` rule at all**
  (verified: a grep for `.blog…:hover` returns nothing). The `transition:
  var(--transition-1)` on `.blog-banner-box img` (`:1201`) and `.blog-item-title`
  (`:1230`) are inert leftovers with no state-change trigger. Epic **R3** forbids adding
  new keyframes or new transform-based hover effects, and `index.html` is out of scope
  (so no `<a>` wrapper may be added). Therefore **do not add** an image-zoom, scrim, or
  title-accent hover. The issue's "subtle, consistent hover treatment" AC is satisfied
  by **consistency with the other card sections** — About (`.content-card`, testimonial,
  clients) and Resume cards likewise carry only inert `transition` declarations and **no
  card `:hover`**; Blog matches that exactly. Leave the two `transition` lines in place
  (removing them is an un-requested change and would touch reduced-motion reasoning).
- **Keep the gradient-border card idiom.** `--border-gradient-onyx` + the
  `::before { inset: 1px; background: var(--eerie-black-1) }` inset is the **site-wide**
  card pattern (About `.content-card` `:388-405`, service/testimonial/clients, Resume,
  Contact form) — it is already tokenized by T1 and shared across sections. "Minimal
  system" for this card = the T1-flattened shadow + tightened radius applied to that
  shared idiom, **not** replacing the border with a flat/solid one. Restructuring the
  card border is out of scope (it would diverge from every merged sibling and is not a
  token substitution). Do not remove or rewrite the `::before`.
- **No re-hardcoding.** Every color/radius/shadow/type must stay a `var(--token)`.
  Introducing any new `hsl`/`hsla`/hex or raw `border-radius`/`box-shadow` design literal
  in a Blog selector is a defect (epic R3/AC3).
- **Structural numbers are exempt.** Grid `gap`, `.blog-content` `padding`, banner/card
  `height`/`width`, dot `width`/`height`, and `.blog-posts` `margin` are layout numbers —
  do not tokenize or churn them (epic §Scope).
- **Do not touch the shared `#PORTFOLIO, BLOG` responsive rules** (`:1444-1445`, `:1703`,
  `:1821`) — they are T5-owned (already merged) combined-selector rules; `:1703` is
  already `var(--radius-lg)`. Editing them would re-open T5's ownership.
- **Tokens are T1's.** Do not add or redefine any custom property. This child only
  references existing tokens.
- **DOM/JS/theme logic** (`index.html`, `assets/js/script.js`, the inline pre-paint theme
  script, `applyTheme`) and **all other sections/chrome/scrollbar rules** are out of
  scope.

---

## 6. Acceptance criteria mapping (from issue #59)

| Issue AC | How this plan satisfies it |
| --- | --- |
| Blog cards match the minimal system in both themes | §3/§4: the card shell already reads the tokenized `--border-gradient-onyx` + T1-flattened `--shadow-4` + `--eerie-black-1` fill; §4.1–4.3 tighten the three residual radius literals to the T1 `--radius-lg`/`--radius-sm` scale, so the card renders flat, tight corners in dark and light, matching the other card sections. |
| Card hover treatment is subtle and consistent with other sections | §5: the blog card has **no** `:hover` (no `<a>` wrapper; `index.html` out of scope; R3 forbids new transform hovers) — identical to the other card sections (About/Resume cards also have inert `transition` + no card hover). Consistency is achieved by **not** bolting on a heavier/aberrant hover. Verified §7 step 3. |
| Post title/meta/excerpt meet AA contrast | §3: title inherits `--white-2` via `.h3` (`--fs-2`, 20px large text); meta/dot `--light-gray-70` (`--fs-6`); excerpt `--light-gray` (`--fs-6`) — all token-driven, unchanged by this stage. §7 step 5 measures and records ratios in both themes; if any measures below threshold the token-only remedy is to point that one declaration at a higher-contrast existing token (note in PR — do not invent a token/literal). |
| Images keep lazy-load and WebP fallback | `loading="lazy"` and `<picture>`/`<source type="image/webp">` live in `index.html` (`:1029-1032` etc.) and are untouched by this CSS-only change. Verified §7 step 4. |

Epic-level: satisfies **AC1** (no accent literal introduced — the card uses no accent),
**AC2** (radius values match the R1 `--radius-lg`/`--radius-sm` contract), **AC3**
(removes all Blog `border-radius` literals; no color literal existed in the section),
**AC4** (only radius values change; grid/responsive layout numbers untouched — layout
holds at all viewports), **AC6** (no behavior change — Blog has no interactive JS),
**AC7** (no new motion; the `#REDUCED MOTION` block has no Blog override and needs none,
since Blog adds no transform hover), **AC8** (contrast measured and recorded in the PR).

---

## 7. Verification (manual browser QA — no test runner exists)

Serve with `python3 -m http.server 8000` from repo root, open
`http://localhost:8000/#blog` (the Blog article, `index.html:1016`; activated via the
hash/`activatePage`).

1. **Grep gate (Blog subset of AC1/AC3):** after the edit, confirm **no** raw
   `border-radius:` numeric literal and no `hsl(`/`hsla(`/hex remains in the Blog-owned
   base rules (`:1160-1240`). Expected: all three rows in §3 now read `var(--…)`; the
   `border-radius: inherit` on `.blog-card::before` remains (not a literal); the two
   `transition: var(--transition-1)` lines remain; structural `gap`/`padding`/`height`
   numbers remain. Do **not** expect any change in the shared `:1703` rule (T5-owned).
2. **Card shell:** each `.blog-card` renders with the tightened `--radius-lg` (12px)
   corner, the tokenized gradient border + `--eerie-black-1` inset fill, and the
   T1-flattened `--shadow-4` elevation. Confirm the card reads as flat/minimal in both
   themes with no double-border or clipped-corner artifact (the `::before` inherits the
   new radius via `border-radius: inherit`).
3. **Hover behavior:** hover a blog card and confirm **nothing animates** (no image zoom,
   no scrim, no title color shift) — matching the About/Resume cards. This is the correct
   "subtle, consistent" behavior for this section; the inert `transition` lines cause no
   visible change. Confirm in both themes.
4. **Lazy-load / WebP:** in DevTools Network, confirm blog banner images still
   `loading="lazy"` (load as they scroll into view) and the `<picture>`/`source
   type="image/webp"` fallback still resolves — untouched by this CSS-only change. The
   `--radius-lg` on `.blog-banner-box` clips the image corners with no layout shift.
5. **AA contrast (epic AC8) — record ratios in the PR, both themes:** measure the **post
   title** (`--white-2` on the card surface — large text ≥3:1, `--fs-2`=20px), **meta
   category/date + dot** (`--light-gray-70` — `--fs-6`=13px body ≥4.5:1), and **excerpt**
   (`--light-gray` — `--fs-6` ≥4.5:1). If any measures below its threshold in either
   theme, the token-only remedy is to point that one declaration at a higher-contrast
   existing token — note it in the PR; do **not** invent a token or literal.
6. **Responsive:** check 375 / 768 / 1024 / 1440px. The blog list is 1-col below 580px
   and 2-col at ≥768px (shared `.project-list, .blog-posts-list`, `:1821`, T5-owned,
   unchanged); `.blog-banner-box` height is `auto` <768px, `12px` radius via the shared
   `:1703` rule ≥768px, and `230px` height at the widest breakpoint (`:1933`). Confirm
   this matches `main` layout exactly with the new card/banner radii and there is no
   layout shift.
7. **Themes:** toggle the theme button; verify the card border, inset fill, shadow, and
   all card text (title/meta/excerpt) read correctly in light and dark (no flash, no
   wrong-theme surface, card text legible on the light `--eerie-black-1` neutral).
8. **Reduced motion:** DevTools → Emulate `prefers-reduced-motion: reduce`; confirm the
   Blog tab has no state-change animation (it has none to begin with). The existing
   `#REDUCED MOTION` block needs and gets **no** Blog addition because no new motion was
   introduced.

Attach before/after screenshots (dark + light) at 375/768/1024/1440px of the blog card
grid (incl. a hover state to show it is intentionally static) to the implement-stage PR,
per the epic DoD, and record the measured contrast ratios from step 5.

---

## 8. Risk / rollback

CSS-only, single file, **three** purely mechanical `border-radius` literal→token
substitutions: two **exact** (`.blog-banner-box` 12px→`--radius-lg`, `.blog-meta .dot`
4px→`--radius-sm`) and one intended tightening (`.blog-card` 16px→`--radius-lg`=12px,
matching the same 16→12 change T5 already made on the sibling `.project-img`). There is
**no non-mechanical decision**: the one judgment call — whether to add a card hover — is
settled toward *no change*, because the DOM has no `<a>` hover-target (and `index.html`
is out of scope), epic R3 forbids new transform hovers, and the other card sections are
likewise hover-free, so no-hover is the *consistent* choice. The card keeps the
site-wide gradient-border idiom (already tokenized) and its `--shadow-4` token, so
elevation/appearance are pixel-stable apart from the intended corner tightening. The one
thing that genuinely needs eyes is the **AA contrast of the meta/excerpt text on the
light-theme card** (§7 step 5). Rollback = revert the section child's PR; the site still
renders on T1's tokens.
