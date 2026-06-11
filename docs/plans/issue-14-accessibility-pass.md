# Implementation Plan — Accessibility Pass (Issue #14)

## Summary

Five independent accessibility fixes to the static vCard portfolio, all
markup-only or small JS additions — no new dependencies, no build step, no
visual redesign:

1. **Active-page indication** — add `aria-current="page"` to the active nav
   button and keep it in sync in `script.js`.
2. **Accessible testimonial modal** — give the modal `role="dialog"` +
   `aria-modal="true"` + a label, close it on `Escape`, and trap focus while
   open (returning focus to the trigger on close).
3. **Accessible names for icon-only links** — add `aria-label` to the three
   social `<a>` links and the project "view" / quote-icon controls (overlaps
   with #9; this plan owns the markup, see [Coordination](#coordination-with-9)).
4. **Meaningful alt text** — replace the six `alt="client logo"` strings and the
   lowercase project alts with descriptive text; fix decorative images.
5. **Color-contrast verification** — measured; muted text on the dark
   background **passes WCAG AA** (5.6–6.2:1). No color change required, but two
   small follow-ups are recommended. See [Contrast findings](#5-color-contrast-verification).

Each item is independently deliverable; they can land in one PR or be split.

## Scope and Assumptions

**In scope**
- `index.html` markup edits (ARIA attributes, alt text, accessible names).
- `assets/js/script.js` additions for `aria-current` sync and modal keyboard/focus behavior.
- A small CSS focus-visible touch-up for the close button (optional, listed in Risks).

**Out of scope**
- The `data-selecct-value` typo (Gotcha #1) — unrelated, do not touch.
- The nav text-matching logic (`script.js:175`) — the `aria-current` change must
  **not** alter the button's `innerHTML`, which the matcher reads (Gotcha #2).
- `index.txt` regeneration (Gotcha #5) — content outline, nothing depends on it.
- Any new dependency, framework, or build tooling.
- Reworking the light/dark themes shipped in #4.

**Assumptions**
- Dark is the default/primary theme; contrast verification targets the dark
  palette per the issue ("muted text on the dark background"). Light-theme
  contrast is noted but not blocking.
- `'use strict'` / ES5-style vanilla JS conventions in `script.js` are preserved
  (no arrow-function refactors required, but `const`/`let` are already used there).
- Ionicons render as inline SVG; `aria-label` on the **parent interactive
  element** (the `<a>`/`<button>`), not the `<ion-icon>`, is the reliable way to
  name them. `<ion-icon>` should additionally get `aria-hidden="true"` where it
  is purely decorative inside an already-labelled control.

## Affected Areas

| File | Lines (approx.) | Change |
| --- | --- | --- |
| `index.html` | 186–202 | Add `aria-current="page"` to the initially-active About button; mark `<nav>` with `aria-label`. |
| `index.html` | 144, 150, 156 | Add `aria-label` to the 3 social `<a class="social-link">`; `aria-hidden="true"` on their `<ion-icon>`. |
| `index.html` | 433–449 | Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `tabindex="-1"`; close button `aria-label="Close testimonial"`; decorative quote `<img>` → `alt=""`. |
| `index.html` | 486–516 | Six `alt="client logo"` → distinct, descriptive alts. |
| `index.html` | 799, 817, 835, 853, 871, 889, 907, 925, 943 | Project image alts (lowercase names) → descriptive; add `aria-label` to each project `<a href="#">` (or rely on inner `<h3>` — see step 3). |
| `index.html` | 259–308 | Service-icon `<img>` decorative-vs-informative pass (`alt="design icon"` etc.). |
| `assets/js/script.js` | 19–54 | Modal: focus trap, `Escape` handler, save/restore trigger focus. |
| `assets/js/script.js` | 171–186 | Nav loop: set/remove `aria-current="page"` alongside the `active` class. |

## Implementation Steps

### 1. Nav `aria-current` (active-page indication)

**Markup** — `index.html:186`, change only the attribute, never the text:
```html
<button class="navbar-link  active" data-nav-link aria-current="page">About</button>
```
Add a landmark label to the nav element (`index.html:181`):
```html
<nav class="navbar" aria-label="Main navigation">
```

**JS** — `script.js:171–186`. The existing loop already toggles `active` on the
matching page and link. Mirror that with `aria-current`. The current loop has a
known index aliasing (`navigationLinks[i]` is updated using the *page* index `i`,
which happens to work because both lists are parallel) — preserve existing
behavior, just add the attribute on the same branches:

```js
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        navigationLinks[i].setAttribute("aria-current", "page");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
        navigationLinks[i].removeAttribute("aria-current");
      }
    }
  });
}
```
> Note: `this.innerHTML` is read for matching — do **not** change button text
> (Gotcha #2). `aria-current` is an attribute, so it does not affect `innerHTML`.

**Verify:** click each tab; exactly one `[data-nav-link]` has `aria-current="page"`
in the DOM inspector at all times.

### 2. Accessible testimonial modal

**Markup** — `index.html:433–449`:
```html
<div class="modal-container" data-modal-container>
  <div class="overlay" data-overlay></div>
  <section class="testimonials-modal" role="dialog" aria-modal="true"
           aria-labelledby="modal-title" tabindex="-1">
    <button class="modal-close-btn" data-modal-close-btn aria-label="Close testimonial">
      <ion-icon name="close-outline" aria-hidden="true"></ion-icon>
    </button>
    ...
    <img src="./assets/images/icon-quote.svg" alt="">   <!-- decorative -->
    ...
    <h4 class="h3 modal-title" id="modal-title" data-modal-title>Daniel lewis</h4>
```
- Add `id="modal-title"` to the existing `<h4 data-modal-title>` (line 453) so
  `aria-labelledby` resolves to the (dynamically updated) reviewer name.
- Quote icon (line 448) is decorative → `alt=""`.

**JS** — `script.js:19–54`. Extend `testimonialsModalFunc` into open/close with
focus management. Keep the existing class-toggle approach but make open vs close
explicit so we can move focus and bind/unbind the key handler:

```js
const modalSection = modalContainer.querySelector(".testimonials-modal");
let lastFocusedEl = null;

const getFocusable = function () {
  return modalSection.querySelectorAll(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
};

const trapFocus = function (e) {
  if (e.key === "Escape") { closeModal(); return; }
  if (e.key !== "Tab") return;
  const f = getFocusable();
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
};

const openModal = function () {
  lastFocusedEl = document.activeElement;
  modalContainer.classList.add("active");
  overlay.classList.add("active");
  document.addEventListener("keydown", trapFocus);
  modalCloseBtn.focus();
};

const closeModal = function () {
  modalContainer.classList.remove("active");
  overlay.classList.remove("active");
  document.removeEventListener("keydown", trapFocus);
  if (lastFocusedEl) lastFocusedEl.focus();
};
```
Then:
- In the testimonial-card click loop (lines 37–50), after populating the modal
  fields, call `openModal()` instead of `testimonialsModalFunc()`.
- Replace the two close bindings (lines 53–54) with `closeModal`.
- The testimonial cards (`[data-testimonials-item]`) are `<li>`/`<div>` clickable
  elements — confirm they are keyboard-operable. If they are not real buttons,
  add `tabindex="0"` + `role="button"` and a `keydown` (Enter/Space) handler, or
  (preferred) note as a follow-up. Minimum for this issue: the **modal itself**
  is fully keyboard-navigable and dismissable once open.

**Verify:** open a testimonial → focus lands on the close button; `Tab` cycles
only within the dialog; `Escape` and overlay-click both close it; focus returns
to the originating card/trigger.

### 3. Accessible names for icon-only controls

**Social links** — `index.html:144,150,156`:
```html
<a href="#" class="social-link" aria-label="Facebook">
  <ion-icon name="logo-facebook" aria-hidden="true"></ion-icon>
</a>
<!-- Twitter, Instagram likewise -->
```

**Project cards** — `index.html:791–806` (×9). Each `<a href="#">` already
contains a visible `<h3 class="project-title">` (e.g. "Finance") and category
text, so the link **already has an accessible name** from that text. The
`eye-outline` icon is decorative → add `aria-hidden="true"` to each
`<ion-icon name="eye-outline">`. Do **not** add a redundant `aria-label` that
would override the visible title. (If a reviewer prefers explicit naming, use
`aria-label="View project: Finance"`, but the no-override default is simpler and
correct.)

**Sidebar contact icons** (`mail-outline`, `phone-portrait-outline`, etc.,
lines 79–121) sit next to visible text labels → mark `aria-hidden="true"`; no
name needed.

### 4. Meaningful alt text

**Client logos** — `index.html:486–516`. Replace all six `alt="client logo"`.
Since these are placeholder/sample logos with no real brand, use distinct,
honest descriptions, e.g. `alt="Client logo 1"` … `alt="Client logo 6"` at
minimum, or the brand name if known. The key requirement: **each alt is unique
and not literally the word "client logo" repeated six times.** If the logos are
purely decorative trust-badges, an empty `alt=""` is also acceptable and arguably
better — decide per reviewer preference; recommend descriptive names.

**Project images** — `index.html:799…943`. Replace lowercase one-word alts
(`finance`, `orizon`, `fundo`, `brawlhalla`, `dsm.`, `metaspark`, `summary`,
`task manager`, `arrival`) with descriptive alts. Because each image already has
an adjacent visible `<h3>` title and category, the image is effectively
decorative within the link; recommended approach is `alt=""` to avoid the
screen-reader announcing the title twice. **Alternative** (if standalone alts are
preferred): `alt="Finance — web development project thumbnail"`. Pick one
convention and apply uniformly.

**Service/skill icons** — `index.html:259–308` (`alt="design icon"`,
`"mobile app icon"`, etc.). These sit beside visible headings ("Web design",
"Mobile apps"…) → make them decorative `alt=""` + heading carries meaning, OR
keep concise informative alts. Recommend `alt=""` since the heading is adjacent.

> Decision to confirm with reviewer: **decorative (`alt=""`) vs descriptive**
> for images that already have adjacent visible text. Recommended default:
> `alt=""` for project thumbnails + service icons (text adjacent); descriptive
> unique alts for client logos.

### 5. Color-contrast verification

**Measured (WCAG 2.1, dark theme):** muted body text uses
`--light-gray-70: hsla(0, 0%, 84%, 0.7)` (`style.css:71`) composited over the two
dark surfaces:

| Foreground | Background | Ratio | AA normal (4.5) | AA large (3.0) |
| --- | --- | --- | --- | --- |
| light-gray @0.7 | `--eerie-black-1` `hsl(240,2%,13%)` | **6.17:1** | ✅ | ✅ |
| light-gray @0.7 | `--onyx` `hsl(240,1%,17%)` | **5.60:1** | ✅ | ✅ |
| solid light-gray | eerie-black-1 | 11.16:1 | ✅ | ✅ |
| `--white-2` | eerie-black-1 | 15.49:1 | ✅ | ✅ |
| gold accent | eerie-black-1 | 12.06:1 | ✅ | ✅ |

**Finding:** muted text on the dark background **passes WCAG AA** for both
normal and large text. **No color change is required** for the dark theme.

**Recommended follow-ups (non-blocking):**
- The smallest muted text uses `--fs-8: 11px` (`style.css:89`) — passing AA but
  below AAA (7:1) on `--onyx`. If AAA is a goal, bump `--light-gray-70` alpha to
  `0.85` (≈7.8:1) or use solid `--light-gray`.
- Re-run the same check against the **light theme** muted value
  (`--light-gray-70: hsla(0,0%,30%,0.7)`, `style.css:164`) before claiming full
  coverage — not requested by this issue but worth a one-line note in the PR.

**How verification was done (reproducible):** standalone WCAG relative-luminance
computation over the composited `hsla` foreground; reproduce with browser
DevTools "Inspect → Accessibility → Contrast" on any `<p>` using
`color: var(--light-gray-70)` (e.g. `style.css:482, 505, 789, 1101, 1167`).

## Coordination with #9

Issue #9 also concerns icon-only social-link accessible names. To avoid a merge
conflict: **this PR owns the markup change** (adds `aria-label` to the three
`social-link` anchors). If #9 lands first, drop step 3's social-link sub-task and
keep only the project/modal icon work. Note the overlap in the PR description.

## Validation Strategy

No automated test suite exists (per `CLAUDE.md`). Validate manually:

1. **Static check:** open `index.html`, confirm no broken markup / duplicate IDs
   (only one `id="modal-title"`).
2. **Keyboard-only pass:** Tab through nav → each tab activatable with Enter;
   `aria-current` follows. Open a testimonial via keyboard; Tab is trapped;
   Escape closes; focus returns.
3. **Screen reader spot-check** (VoiceOver/NVDA): social links announce
   "Facebook link" etc.; project images don't double-announce; modal announces as
   a dialog with the reviewer's name.
4. **Contrast:** DevTools Accessibility pane on muted-text nodes shows ≥4.5:1.
5. **Regression:** portfolio filter (desktop buttons + mobile dropdown) still
   works; nav still switches pages (text-matching untouched); form submit button
   still gates on validity.
6. Optional: run an automated auditor (axe DevTools / Lighthouse Accessibility)
   before vs after and attach the score delta to the PR.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Changing nav button text breaks page switching (Gotcha #2). | Only attributes added; `innerHTML` untouched. Covered in step 1 note + validation #5. |
| `aria-labelledby` points at an `<h4>` whose text is rewritten on each open (`script.js:43`). | `id` is stable; only text content changes, which is exactly the desired dynamic label. Verify announce on second open. |
| Focus trap binds a global `keydown` that leaks if modal opened/closed many times. | `closeModal` removes the listener it added; open adds exactly one. Idempotent. |
| Testimonial cards may not be keyboard-focusable (they're clickable `<li>`/`<div>`). | Modal keyboard support is fully delivered; card focusability flagged as a scoped follow-up if cards aren't native buttons. |
| Over-labelling project links creates double announcements. | Default to `aria-hidden` on the eye icon + rely on visible `<h3>`; no redundant `aria-label`. |
| Decorative-vs-informative alt decision is subjective. | Default convention stated (step 4); single reviewer decision noted, applied uniformly. |
| Light-theme contrast unverified. | Explicitly scoped out; flagged as a one-line follow-up. |

## Success Criteria

- Exactly one nav button carries `aria-current="page"`, tracking the visible page.
- Testimonial modal exposes `role="dialog"` + `aria-modal="true"` + an accessible
  name, closes on Escape and overlay click, traps Tab focus, and restores focus
  to its trigger on close.
- All three social links and all icon-only interactive controls have accessible
  names; purely decorative icons are `aria-hidden`.
- No `alt="client logo"` duplicates remain; project/service images use a
  consistent, justified alt convention.
- A documented contrast measurement confirms muted dark-theme text meets WCAG AA
  (already verified at 5.6–6.2:1), with any sub-AAA cases noted.
- Existing behavior (page nav, portfolio filter, contact-form gating) is
  unregressed.
