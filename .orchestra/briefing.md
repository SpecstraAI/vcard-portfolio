# Stage Briefing

- Assigned agent: **Frontend Engineer** (engineer)
- Composition: template (template:v1)
- Composed at: 2026-06-12T00:14:38.718041 UTC

## Run Goal
Performance: self-host icons, optimize images, remove cruft

- Ion-icons load from unpkg CDN (`index.html:1196-1197`) — self-host or replace with inline SVGs
- Images total ~876 KB as PNG/JPG — convert to WebP and add `width`/`height` attributes to prevent layout shift
- Delete stray files: `website-demo-image/Thumbs.db`, `index.txt`
- Add a `404.html` + deploy config if targeting GitHub Pages

## Stage Goal
Complete the Run stage.

## Context Bundle
| Kind | Source | Path | Summary |
| --- | --- | --- | --- |
| issue_body | issue:13 | `.orchestra/context/issue.md` | Performance: self-host icons, optimize images, remove cruft |

## Expected Output
- Kind: **generic_artifact**
- Description: Produce the stage's expected output artifact.

## Success Criteria
The stage's Completion Contract is satisfied.
