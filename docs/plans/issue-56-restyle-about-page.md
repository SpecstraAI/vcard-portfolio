# Issue #56 — Restyle About page

**Type:** implementation plan (plan stage). No CSS is changed by this stage — this
document is the contract the *implement* stage follows.
**Base branch:** `epic/53-restyle-vcard-portfolio-to-a-modern-mini` (never `main`).
**Only file the implement stage may change:** `assets/css/style.css`.
**Parent:** #53 (epic). This is child **T3**, the About section child. It depends
on **T1** (#54, merged) which already defined every token this plan consumes, and
follows **T2** (#55, merged) which restyled the chrome using the same pattern.

---

## 1. Goal

Convert the `#ABOUT` section — the intro text, the **services** cards, the
**testimonials** cards + modal, and the **clients** strip — so all
color/radius/shadow/type **resolve from the tokens T1 already defined**, and so
the section reads as one cohesive modern-minimal system in both themes. Because
the token values themselves already changed in T1 (cool accent, tighter radii,
flatter shadows), every About surface that already references a token inherits
the new look for free; this stage finishes the job by replacing the remaining
**literals** in About-owned selectors with the matching tokens, and by verifying
the testimonials modal (role=dialog, focus trap, focus restore) keeps its markup
and behavior with the refreshed minimal styling.

**No DOM, no JS, no behavior change.** The testimonials modal open/close, its Tab
focus trap, Escape/overlay-click close, and focus-restore-to-trigger all keep
working exactly as they do today (they live entirely in `assets/js/script.js` and
`index.html`, both out of scope) — this is a CSS-only, token-only pass over
selectors this child owns.

---

## 2. Ownership (per epic R2 — by selector, not line range)

T3 owns the **About** section: the `#ABOUT` banner rules (`assets/css/style.css:624`)
and their counterparts in the `#RESPONSIVE › #ABOUT` block
(`assets/css/style.css:1579`). Only T1 may add or change token *definitions*; this
child only *consumes* tokens. Concretely, the selectors this child may edit:

- **Intro text:** `.about .article-title`, `.about-text`, `.about-text p`
  (`:627-636`).
- **Services:** `.service*` — `.service`, `.service-title`, `.service-list`,
  `.service-item`, `.service-item::before`, `.service-icon-box`,
  `.service-content-box`, `.service-item-title`, `.service-item-text`
  (`:644-685`) and their responsive rules (`:1588-1601`).
- **Testimonials:** `.testimonials*` — list, item, avatar-box, title, text
  (`:692-737`) and their responsive rules (`:1605-1634`).
- **Testimonials modal:** `.modal-container`, `.overlay`, `.testimonials-modal`,
  `.modal-close-btn`, `.modal-avatar-box`, `.modal-img-wrapper`, `.modal-title`,
  `.modal-content *` (`:744-850`) and their responsive rules (`:1636-1666`).
- **Clients:** `.clients*` — `.clients`, `.clients-list`, `.clients-item`,
  `.clients-item img` (`:857-885`) and their responsive rules (`:1670-1677`).
- **Shared reused-style `.content-card` / `.content-card::before`** (`:388-410`):
  this rule exists in `#REUSED STYLE` but is consumed **only** by the About
  testimonials cards (`index.html:371,393,415,437`, each a
  `button.content-card[data-testimonials-item]`). T1 already tokenized its radius
  (`--radius-lg`, `:393`) and shadow (`--shadow-2`, `:394`); no residual literal
  remains, so this child does not need to edit it — but it is noted here as an
  About-consumed surface for QA orientation.

> **Do not touch** the token blocks (`:18-150` dark, `:152-216` light), the
> `#RESUME`–`#CONTACT` section rules, the sidebar/navbar chrome (T2), the
> portfolio filter, the contact form, the scrollbar rules, or the `#REDUCED
> MOTION` block (T7). Do not touch `index.html`, `assets/js/script.js`, or
> `404.html`.

---

## 3. Current state (grounded in the code)

Relevant tokens **already defined by T1** that this stage consumes:

| Token | Dark value | Light value | Source |
| --- | --- | --- | --- |
| `--radius-md` | `8px` | (theme-independent) | `:128` |
| `--radius-lg` | `12px` | (theme-independent) | `:129` |
| `--overlay` | `hsl(0,0%,5%)` | (no light override — intentionally dark in both) | `:84` |
| `--shadow-1/2/5` | flattened | lighter alpha | `:137/138/141`, `:210/211/214` |
| `--bg-gradient-onyx`, `--bg-gradient-jet`, `--border-gradient-onyx` | neutral grayscale gradients | light counterparts | `:26-50`, `:156-175` |

**The About surfaces already read from tokens for almost everything.** The
services card (`--border-gradient-onyx` border + `--bg-gradient-jet` inset +
`--shadow-2`), the testimonials avatar/card (`--bg-gradient-onyx`, `--shadow-1`),
and the modal (`--eerie-black-2`, `--jet`, `--onyx`, `--white-2`, `--light-gray`,
`--light-gray-70`, `--shadow-5/2`) all reference theme-aware tokens — so they
already inherit T1's flatter shadows and cool palette in both themes. The
"gradient/card identity" the issue calls out is these **neutral** grayscale
gradients; the epic keeps them (they are not the gold accent, and removing or
restructuring them is out of scope). What still reads as un-minimal is purely the
**radius literals** (14/18/20px corners, larger than the new `--radius-lg: 12px`
scale) and one **color literal** in the overlay — that is the work.

The modal markup (for orientation, **not** to be edited):

- `[data-modal-container]` is `role="dialog" aria-modal="true"
  aria-labelledby="modal-label"` (`index.html:467`). Open/close toggles `.active`
  on it (`assets/js/script.js:34-35`); `.overlay.active` /
  `.modal-container.active .testimonials-modal` drive the fade/zoom (`:781-804`).
- Focus management is JS: on open, focus moves to `[data-modal-close-btn]`; on
  close, focus restores to the stored `lastFocusedTrigger`
  (`assets/js/script.js:30,38-41,55`). Tab is trapped inside the container and
  Escape closes it (`assets/js/script.js:66-99`). **None of this is CSS** — it is
  unaffected by this stage.
- The modal focus ring is already accent-colored via the global
  `:focus { outline-color: var(--orange-yellow-crayola); }` (`:258`, resolves to
  `--accent`). Leave it as-is (switching to `:focus-visible` would be a behavior
  change and is out of scope).

### Literals still present in About selectors (the work)

Colors (must tokenize — epic AC1/AC3):

| Line | Rule | Current | Change to |
| --- | --- | --- | --- |
| `773` | `.overlay` `background` | `hsl(0, 0%, 5%)` | `var(--overlay)` |

`border-radius` literals (must tokenize — epic AC3), per the T1 radius mapping
(`3/4/5→sm`, `8/10→md`, `12/14/15/16/18/20→lg`, `30`/pill→pill, `50%→circle`):

| Line | Rule | Current | Change to |
| --- | --- | --- | --- |
| `658` | `.service-item` | `14px` | `var(--radius-lg)` |
| `721` | `.testimonials-avatar-box` | `14px` | `var(--radius-lg)` |
| `793` | `.testimonials-modal` | `14px` | `var(--radius-lg)` |
| `811` | `.modal-close-btn` | `8px` | `var(--radius-md)` |
| `829` | `.modal-avatar-box` | `14px` | `var(--radius-lg)` |
| `1621` | `.testimonials-avatar-box` (≥768px block) | `20px` | `var(--radius-lg)` |
| `1646` | `.testimonials-modal` (≥768px block) | `20px` | `var(--radius-lg)` |
| `1656` | `.modal-avatar-box` (≥768px block) | `18px` | `var(--radius-lg)` |

`font-size` literal in About (R3 "express type via tokens"; convert **only where a
token matches exactly**):

| Line | Rule | Current | Change to | Note |
| --- | --- | --- | --- | --- |
| `818` | `.modal-close-btn` | `18px` | **leave as literal** | No 18px token exists; this sizes the close-X ion-icon glyph, not the type scale. Not flagged by AC3 (which covers color + border-radius). Same precedent as T2's `.social-link` 18px (`docs/plans/issue-55-…:117`). |

All other About type sizes already read from tokens (`--fs-6` throughout the
text/service/testimonials/modal copy).

---

## 4. Step-by-step changes

All edits are in `assets/css/style.css` only. Every change is a
literal→`var(--token)` substitution — no value changes appearance except by way of
the (already-approved) T1 token values.

**4.1 Modal overlay color → token.**
- `:773` `.overlay { background: hsl(0, 0%, 5%); … }` → `background:
  var(--overlay);`. This is the last color literal in the About section and the
  exact literal T1 defined `--overlay` to replace. Opacity stays driven by
  `.overlay` (`0`) / `.overlay.active` (`0.8`) — do not touch those.

**4.2 Services + testimonials base radii → tokens.**
- `:658` `.service-item` `14px` → `var(--radius-lg)`.
- `:721` `.testimonials-avatar-box` `14px` → `var(--radius-lg)`.

**4.3 Modal base radii → tokens.**
- `:793` `.testimonials-modal` `14px` → `var(--radius-lg)`.
- `:811` `.modal-close-btn` `8px` → `var(--radius-md)`.
- `:829` `.modal-avatar-box` `14px` → `var(--radius-lg)`.

**4.4 Responsive (≥768px) radii → tokens.**
- `:1621` `.testimonials-avatar-box` `20px` → `var(--radius-lg)`.
- `:1646` `.testimonials-modal` `20px` → `var(--radius-lg)`.
- `:1656` `.modal-avatar-box` `18px` → `var(--radius-lg)`.

**4.5 Leave the modal close-btn font-size as a literal.**
- `:818` `.modal-close-btn { font-size: 18px; }` stays — no matching token (see
  §3 table).

**4.6 Spacing / surface polish — token-only, minimal, optional.**
The About spacing (`padding`, `gap`, `margin`), the scroll-snap carousel numbers
(`.testimonials-list`, `.clients-list` overflow/scroll rules), the
`translate(15px,-25px)` avatar offset, and structural widths (`min-width`,
`calc(33.33% - 35px)`) are layout numbers and are **exempt** from tokenization
(epic §Scope). Do not churn them unless a specific QA regression demands it. If the
minimal system reads cramped anywhere, adjust only the spacing that visibly reads
as tight, keep it consistent with the ≥768px responsive step, and never introduce
a color/radius/shadow literal to do it.

---

## 5. What must NOT change (guardrails)

- **Modal behavior:** the open/close toggle (`.active`), the Tab focus trap,
  Escape/overlay-click close, and focus-restore-to-trigger are all JS
  (`assets/js/script.js:30-99`) and markup (`index.html:467-500`) — **out of
  scope, untouched.** Do not alter `.modal-container.active`,
  `.overlay.active`, or `.modal-container.active .testimonials-modal` selectors'
  behavior; you may only change the `border-radius`/`background` *values* inside
  the base rules as listed in §4.
- **Motion:** the modal zoom (`transform: scale(1.2)`→`scale(1)`, `:795-804`) and
  its reduced-motion override (`.testimonials-modal, .modal-container.active
  .testimonials-modal { transform: none; }`, `:2124-2127`, owned by T7) stay as
  they are. Reuse existing `--transition-1/2` only; add **no** new keyframes and
  **no** new transform-based hover effects (epic R3) so the `#REDUCED MOTION`
  block stays complete without a per-section override.
- **The clients grayscale hover** (`.clients-item img:hover { filter:
  grayscale(0); }`, `:885`) is an existing filter transition, not motion and not a
  color literal — leave it exactly as-is.
- **Neutral card gradients** (`--border-gradient-onyx`, `--bg-gradient-jet`,
  `--bg-gradient-onyx`) are kept — do not flatten cards to solid fills or remove
  the `::before` inset layers. The epic keeps these neutral gradients; "minimal"
  here is delivered by T1's flatter shadows + this stage's tighter radii, not by
  restructuring the card composition.
- **DOM/JS/theme logic:** `index.html`, `assets/js/script.js`, the inline
  pre-paint theme script, and `applyTheme` are all out of scope.
- **Tokens:** do not add or redefine any custom property — that is T1's
  ownership. This child only references existing tokens.
- **Other sections:** don't edit `#RESUME`–`#CONTACT`, chrome, scrollbar, filter,
  or form rules.

---

## 6. Acceptance criteria mapping (from issue #56)

| Issue AC | How this plan satisfies it |
| --- | --- |
| About services, testimonials, and clients match the minimal system in both themes | §4 tokenizes every remaining About radius so cards/avatars/modal inherit T1's tighter `--radius-lg/md`; backgrounds/shadows already read theme-aware tokens (§3), so all three surfaces render the flat, cool minimal look in dark and light. |
| Testimonials modal opens, traps Tab focus, closes on Escape/overlay, restores focus | §5 — modal behavior is JS/markup and is untouched; only the modal's `border-radius`/overlay `background` values change, verified by the QA script in §7 (keyboard + mouse open/close, focus trap, focus restore). |
| Modal dialog styling meets AA contrast | §7 records measured ratios for the modal title/body/time text on `--eerie-black-2`, and the close-button glyph, in both themes (epic AC8: ≥4.5:1 body, ≥3:1 large/UI). Values already read from `--white-2`/`--light-gray`/`--light-gray-70` tokens set by T1. |
| No hardcoded colors introduced | §4.1 replaces the one remaining color literal (`.overlay`) with `var(--overlay)`; §5 forbids new literals; radius conversions add no color. |

Epic-level: satisfies **AC1/AC3** for the About selectors (removes the `.overlay`
color literal and the eight `border-radius` literals), **AC4** (responsive radius
rules converted, no layout number changed), **AC6** (modal + no behavior change),
**AC7** (no new motion; T7's modal override untouched), **AC8** (contrast measured
in the PR).

---

## 7. Verification (manual browser QA — no test runner exists)

Serve with `python3 -m http.server 8000` from repo root, open
`http://localhost:8000/` (the About tab is the default/active view,
`index.html:258`).

1. **Grep gate (About subset of AC1/AC3):** after the edit, confirm no `hsl(` /
   `hsla(` and no raw `border-radius:` numeric literal remains in the About-owned
   rules (`:627-885` base and `:1582-1677` responsive; token blocks `:18-216`
   exempt). Expected: the eight radius rows and the one overlay color row in §3
   all now read `var(--…)`; only the intentional `font-size: 18px` literal at
   `:818` remains.
2. **Services:** the three-ish service cards render with the tighter 12px corners,
   flat T1 shadow, neutral onyx border-gradient + jet inset intact, centered
   (mobile) / left-aligned (≥768px) layout unchanged.
3. **Testimonials carousel:** horizontal scroll-snap still works; each
   `.content-card` shows the offset avatar box (now 12px corners) and clamped
   text (4 lines mobile / 2 lines ≥768px).
4. **Testimonials modal — behavior (the critical AC):**
   - Click a testimonial card → modal opens, focus lands on the close button.
   - Press **Tab** repeatedly → focus stays trapped inside the dialog
     (close-btn ↔ any focusable), never escaping to the page behind.
   - Press **Escape** → modal closes and focus **restores to the card you
     clicked**. Re-open, then **click the dark overlay** → closes and restores
     focus the same way. Re-open, then **click the ✕** → same.
   - Confirm the modal card now has the tighter 12px radius (18px on the avatar →
     12px), the overlay still dims the page (`var(--overlay)` at 0.8 opacity),
     and the zoom-in on open still plays.
5. **Clients strip:** grayscale logos still colorize on hover; scroll-snap intact.
6. **Themes:** toggle the theme button; verify service cards, testimonials cards,
   the modal surface/border/close-button, and the clients strip all read
   correctly in light and dark (no flash, no wrong-theme surface, no lost
   border).
7. **AA contrast (epic AC8):** with the modal open, use DevTools → Inspect →
   Accessibility → Contrast (or WebAIM) to measure, in **both** themes:
   modal title (`--white-2` on `--eerie-black-2`), body copy + `time`
   (`--light-gray` / `--light-gray-70` on `--eerie-black-2`), and the close-button
   glyph (`--white-2` on `--onyx`). Record the ratios in the PR description
   (target ≥4.5:1 body / ≥3:1 large/UI).
8. **Responsive:** check 375 / 768 / 1024 / 1440px — service card layout switch at
   768px, testimonials offset avatar, modal two-column layout at ≥768px, and the
   clients `calc(33.33% - 35px)` sizing must match `main` with the new (tighter)
   radii and no layout shift.
9. **Reduced motion:** DevTools → Emulate `prefers-reduced-motion: reduce`;
   confirm the modal opens without the zoom (fade only) and the carousels don't
   smooth-scroll — i.e. T7's existing overrides still cover About unchanged.

Attach before/after screenshots (dark + light) at 375/768/1024/1440px — including
at least one with the modal open — to the implement-stage PR, per the epic DoD.

---

## 8. Risk / rollback

CSS-only, single file, purely mechanical literal→token substitutions (one color,
eight radii). There is **no non-mechanical decision** in this stage — every target
token was defined by T1 to hold the exact current appearance, so the only visible
delta is the intended tighter corners and (already-shipped) flatter shadows. The
highest-value QA is confirming the modal's JS-driven focus trap / restore still
works after the radius/overlay value changes (§7.4); the CSS changes cannot affect
that logic, but it is the issue's headline acceptance criterion and must be
exercised. Rollback = revert the section child's PR; the site still renders on
T1's tokens.
