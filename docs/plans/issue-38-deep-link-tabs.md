# Implementation Plan — Deep-Link Tabs via URL Hash (Issue #38)

## Summary

Issue #38 asks for the navbar tabs (About / Resume / Portfolio / Blog / Contact) to be
shareable, reload-safe, and navigable with the browser Back/Forward buttons by reflecting
the active tab in the URL hash.

**Most of this is already implemented** on the working branch by commit `776fd2e`
("feat: add hash routing and SVG favicon"). The page-navigation section of
`assets/js/script.js` (lines **266–286**) already:

- updates the URL hash on a nav-link click,
- reads `location.hash` on initial load and activates the matching page (falling back to
  the first/About page for a missing or unknown hash),
- listens for `hashchange`,
- routes every activation through the existing `activatePage()` so the `active` class and
  `aria-current="page"` stay in sync.

There is **one real defect** against the issue's acceptance criteria: the click handler
uses `history.replaceState(...)` instead of `history.pushState(...)`. `replaceState`
overwrites the current history entry rather than adding a new one, so **no per-tab history
entries are ever created** — and therefore **browser Back/Forward does not move between
tabs** (acceptance criterion #3 fails). The fix is a one-line change plus a small dedupe
guard. This plan documents the current state, the exact change, and how to verify it.

**Recommendation:** apply the minimal `replaceState → pushState` fix (plus the
same-tab dedupe guard) in `assets/js/script.js`. No `index.html` markup change is
required — page/nav names already map cleanly and case-insensitively.

## Current State (Evidence)

The page-navigation section of `assets/js/script.js` on this branch (and on `main`) is:

```js
// add event to all nav link — also update URL hash
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    var pageName = this.innerHTML.toLowerCase();
    history.replaceState(null, '', '#' + pageName);   // <-- defect: replaceState
    activatePage(pageName);
  });
}

// activate the page indicated by the URL hash, falling back to the first page
const handleHash = function () {
  var hash = window.location.hash.slice(1);
  var valid = false;
  for (var i = 0; i < pages.length; i++) {
    if (pages[i].dataset.page === hash) { valid = true; break; }
  }
  activatePage(valid ? hash : pages[0].dataset.page);
};

window.addEventListener('hashchange', handleHash);
handleHash();
```

`activatePage(pageName)` (`assets/js/script.js:246–264`) toggles the `active` class on
each `[data-page]`, scrolls to top, and syncs `active` + `aria-current="page"` on the
matching `[data-nav-link]`.

Markup names map cleanly (verified in `index.html`):

| Nav-link button text (lowercased) | `[data-page]` value | Match |
| --- | --- | --- |
| `About` → `about` (`index.html:220`) | `about` (`index.html:258`) | ✅ |
| `Resume` → `resume` (`index.html:224`) | `resume` (`index.html:556`) | ✅ |
| `Portfolio` → `portfolio` (`index.html:228`) | `portfolio` (`index.html:749`) | ✅ |
| `Blog` → `blog` (`index.html:232`) | `blog` (`index.html:1016`) | ✅ |
| `Contact` → `contact` (`index.html:236`) | `contact` (`index.html:1226`) | ✅ |

Because the nav-link labels are single words with no surrounding whitespace, the existing
`this.innerHTML.toLowerCase()` produces exactly the `[data-page]` token. (See
[Risks](#risks-and-mitigations) for a note on keeping this robust.)

## Why Back/Forward is broken today (root cause)

- `history.replaceState(state, '', url)` **modifies the current history entry in place**.
  It never pushes a new entry, so clicking About → Portfolio → Blog leaves the history
  stack at the same single entry (its URL just keeps getting overwritten). Pressing Back
  then leaves the site entirely instead of returning to the previously viewed tab.
- `history.pushState(state, '', url)` **adds a new entry** to the history stack. Clicking
  About → Portfolio → Blog produces three entries. Pressing Back returns to `#portfolio`,
  and Forward returns to `#blog`.
- Neither `pushState` nor `replaceState` fires a `hashchange` (or `popstate`) event by
  itself — which is why the click handler must keep calling `activatePage()` directly.
- When the user presses **Back/Forward** and that navigation changes the URL fragment, the
  browser fires `hashchange` (in addition to `popstate`). The existing
  `window.addEventListener('hashchange', handleHash)` therefore already handles the
  re-activation on Back/Forward **once entries actually exist** — so switching to
  `pushState` is sufficient to make Back/Forward work end-to-end without adding a
  `popstate` listener.

This is standard History API / fragment-navigation behavior; the only code change needed
to satisfy criterion #3 is creating the history entries in the first place.

## Scope and Assumptions

**In scope:** the page-navigation section of `assets/js/script.js` (lines 266–286), the
nav-link click handler specifically.

**Out of scope:** any visual/layout change; the testimonials modal, custom select,
portfolio filter, contact form, and theme-toggle logic; `index.html` markup (no change
required — see the table above); `assets/css/style.css`.

**Assumptions:**

- The five `[data-page]` tokens (`about`, `resume`, `portfolio`, `blog`, `contact`) and
  their nav-link labels remain single lowercase words, so case-insensitive matching via
  `toLowerCase()` continues to map correctly.
- "About" is the intended default tab; `pages[0]` is the About article
  (`index.html:258`), so the existing `pages[0].dataset.page` fallback is correct for
  empty/unknown hashes.
- The base branch is `main`; this branch already contains commit `776fd2e`, so the only
  delta this stage needs is the `replaceState → pushState` fix.

## Implementation Steps

### Step 1 — Switch the nav-click handler from `replaceState` to `pushState` (with a dedupe guard)

In `assets/js/script.js`, replace the nav-link click loop (lines **267–273**):

```js
// add event to all nav link — also update URL hash
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    var pageName = this.innerHTML.toLowerCase();
    history.replaceState(null, '', '#' + pageName);
    activatePage(pageName);
  });
}
```

with:

```js
// add event to all nav link — push a history entry so Back/Forward works
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    var pageName = this.innerHTML.toLowerCase();
    // Only push a new entry when the tab actually changes, so repeated clicks
    // on the active tab don't stack dead history entries.
    if (window.location.hash.slice(1) !== pageName) {
      history.pushState(null, '', '#' + pageName);
    }
    activatePage(pageName);
  });
}
```

Notes:

- The guard compares the current fragment (`window.location.hash.slice(1)`) to the
  target `pageName`. On the very first click of a tab from the default load (no hash),
  `location.hash` is `''`, so even clicking About pushes `#about` once — which is the
  desired "URL now reflects the tab" behavior. Subsequent repeat-clicks on the same tab
  are no-ops for history.
- `activatePage(pageName)` is still called directly because `pushState` does not fire
  `hashchange`. There is no double-activation: the direct call is the only activation on
  click; `handleHash` runs only on load and on Back/Forward.

### Step 2 — Leave `handleHash`, the `hashchange` listener, and the initial call unchanged

Lines **275–286** already satisfy criteria #2 (deep-link load + fallback) and, once
Step 1 creates history entries, criterion #3 (Back/Forward). No change needed:

- `handleHash()` validates the fragment against `[data-page]` tokens and falls back to
  `pages[0]` (About) for empty/unknown hashes.
- `window.addEventListener('hashchange', handleHash)` re-activates the correct page when
  Back/Forward changes the fragment.
- The trailing `handleHash()` call runs on initial load so `…/#portfolio` opens Portfolio.

### Step 3 (optional hardening, not required to pass acceptance) — normalize the label lookup

`activatePage` matches the active nav link with
`pageName === navigationLinks[i].innerHTML.toLowerCase()`. This is correct today because
labels are single words, but it is whitespace-sensitive. If a future label gains
surrounding markup/whitespace, switch the click handler and this comparison to
`this.textContent.trim().toLowerCase()`. **Do not** make this change as part of #38 unless
a label changes — it is noted only so the implementer doesn't "fix" the current working
code unnecessarily.

## Validation Strategy

Serve the static site (e.g. `python3 -m http.server 8765` from the repo root) and open
`http://localhost:8765/index.html`. Verify each acceptance criterion:

1. **Click updates the hash** — click **Portfolio**; the URL becomes `…/index.html#portfolio`
   and the Portfolio panel shows. Repeat for each tab.
2. **Deep-link load** — open `…/index.html#resume` in a fresh tab → the Resume panel is
   active on load and the Resume nav link has `aria-current="page"`. Open
   `…/index.html#bogus` and `…/index.html` (no hash) → About is active (fallback).
3. **Back/Forward** — from a fresh load, click Portfolio, then Blog, then Contact. Press
   **Back** twice → you land back on Portfolio (via Blog), with the correct panel and
   `aria-current` each step. Press **Forward** → returns to Blog. (This is the criterion
   that fails today and is fixed by Step 1.)
4. **`aria-current` correctness** — after every transition above, exactly one nav link
   carries `aria-current="page"` and it matches the visible panel.

Optional automated check (Playwright), asserting `history.length` increases per distinct
tab click and that `goBack()` re-activates the previous panel:

```js
await page.goto('http://localhost:8765/index.html');
await page.click('button[data-nav-link]:has-text("Portfolio")');
await page.click('button[data-nav-link]:has-text("Blog")');
await page.goBack();                       // expect URL → #portfolio
// assert [data-page="portfolio"] has class "active" and the Portfolio nav link has aria-current
```

> Note: a live browser run was attempted during planning but the sandbox lacks the system
> libraries to launch Chromium (`libglib-2.0.so.0` missing), so the criteria above were
> validated by code analysis against the History API's documented semantics. The
> implementer should run the manual steps (and optionally the Playwright snippet) in a real
> browser before merge.

## Risks and Mitigations

- **Risk: repeated clicks on the active tab stack dead history entries**, making Back feel
  broken (one press appears to do nothing). **Mitigation:** the Step 1 dedupe guard skips
  `pushState` when the fragment already equals the target tab.
- **Risk: someone "simplifies" by removing the direct `activatePage()` call**, assuming
  `pushState` fires `hashchange`. **Mitigation:** it does not — the click handler must keep
  calling `activatePage()` directly. Called out in Step 1.
- **Risk: whitespace/markup creeps into a nav-link label**, breaking the
  `innerHTML.toLowerCase()` → `[data-page]` match. **Mitigation:** documented in Step 3;
  switch to `textContent.trim().toLowerCase()` if labels ever change. Not needed today.
- **Risk: a reviewer reads the issue ("the URL never changes") and assumes nothing is
  implemented.** **Mitigation:** this plan pins the current state to commit `776fd2e` and
  scopes the work to the single `replaceState → pushState` defect.

## Success Criteria

- Clicking a tab updates the URL hash to that tab (`#about` / `#resume` / `#portfolio` /
  `#blog` / `#contact`).
- Loading `…/#<valid-tab>` opens that tab directly; an unknown or empty hash opens About.
- Browser Back/Forward moves between previously visited tabs, with the correct panel and
  `aria-current` at each step.
- `aria-current="page"` stays correct on exactly the active nav link throughout.
- The change is confined to `assets/js/script.js`'s page-navigation section; no
  visual/layout change; everything still routes through `activatePage()`.
- Issue #38 is linked from a PR to `main` (`Closes #38`) and this plan is present under
  `docs/plans/`.
