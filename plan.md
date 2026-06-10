# Implementation Plan: Add "Download CV" Button to Portfolio Sidebar

Closes #1

---

## Summary

Add a full-width "Download CV" anchor element to the sidebar's expandable info panel (`.sidebar-info_more` in `index.html`), positioned directly below the `.contacts-list` and above the `.separator`/`.social-list` block. The control uses a native `<a href="assets/cv.pdf" download>` so no JavaScript is required. A new CSS class `.cv-btn` in `assets/css/style.css` mirrors the visual pattern of `.form-btn` (gradient border, `--orange-yellow-crayola` text, `::before` overlay, hover transition, full-width, icon slot) while remaining decoupled from the contact form. A minimal placeholder `assets/cv.pdf` is added so the download link resolves immediately; swapping in a real CV later requires no code change.

---

## Scope and Assumptions

### In scope
- New HTML anchor element in `index.html` between `</ul>` (line 124) and `<div class="separator">` (line 126).
- New CSS class `.cv-btn` in `assets/css/style.css`, appended near the existing `.form-btn` rules (~line 1222).
- Placeholder `assets/cv.pdf` — a minimal valid PDF (7-byte or single-page).

### Non-goals / explicitly out of scope
- Modifying `.form-btn` or any contact-form behavior.
- Download tracking, analytics, or JavaScript-driven download handling.
- Real CV content.
- Changing the `.separator` or `.social-list` markup.
- Adding any new pages or nav links.

### Assumptions
- Ionicons 5.5.2 is already loaded from CDN (`index.html` lines 1196–1197); `download-outline` is a valid icon name in that version.
- The button should appear on both desktop and mobile expanded sidebar; no new responsive breakpoints are needed because the sidebar's existing max-width constraints already make any full-width child adapt correctly.
- The placeholder PDF only needs to be a valid, non-corrupt PDF so browsers accept it as a download — no content required.
- CSS variables `--border-gradient-onyx`, `--orange-yellow-crayola`, `--bg-gradient-jet`, `--bg-gradient-yellow-1`, `--bg-gradient-yellow-2`, `--shadow-3`, `--transition-1`, and `--fs-6` are all already defined in `:root` in `style.css` and can be referenced without modification.

---

## Affected Areas

| File | New/Edit | Responsibility |
|---|---|---|
| `index.html` | edit | Insert `.cv-btn` anchor between `</ul>` (`.contacts-list`, line 124) and `<div class="separator">` (line 126) |
| `assets/css/style.css` | edit | Add `.cv-btn` class and its `::before` / `ion-icon` / `:hover` / `:hover::before` rules after the `.form-btn` block (~line 1222) |
| `assets/cv.pdf` | new | Minimal valid placeholder PDF so `href="assets/cv.pdf"` resolves and browsers trigger the file download |

---

## Implementation Steps

### Step 1 — Add the placeholder `assets/cv.pdf`

Create `assets/cv.pdf` as a minimal valid PDF. The smallest self-contained PDF that most browsers/OS parsers accept is:

```
%PDF-1.0
1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj
2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj
3 0 obj<</Type /Page /MediaBox [0 0 612 792] /Parent 2 0 R>>endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer<</Size 4 /Root 1 0 R>>
startxref
190
%%EOF
```

Write this content verbatim to `assets/cv.pdf`. The file must not be zero bytes or the browser may refuse the download.

### Step 2 — Add the `.cv-btn` CSS class to `assets/css/style.css`

After line 1222 (the last rule in the `.form-btn` block, `.form-btn:disabled:hover::before { background: var(--bg-gradient-jet); }`), insert:

```css
/*-----------------------------------*\
  #CV-BUTTON
\*-----------------------------------*/

.cv-btn {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 13px 20px;
  background: var(--border-gradient-onyx);
  color: var(--orange-yellow-crayola);
  border-radius: 14px;
  font-size: var(--fs-6);
  text-transform: capitalize;
  box-shadow: var(--shadow-3);
  z-index: 1;
  transition: var(--transition-1);
  text-decoration: none;
}

.cv-btn::before {
  content: "";
  position: absolute;
  inset: 1px;
  background: var(--bg-gradient-jet);
  border-radius: inherit;
  z-index: -1;
  transition: var(--transition-1);
}

.cv-btn ion-icon { font-size: 16px; }

.cv-btn:hover { background: var(--bg-gradient-yellow-1); }

.cv-btn:hover::before { background: var(--bg-gradient-yellow-2); }
```

Key differences from `.form-btn`: the selector name is `.cv-btn`, `text-decoration: none` is added because this is an `<a>` tag (not a `<button>`), and the `:disabled` rules are omitted because anchors cannot be disabled.

### Step 3 — Insert the HTML anchor in `index.html`

Between line 124 (`        </ul>`) and line 126 (`        <div class="separator">`) in `index.html`, insert the following block (maintaining the two-space/consistent indentation already used in the sidebar section):

```html
        <a href="assets/cv.pdf" download class="cv-btn">
          <ion-icon name="download-outline"></ion-icon>
          <span>Download CV</span>
        </a>

```

The `download` attribute (no value) tells the browser to save the file using the server-supplied or path-derived filename (`cv.pdf`). No `target` attribute is needed. The element must be placed **after** `</ul>` at line 124 and **before** `<div class="separator">` at line 126 so it appears below the contacts list and above the social links section.

---

## Validation Strategy

1. **Visual check (desktop):** Open `index.html` in a browser (or via `python3 -m http.server 8080`). The "Download CV" button must be visible in the sidebar below the contact info list and above the social icons, styled with the orange-yellow text, gradient border, and dark interior matching the "Send Message" button on the Contact page.
2. **Visual check (mobile):** Resize the browser to < 580 px width. Click "Show Contacts" to expand the sidebar. Confirm the "Download CV" button appears in the same position (below contacts, above social links) and is full-width.
3. **Download behavior:** Click the button. The browser must trigger a file download named `cv.pdf` without navigating away from the page.
4. **No JavaScript required:** Confirm in DevTools Network tab that clicking the button generates no XHR/fetch requests — only a direct file download.
5. **No regressions:** Click all five nav tabs (About, Resume, Portfolio, Blog, Contact), toggle the testimonial modal, use the portfolio filter, and confirm the "Send Message" button on the Contact page still requires form validation before enabling. None of these should be affected.
6. **No console errors:** Confirm DevTools Console shows no errors after page load and after clicking the "Download CV" button.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Ionicons CDN unavailable (e.g. offline dev environment) | `download-outline` icon simply renders invisible; text "Download CV" remains and the button functions. Document this as an existing project constraint (same behavior affects all other icons). |
| Placeholder PDF rejected by strict PDF parsers | Use the minimal-but-valid PDF structure in Step 1. If a browser still rejects it, use a single-page PDF generated by LibreOffice or any standard tool — the content is irrelevant. |
| `z-index: 1` on `.cv-btn` conflicting with sidebar layering | The `.form-btn` uses the same `z-index: 1` without issues; the sidebar has no stacking contexts that would interfere. |
| `text-decoration: none` missed on `.cv-btn` | Without it, browsers render an underline on the anchor text. Step 2 includes it explicitly. |
| Incorrect insertion point in `index.html` causing button to appear inside/after social list | Step 3 specifies exact surrounding lines (line 124 `</ul>`, line 126 `<div class="separator">`). Verify by diffing the file after edit. |

---

## Success Criteria

1. `index.html` contains `<a href="assets/cv.pdf" download class="cv-btn">` with a nested `<ion-icon name="download-outline">` and `<span>Download CV</span>`, inserted between the close of `.contacts-list` and the `.separator` preceding `.social-list`.
2. `assets/css/style.css` contains a `.cv-btn` block and its `::before`, `ion-icon`, `:hover`, and `:hover::before` rules, positioned after the `.form-btn` block, with no modifications to any `.form-btn` rule.
3. `assets/cv.pdf` exists and is a non-zero, valid PDF file.
4. Opening `index.html` in a browser and clicking "Download CV" triggers a browser file-download dialog or saves `cv.pdf` without navigating away from the page.
5. The button is visible in the sidebar's expanded panel on both desktop (always visible) and mobile (visible after "Show Contacts" is toggled), positioned below the contacts list and above the social links.
6. The Contact page "Send Message" button behavior is unchanged (disabled at load, enabled only when form is valid).
7. No JavaScript errors appear in the browser console on page load or on button click.
