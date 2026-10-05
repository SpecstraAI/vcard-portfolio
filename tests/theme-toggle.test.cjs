const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const read = (path) => readFileSync(resolve(__dirname, '..', path), 'utf8');

test('moon hiding outranks the generic SVG display rule in dark mode', () => {
  const css = read('assets/css/style.css');
  // Two classes outrank svg.icon (one class and one element).
  assert.match(css, /\.theme-btn \.theme-icon--moon\s*\{\s*display: none;\s*\}/);
  assert.match(css, /:root\[data-theme="light"\] \.theme-icon--sun\s*\{\s*display: none;\s*\}/);
  assert.match(css, /:root\[data-theme="light"\] \.theme-icon--moon\s*\{\s*display: block;\s*\}/);
});

for (const initialTheme of ['dark', 'light']) {
  test(`${initialTheme} startup and toggling advertise only the destination theme`, () => {
    const attributes = {};
    const dataset = initialTheme === 'light' ? { theme: 'light' } : {};
    const stored = [];
    let click;
    const button = {
      setAttribute: (name, value) => { attributes[name] = value; },
      addEventListener(event, handler) {
        assert.equal(event, 'click');
        click = handler;
      }
    };
    const source = read('assets/js/script.js').split('// theme toggle')[1].split('// page navigation variables')[0];
    runInNewContext(source, {
      document: {
        documentElement: { dataset },
        querySelector(selector) {
          assert.equal(selector, '[data-theme-btn]');
          return button;
        }
      },
      localStorage: { setItem: (key, value) => { stored.push([key, value]); } }
    });
    const destination = initialTheme === 'light' ? 'dark' : 'light';
    assert.equal(attributes['aria-label'], `Switch to ${destination} mode`);
    assert.equal(attributes.title, attributes['aria-label']);
    assert.deepEqual(stored, []); // Initialization preserves the saved preference.
    click();
    assert.equal(dataset.theme || 'dark', destination);
    assert.equal(attributes['aria-label'], `Switch to ${initialTheme} mode`);
    assert.equal(attributes.title, attributes['aria-label']);
    assert.deepEqual(stored, [['theme', destination]]);
    click();
    assert.equal(dataset.theme || 'dark', initialTheme);
    assert.equal(attributes['aria-label'], `Switch to ${destination} mode`);
  });
}
