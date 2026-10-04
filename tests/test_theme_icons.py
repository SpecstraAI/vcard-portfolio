"""Regression checks for theme icon visibility and CSS specificity."""

from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]


class ThemeIconTests(unittest.TestCase):
    def test_dark_mode_hide_rule_beats_svg_display_reset(self):
        css = (ROOT / 'assets/css/style.css').read_text()
        # svg.icon has specificity (0, 1, 1); the hide rule must beat it.
        # A bare .theme-icon--moon selector loses even when declared later.
        self.assertRegex(css, r'img, svg\.icon, a, button, time, span\s*\{\s*display:\s*block;\s*\}')
        self.assertRegex(css, r'svg\.icon\.theme-icon--moon\s*\{\s*display:\s*none;\s*\}')

    def test_light_mode_hides_sun_and_shows_moon(self):
        css = (ROOT / 'assets/css/style.css').read_text()
        # These root attribute rules outrank the default moon hide rule.
        for icon, display in (('sun', 'none'), ('moon', 'block')):
            with self.subTest(icon=icon):
                selector = f':root[data-theme="light"] .theme-icon--{icon}'
                self.assertRegex(
                    css,
                    re.escape(selector) + r'\s*\{\s*display:\s*' + display + r';\s*\}',
                )

    def test_toggle_icons_use_visibility_classes(self):
        html = (ROOT / 'index.html').read_text()
        for icon in ('sun', 'moon'):
            with self.subTest(icon=icon):
                self.assertIn(f'class="icon theme-icon theme-icon--{icon}"', html)


if __name__ == '__main__':
    unittest.main()
