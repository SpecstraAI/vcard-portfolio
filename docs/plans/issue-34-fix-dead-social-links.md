# Implementation Plan — Fix Dead Social Media Links in the vCard Sidebar (Issue #34)

## Summary

**The defect described in issue #34 is already fixed on `main`.** This plan is the
result of investigating the issue against the current codebase and verifying every
acceptance criterion. No code change is required to close #34.

Issue #34 reports that the three sidebar social icons (`index.html:189–201`) all use
`href="#"`, so clicking them does nothing and yanks the page to the top. That was true
of the original template and is still true on the **stale local `main` snapshot**
(`416ebf8`) captured at the start of this run. It is **no longer true on the real base
branch** (`origin/main` @ `025070e`): the sidebar social list there contains a single,
working GitHub link with all required attributes.

This happened because the same defect was enumerated and fixed under the broader
**issue #9** ("Fix dead links: social icons, project & blog cards"), whose plan
(`docs/plans/issue-9-fix-dead-links.md`) explicitly covered the three sidebar social
icons. That fix landed in commit `5726d40` and merged to `main` via **PR #30**. Issue
#34 is therefore a narrower duplicate of work already shipped.

**Recommendation:** close issue #34 as already-resolved (resolved by PR #30 / issue #9).
The only open question is a *content* decision, not a defect — see
[Residual Decision](#residual-decision-optional). This plan documents the evidence so a
reviewer can confirm closure without re-deriving it, and gives the exact one-line change
if the owner wants a different social target.

## Current State (Evidence)

The sidebar social list on `origin/main` (`index.html:186–195`) is:

```html
<ul class="social-list">

  <li class="social-item">
    <a href="https://github.com/SpecstraAI" class="social-link"
       aria-label="GitHub" target="_blank" rel="noopener noreferrer">
      <svg class="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">…</svg>
    </a>
  </li>

</ul>
```

Verification commands run against the working tree (== `origin/main`):

| Check | Command | Result |
| --- | --- | --- |
| No placeholder anchors anywhere in the page | `grep -c 'href="#"' index.html` | `0` |
| No placeholder anchors in the sidebar (`<aside>`, lines 93–199) | `sed -n '93,199p' index.html \| grep 'href="#"'` | none |
| GitHub destination resolves | `curl -s -o /dev/null -w "%{http_code}" https://github.com/SpecstraAI` | `200` |
| No JS coupling to the social anchors | `grep -rn 'social-link\|social-list\|social-item' assets/js` | no matches (CSS only, cosmetic) |

## Acceptance Criteria — Status

Each criterion from issue #34, checked against the current code:

1. **"every social icon in the sidebar navigates to a real, working profile URL in a
   new browser tab"** — ✅ The one remaining icon points at `https://github.com/SpecstraAI`
   (HTTP 200) and carries `target="_blank"`.
2. **"no social icon remains that points at `#` or a nonexistent profile — unused
   platforms are removed from the markup entirely"** — ✅ The three original placeholder
   platforms (Facebook, Twitter/X, Instagram) were removed; zero `href="#"` remain.
3. **"each link carries `target="_blank"` with `rel="noopener noreferrer"` and an
   accessible name"** — ✅ The GitHub link has `target="_blank"`, `rel="noopener noreferrer"`,
   and `aria-label="GitHub"`.
4. **Requirement 4 — "each remaining social link retains an accessible name"** — ✅
   `aria-label="GitHub"` is present and the inner `<svg>` is correctly `aria-hidden="true"`.

All four pass. The "success signal" in the issue ("a visitor being able to click any
visible social icon and land on the correct external profile") is satisfied.

## Scope and Assumptions

**In scope (of the original issue):** only the sidebar social list in `index.html`
(`index.html:186–195`). No `assets/js/script.js` or `assets/css/style.css` changes were
needed, exactly as the issue's Technical Notes predicted.

**Out of scope (per the issue):** the portfolio project-tile links (`index.html:837`,
`858`, …) and adding any new social platforms not in the original template. Both remain
out of scope here. (Note: the project-tile and client-logo placeholders were *also*
already addressed under issue #9 / PR #30 — `grep -c 'href="#"' index.html` is `0`
across the whole file — but that is incidental to #34.)

**Assumptions:**

- The persona "Alex Morgan" is fictional (this is a customizable template), so no real
  Alex Morgan Facebook/Twitter/Instagram profiles exist. The only verified-live
  destination associated with this repository is its GitHub organization,
  `https://github.com/SpecstraAI` (HTTP 200). This matches the choice already
  documented and shipped under issue #9.
- `origin/main` (`025070e`), not the run-start local `main` snapshot (`416ebf8`), is the
  true base. The local snapshot predates the PR #30 merge, which is why the issue's
  reported line numbers still show `href="#"` there.

## Residual Decision (Optional)

There is **one non-defect content question** a reviewer or owner may want to settle. It
does not block closing #34, because all acceptance criteria already pass.

- The single social link targets the **`SpecstraAI` GitHub org** (the repo owner), not a
  personal "Alex Morgan" GitHub profile, and GitHub was not one of the three platforms in
  the original template (Facebook, Twitter/X, Instagram). The implementation chose to
  remove all three template platforms and surface the one destination that is provably
  live. This is a reasonable, real-world-honest choice and satisfies the issue, but if the
  owner later supplies real profile URLs they would be added here.

**Contingency change (only if the owner supplies a different/additional URL):** edit the
single `<li class="social-item">` block at `index.html:188–193`. To repoint the existing
link, change the `href`; keep `class="social-link"`, `target="_blank"`,
`rel="noopener noreferrer"`, and update `aria-label` to match the new platform. To add a
second platform, duplicate the `<li class="social-item">…</li>` block, swap the `<svg>`
path for that platform's icon (follow the existing inline-SVG pattern — the icons are
self-hosted inline SVG, **not** ionicons, despite older plan docs), set its `href` and
`aria-label`. No CSS change is needed: `.social-list` / `.social-item .social-link`
(`assets/css/style.css:508–523`) already style any number of items, and the mobile rule
(`:2017`) centers them.

## Implementation Steps

Because the defect is already fixed, the "implementation" for the #34 stage is
documentation + closure, not code:

1. **No edit to `index.html`.** Confirmed clean (`grep -c 'href="#"' index.html` → `0`).
2. **Land this plan** (`docs/plans/issue-34-fix-dead-social-links.md`) via a PR to `main`
   so the investigation and verification are recorded, matching the repo's
   `docs/plans/issue-N-*.md` convention.
3. **Reference `Closes #34`** in the PR so the issue is linked and closed when the
   orchestrator merges.
4. If the owner answers the [Residual Decision](#residual-decision-optional) with a real
   URL, apply the one-line contingency change above as a tiny follow-up; otherwise leave
   as-is.

## Validation Strategy

Already executed (see [Current State](#current-state-evidence)); a reviewer can re-run:

- `grep -c 'href="#"' index.html` → expect `0`.
- Open `index.html` in a browser, click the GitHub icon → a new tab opens at
  `https://github.com/SpecstraAI`; the underlying page does not scroll to top or reset
  the SPA tab.
- Screen-reader / accessibility check: the link announces as "GitHub" (`aria-label`); the
  decorative `<svg>` is skipped (`aria-hidden="true"`).
- `curl -s -o /dev/null -w "%{http_code}" https://github.com/SpecstraAI` → `200`.

## Risks and Mitigations

- **Risk: reviewer compares against the stale local `main` (`416ebf8`) and sees three
  `href="#"` icons, concluding the fix is missing.** Mitigation: the Evidence and
  Acceptance sections pin every check to `origin/main` (`025070e`) and state the exact
  commit (`5726d40`) / PR (#30) that delivered the fix.
- **Risk: the GitHub org URL changes or the org is renamed**, breaking the link.
  Mitigation: low likelihood; the URL is verified live (HTTP 200) and is the repo's own
  org. If it ever breaks, apply the contingency change.
- **Risk: duplicate-work churn** (a parallel `feat/34` branch and closed PR #35 took a
  *different* approach — removing the social list entirely with no GitHub link).
  Mitigation: prefer the shipped `origin/main` state (one working GitHub link), which
  better serves the "connect with me" call-to-action than an empty list. Do not resurrect
  PR #35's approach.

## Success Criteria

- `grep -c 'href="#"' index.html` returns `0` and the sidebar social list contains only
  real, resolving external links. ✅ (already true)
- Every visible sidebar social icon opens a working external profile in a new tab with
  `rel="noopener noreferrer"` and an accessible name. ✅ (already true)
- Issue #34 is linked from a PR to `main` (`Closes #34`) and closes on merge.
- This plan document is present under `docs/plans/`.
