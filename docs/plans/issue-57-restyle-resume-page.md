# Issue #57 — Restyle Resume page

**Type:** implementation plan (plan stage). No CSS is changed by this stage — this
document is the contract the *implement* stage follows.
**Base branch:** `epic/53-restyle-vcard-portfolio-to-a-modern-mini` (never `main`).
**Only file the implement stage may change:** `assets/css/style.css`.
**Parent:** #53 (epic). This is child **T4**, the Resume section child. It depends
on **T1** (#54, merged) which already defined every token this plan consumes, and
follows **T2** (#55, chrome, merged) and **T3** (#56, About, merged) which applied
the same literal→token pattern to their sections.

---

## 1. Goal

Convert the `#RESUME` section — the **education/experience timeline** (markers,
connector line, dates, copy) and the **skills** bars (track + progress fill) — so
all color/radius/shadow/type **resolve from the tokens T1 already defined**, and so
the section reads as one cohesive modern-minimal system in both themes. Because the
token *values* themselves already changed in T1 (cool accent replacing the
gold/yellow, tighter radii, flatter shadows), every Resume surface that already
references a token inherits the new look for free; this stage finishes the job by
replacing the remaining **radius literals** in Resume-owned selectors with the
matching tokens, and by verifying hierarchy/legibility and AA contrast in both
themes.

**No DOM, no JS, no behavior change.** This is a CSS-only, token-only pass over the
selectors this child owns. There is no interactive behavior on the Resume tab (no
modal, filter, or form), so the risk surface is purely visual.

---

## 2. Ownership (per epic R2 — by selector, not line range)

T4 owns the **Resume** section: the `#RESUME` banner rules
(`assets/css/style.css:892-996`) and their counterparts in the
`#RESPONSIVE › #RESUME` block (`assets/css/style.css:1681-1695`). Only T1 may add or
change token *definitions*; this child only *consumes* tokens. Concretely, the
selectors this child may edit:

- **Timeline (education & experience):** `.timeline`, `.timeline .title-wrapper`,
  `.timeline-list`, `.timeline-item`, `.timeline-item:not(:last-child)`,
  `.timeline-item-title`, `.timeline-list span`,
  `.timeline-item:not(:last-child)::before` (the vertical connector line),
  `.timeline-item::after` (the marker dot), `.timeline-text`
  (`assets/css/style.css:902-958`) and their responsive rules
  (`:1685-1693`: `.timeline-list`, `.timeline-item:not(:last-child)::before`,
  `.timeline-item::after`).
- **Skills:** `.skills-title`, `.skills-list`, `.skills-item:not(:last-child)`,
  `.skill .title-wrapper`, `.skill .title-wrapper data`, `.skill-progress-bg`
  (the track), `.skill-progress-fill` (the accent fill)
  (`:965-996`) and their responsive rule (`:1695`:
  `.skills-item:not(:last-child)`).
- **`.article-title` margin (`:895`)** sits under the `#RESUME` banner but the
  selector is shared (every tab's section title uses it). Its only Resume-local
  declaration here is `margin-bottom: 30px` — a structural number. The visual part
  of `.article-title` (the accent underline `.article-title::after`, `:360-368`)
  lives in `#REUSED STYLE` and is **already fully tokenized** by T1
  (`--text-gradient-yellow`, `--radius-sm`). Do not edit it.

> **Shared reused styles consumed by Resume but NOT owned here (already tokenized
> by T1 — for QA orientation only):**
> - `.icon-box` / `.icon-box::before` (`:289-311`) — the boxed ion-icon next to
>   each timeline section title (`index.html:564,621`). Already reads
>   `--border-gradient-onyx`, `--radius-md`, `--orange-yellow-crayola` (=accent),
>   `--shadow-1`, `--eerie-black-1`. Inherits the new accent/radius/shadow for
>   free; leave untouched.
> - `.h4` / `.h5` (`:348-353`) — `.timeline-item-title` and the skill labels use
>   these; already `--white-2` / token font sizes.

> **Do not touch** the token blocks (`:18-216`), the `#REUSED STYLE` block, the
> `#ABOUT`/`#PORTFOLIO`/`#BLOG`/`#CONTACT` section rules, the sidebar/navbar chrome
> (T2), the scrollbar rules, or the `#REDUCED MOTION` block (T7). Do not touch
> `index.html`, `assets/js/script.js`, or `404.html`.

---

## 3. Current state (grounded in the code)

Relevant tokens **already defined by T1** that this stage consumes:

| Token | Dark value | Light value | Source |
| --- | --- | --- | --- |
| `--radius-md` | `8px` | (theme-independent) | `:128` |
| `--radius-circle` | `50%` | (theme-independent) | `:131` |
| `--jet` (divider/track) | `hsl(0,0%,22%)` | `hsl(0,0%,80%)` | `:59`, `:179` |
| `--text-gradient-yellow` (accent) | `linear-gradient(to right, var(--accent-strong), var(--accent))` | accent light values | `:51-55` (derives from `--accent`) |
| `--vegas-gold` → `--accent-muted` (dates) | `hsl(213,25%,55%)` | `hsl(213,30%,40%)` | `:69`, `:78`, `:194-ish` |
| `--light-gray` (body copy / skill %) | `hsl(0,0%,84%)` | `hsl(0,0%,30%)` | `:70`, `:187` |
| `--white-2` (titles via `.h4/.h5`) | `hsl(0,0%,98%)` | `hsl(0,0%,20%)` | `:67`, `:186` |

**The Resume surfaces already read from tokens for almost everything.** After T1:

- The **marker dot** (`.timeline-item::after` `background: var(--text-gradient-yellow)`,
  `:949`) and the **skill progress fill** (`.skill-progress-fill` `background:
  var(--text-gradient-yellow)`, `:993`) already render the **cool accent** — the
  gradient token now derives from `--accent`/`--accent-strong`, so the old
  gold/yellow is already gone.
- The **connector line** (`.timeline-item:not(:last-child)::before` `background:
  var(--jet)`, `:939`) and the **skill track** (`.skill-progress-bg` `background:
  var(--jet)`, `:986`) already read the neutral divider token — correct for a
  minimal system (neutral dividers, accent only on the active marker/fill).
- The **date/period text** (`.timeline-list span` `color: var(--vegas-gold)`,
  `:927`) reads the accent-muted alias.
- Body copy (`.timeline-text` → `--light-gray`, `:955`), titles
  (`.timeline-item-title`/`.h4` → `--white-2`), and skill % labels
  (`.skill .title-wrapper data` → `--light-gray`, `--fs-7`, `:979-982`) already
  read tokens.

What still reads as un-minimal / un-tokenized is purely **two `border-radius`
literals** — that is the work.

### Literals still present in Resume selectors (the work)

`border-radius` literals (must tokenize — epic AC3), per the T1 radius mapping
(`3/4/5→sm`, `8/10→md`, `12/14/15/16/18/20→lg`, `30`/pill→pill, `50%→circle`):

| Line | Rule | Current | Change to |
| --- | --- | --- | --- |
| `950` | `.timeline-item::after` (marker dot) | `border-radius: 50%;` | `var(--radius-circle)` |
| `989` | `.skill-progress-bg` (skill track) | `border-radius: 10px;` | `var(--radius-md)` |

No color literals remain in the Resume section — every `background`/`color`
already reads a token (verified: `:927,939,949,986,993` are all `var(--…)`).

### Deliberately left as-is (not defects, per epic scope)

| Line | Rule | Value | Why it stays |
| --- | --- | --- | --- |
| `951` | `.timeline-item::after` | `box-shadow: 0 0 0 4px var(--jet);` | This is a **structural ring** that punches the marker dot out of the connector line (spread-only, zero offset/blur), **not** an elevation drop-shadow — it does not map to `--shadow-1…5`. Its color is already the `--jet` token; `0 0 0 4px` are structural numbers, exempt from tokenization (epic §Scope). Changing it to a `--shadow-*` token would break the ring. Leave exactly as-is. |
| `995` | `.skill-progress-fill` | `border-radius: inherit;` | Not a literal — inherits the (now-tokenized) `--radius-md` from `.skill-progress-bg`. Nothing to change. |
| `1685-1693` | `#RESPONSIVE › #RESUME` | margins, positions, `6px→8px` marker dimensions | All **structural** layout numbers (`margin-left`, `left`, `height`/`width` of the marker, `margin-bottom`). No color/radius/shadow literal in this block — nothing to tokenize. |

---

## 4. Step-by-step changes

All edits are in `assets/css/style.css` only. Both changes are literal→`var(--token)`
substitutions — no value changes appearance except by way of the (already-approved)
T1 token values. The `50%→circle` swap is exact (`--radius-circle: 50%`), so the
marker dot's shape is pixel-identical; the `10px→md` swap tightens the skill-track
corners from 10px to 8px (an intended, imperceptible-at-8px-height tightening).

**4.1 Timeline marker dot radius → token.**
- `:950` `.timeline-item::after { … border-radius: 50%; … }` → `border-radius:
  var(--radius-circle);`. Leave the surrounding `background:
  var(--text-gradient-yellow)` and `box-shadow: 0 0 0 4px var(--jet)` untouched
  (see §3 "left as-is").

**4.2 Skill track radius → token.**
- `:989` `.skill-progress-bg { … border-radius: 10px; }` → `border-radius:
  var(--radius-md);`. `.skill-progress-fill { border-radius: inherit; }` (`:995`)
  then inherits `--radius-md` automatically — do not add an explicit radius there.

**4.3 Nothing else changes.**
- No color literal to convert (all already tokenized, §3).
- The responsive `#RESUME` block (`:1685-1693`) is structural-only — leave it.
- The accent marker/fill keep the `--text-gradient-yellow` token (see §4.4).

**4.4 Decision — keep the accent gradient token, do not swap to solid `var(--accent)`.**
The issue says markers/fills should use "the accent token." Today they use
`--text-gradient-yellow`, which T1 **redefined to derive entirely from `--accent`**
(`linear-gradient(to right, var(--accent-strong), var(--accent))`, `:51-55`) — so
they already *are* accent-token-driven, and the accent hue is defined exactly once
(epic AC1). The gradient is between two near-identical accent lightness stops and is
imperceptible on a 6px dot / 8px-high bar. **Recommendation: keep
`--text-gradient-yellow`** — it satisfies "reads from the accent token" at lowest
risk and matches how About/chrome kept the shared accent-gradient underline. Do
**not** introduce a new solid-vs-gradient literal or a new token. (If a reviewer
insists on a flat solid fill, the only acceptable form is swapping the *token
reference* to the existing `var(--accent)` — never a raw color — but this is not
recommended and is out of the minimal-diff scope.)

---

## 5. What must NOT change (guardrails)

- **Timeline structure & the marker ring.** Keep the connector line
  (`::before`, `--jet`) and the marker dot's `box-shadow: 0 0 0 4px var(--jet)`
  ring exactly as-is — that ring is what visually separates the dot from the line.
  Only the dot's `border-radius` value changes (50% → `--radius-circle`, identical).
- **No re-hardcoding.** Every color/radius/shadow/type must stay a `var(--token)`.
  Introducing any new `hsl`/`hsla`/hex or raw `border-radius`/`box-shadow` design
  literal in a Resume selector is a defect (epic R3/AC3).
- **No new motion.** The only Resume transitions/animations are the shared
  `article.active { animation: fade … }` (`:326-334`, not Resume-owned) and the
  page-fade — reuse existing `--transition-1/2` if any hover is ever needed; add
  **no** new keyframes and **no** new transform-based hover effects (epic R3), so
  the `#REDUCED MOTION` block stays complete without a per-section override.
- **Structural numbers are exempt.** Margins, gaps, paddings, the timeline
  `margin-left`/`left` offsets, and the marker's `6px`/`8px` dimensions are layout
  numbers — do not tokenize or churn them (epic §Scope). Do not change the
  responsive `#RESUME` block.
- **Tokens are T1's.** Do not add or redefine any custom property. This child only
  references existing tokens.
- **DOM/JS/theme logic** (`index.html`, `assets/js/script.js`, the inline pre-paint
  theme script, `applyTheme`) and **all other sections/chrome/scrollbar/filter/form
  rules** are out of scope.

---

## 6. Acceptance criteria mapping (from issue #57)

| Issue AC | How this plan satisfies it |
| --- | --- |
| Timeline and skills match the minimal system in both themes | §3/§4: markers + skill fill already render the cool accent via `--text-gradient-yellow` (T1-redefined from `--accent`); connector line + skill track read the neutral `--jet` divider; §4.1/4.2 tighten the two residual radius literals to the T1 scale — so both surfaces render flat, cool, tight corners in dark and light. |
| Timeline markers/lines and skill fills read from tokens | Marker dot & skill fill → `--text-gradient-yellow` (accent, `:949,993`); connector line & skill track → `--jet` (`:939,986`); dates → `--vegas-gold`/accent-muted (`:927`). §4 removes the last two non-token values (both `border-radius`). After this stage, **zero** design-value literals remain in Resume selectors. |
| Text and progress fills meet AA contrast | §7 step 4 records measured ratios in both themes for: timeline-item titles (`--white-2` on the page surface), body copy (`--light-gray`), the **date/period text** (`--vegas-gold`=`--accent-muted` — the highest-risk value, called out below), skill labels/% (`--white-2`/`--light-gray`), and the accent fill vs. its `--jet` track (≥3:1 UI). |
| No layout regression at existing breakpoints | §5: no structural number changes; the responsive `#RESUME` block is untouched; `50%→circle` is pixel-identical and `10px→8px` is an 8px-tall bar's corner — verified at 375/768/1024/1440px in §7 step 5. |

Epic-level: satisfies **AC1** (accent still single-sourced; no new accent literal),
**AC3** (removes the two remaining `border-radius` literals in Resume — the only
Resume literals left after T1), **AC4** (responsive rules untouched, no layout
number changed), **AC7** (no new motion; `#REDUCED MOTION` stays complete),
**AC8** (contrast measured and recorded in the PR).

---

## 7. Verification (manual browser QA — no test runner exists)

Serve with `python3 -m http.server 8000` from repo root, open
`http://localhost:8000/#resume` (the Resume article,
`index.html:556`; activated via the hash/`activatePage`).

1. **Grep gate (Resume subset of AC1/AC3):** after the edit, confirm **no** raw
   `border-radius:` numeric literal and no `hsl(`/`hsla(`/hex remains in the
   Resume-owned rules (`:902-996` base and `:1685-1693` responsive; token blocks
   and `#REUSED STYLE` exempt). Expected: both rows in §3 now read `var(--…)`;
   `.skill-progress-fill` keeps `border-radius: inherit`; the marker `box-shadow`
   ring keeps `0 0 0 4px var(--jet)`.
2. **Timeline (education + experience):** both `.timeline` sections render — the
   boxed accent icon (`.icon-box`) next to each title, the round accent marker dot
   on each entry with its `--jet` ring separating it from the vertical `--jet`
   connector line, dates in accent-muted, titles in `--white-2`, body copy in
   `--light-gray`. Confirm the marker is still a perfect circle and the connector
   line runs continuously between items (`:not(:last-child)::before`).
3. **Skills:** each `.skill-progress-bg` track (neutral `--jet`, now 8px corners)
   holds an accent `.skill-progress-fill` at the width set inline in `index.html`;
   fill corners inherit the track's radius; the `data` percentage label reads
   `--light-gray`. Confirm no clipping/overflow at the tightened radius.
4. **AA contrast (epic AC8) — record ratios in the PR, both themes:**
   - Highest risk: **date/period text** `.timeline-list span` (`--vegas-gold` =
     `--accent-muted`: dark `hsl(213,25%,55%)`, light `hsl(213,30%,40%)`) on the
     Resume surface — small 13px text needs ≥4.5:1. **If either theme measures
     below 4.5:1**, the minimal remedy (still token-only) is to point that one
     declaration at a higher-contrast existing token (`--light-gray` for neutral,
     or `--accent` for a stronger accent) — note the substitution in the PR; do
     **not** invent a new token or literal.
   - Also measure: timeline-item title (`--white-2`), body copy (`--light-gray`),
     skill label/`data` (`--white-2`/`--light-gray`), and the accent fill vs. its
     `--jet` track (≥3:1 UI/graphical).
5. **Responsive:** check 375 / 768 / 1024 / 1440px. At ≥768px the timeline shifts
   (`margin-left: 65px`, marker `left: -43px`, dot grows to 8px) — confirm this
   matches `main` exactly with the new radii and there is no layout shift.
6. **Themes:** toggle the theme button; verify the marker dots, connector lines,
   skill tracks + fills, dates, and copy all read correctly in light and dark (no
   flash, no wrong-theme surface, accent visible on both, ring still separates dot
   from line).
7. **Reduced motion:** DevTools → Emulate `prefers-reduced-motion: reduce`; confirm
   the Resume tab still only does the shared page-fade (no new motion introduced) —
   T7's existing overrides cover it unchanged.

Attach before/after screenshots (dark + light) at 375/768/1024/1440px of the
timeline and skills to the implement-stage PR, per the epic DoD, and record the
measured contrast ratios from step 4.

---

## 8. Risk / rollback

CSS-only, single file, **two** purely mechanical literal→token substitutions (one
`50%→--radius-circle`, exact; one `10px→--radius-md`, an intended 2px tightening on
an 8px bar). There is **no non-mechanical decision** except the already-settled
§4.4 recommendation to keep the accent-gradient token. Every target token was
defined by T1 to hold the intended appearance, so the only visible delta is the
(already-shipped) cool accent + flat shadows this section already inherited, plus
the tightened skill-track corner. The one thing that genuinely needs eyes is the
**AA contrast of the accent-muted date text** (§7 step 4) — the issue's headline
contrast criterion — with a token-only fallback specified if it fails. Rollback =
revert the section child's PR; the site still renders on T1's tokens.
