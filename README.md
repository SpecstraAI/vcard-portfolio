# vCard Portfolio

A fully responsive single-page personal portfolio ("vCard") that presents an
About, Resume, Portfolio, Blog, and Contact section as client-side-routed tabs
in one HTML document — built with plain HTML, CSS, and JavaScript, with no
backend, build step, or bundler.

This repository is a customized fork of the open-source
[`codewithsadee/vcard-personal-portfolio`](https://github.com/codewithsadee/vcard-personal-portfolio)
template, re-skinned for the placeholder person "Alex Morgan" and deployed as a
static GitHub Pages site.

**Live site:** <https://specstraai.github.io/vcard-portfolio/>

## Demo

![vCard Desktop Demo](./website-demo-image/desktop.png "Desktop Demo")
![vCard Mobile Demo](./website-demo-image/mobile.png "Mobile Demo")

## Prerequisites

Before you begin, ensure you have met the following requirements:

* [Git](https://git-scm.com/downloads "Download Git") must be installed on your operating system.

## Getting Started

Clone this repository:

```bash
git clone https://github.com/SpecstraAI/vcard-portfolio.git
```

There is no install or build step — this is a plain static HTML/CSS/JS site.
Serve the repo root over HTTP and open it in a browser:

```bash
cd vcard-portfolio
python3 -m http.server 8000
```

Then visit <http://localhost:8000/>.

## Deployment

The site is deployed as a GitHub Pages project site at
<https://specstraai.github.io/vcard-portfolio/>. An empty `.nojekyll` file at
the repo root disables Jekyll processing so the `assets/` directory is served
verbatim, and `404.html` provides a custom not-found page.

## Credits

This project is based on the
[`codewithsadee/vcard-personal-portfolio`](https://github.com/codewithsadee/vcard-personal-portfolio)
template by [codewithsadee](https://github.com/codewithsadee). All original
credit for the design goes to the upstream author.

## License

MIT
