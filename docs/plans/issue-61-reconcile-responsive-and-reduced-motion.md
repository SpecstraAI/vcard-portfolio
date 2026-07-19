# Issue #61 — Reconcile responsive and reduced-motion for the new aesthetic

**Type:** implementation plan for the epic's final **audit / reconciliation** child (**T8**).
**Base branch:** `epic/53-restyle-vcard-portfolio-to-a-modern-mini` (never `main`).
**File touched by the implementation (if any):** `assets/css/style.css` only — and only the
`#RESPONSIVE` and `#REDUCED MOTION` blocks (see §2 Ownership). **Expect a small-to-zero diff:**
this stage is primarily a QA gate that confirms the six merged restyle children left the layout
and motion-neutralization intact, with **contingency fixes** (§5, §6) specified in advance for the
narrow set of regressions the restyle could plausibly have introduced.
**Parent:** #53 (epic). Depends on T2–T7 (#55–#60), all merged.

---

## 1. Goal

The modern-minimal restyle (#54–#60, all merged) re-pointed color/radius/shadow/type **tokens**
and applied them per section. This child is the epic's **reconciliation gate**: prove that the new
look

1. **renders correctly across every existing breakpoint** — no horizontal overflow, clipping, or
   layout shift versus `main` — and
2. **stays fully motion-neutralized under `prefers-reduced-motion: reduce`** — every
   transform-based effect still snaps to its final state, and no restyle-introduced effect animates.

Per the epic (R3, "No new motion") the section children were **forbidden from adding new keyframes
or new transform-based hover effects**. This plan's investigation confirms they held to that (§3),
so the honest expectation is that **`#REDUCED MOTION` needs no new rule** and `#RESPONSIVE` needs at
most a couple of targeted heading-overflow guards at the 375 px width. The plan still specifies
exactly what to check and exactly what to change *if* QA surfaces a regression, so the implementer is
never guessing.

**No DOM, no JS, no behavior change. No token *definitions* change** (those are T1-owned). This is a
CSS-only pass confined to the two audit-owned blocks.

---

## 2. Ownership (per epic R2 — by selector/section, not line range)

T8 owns the two cross-cutting blocks the other children could not each fully own:

- **`#RESPONSIVE`** (`assets/css/style.css:1432`–`1745`+, i.e. the `@media (min-width: …)` blocks at
  **450 px** `:1439`, **580 px** `:1466`, **768 px** `:1755`, **1024 px** `:1855`, **1250 px** `:1954`
  and the light-theme scrollbar `1250 px` block `:2071`). Section children own their *own* section's
  responsive rules; T8 owns the **reconciliation** — any cross-section adjustment needed so the whole
  page holds together at every breakpoint.
- **`#REDUCED MOTION`** (`assets/css/style.css:2088`–`2139`, the
  `@media (prefers-reduced-motion: reduce)` block).

**Out of ownership (do not touch):** the token blocks `:root` (`:15`–`:175`) and
`[data-theme="light"]`, and any section's *base* rules. Only **T1** may change token definitions; if
a residual literal is found in a section's base rules (see §7), **flag it in the PR — do not fix it
here.**

---

## 3. What the restyle actually changed (grounding — read before editing)

A `git diff origin/main...origin/epic/53-restyle-vcard-portfolio-to-a-modern-mini --
assets/css/style.css` shows the restyle was **representation-only plus a type-scale revalue**:

- **Motion:** filtering the diff for `transform|animation|@keyframes|transition|will-change`
  (excluding `text-transform`) yields **only three lines — all background-color tokenizations**
  (`.project-img::before` scrim, and the two scrollbar-thumb `:hover` backgrounds now use
  `var(--overlay-scrim)` / `var(--scrollbar-thumb-hover)`). **Zero new transforms, keyframes,
  animations, or transitions were added.** This is the single most important fact for the
  reduced-motion half of this issue.
- **Radius:** literals were replaced by radius tokens (`--radius-sm/md/lg/pill/circle`). Radius does
  **not** affect box size or layout — purely visual.
- **Shadow:** `--shadow-1…5` values were flattened (lower alpha, e.g. dark `--shadow-3` alpha
  `0.20`). `box-shadow` does **not** occupy layout space — no reflow risk.
- **Type scale:** the base (`:root`) `--fs-*` values changed (`assets/css/style.css:117`-ish). This
  is the **only** change that can alter geometry, because font size drives text width/height:

  | token | old (`main`) | new (epic) | at <580 px (mobile/375 px QA) |
  |-------|-------------|-----------|-------------------------------|
  | `--fs-1` | 24px | **28px** | **larger** ⚠ |
  | `--fs-2` | 18px | **20px** | **larger** ⚠ |
  | `--fs-3` | 17px | 16px | smaller (safe) |
  | `--fs-4` | 16px | 15px | smaller (safe) |
  | `--fs-5` | 15px | 14px | smaller (safe) |
  | `--fs-6` | 14px | 13px | smaller (safe) |
  | `--fs-7` | 13px | 12px | smaller (safe) |
  | `--fs-8` | 11px | 11px | unchanged |

  The **580 px `:root` override** (`:1472`) still sets `--fs-1: 32px … --fs-8: 12px` — those values
  were **not** changed by the restyle, so at ≥580 px the type geometry equals `main`. **The only
  breakpoint where headings grew is below 580 px (the 375 px QA width).**

### Enlarged-heading consumers to watch at 375 px

- **`--fs-1` → `.h2`** (`:353`) → `class="h2 article-title"` — the five tab titles
  ("About / Resume / Portfolio / Blog / Contact"). Short single words → low overflow risk, but the
  underline `::after` and `padding-bottom` interaction should be eyeballed.
- **`--fs-2` → `.h3`** (`:355`) → the section headings **and** `class="h3 blog-item-title"` (6 blog
  titles, `index.html`). Blog titles are full sentences → a 18→20px bump is the **most likely** place
  to see an extra wrapped line (reflow) at 375 px; confirm it does not overflow the card or clip.
- **`--fs-2` also → `.theme-btn`** (`:618`, sizes the sun/moon icon) — 18→20px icon, negligible.

Everything else that changed size got **smaller** at mobile, which only reduces overflow risk.

### Reduced-motion coverage is already complete

The state-triggered motion effects in the stylesheet, and their existing neutralizations, are:

| effect | base rule | neutralized at |
|--------|-----------|----------------|
| project image zoom-on-hover | `.project-item > a:hover img { transform: scale(1.1) }` `:1146` | `:2118` `transform:none` |
| project card filter entrance | `.project-item.active { animation: scaleUp }` `:1083` | `:2123` `animation:none` |
| project overlay icon scale-in | `.project-item-icon-box { …scale(var(--scale)) }` `:1124` | `:2129` `--scale:1` |
| testimonials modal zoom-open | `.testimonials-modal { transform: scale(1.2) }` `:803` | `:2134` `transform:none` |
| tab/section fade-in | `animation: fade …` `:337` | blanket `animation-duration:0.01ms` `:2103` |
| smooth scroll | `scroll-behavior` | blanket `:2106` |

Because the restyle added **no** new transform/animation (verified above), this table is still
exhaustive. Note the filter-chevron rotate (`.filter-select.active .select-icon { rotate(0.5turn) }`
`:1036`) is **intentionally not** overridden: its rotation *is* the "open" state indicator, and under
reduced motion the blanket duration-collapse makes it snap to that final rotated state — which is the
correct, unchanged behavior. Do not add an override for it.

---

## 4. Verification plan (the substance of this stage)

Serve locally per CLAUDE.md: `python3 -m http.server 8000`, open `http://localhost:8000/`. Use
DevTools device toolbar. **Both themes** (toggle the sun/moon button) at **each** width.

### 4a. Responsive QA — widths 375, 768, 1024, 1440 px × dark + light × all five tabs

For each tab (About `#about`, Resume `#resume`, Portfolio `#portfolio`, Blog `#blog`, Contact
`#contact`):

1. **No horizontal scroll / overflow.** In the console, confirm
   `document.documentElement.scrollWidth <= document.documentElement.clientWidth` (no runaway
   horizontal scrollbar). Visually scan for any element bleeding past the `.sidebar`/`article`
   `520/700/950px`-then-`auto` container.
2. **No clipping.** Headings (esp. blog-item titles at 375 px, §3), the tab titles, service/skill
   titles, timeline text, form labels, and the contact map must not be cut off by their containers or
   by tightened radii.
3. **No layout shift vs `main`.** Compare against a `main` build side-by-side (or the before
   screenshots the section PRs attached). Radius/shadow changes must not have nudged box geometry
   (they shouldn't — see §3). Confirm the breakpoint transitions (the sidebar collapse below 1250 px,
   the navbar reposition at 1024 px `:1886`, the 2-col→3-col portfolio grid `:1934`, the mobile
   filter `<select>` ↔ button row swap at 768 px `:1807`) still fire cleanly.
4. **Chrome specifics:** sidebar `.info_more-btn` toggle (below 1250 px), navbar bottom-bar (mobile)
   vs top-right pill (`≥1024 px`, `border-radius: 0 var(--radius-lg)` `:1893`), scrollbar styling
   (`≥1250 px`).

### 4b. Reduced-motion QA — DevTools "Emulate CSS prefers-reduced-motion: reduce", all tabs

1. **Restyle-introduced effects:** none exist (§3) — confirm nothing new animates on hover/active/open
   anywhere.
2. **Each row of the §3 table snaps to final state:** hover a portfolio card (no image zoom; the dark
   scrim overlay still appears as the hover cue), filter the portfolio grid (cards appear without the
   scale-up), open a testimonial (modal appears without the zoom, focus trap still works), click
   through tabs (no fade), confirm no smooth-scroll.
3. **Regression check:** temporarily disable emulation and confirm all the above animations *do* play
   normally — i.e. the overrides are scoped to the media query and haven't leaked.

### 4c. Behavior regression (must stay identical — epic AC6)

Modal open/focus-trap/Escape/overlay-close, nav `aria-current` active state, portfolio filter (both
button row and mobile `<select>`), theme toggle + persistence (no flash-of-wrong-theme). These are
JS-driven and untouched, but confirm the CSS pass didn't disturb their visible states.

---

## 5. Contingency fix A — responsive overflow (only if 4a surfaces one)

If, and only if, a heading overflows/clips or a horizontal scrollbar appears at 375 px (most likely
`blog-item-title`, §3), add a **targeted, token-scoped** rule **inside `#RESPONSIVE`** — do **not**
change base rules or token definitions. Preferred remedies, least-invasive first:

1. Prefer letting text **wrap** (reflow is not "overflow") — verify it's genuinely clipping/overflowing,
   not merely taller, before changing anything.
2. If a specific heading truly overflows, scope a mobile-only size step-down for **that selector only**
   in a `@media (max-width: 449px)` (or by nudging its size inside the existing sub-580 cascade),
   e.g. reduce `.blog-item-title` line length via existing `-webkit-line-clamp` already present
   (`:1642` clamps testimonials; check blog title clamp) rather than resizing the token.
3. Never alter a global `--fs-*` token (T1-owned) or a section base rule to fix a responsive issue —
   the fix lives in the breakpoint block this child owns.

Document any such rule with a comment naming the width and symptom it guards.

## 6. Contingency fix B — reduced-motion gap (only if 4b surfaces one)

If QA finds any effect that animates under reduced motion and isn't in the §3 table (it shouldn't,
given §3), add a matching override to the `#REDUCED MOTION` block following the **existing idiom**
there: neutralize the *transform* (`transform: none` / hold a custom prop) or `animation: none`,
**preserve** the non-motion cue (opacity/color/overlay) and the final resting state, and add a
one-line comment explaining what it cancels and what cue it leaves intact (mirror `:2116`–`:2137`).

---

## 7. Observations to flag in the PR (not fixed here — out of ownership)

- **Residual radius literal:** `.cv-btn { border-radius: 14px; }` (`assets/css/style.css:1401`) is a
  raw literal that escaped tokenization — it should be `var(--radius-lg)` per epic AC3. `.cv-btn` is a
  **Resume/base** selector (T4-owned base rule), **not** part of `#RESPONSIVE`/`#REDUCED MOTION`, so
  fixing it is out of this child's ownership (R2). **Flag it in the PR description** (recommend a
  one-line follow-up or a T4 touch-up) rather than editing it here. This is the only remaining raw
  `border-radius` design literal outside the token blocks (confirmed by grep).

---

## 8. Acceptance criteria mapping (issue #61)

- *All existing breakpoints render the minimal look correctly at mobile/tablet/desktop* → §4a.
- *No overflow, clipping, or layout shift introduced by the restyle* → §4a + §5 contingency.
- *With OS reduced-motion enabled, no restyle-introduced animation plays* → §4b (and §3: none exist).
- *Existing reduced-motion neutralizations remain intact* → §4b.2/3, §3 table.

## 9. Definition of done

- Responsive QA (4a) and reduced-motion QA (4b) performed across all five tabs, both themes, at 375 /
  768 / 1024 / 1440 px; results recorded in the PR description (before/after screenshots per epic DoD
  where a change was made; a "no regression" note where none was needed).
- Any regression fixed only within `#RESPONSIVE` / `#REDUCED MOTION` per §5/§6; if none was found, the
  PR carries the plan doc plus the QA evidence and **no CSS diff** is acceptable and expected.
- The `.cv-btn` residual (§7) is flagged, not fixed.
- PR opened against `epic/53-…`, `Closes #61`.
