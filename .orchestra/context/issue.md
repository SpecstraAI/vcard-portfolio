# Issue #13: Performance: self-host icons, optimize images, remove cruft

- Ion-icons load from unpkg CDN (`index.html:1196-1197`) — self-host or replace with inline SVGs
- Images total ~876 KB as PNG/JPG — convert to WebP and add `width`/`height` attributes to prevent layout shift
- Delete stray files: `website-demo-image/Thumbs.db`, `index.txt`
- Add a `404.html` + deploy config if targeting GitHub Pages