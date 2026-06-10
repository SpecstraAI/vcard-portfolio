# Implementation Plan — Light/Dark Theme Toggle (Issue #4)

## Summary

Add a sun/moon toggle to the vCard portfolio that switches between the existing
dark theme and a new, hand-authored light theme. The active theme is resolved
**before first paint** (no flash), respects the OS `prefers-color-scheme` on a
first visit, and persists the user's explicit choice in `localStorage` across
reloads.

The implementation is purely additive and dependency-free:

- A `[data-theme="light"]` block in `assets/css/style.css` re-declares the color
  custom properties (dark stays the default in `:root`, so every existing rule is
  untouched).
- A handful of currently **hardcoded** colors that live outside `:root` are
  promoted to variables so they participate in theming (this is the main
  correctness landmine — see [Affected Areas](#affected-areas)).
- A blocking inline `<script>` in `<head>` sets `data-theme` on `<html>` synchronously.
- A toggle `<button data-theme-btn>` is added inside `.navbar`, and `script.js`
  wires the click to flip the theme, swap the icon, and write `localStorage`.

The center of gravity is **authoring a coherent light palette** — the existing
design *is* the dark theme, so light values must be hand-tuned (especially the
gold accent and the semi-transparent overlays), not mechanically inverted.

## Scope and Assumptions

**In scope**
- New light palette under `[data-theme="light"]`.
- Darkened gold accent for light mode legibility.
- Sun/moon toggle button in the navbar (desktop top-right, mobile bottom bar).
- Flash-free initial theme resolution (`localStorage` → `prefers-color-scheme` → dark).
- JS wiring to toggle, swap icon, and persist.

**Out of scope** (per issue Technical Notes)
- Changing navigation/text-matching logic (`script.js:148`).
- Touching the `data-selecct-value` typo.
- Updating `index.txt`.
- Adding a build step or any new dependency. Use plain CSS variables + existing
  Ionicons for the glyphs.

**Assumptions**
- Dark remains the default theme (matches current design and the issue's
  "dark default" fallback). `:root` is treated as the dark theme; we do **not**
  introduce a `[data-theme="dark"]` block — absence of `light` = dark.
- The toggle button text/glyph is icon-only (`<ion-icon>`), so it will **not**
  collide with the nav's `innerHTML.toLowerCase()` text-matching loop (it is not a
  `[data-nav-link]`, so the loop in `script.js:144` never sees it).
- localStorage key: `theme`, values `"light"` / `"dark"`.
- Ionicons glyph names: `sunny-outline` (shown in dark mode, "switch to light")
  and `moon-outline` (shown in light mode, "switch to dark"). Exact glyph choice
  is cosmetic and may be adjusted at implementation time.

## Affected Areas

| File | Change |
| --- | --- |
| `index.html` (`<head>`, ~line 18) | Add blocking inline `<script>` to set `data-theme` before `style.css` paints. Must come **before** `<link rel="stylesheet" href="./assets/css/style.css">` at line 18, or at least before the body renders. |
| `index.html` (`.navbar`, lines 173–199) | Add `<li>` + `<button class="navbar-theme-btn" data-theme-btn>` with an `<ion-icon>` inside the existing `.navbar-list`. |
| `assets/css/style.css` (`:root`, lines 18–112) | Promote hardcoded overlay colors to new variables (see below). |
| `assets/css/style.css` (new block) | Add `[data-theme="light"] { … }` overriding every color variable. |
| `assets/css/style.css` (navbar rules 457–488, 1737–1754) | Add `.navbar-theme-btn` styling for both breakpoints. |
| `assets/js/script.js` (end of file, after line 159) | Add theme-toggle variables + click listener following the `[data-*]` convention. |

### Hardcoded colors that must be promoted to variables (the landmine)

Overriding `:root` variables alone will leave these dark because they use literal
`hsl()`/`hsla()` values **not** routed through a variable. Each must be replaced
with a `var(--…)` reference, the variable defined in `:root` (dark value), and
re-declared in `[data-theme="light"]`:

| Location | Current literal | Purpose | New variable (suggested) |
| --- | --- | --- | --- |
| `style.css:462` | `hsla(240, 1%, 17%, 0.75)` | navbar translucent bg | `--navbar-bg` |
| `style.css:644` | `hsl(0, 0%, 5%)` | modal/sidebar overlay bg | `--overlay-bg` |
| `style.css:1815` | `hsla(0, 0%, 100%, 0.1)` | desktop scrollbar thumb | `--scrollbar-thumb` |
| `style.css:1817–1818` | `hsla(0, 0%, 100%, 0.11)` ×2 | scrollbar thumb inset shadow | `--scrollbar-thumb-shadow` |
| `style.css:1821` | `hsla(0, 0%, 100%, 0.15)` | scrollbar thumb hover | `--scrollbar-thumb-hover` |

Leave these literals as-is (do **not** need theming):
- `style.css:933` `--eerie-black-2: hsl(240, 2%, 20%)` — a local variable override
  on select-item hover; it re-points an already-themed variable, so it follows the
  theme automatically. Verify it still looks right in light mode; adjust only if
  it reads wrong.
- `style.css:977` `hsla(0, 0%, 0%, 0.5)` — a darkening scrim over project
  thumbnails on hover; intentional in both themes.
- `style.css:1700–1702` shadow overrides — shadow opacity, theme-neutral.

> If the implementer prefers minimal churn, an acceptable alternative for the
> scrollbar is to scope a single rule under `[data-theme="light"] body::-webkit-scrollbar-thumb { … }`
> rather than introducing variables. The variable approach is preferred for
> consistency; either satisfies acceptance criterion (4).

## Implementation Steps

### Step 1 — Promote hardcoded overlay colors to variables (`style.css`)
1. In the `:root` block (after the existing `/* solid */` group, ~line 70), add
   the dark-theme values for the new variables:
   ```css
   /* themed surfaces (dark defaults) */
   --navbar-bg: hsla(240, 1%, 17%, 0.75);
   --overlay-bg: hsl(0, 0%, 5%);
   --scrollbar-thumb: hsla(0, 0%, 100%, 0.1);
   --scrollbar-thumb-shadow: hsla(0, 0%, 100%, 0.11);
   --scrollbar-thumb-hover: hsla(0, 0%, 100%, 0.15);
   ```
2. Replace the literals at lines 462, 644, 1815, 1817–1818, 1821 with the
   corresponding `var(--…)`. Example for line 462:
   `background: var(--navbar-bg);`
3. Confirm the site still renders **identically** in dark mode (this step is a
   pure refactor — no visual change yet).

### Step 2 — Author the light palette (`style.css`)
Add a new block immediately after the `:root` block closes (after line 112), so it
has equal specificity but wins via source order when `data-theme="light"` is set:

```css
[data-theme="light"] {
  /* gradients */
  --bg-gradient-onyx: linear-gradient(to bottom right, hsl(0,0%,96%) 3%, hsl(0,0%,90%) 97%);
  --bg-gradient-jet:  linear-gradient(to bottom right, hsla(0,0%,100%,0.5) 0%, hsla(0,0%,100%,0) 100%), hsl(0,0%,98%);
  --bg-gradient-yellow-1: linear-gradient(to bottom right, hsl(45,90%,55%) 0%, hsla(36,90%,55%,0) 50%);
  --bg-gradient-yellow-2: linear-gradient(135deg, hsla(45,90%,55%,0.2) 0%, hsla(35,90%,55%,0) 59.86%), hsl(0,0%,98%);
  --border-gradient-onyx: linear-gradient(to bottom right, hsl(0,0%,80%) 0%, hsla(0,0%,80%,0) 50%);
  --text-gradient-yellow: linear-gradient(to right, hsl(38,90%,45%), hsl(30,90%,42%));

  /* solids */
  --jet: hsl(0,0%,88%);
  --onyx: hsl(0,0%,94%);
  --eerie-black-1: hsl(0,0%,98%);   /* surfaces */
  --eerie-black-2: hsl(0,0%,96%);
  --smoky-black: hsl(0,0%,92%);     /* page bg */
  --white-1: hsl(0,0%,12%);         /* primary text (now dark) */
  --white-2: hsl(0,0%,20%);         /* secondary text */
  --orange-yellow-crayola: hsl(38,92%,42%); /* darkened gold — legible on light */
  --vegas-gold: hsl(38,60%,45%);
  --light-gray: hsl(0,0%,30%);
  --light-gray-70: hsla(0,0%,30%,0.7);
  --bittersweet-shimmer: hsl(0,55%,48%);

  /* themed surfaces */
  --navbar-bg: hsla(0,0%,100%,0.75);
  --overlay-bg: hsl(0,0%,40%);
  --scrollbar-thumb: hsla(0,0%,0%,0.18);
  --scrollbar-thumb-shadow: hsla(0,0%,0%,0.06);
  --scrollbar-thumb-hover: hsla(0,0%,0%,0.28);

  /* shadows — soften for light bg */
  --shadow-1: -4px 8px 24px hsla(0,0%,0%,0.1);
  --shadow-2: 0 16px 30px hsla(0,0%,0%,0.1);
  --shadow-3: 0 16px 40px hsla(0,0%,0%,0.1);
  --shadow-4: 0 25px 50px hsla(0,0%,0%,0.08);
  --shadow-5: 0 24px 80px hsla(0,0%,0%,0.1);
}
```

**Notes for the implementer:**
- The `--white-*` variables are used as **text** colors throughout, so in light
  mode they must become *dark* values — do not literally set them to white.
- `--smoky-black` is the page background (`body`, `style.css:158`) → light gray.
- `--eerie-black-1/2` are card/surface backgrounds → near-white.
- The two `--bg-gradient-yellow-*` gradients are decorative accents (e.g. avatar
  box, active states); the values above are a starting point — tune visually.
- These hex/HSL values are a **calibrated starting palette**, not gospel. The
  acceptance bar is "looks intentionally designed" + sufficient contrast; the
  implementer should eyeball each section and adjust. Aim for WCAG AA (≥4.5:1)
  on body text.

### Step 3 — Flash-prevention inline script (`index.html` `<head>`)
Insert **before** the stylesheet `<link>` at line 18 (placing it right after the
`<title>` is fine, as long as it precedes the stylesheet):

```html
<script>
  (function () {
    try {
      var stored = localStorage.getItem('theme');
      var theme = stored
        || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
</script>
```
- Runs synchronously, so `data-theme` is on `<html>` before `style.css` is
  fetched/applied → no flash, even on hard refresh.
- `try/catch` guards against `localStorage` being unavailable (private mode).
- Always sets an explicit attribute (even `"dark"`) so the JS toggle has a known
  starting state to read.

### Step 4 — Add the toggle button (`index.html` navbar)
Inside `.navbar-list` (lines 175–197), add as the last item:

```html
<li class="navbar-item">
  <button class="navbar-link navbar-theme-btn" data-theme-btn aria-label="Toggle color theme">
    <ion-icon name="moon-outline"></ion-icon>
  </button>
</li>
```
- It reuses `.navbar-link` for baseline sizing/spacing, plus `.navbar-theme-btn`
  for icon-specific tweaks.
- The initial icon in markup is a static default; **Step 5 corrects it on load**
  to match the resolved theme (so a light-mode visitor doesn't briefly see the
  wrong glyph). Alternatively, set the correct icon in the Step 3 inline script —
  but the button isn't in the DOM yet at `<head>` time, so do it in `script.js`.
- `aria-label` makes the icon-only button accessible.

### Step 5 — Wire the toggle (`script.js`)
Append at the end of the file (after line 159), following the existing pattern:

```js
// theme toggle
const themeBtn = document.querySelector("[data-theme-btn]");
const themeIcon = themeBtn.querySelector("ion-icon");

const applyThemeIcon = function (theme) {
  // moon shown in light mode (click → dark); sun shown in dark mode (click → light)
  themeIcon.setAttribute("name", theme === "light" ? "moon-outline" : "sunny-outline");
};

// sync icon with the theme the inline <head> script already applied
applyThemeIcon(document.documentElement.getAttribute("data-theme"));

themeBtn.addEventListener("click", function () {
  const next = document.documentElement.getAttribute("data-theme") === "light"
    ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  applyThemeIcon(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});
```
- Reads the current state from the `<html>` attribute (single source of truth),
  not from a separate JS variable that could drift.
- `try/catch` mirrors the inline script's resilience.
- No change to `elementToggleFunc` or the nav loop is needed; this is independent.

### Step 6 — Style the toggle button (`style.css`)
- Base (mobile, near line 488):
  ```css
  .navbar-theme-btn {
    display: flex;
    align-items: center;
    font-size: 18px;
    color: var(--light-gray);
  }
  .navbar-theme-btn:hover,
  .navbar-theme-btn:focus { color: var(--orange-yellow-crayola); }
  ```
- Desktop (inside the `@media` that holds `.navbar` at line 1737, near 1754):
  verify the button aligns with the nav links in the top-right bar; adjust
  padding/`font-size` only if it looks misaligned.
- Because the button uses themed variables (`--light-gray`,
  `--orange-yellow-crayola`), it adapts to both themes automatically.

## Validation Strategy

No test suite exists (per CLAUDE.md). Validate manually by opening `index.html`
(or `python3 -m http.server 8080`) and checking each acceptance criterion:

1. **First visit honors OS theme** — clear `localStorage` (`localStorage.removeItem('theme')`),
   set OS / DevTools "Emulate prefers-color-scheme" to light, hard-reload → site
   loads light. Switch emulation to dark, clear storage, reload → loads dark.
2. **Toggle switches everything** — click the button; confirm About, Resume,
   Portfolio, Blog, and Contact all flip (navigate each tab in both themes).
   Confirm the icon swaps sun↔moon.
3. **Persistence** — choose light, reload → still light. Choose dark, reload →
   still dark.
4. **No flash** — hard refresh (Cmd/Ctrl+Shift+R) several times in light mode;
   watch for any dark frame before paint. Throttle network (DevTools → Slow 3G)
   to exaggerate any flash; confirm none.
5. **Contrast / legibility** — in light mode, verify body text, the gold accent
   (nav active link, headings, avatar box), the navbar translucent bar, the
   testimonial modal overlay, and the desktop scrollbar are all readable. Spot-check
   with DevTools contrast ratio on primary text (target ≥4.5:1).
6. **Regression** — confirm dark mode is byte-for-byte visually unchanged from
   `main` (Step 1 refactor + default `:root` should guarantee this).
7. **Resilience** — open in a context where `localStorage` throws (some private
   modes); confirm no console error and the site still loads (defaults to dark).

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| **Flash of wrong theme** if the inline script is placed after the stylesheet or deferred. | Place the `<script>` (no `defer`/`async`) in `<head>` **before** the stylesheet `<link>`; it must run synchronously. Verified in validation step 4. |
| **Missed hardcoded colors** leaving dark patches in light mode (navbar bar, modal overlay, scrollbar). | Step 1 explicitly enumerates and promotes all five literal usages. Validation step 5 inspects each surface. |
| **Illegible gold** on light surfaces. | Darken `--orange-yellow-crayola` to ~`hsl(38,92%,42%)` in the light block; verify contrast on white. |
| **Icon-only button caught by nav text-matching loop.** | The button is **not** a `[data-nav-link]`, so the `script.js:144` loop never selects it. No `innerHTML` collision. |
| **Mechanical inversion looks cheap.** | Hand-tune surfaces/gradients per Step 2 notes; treat the provided palette as a starting point and adjust visually. |
| **Initial button icon mismatches resolved theme** for a light-mode visitor. | `applyThemeIcon(...)` in Step 5 runs on load and corrects the glyph from the `<html>` attribute. |
| **localStorage unavailable** (private mode) throws. | `try/catch` in both the inline script and `script.js`; falls back to dark, no crash. |

## Success Criteria

- A first-time visitor with no stored preference sees the theme matching their OS
  `prefers-color-scheme`; a returning visitor sees their last chosen theme.
- Clicking the toggle instantly switches all five sections between light and dark,
  the icon reflects the current state, and the choice survives a reload.
- No flash of the wrong theme on load, including hard refresh.
- All sections are readable in both themes; the gold accent stays legible on light
  surfaces.
- Dark theme is visually unchanged from `main`.
- No new dependencies, no build step; only `index.html`, `assets/css/style.css`,
  and `assets/js/script.js` change.
