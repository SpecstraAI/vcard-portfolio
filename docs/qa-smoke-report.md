# QA Smoke Report — Headless Browser (#41)

**Date:** 2026-06-17  
**Branch:** feat/41-qa-smoke-verify-the-site-in-a-headless-b  
**Tool:** Playwright 1.61.0 + Chromium headless shell

## Environment Notes

Chromium required manual setup: system libraries (libglib, libnss3, libatk, libdbus, libgbm, etc.) were absent from the container. They were downloaded from the Ubuntu 24.04 Noble package archive and loaded via `LD_LIBRARY_PATH`. Playwright + Chromium can run in this environment with that workaround.

## Results

| # | Check | Result | Detail |
|---|-------|--------|--------|
| 1 | Page renders (avatar + name) | **PASS** | Avatar image visible, name "Alex Morgan" in sidebar |
| 2 | Nav tabs clickable | **PASS** | All 5 tabs clicked: About, Resume, Portfolio, Blog, Contact — active section switched on each |
| 3 | Theme toggle light/dark | **PASS** | Toggle found at `[data-theme-btn]`; `data-theme` attribute changed and body background switched from `rgb(245,245,245)` (light) to `rgb(18,18,18)` (dark) |

**Overall: PASS (3/3)**

## Screenshots

| Screenshot | What it shows |
|------------|---------------|
| `01-initial-load.png` | Initial page load, sidebar and About section |
| `02-tab-about.png` | About tab active |
| `02-tab-resume.png` | Resume tab active |
| `02-tab-portfolio.png` | Portfolio tab active |
| `02-tab-blog.png` | Blog tab active |
| `02-tab-contact.png` | Contact tab active |
| `03-after-theme-toggle.png` | Dark mode after clicking theme toggle |
| `04-final-state.png` | Final state |
