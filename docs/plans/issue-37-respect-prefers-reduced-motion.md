# Implementation Plan — Respect `prefers-reduced-motion` (Issue #37)

## Summary

Add a single `@media (prefers-reduced-motion: reduce)` block to
`assets/css/style.css` so that visitors who have enabled the OS-level "reduce
motion" accessibility preference (commonly used for vestibular / motion
sensitivity) get a near-static experience: entrance fades, the modal zoom, the
project-card hover zoom, the sidebar slide, and smooth scrolling are all
neutralized, while colors, layout, spacing, opacity-based cues, and every final
visible state stay exactly as they are today.

This is a **CSS-only**, additive change. It introduces no new selectors that
affect default (no-preference) rendering, touches no JavaScript, and changes no
markup. The default experience for users who have *not* opted out is unchanged.

**Status:** the implementation already exists on branch
`feat/37-a11y-respect-prefers-reduced-motion-disa` and is open as **PR #39**
(base `main`, `assets/css/style.css` +58 lines). This document is the design
record and verification plan for that change; the plan doc is being added to the
same branch/PR rather than opening a second PR (per the run's completion
contract). The sections below ground the approach in the current code, justify
each rule, and give a reviewer an exact, runnable acceptance checklist.

## Current State (Evidence)

There is **no** reduced-motion handling anywhere today. `grep -n
"prefers-reduced-motion" assets/css/style.css` returns nothing on the base, and
all motion plays unconditionally. The motion the issue calls out maps to these
concrete sources in `assets/css/style.css` (line numbers from the base before
the new block):

| Motion | Source | Mechanism |
| --- | --- | --- |
| Transition tokens | `:111` `--transition-1: 0.25s ease`, `:112` `--transition-2: 0.5s ease-in-out` | reused by ~20 `transition:` declarations |
| Active-tab fade | `:285–293` `article.active { animation: fade 0.5s … }` + `@keyframes fade` (opacity 0→1) | keyframe animation |
| Project filter entrance | `:1033–1041` `.project-item.active { animation: scaleUp 0.25s … }` + `@keyframes scaleUp` (scale .5→1) | keyframe animation (transform scale) |
| Sidebar expand/collapse (mobile) | `:393–398` `.sidebar { max-height; transition: var(--transition-2) }` | `max-height` transition |
| Testimonials modal open | `:748–765` `.testimonials-modal { transform: scale(1.2); opacity:0; transition: … }` → `.active … { transform: scale(1); opacity:1 }` | transform-scale + opacity transition |
| Modal overlay fade | `:728–746` `.overlay { opacity:0; transition: var(--transition-1) }` → `.active` opacity .8 | opacity transition (acceptable cue, but made instant) |
| Project image hover zoom | `:1091–1098` `.project-img img { transition }` + `:hover img { transform: scale(1.1) }` | transform-scale on hover |
| Project icon-box hover pop | `:1068–1088` `--scale: 0.8; transform: translate(-50%,-50%) scale(var(--scale)); opacity:0` → `:hover … { --scale:1; opacity:1 }` | transform-scale + opacity on hover |
| Smooth scroll | `:666` (`.testimonials-list`/horizontal scroller) and `:829` `scroll-behavior: smooth` | smooth scrolling |

**Static transforms that must NOT be reset** (these are layout positioning, not
motion, and have no transition): `:680` `.testimonials-avatar-box { transform:
translate(15px,-25px) }`, the `translate(-50%,-50%)` centering inside the
icon-box `:1076`, and `:1569` (responsive decorative offset). A blanket
`transform: none` would break layout — see [Risks](#risks-and-mitigations). This
is why the plan neutralizes the *scale* deltas surgically rather than zeroing all
transforms.

## Scope and Assumptions

**In scope:** one new `@media (prefers-reduced-motion: reduce)` block appended to
the end of `assets/css/style.css` (after the last existing rule, `:2039`).

**Out of scope:** any change to default behavior; any HTML or
`assets/js/script.js` change; introducing a JS-based motion toggle (the issue is
explicit that this is CSS-only and independent of JS). The `::-webkit-scrollbar`
cosmetic rules are not motion and are left alone.

**Assumptions:**
- The repository ships as a static site (`index.html` + `assets/`), so the media
  query is evaluated directly by the browser against the user's OS setting; no
  build step is involved.
- "Near-static" (the WCAG-aligned, widely used pattern of collapsing durations to
  `~0.01ms` rather than `0`) is acceptable. Using a tiny non-zero duration
  instead of `none`/`0` preserves any JS that may listen for `transitionend`/
  `animationend` so such handlers still fire. (Current `script.js` does not rely
  on those events, but this keeps the change robust to future JS.)

## Design / Approach

Two layers, both inside the single media block:

**Layer 1 — global duration collapse** (covers every transition/animation,
including ones not individually enumerated, and future ones):

```css
*,
*::before,
*::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
```

`!important` is required here to override the inline `0.25s/0.5s` durations baked
into `--transition-1/2` and the keyframe declarations. `animation-iteration-count:
1` stops any looping animation from repeating. `scroll-behavior: auto` disables
the smooth scroll at `:666`/`:829`. Because both keyframes (`fade`, `scaleUp`)
resolve to their *visible end state*, collapsing the duration simply jumps to the
final frame — no flash, no regression.

**Layer 2 — neutralize residual transform deltas** (a duration collapse alone
leaves transform-based scale/move in place; it just snaps instantly, which is
still a visible size jump on hover). These rules hold the affected elements at
their resting/non-scaled state while preserving the non-motion hover cues:

```css
/* Project card image: cancel the zoom-on-hover; the .project-img::before
   darkening overlay remains as the hover affordance. */
.project-item > a:hover img { transform: none; }

/* Project filter grid: drop the scale-up entrance entirely. */
.project-item.active { animation: none; }

/* Project overlay icon: hold at final scale so it still fades in via opacity
   without growing; the centering translate is preserved by --scale:1. */
.project-item-icon-box { --scale: 1; }

/* Testimonials modal: open without the zoom; opacity fade (instant) remains.
   The modal is centered by the flex parent, so transform:none is safe. */
.testimonials-modal,
.modal-container.active .testimonials-modal { transform: none; }
```

Note `--scale: 1` rather than `transform: none` for the icon-box: that element's
`transform` includes the `translate(-50%,-50%)` centering, so we only reset the
scale *variable*, leaving positioning intact. This is the key reason the approach
is surgical rather than a blanket transform reset.

Hover/focus remain distinguishable per the issue: project cards still darken
(`::before` overlay opacity), the icon still appears (opacity 0→1), the modal
close button still changes opacity (`:783`), and all color transitions still
apply (instantly). Only large movement/scale is removed.

## Implementation Steps

1. **Append the block** at the end of `assets/css/style.css` (after `:2039`),
   under a clearly labeled section comment matching the file's existing
   `/*---- #SECTION ----*/` banner style. Placing it last means source order
   already favors it; combined with `!important` on Layer 1 and equal/higher
   specificity on Layer 2, the overrides win without raising specificity
   elsewhere. *(Done in PR #39.)*
2. **Layer 1:** the universal `*, *::before, *::after` duration/scroll reset.
3. **Layer 2:** the four targeted transform/animation neutralizers above.
4. **Do not modify** any rule outside the media block — no default-path edits.
5. **Land this plan doc** (`docs/plans/issue-37-respect-prefers-reduced-motion.md`)
   on the same branch/PR (#39) so design + verification are recorded, matching
   the repo's `docs/plans/issue-N-*.md` convention.

## Validation Strategy

Static checks (runnable now):
- `grep -c "prefers-reduced-motion" assets/css/style.css` → `1` (block present).
- Confirm the block is the **last** rule and that no line *outside* it was
  changed: `git diff main -- assets/css/style.css` shows only additions appended
  after `:2039`.
- Confirm no blanket `transform: none` on the icon-box (positioning preserved):
  the icon-box rule sets `--scale: 1`, not `transform`.

Behavioral checks — DevTools emulation (Chrome/Firefox: Rendering →
"Emulate CSS prefers-reduced-motion: reduce"), or OS setting (macOS: Accessibility
→ Display → Reduce motion; Windows: Settings → Accessibility → Visual effects →
Animation effects off):

| Step | Expected with **reduce** | Expected with **no preference** (regression guard) |
| --- | --- | --- |
| Load the page | No fade-in on the active article | `fade` plays (0.5s) |
| Switch nav tabs (About/Resume/Portfolio/Contact) | New panel appears instantly, no fade | fade plays |
| Filter portfolio items | Items appear instantly, no scale-up | `scaleUp` plays |
| Hover a project card | Overlay darkens + icon fades in; **image does not zoom**, icon does not pop-scale | image zooms to 1.1, icon scales 0.8→1 |
| Open a testimonial (modal) | Modal appears with no zoom; overlay dim still applies | modal scales 1.2→1, overlay fades |
| Toggle sidebar (mobile width ≤ ~580px) | Expands/collapses with no slide | slides via `max-height` transition |
| Scroll long sections / anchor jumps | Instant (no smooth scroll) | smooth scroll |

Pass criteria: with **reduce**, none of the above produce nontrivial
movement/animation; with **no preference**, every behavior is identical to
today. No color/layout/spacing differences in either mode.

## Risks and Mitigations

- **Risk: blanket `transform: none` breaks positioning.** The avatar box `:680`,
  icon-box centering `:1076`, and responsive offset `:1569` are static layout
  transforms. *Mitigation:* Layer 2 only resets transforms on elements whose
  transform is purely motion (hover image, modal), and uses `--scale: 1` for the
  icon-box so its `translate(-50%,-50%)` centering is preserved. The avatar box
  and `:1569` are never touched.
- **Risk: `!important` over-reaches.** It is scoped to *duration*/*iteration*/
  *scroll-behavior* only, and only inside the reduce-motion media query — it
  cannot affect color, layout, or the no-preference path.
- **Risk: instant transition swallows a `transitionend`/`animationend` listener.**
  *Mitigation:* durations are `0.01ms`, not `0`/`none`, so those events still
  fire. Current `script.js` does not depend on them; this guards future JS.
- **Risk: future animations are added and forgotten.** *Mitigation:* Layer 1's
  universal selector neutralizes any new transition/animation automatically; only
  brand-new transform-based hover/entrance effects would need a Layer-2 line.
- **Risk: a reviewer diffs against the stale local `main` snapshot.** *Mitigation:*
  PR #39 targets the real `origin/main`; the diff is purely the appended block.

## Success Criteria

- A single `@media (prefers-reduced-motion: reduce)` block exists in
  `assets/css/style.css`; no default-path rule is modified. ✅ (PR #39)
- With reduce-motion emulation/OS setting: load, tab switch, portfolio filter,
  card hover, modal open, sidebar toggle, and scrolling produce no nontrivial
  motion (per the table above).
- With no preference: behavior is byte-for-byte unchanged from today.
- No visual regression — identical colors, layout, spacing, and final states in
  both modes; hover/focus remain distinguishable via opacity/overlay/color.
- Issue #37 is linked from a PR to `main` (`Closes #37`) and closes on merge;
  this plan is present under `docs/plans/`.
