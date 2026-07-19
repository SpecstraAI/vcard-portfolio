# Issue #54 — Establish modern-minimal design-token foundation

**Type:** implementation plan (plan stage). No CSS is changed by this stage — this
document is the contract the *implement* stage follows.
**Base branch:** `epic/53-restyle-vcard-portfolio-to-a-modern-mini` (never `main`).
**Only file the implement stage may change:** `assets/css/style.css`.
**Parent:** #53 (epic). This is child **T1**, the foundation the other six
section children (#55–#61) build on.

---

## 1. Goal

Redefine the design-token layer of `assets/css/style.css` so the portfolio's
identity moves from the current gold/yellow, heavy-shadow, large-radius look to a
**modern-minimal** system: one restrained cool accent, a small radius scale,
flatter shadows, a refined type scale. Because every component rule already reads
from CSS custom properties, redefining the tokens re-skins every consumer at once.
This stage also introduces the tokens that later children will consume (radius
scale, orphaned-color tokens) so the contract exists as a single source of truth
before any section work begins.

T1 is **independently shippable**: after it merges the site still renders — with
the new accent, shadows, and type, and legacy radii — until the section children
(#55–#60) convert per-section radius/shadow/color literals to the new tokens.

---

## 2. Current state (grounded in the code)

All theme-able values live in the `#CUSTOM PROPERTY` block:

- `:root` (dark) — `assets/css/style.css:18-114`
- `[data-theme="light"]` (light overrides) — `assets/css/style.css:116-175`

Component rules reference these variables, so the token blocks are already the
de-facto single source of truth for anything tokenized. What is **not** tokenized
today (and is in scope for T1 to *define*, per the epic R1):

| Concern | Location today | Notes |
| --- | --- | --- |
| Accent hue | `--orange-yellow-crayola` `:68`/`:161`, `--vegas-gold` `:69`/`:162`, and the three yellow gradients `:36-45`, `:51-55`, `:130-149` | Gold/yellow literal appears in several places; no single `--accent`. |
| Radius | Literals only — e.g. `article` `20px` `:235`, icon-box `8px` `:253`, title separator `3px` `:327`, scrollbar track/thumb `5px` `:337,:342`, content-card `14px` `:352` | **No radius token exists at all today.** |
| Shadow | `--shadow-1..5` `:101-105` (dark) / `:169-173` (light) | Heavy (`-4px 8px 24px`, `0 25px 50px`, etc.); also re-declared in a responsive `@media` at `:1819-1821`. |
| Type scale | `--fs-1..8` `:82-89` | Present but coarse (`24/18/17/16/15/14/13/11`). |
| Navbar surface | `hsla(240,1%,17%,0.75)` `:538`; light `hsla(0,0%,88%,0.85)` `:566` | Hardcoded, in `#NAVBAR`. |
| Modal overlay | `hsl(0,0%,5%)` `:734` | Hardcoded, in `#ABOUT`. |
| Portfolio hover scrim | `hsla(0,0%,0%,0.5)` `:1066` | Hardcoded, in `#PORTFOLIO`. |
| Form status colors | `:1331-1340` (success bg/fg/border, error bg/fg/border) | Hardcoded, in `#CONTACT`; error `color` already uses `--bittersweet-shimmer`. |
| Scrollbar thumb | `:1936-1942` (dark), `:2043-2046` (light) | Hardcoded, inside `#RESPONSIVE`. |

Section banners (for orientation): `#RESET` `:182`, `#REUSED STYLE` `:228`,
`#MAIN` `:376`, `#SIDEBAR` `:390`, `#NAVBAR` `:530`, `#ABOUT` `:585`,
`#RESUME` `:853`, `#PORTFOLIO` `:964`, `#BLOG` `:1122`, `#CONTACT` `:1206`,
`#RESPONSIVE` `:1384`, `#REDUCED MOTION` `:2058`.

Theme is set pre-paint by the inline `<head>` script (`index.html:52-58`) and
mirrored by `applyTheme`/`themeBtn` (`assets/js/script.js:225-237`). **This is
out of scope and must not be touched** — the change is CSS-only.

---

## 3. Ownership boundary (what T1 does vs. what it defers)

The epic uses **selector/section ownership** (R2), not line ranges. Two rules
matter here:

- **Only T1 may add or change token *definitions*** (anything inside `:root` /
  `[data-theme="light"]`, plus the responsive shadow *re-declarations* at
  `:1819-1821`, which are token definitions).
- **Section children own their section's *usage-site* rules.** So navbar (`:538`,
  `:566`) → #55 (chrome/T2), modal overlay (`:734`) → #56 (About/T3), portfolio
  scrim (`:1066`) → #58 (Portfolio/T5), form-status (`:1331-1340`) → #60
  (Contact/T6).

This matches issue #54's own scope statement — usage-site promotion is limited to
**`#RESET` / `#REUSED STYLE` / `#MAIN`** — and its acceptance criterion *"No
component color is hardcoded in the reused/reset/main sections."* T1 therefore
**defines** the orphaned-color tokens (so the contract exists) but does **not**
edit the navbar/modal/portfolio/contact usage sites; the owning child swaps
`hsla(...)` → `var(--token)` when it restyles its section. Defining
not-yet-consumed tokens is the intended handoff, and it keeps T1 from editing into
other children's sections (which would cause merge conflicts across #55–#60).

> **Decision point to confirm with the epic owner — scrollbar tokens.** The body
> scrollbar literals live inside `#RESPONSIVE` (`:1936-1942`, `:2043-2046`) and
> have **no clean section child** (chrome/T2 owns sidebar/navbar/main, not the
> body scrollbar). Two defensible options:
>
> 1. **T1 defines *and* applies the scrollbar tokens** at `:1936-1942`/`:2043-2046`
>    (recommended): T1 already owns the base `.has-scrollbar` scrollbar rules in
>    `#REUSED STYLE` (`:337`, `:342`) and there is no other owner, so keeping the
>    whole scrollbar surface in one PR avoids an orphan.
> 2. **T1 defines only; fold the responsive apply into chrome/T2 (#55).**
>
> This plan proceeds with **option 1** and flags it; if the epic owner prefers
> option 2, the only change is to leave `:1936-1942`/`:2043-2046` untouched here
> and move that bullet to #55.

---

## 4. Exact token changes (implement stage)

All values below come verbatim from the epic **R1** contract. Keep the existing
file's formatting (multi-line gradients, two-space indent) — the repo's
PostToolUse auto-formatter has **no `.css` case**, so CSS is not reformatted;
match the surrounding style by hand.

### 4.1 Accent tokens — add to `:root`, override lightness in `[data-theme="light"]`

Add a new `/* accent */` group in both blocks.

```css
/* :root */
--accent:        hsl(213, 90%, 64%);
--accent-strong: hsl(213, 90%, 72%);
--accent-muted:  hsl(213, 25%, 55%);
--accent-subtle: hsla(213, 90%, 64%, 0.14);

/* [data-theme="light"] */
--accent:        hsl(213, 85%, 42%);
--accent-strong: hsl(213, 85%, 34%);
--accent-muted:  hsl(213, 30%, 40%);
--accent-subtle: hsla(213, 85%, 42%, 0.10);
```

`--accent` is the **only** place the accent hue literal is allowed to appear
(AC1). Every other accent use derives from these four.

### 4.2 Legacy accent aliases — re-point, delete light-theme literals

In `:root`, change the existing declarations at `:68-69` to aliases:

```css
--orange-yellow-crayola: var(--accent);
--vegas-gold: var(--accent-muted);
```

**Delete** the per-theme literal overrides in `[data-theme="light"]` at `:161-162`
(`--orange-yellow-crayola: hsl(40,90%,38%);` and `--vegas-gold: hsl(40,60%,35%);`).
The aliases resolve through `var(--accent)`/`var(--accent-muted)`, which already
differ per theme, so a light-theme literal would be a second source of truth
(defeats AC1). Grep for other consumers of these two legacy names — they keep
working unchanged because the variable name is unchanged; only its value now flows
from `--accent`.

### 4.3 Accent-derived gradients — redefine from the accent

Replace the yellow gradient literals with accent-derived forms.

```css
/* both themes, driven by accent */
--text-gradient-yellow: linear-gradient(to right, var(--accent-strong), var(--accent));
--bg-gradient-yellow-1: linear-gradient(to bottom right, var(--accent) 0%, hsla(213, 90%, 64%, 0) 50%);

/* :root */
--bg-gradient-yellow-2:
  linear-gradient(135deg, var(--accent-subtle) 0%, transparent 59.86%),
  hsl(240, 2%, 13%);

/* [data-theme="light"] — same, but light neutral base */
--bg-gradient-yellow-2:
  linear-gradient(135deg, var(--accent-subtle) 0%, transparent 59.86%),
  hsl(0, 0%, 91%);
```

Notes:
- `--text-gradient-yellow` (`:51-55` dark, `:145-149` light) and
  `--bg-gradient-yellow-1` (`:36-40` dark, `:130-134` light) become
  **theme-independent** (they resolve through per-theme accent vars), so the
  `[data-theme="light"]` copies can be removed — keep them only if you prefer an
  explicit mirror. Either is acceptable; removing them is cleaner and keeps a
  single definition.
- `--bg-gradient-yellow-2` **must stay per-theme** because its opaque base color
  differs (`hsl(240,2%,13%)` dark vs `hsl(0,0%,91%)` light — the latter matches the
  existing light neutral at `:139`/`:155`).
- The `hsla(213, 90%, 64%, 0)` in `--bg-gradient-yellow-1` is a transparent stop,
  not an independent accent literal; it is the same hue as `--accent` at 0 alpha,
  which the contract accepts. Leave as written.

### 4.4 Radius scale — new, `:root` only (theme-independent)

Add a `/* radius */` group in `:root` (no `[data-theme="light"]` counterpart):

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-pill: 999px;
--radius-circle: 50%;
```

**Conversion mapping** (section children apply this to their own literals; T1
applies it only within `#RESET`/`#REUSED STYLE`/`#MAIN`, see §4.7):
`3px/4px/5px → --radius-sm`, `8px/10px → --radius-md`,
`12px/14px/15px/16px/18px/20px → --radius-lg`, `30px` and pill controls →
`--radius-pill`, `50% → --radius-circle`. Directional radii keep their pattern,
e.g. `20px 20px 0 0 → var(--radius-lg) var(--radius-lg) 0 0`.

### 4.5 Shadow scale — redefine values, keep the five names

```css
/* :root */
--shadow-1: 0 1px 2px  hsla(0,0%,0%,0.16);
--shadow-2: 0 2px 8px  hsla(0,0%,0%,0.18);
--shadow-3: 0 4px 16px hsla(0,0%,0%,0.20);
--shadow-4: 0 8px 24px hsla(0,0%,0%,0.14);
--shadow-5: 0 12px 32px hsla(0,0%,0%,0.18);

/* [data-theme="light"] — same offsets/blur, softer alpha */
--shadow-1: 0 1px 2px  hsla(0,0%,0%,0.06);
--shadow-2: 0 2px 8px  hsla(0,0%,0%,0.07);
--shadow-3: 0 4px 16px hsla(0,0%,0%,0.08);
--shadow-4: 0 8px 24px hsla(0,0%,0%,0.05);
--shadow-5: 0 12px 32px hsla(0,0%,0%,0.07);
```

Replaces `:101-105` (dark) and `:169-173` (light).

### 4.6 Type scale — redefine in `:root` (font family/weights unchanged)

```css
--fs-1: 28px;
--fs-2: 20px;
--fs-3: 16px;
--fs-4: 15px;
--fs-5: 14px;
--fs-6: 13px;
--fs-7: 12px;
--fs-8: 11px;
```

Replaces `:82-89`. No `[data-theme="light"]` counterpart (type is
theme-independent — none exists today either).

### 4.7 Orphaned-color tokens — **define** in the token blocks (values keep current appearance)

Add these to `:root` and, where the value differs per theme, to
`[data-theme="light"]`. **This is a representation change only — the rendered
colors stay identical** because the literal being tokenized is copied verbatim.
T1 does **not** edit the usage sites (that is deferred per §3); it only creates the
tokens.

```css
/* :root */
--surface-navbar: hsla(240, 1%, 17%, 0.75);   /* mirrors literal at :538 */
--overlay:        hsl(0, 0%, 5%);              /* mirrors literal at :734 */
--overlay-scrim:  hsla(0, 0%, 0%, 0.5);        /* mirrors literal at :1066 */

--status-success-bg:     hsla(120, 40%, 45%, 0.15);  /* :1332 */
--status-success-fg:     hsl(120, 40%, 55%);         /* :1333 */
--status-success-border: hsla(120, 40%, 45%, 0.3);   /* :1334 */
--status-error-bg:       hsla(0, 43%, 51%, 0.15);    /* :1338 */
--status-error-fg:       var(--bittersweet-shimmer); /* :1339 already uses this */
--status-error-border:   hsla(0, 43%, 51%, 0.3);     /* :1340 */

/* [data-theme="light"] */
--surface-navbar: hsla(0, 0%, 88%, 0.85);      /* mirrors literal at :566 */
```

**Scrollbar tokens** (per the §3 decision point, option 1 — T1 also applies these):

```css
/* :root */
--scrollbar-thumb:       hsla(0, 0%, 100%, 0.1);   /* :1936 */
--scrollbar-thumb-hover: hsla(0, 0%, 100%, 0.15);  /* :1942 */
--scrollbar-inset:       hsla(0, 0%, 100%, 0.11);  /* :1938-1939 inset lines */

/* [data-theme="light"] */
--scrollbar-thumb:       hsla(0, 0%, 0%, 0.15);    /* :2044 */
--scrollbar-thumb-hover: hsla(0, 0%, 0%, 0.15);    /* light hover — confirm parity target */
--scrollbar-inset:       hsla(0, 0%, 0%, 0.11);    /* :2045-2046 */
```

Then update the usage sites **that have no section owner**:
- `:1936` `background` → `var(--scrollbar-thumb)`;
  `:1938-1939` inset shadows → `var(--scrollbar-inset)`;
  `:1942` hover → `var(--scrollbar-thumb-hover)`.
- `:2044` → `var(--scrollbar-thumb)`; `:2045-2046` → `var(--scrollbar-inset)`.

> Contrast the current light `body::-webkit-scrollbar-thumb:hover` value against
> `:2043-2046` when implementing — if the existing light theme has no explicit
> hover rule, keep `--scrollbar-thumb-hover` light equal to `--scrollbar-thumb`
> light so behavior is unchanged, and note it in the PR.

### 4.8 Responsive shadow re-declarations — T1 owns (token definitions)

Update `:1819-1821` so the media-query re-declaration matches the new
`--shadow-1/2/3` from §4.5 (these three lines re-declare the token *values* inside
a breakpoint, so they are definitions, not usages):

```css
--shadow-1: 0 1px 2px  hsla(0,0%,0%,0.16);
--shadow-2: 0 2px 8px  hsla(0,0%,0%,0.18);
--shadow-3: 0 4px 16px hsla(0,0%,0%,0.20);
```

> While here, sanity-check *why* these three shadows are re-declared at this
> breakpoint (they were heavier originally). If, after flattening, the base and
> responsive values are identical, the re-declaration is dead and could be removed
> — but **removal is out of scope for T1** (it is not a token contract change);
> if you spot this, note it in the PR for a follow-up rather than deleting.

### 4.9 Radius/shadow promotion inside `#RESET` / `#REUSED STYLE` / `#MAIN` (T1's usage scope)

These are the usage-site literals T1 **is** allowed to promote (per issue #54's
scope). Apply the §4.4 radius mapping:

| Selector (approx.) | Line | Current | → |
| --- | --- | --- | --- |
| `article` | `:235` | `border-radius: 20px;` | `var(--radius-lg)` |
| icon-box outer | `:253` | `border-radius: 8px;` | `var(--radius-md)` |
| icon-box `::before` inset | `:268` | `border-radius: inherit;` | **leave `inherit`** |
| title/heading separator | `:327` | `border-radius: 3px;` | `var(--radius-sm)` |
| `.has-scrollbar::-webkit-scrollbar-track` | `:337` | `border-radius: 5px;` | `var(--radius-sm)` |
| `.has-scrollbar::-webkit-scrollbar-thumb` | `:342` | `border-radius: 5px;` | `var(--radius-sm)` |
| `.content-card` | `:352` | `border-radius: 14px;` | `var(--radius-lg)` |

Box-shadows in this section (`:237` `article`, `:352`-area `content-card`) already
use `var(--shadow-*)`, so no shadow-usage change is needed here — flattening them
happens automatically via §4.5.

> Verify the exact selectors at each line before editing (line numbers here are
> from `main`/epic tip and will drift as you insert token lines above them). Grep
> `border-radius` within `:182-389` to confirm you have the complete set and did
> not miss a literal.

---

## 5. Section-by-section edit checklist (implement stage)

1. `:root` `#CUSTOM PROPERTY` (`:18-114`): add accent group (§4.1); re-point legacy
   aliases (§4.2); redefine accent gradients (§4.3); add radius group (§4.4);
   redefine shadows (§4.5); redefine type scale (§4.6); add orphaned-color +
   scrollbar tokens (§4.7).
2. `[data-theme="light"]` (`:116-175`): add accent overrides (§4.1); **remove**
   legacy alias literals `:161-162` (§4.2); update `--bg-gradient-yellow-2` base +
   remove now-redundant gradient mirrors (§4.3); redefine shadows (§4.5); add
   `--surface-navbar` + scrollbar light overrides (§4.7).
3. `#REUSED STYLE` (`:228-375`): apply radius promotions per §4.9.
4. `#RESPONSIVE` shadow re-declaration `:1819-1821`: flatten to match (§4.8).
5. `#RESPONSIVE` scrollbar `:1936-1942` / `:2043-2046`: apply scrollbar tokens
   (§4.7, per §3 option 1).

**Do not touch:** `index.html`, `assets/js/script.js`, `404.html`, `README.md`,
images; the theme-detection scripts; any navbar/modal/portfolio/contact usage-site
color literal (those belong to #55/#56/#58/#60); the `#REDUCED MOTION` block
(#61); any keyframes; any selector rename.

---

## 6. Acceptance criteria mapping (issue #54)

- *Every token in `:root` has a mirrored declaration under `[data-theme="light"]`
  with the same name* → satisfied for **theme-varying** tokens (accent color,
  shadows, `--surface-navbar`, scrollbar). Radius and type are **single-definition
  and theme-independent** by contract (epic R1/R4) — this is intentional, not a
  gap; call it out explicitly in the PR so a reviewer does not read the missing
  light-side radius/type as an omission.
- *Shared radius and shadow values used across components resolve from tokens, not
  literals* → §4.4, §4.9 (radius), §4.5 (shadow).
- *Loading the site with only this change shifts global chrome and shared surfaces
  toward the minimal look in both themes with no flash-of-wrong-theme* → shared
  surfaces (`article`, icon-box, content-card, scrollbars, accent, shadows) change;
  pre-paint theme script untouched, so no FOWT. Verify by reload test.
- *No component color is hardcoded in the reused/reset/main sections* → §4.9 leaves
  no color literal in `#RESET`/`#REUSED STYLE`/`#MAIN`; grep to confirm.

---

## 7. Manual QA & verification (no test runner exists)

Serve locally: `python3 -m http.server 8000` from repo root, open
`http://localhost:8000/`.

1. **Both themes, default (About) view** — dark and light render the new accent
   (cool blue, not gold), flatter shadows, tighter shared radii; no gold/yellow
   remains on shared chrome.
2. **Reload test (FOWT)** — set light, reload: no dark flash before paint; repeat
   for dark. (Confirms the untouched inline script still governs first paint.)
3. **Legacy-alias consumers** — anything that used `--orange-yellow-crayola` /
   `--vegas-gold` (e.g. scrollbar thumb `:342`, heading separators) now shows the
   accent, proving the alias re-point works in both themes.
4. **Grep audits** (record output in the PR):
   - `grep -nE 'hsl|#[0-9a-fA-F]{3,6}' assets/css/style.css | sed -n '/^18[2-9]/,/^389/p'`
     — no color literal in `#RESET`/`#REUSED STYLE`/`#MAIN`.
   - `grep -n 'border-radius' assets/css/style.css` limited to `:182-389` — every
     hit is `var(--radius-*)` or `inherit`.
   - `grep -nE 'hsl\(213|hsl\(45|hsl\(40' assets/css/style.css` — the accent hue
     (`213`) appears only inside `:root`/`[data-theme="light"]`; no stray `45`/`40`
     (old gold) in shared sections.
5. **Contrast (record ratios in PR, per epic DoD)** — measure accent-on-surface,
   body text, and (once consumed) status text with WebAIM/DevTools; target WCAG
   2.1 AA (≥4.5:1 body, ≥3:1 large/UI). Accent `hsl(213,85%,42%)` on light neutral
   and `hsl(213,90%,64%)` on dark neutral should both clear 3:1 for UI/large text —
   verify.
6. **No behavior change** — click all five tabs, open/close a testimonial modal,
   run the portfolio filter, toggle theme: all unchanged (this stage touches no
   JS/DOM).

---

## 8. Risks & landmines

- **Accent hue must appear exactly once (AC1).** The most likely defect is leaving
  a light-theme literal for `--orange-yellow-crayola`/`--vegas-gold` (§4.2) or a
  stray `hsl(45…)`/`hsl(40…)` gold in a gradient. Grep guards this (§7.4).
- **Theme parity for theme-varying tokens only.** Do **not** invent a
  `[data-theme="light"]` radius/type block to "match" — the contract makes those
  single-definition (R1/R4). Adding one would be scope creep and a second source of
  truth. Document the intentional asymmetry in the PR.
- **`--bg-gradient-yellow-2` base color is per-theme** (`hsl(240,2%,13%)` dark vs
  `hsl(0,0%,91%)` light). Do not collapse it to one definition.
- **CSS is not auto-formatted** (repo formatter has no `.css` case). Match existing
  multi-line/indent style by hand; do not run a formatter that would churn the file.
- **Line numbers drift.** Inserting token lines shifts everything below; re-grep by
  selector/pattern rather than trusting the line numbers in this doc after the first
  insert.
- **Scrollbar ownership is a genuine ambiguity** (§3 decision point) — confirm
  option 1 vs 2 with the epic owner if unsure; the plan defaults to option 1 and
  flags it so a reviewer can veto.
- **Out-of-scope de-hardcoding is deferred, not forgotten.** Navbar/modal/portfolio/
  contact literals remain after T1 by design; the epic's whole-tree grep audit (AC3)
  passes cumulatively across #55–#60, not at T1.

---

## 9. Out of scope for this stage

- Any implementation of the CSS itself (this is the plan stage; the implement stage
  applies §4–§5).
- Editing `index.html`, `assets/js/script.js`, `404.html`, `README.md`, or images.
- The navbar/modal/portfolio/contact/reduced-motion usage-site conversions
  (children #55–#61).
- Renaming selectors or the legacy token names (explicitly deferred as accepted
  debt by the epic).
