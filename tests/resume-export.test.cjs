const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const read = (path) => readFileSync(resolve(__dirname, '..', path), 'utf8');

test('both export buttons open native print without changing page state', () => {
  const handlers = [];
  let prints = 0;
  const window = Object.freeze({ print: () => { prints++; } });
  const document = Object.freeze({
    querySelectorAll(selector) {
      assert.equal(selector, '[data-resume-export]');
      return [0, 1].map(() => ({
        addEventListener(event, handler) {
          assert.equal(event, 'click');
          handlers.push(handler);
        }
      }));
    }
  });
  // No navigation, storage, theme, or DOM mutation APIs are exposed.
  runInNewContext(read('assets/js/resume-export.js'), { window, document });
  assert.equal(handlers.length, 2);
  assert.equal(prints, 0);
  handlers.forEach((handler, index) => {
    handler();
    assert.equal(prints, index + 1);
  });
  // A second export after canceling is still available.
  handlers[0]();
  assert.equal(prints, 3);
});

test('export is discoverable in the sidebar and resume, not a blank PDF link', () => {
  const html = read('index.html');
  assert.equal((html.match(/type="button" class="cv-btn" data-resume-export/g) || []).length, 2);
  assert.match(html, /<article class="resume"[\s\S]*?data-resume-export/);
  assert.match(html, /<aside[\s\S]*?data-resume-export[\s\S]*?<\/aside>/);
  assert.doesNotMatch(html, /href="assets\/cv\.pdf"/);
  assert.match(html, /href="\.\/assets\/css\/resume-print\.css" media="print"/);
  assert.match(html, /src="\.\/assets\/js\/resume-export\.js"/);
  assert.match(html, /Choose “Save as PDF”/);
});

test('print CSS exposes resume and collapsed contacts independently of active tab', () => {
  const css = read('assets/css/resume-print.css');
  assert.match(css, /main, \.main-content, \.sidebar, article\.resume\s*\{[^}]*display: block !important;[^}]*max-height: none !important;/);
  assert.match(css, /article:not\(\.resume\)[^{]*\{\s*display: none !important;/);
  assert.match(css, /\.sidebar-info, \.sidebar-info_more\s*\{[^}]*opacity: 1 !important;[^}]*visibility: visible !important;/);
  assert.match(css, /color: #000 !important;/);
  assert.match(css, /body \{ background: #fff !important;/);
  assert.match(css, /break-inside: avoid;/);
});
