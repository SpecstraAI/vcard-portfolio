# Issue #55 — Restyle sidebar and navbar chrome

**Type:** implementation plan (plan stage). No CSS is changed by this stage — this
document is the contract the *implement* stage follows.
**Base branch:** `epic/53-restyle-vcard-portfolio-to-a-modern-mini` (never `main`).
**Only file the implement stage may change:** `assets/css/style.css`.
**Parent:** #53 (epic). This is child **T2**, the "chrome" section child. It
depends on **T1** (#54, merged) which already defined every token this plan
consumes.

---

## 1. Goal

Convert the persistent chrome — the `#SIDEBAR` (avatar, contacts, social) and
`#NAVBAR` (tab bar + theme button) sections, plus the shared reused-style rules
they own — so all color/radius/shadow/type **resolve from the tokens T1 already
defined**, and so the minimal system reads cleanly in both themes. Because the
token values themselves already changed in T1 (cool accent, tighter radii,
flatter shadows), the chrome already inherits the new look wherever it references
a token; this stage finishes the job by replacing the remaining **literals** in
the chrome with the matching tokens and by verifying the active-tab /
`aria-current` indication and the show-contacts toggle still read and behave
correctly.

**No DOM, no JS, no behavior change.** The sidebar show/hide toggle, the nav
active state, and the theme button all keep working exactly as they do today —
this is a CSS-only, token-only pass over selectors this child owns.

---

## 2. Ownership (per epic R2 — by selector, not line range)

T2 owns the **chrome**: sidebar, navbar, main layout, and the shared reused-style
rules that primarily serve them. Only T1 may add or change token *definitions*;
this child only *consumes* tokens. Concretely, the selectors this child may edit:

- `#MAIN` — `main` (`assets/css/style.css:420`) and its responsive rules.
- `#SIDEBAR` — everything under the banner (`assets/css/style.css:434-564`) and
  its responsive rules.
- `#NAVBAR` — everything under the banner (`assets/css/style.css:574-619`) and
  its responsive rules.
- Shared reused-style rules that are consumed by the chrome and are not owned by
  any per-tab child: `.sidebar, article` (`:272`), `.separator` (`:282`),
  `.icon-box`/`.icon-box::before` (`:289`, `:304`). T1 already tokenized the
  radii here; the only residual literals are noted in §4.

> **Do not touch** the token blocks (`:18-150` dark, `:152-267` light), the
> `#ABOUT`–`#CONTACT` section rules, the testimonials modal, the portfolio
> filter, the contact form, or the scrollbar rules — those belong to T1 (defs)
> or other section children. Do not touch `index.html`, `assets/js/script.js`,
> or `404.html`.

---

## 3. Current state (grounded in the code)

Relevant tokens **already defined by T1** that this stage consumes:

| Token | Dark value | Light value | Source |
| --- | --- | --- | --- |
| `--accent` (+ `--orange-yellow-crayola` alias `= var(--accent)`) | `hsl(213,90%,64%)` | `hsl(213,85%,42%)` | `:76`, `:68` / light block |
| `--surface-navbar` | `hsla(240,1%,17%,0.75)` | `hsla(0,0%,88%,0.85)` | `:83`, `:200` |
| `--radius-sm/md/lg/pill/circle` | `4/8/12/999px/50%` | (theme-independent) | `:127-131` |
| `--shadow-1/2/5` | flattened | lighter alpha | `:137-141` |
| `--fs-2/3/6` | `20/16/13px` | (theme-independent) | `:109-113` |

The chrome markup (for orientation, **not** to be edited):

- Sidebar toggle: `[data-sidebar-btn]` click calls `elementToggleFunc(sidebar)`
  which toggles `.active` on `[data-sidebar]` (`assets/js/script.js:11-15`). CSS
  drives the expand/collapse purely off `.sidebar` / `.sidebar.active`
  `max-height` (`:434-441`, and responsive `:1527-1532`, `:2006-2014`).
- Nav active state: `activatePage` sets **both** `.active` **and**
  `aria-current="page"` on the current `[data-nav-link]`, and removes both from
  the others (`assets/js/script.js:249-261`). So `.navbar-link.active` and
  `[aria-current="page"]` are always in lockstep — styling either reflects the
  aria state. The active markup ships on the About tab
  (`index.html:220`).
- Global focus ring is already accent-colored: `:focus { outline-color:
  var(--orange-yellow-crayola); }` (`:258`) — resolves to `--accent`. This covers
  focus-visible on nav links and social icons; **leave it as-is** (switching to
  `:focus-visible` would be a behavior change and is out of scope).

### Literals still present in chrome selectors (the work)

Colors (must tokenize — epic AC1/AC3):

| Line | Rule | Current | Change to |
| --- | --- | --- | --- |
| `579` | `.navbar` `background` | `hsla(240, 1%, 17%, 0.75)` | `var(--surface-navbar)` |
| `607` | `[data-theme="light"] .navbar` `background` | `hsla(0, 0%, 88%, 0.85)` | **delete this rule** — see §4 |

`border-radius` literals (must tokenize — epic AC3), per the T1 radius mapping
(`3/4/5→sm`, `8/10→md`, `12/14/15/16/18/20→lg`, `30`/pill→pill, `50%→circle`):

| Line | Rule | Current | Change to |
| --- | --- | --- | --- |
| `453` | `.avatar-box` | `20px` | `var(--radius-lg)` |
| `471` | `.info-content .title` | `8px` | `var(--radius-md)` |
| `478` | `.info_more-btn` | `0 15px` | `0 var(--radius-lg)` |
| `582` | `.navbar` | `12px 12px 0 0` | `var(--radius-lg) var(--radius-lg) 0 0` |
| `1506` | `.icon-box` (≥580px block) | `12px` | `var(--radius-lg)` |
| `1536` | `.avatar-box` (≥580px block) | `30px` | `var(--radius-pill)` |
| `1572` | `.navbar` (≥580px block) | `20px 20px 0 0` | `var(--radius-lg) var(--radius-lg) 0 0` |
| `1886` | `.navbar` (≥1024px block) | `0 20px` | `0 var(--radius-lg)` |

`font-size` literals in chrome (R3 "express type via tokens"; convert **only
where a token matches exactly** — AC3's grep covers color + border-radius, not
type, so these are cohesion polish, not a hard gate):

| Line | Rule | Current | Change to | Note |
| --- | --- | --- | --- | --- |
| `298` | `.icon-box` | `16px` | `var(--fs-3)` | 16px = `--fs-3` |
| `479` | `.info_more-btn` | `13px` | `var(--fs-6)` | 13px = `--fs-6` (sizes the SVG icon) |
| `611` | `.theme-btn` | `20px` | `var(--fs-2)` | 20px = `--fs-2` |
| `560` | `.social-item .social-link` | `18px` | **leave as literal** | No 18px token exists; this is an icon-glyph dimension, not the type scale. Not flagged by AC3. |

---

## 4. Step-by-step changes

All edits are in `assets/css/style.css` only.

**4.1 Navbar surface → token, remove redundant light override.**
- `:579` `.navbar { background: hsla(240,1%,17%,0.75); … }` → `background:
  var(--surface-navbar);`.
- `:582` `border-radius: 12px 12px 0 0;` → `border-radius: var(--radius-lg)
  var(--radius-lg) 0 0;`.
- **Delete** `:607` `[data-theme="light"] .navbar { background: hsla(0,0%,88%,0.85); }`
  entirely. Rationale: once `.navbar` reads `var(--surface-navbar)`, the token is
  already theme-aware (dark `:83`, light `:200`), so the manual light override is
  dead — keeping it would be a second, parallel source of truth for the same
  value, which the epic explicitly reconciles. Removing it is the correct
  simplification, not a scope creep. Verify the light navbar still renders the
  same translucent surface after removal.

**4.2 Sidebar radius literals → tokens.**
- `:453` `.avatar-box` `20px` → `var(--radius-lg)`.
- `:471` `.info-content .title` `8px` → `var(--radius-md)`.
- `:478` `.info_more-btn` `0 15px` → `0 var(--radius-lg)` (keep the directional
  two-value form — top-left `0`, the corner that visually anchors the button to
  the card corner stays `0`).

**4.3 Shared reused-style / icon-box residuals.**
- `:298` `.icon-box` `font-size: 16px` → `var(--fs-3)`.
- `:1506` `.icon-box` (≥580px) `border-radius: 12px` → `var(--radius-lg)`.
- (These serve the sidebar contact icons; `.icon-box` color/shadow/base radius
  were already tokenized by T1 at `:294`, `:299`, `:300`.)

**4.4 Navbar/theme-button + sidebar type residuals.**
- `:479` `.info_more-btn` `font-size: 13px` → `var(--fs-6)`.
- `:611` `.theme-btn` `font-size: 20px` → `var(--fs-2)`.
- Leave `:560` `.social-item .social-link` `font-size: 18px` as-is (no matching
  token; see §3 table).

**4.5 Responsive radius literals → tokens.**
- `:1536` `.avatar-box` `30px` → `var(--radius-pill)`.
- `:1572` `.navbar` `20px 20px 0 0` → `var(--radius-lg) var(--radius-lg) 0 0`.
- `:1886` `.navbar` `0 20px` → `0 var(--radius-lg)`.

**4.6 Active-tab / aria-current — verify, keep as-is unless it fails QA.**
- `:605` `.navbar-link.active { color: var(--orange-yellow-crayola); }` already
  colors the active tab with the (now cool) accent via the alias, and JS keeps
  `.active` in lockstep with `aria-current="page"` (§3), so aria-current is
  already reflected. **Preferred: leave the selector and alias unchanged** — the
  epic retains legacy aliases and defers renames, and the active tab already
  reads as accent. Do **not** add new selectors or DOM.
- Only if manual QA finds the accent-vs-idle contrast on the tab bar reads too
  faintly against `--surface-navbar` in *either* theme (measure it — epic AC8
  wants ≥3:1 for UI state), strengthen it **using tokens already available**,
  e.g. swap the active color to `var(--accent-strong)` (defined by T1, `:77`/light
  block) which is a pure token change, no new literal, no DOM. Record the measured
  ratio in the PR description regardless of whether you change it.

**4.7 Spacing / surface polish — token-only, minimal, optional.**
The sidebar/navbar spacing (`padding`, `gap`, `margin`) and structural widths are
layout numbers and are **exempt** from tokenization (epic §Scope). Do not churn
them unless a specific QA regression demands it. If the minimal system calls for a
touch more breathing room, adjust only the spacing that visibly reads as cramped,
keep it consistent with the ≥580/≥768/≥1024/≥1250 responsive steps, and never
introduce a color/radius/shadow literal to do it.

---

## 5. What must NOT change (guardrails)

- **Behavior:** sidebar `max-height` expand/collapse values (`:441` 405px,
  `:1532` 584px, `:2009` `max-content`) and the `.sidebar-info_more` opacity/
  visibility transition (`:506-515`) are the show-contacts mechanism — leave the
  numbers and the `transition` refs (`--transition-2`) untouched.
- **Motion:** reuse existing `--transition-1/2` only; add **no** new keyframes and
  **no** new transform-based hover effects (epic R3) so the `#REDUCED MOTION`
  block (`:2058+`, owned by T7) stays complete without a per-section override.
- **DOM/JS/theme logic:** `index.html`, `assets/js/script.js`, the inline
  pre-paint theme script, and `applyTheme` are all out of scope.
- **Tokens:** do not add or redefine any custom property — that is T1's
  ownership. This child only references existing tokens.
- **Other sections & scrollbar:** don't edit `.has-scrollbar`, modal, filter,
  form, or any `#ABOUT`–`#CONTACT` rule.

---

## 6. Acceptance criteria mapping (from issue #55)

| Issue AC | How this plan satisfies it |
| --- | --- |
| Sidebar & navbar match the minimal system in both themes | §4 tokenizes every chrome color/radius so they inherit T1's cool accent, tighter radii, flatter shadows in both themes (tokens are theme-aware). |
| Active nav tab clearly indicated; aria-current visible | §4.6 — active tab colored by accent (`.active`), which JS keeps in lockstep with `aria-current="page"`; measured against AA UI-state contrast, strengthened to `--accent-strong` only if needed. |
| Sidebar show-contacts toggle unchanged | §5 — no edits to `.sidebar`/`.sidebar.active` `max-height` or `.sidebar-info_more`; JS untouched. |
| No hardcoded colors introduced; values from tokens | §4.1/§4.2/§4.5 replace the residual color + radius literals; §5 forbids new literals. |

Epic-level: satisfies **AC1/AC3** for the chrome selectors (removes the
`--surface-navbar` literals at `:579`/`:607` and the chrome `border-radius`
literals), **AC4** (responsive radius rules converted, no layout number changed),
**AC6** (no behavior change), **AC7** (no new motion).

---

## 7. Verification (manual browser QA — no test runner exists)

Serve with `python3 -m http.server 8000` from repo root, open
`http://localhost:8000/`.

1. **Grep gate (chrome subset of AC1/AC3):** after the edit, confirm no
   `hsl(`/`hsla(` and no raw `border-radius:` numeric literal remains in the
   `#SIDEBAR`/`#NAVBAR`/reused-style rules this child owns (token blocks
   `:18-267` are exempt). Expected: the eight radius rows and the two navbar
   color rows in §3 all now read `var(--…)`, and `:607` is gone.
2. **Toggle:** at ≤580px, click the "Show Contacts" chevron — the sidebar must
   expand to reveal contacts/social and collapse again, identical to `main`.
3. **Active tab:** click through all five tabs (About→Resume→Portfolio→Blog→
   Contact); the active `.navbar-link` shows the accent color and only one tab is
   active at a time. Inspect the active link in DevTools → Accessibility and
   confirm `aria-current="page"` is present and its color contrast vs the navbar
   surface is ≥3:1 in **both** themes; record the ratio in the PR.
4. **Themes:** toggle the theme button; verify the navbar translucent surface,
   sidebar card, avatar radius, contact icon boxes, and active tab all read
   correctly in light and dark (no flash, no wrong-theme surface).
5. **Focus:** Tab through nav links, theme button, and social icons — the
   accent focus outline (`:258`) must be visible on each.
6. **Responsive:** check 375 / 768 / 1024 / 1440px — navbar corner radii, the
   ≥1024px right-aligned vertical navbar (`0 var(--radius-lg)`), and the ≥1250px
   sticky sidebar layout must match `main` with the new (tighter) radii and no
   layout shift.
7. **Reduced motion:** DevTools → Emulate `prefers-reduced-motion: reduce`;
   confirm the sidebar slide and tab fades are neutralized as before (no new
   motion introduced).

Attach before/after screenshots (dark + light) at 375/768/1024/1440px to the
implement-stage PR, per the epic DoD.

---

## 8. Risk / rollback

CSS-only, single file, independently revertable (GitHub Pages static deploy).
The one non-mechanical decision is deleting the redundant light-navbar override
(§4.1) — verified safe because `--surface-navbar` already carries the light value
T1 set. Rollback = revert the section child's PR; the site still renders on T1's
tokens.
