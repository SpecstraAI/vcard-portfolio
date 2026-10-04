"""Static regression checks for the site's shared font configuration."""

from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]


class TypographyTests(unittest.TestCase):
    def test_shared_stylesheet_uses_manrope_with_fallbacks(self):
        css = (ROOT / 'assets/css/style.css').read_text()
        self.assertRegex(css, r"--ff-manrope:\s*'Manrope',\s*Helvetica,\s*Arial,\s*sans-serif;")
        self.assertRegex(css, r'html\s*\{\s*font-family:\s*var\(--ff-manrope\);\s*\}')
        self.assertNotIn('--ff-poppins', css)
        self.assertNotIn('--ff-helvetica', css)

    def test_controls_inherit_site_font(self):
        css = (ROOT / 'assets/css/style.css').read_text()
        for selector in ('button', 'input, textarea'):
            with self.subTest(selector=selector):
                self.assertRegex(css, re.escape(selector) + r'\s*\{[^}]*font:\s*inherit;')

    def test_pages_load_manrope_with_required_weights_and_font_swap(self):
        for name in ('index.html', '404.html'):
            with self.subTest(page=name):
                html = (ROOT / name).read_text()
                self.assertRegex(html, r'<link\s+rel="stylesheet"\s+href="[^"]*assets/css/style\.css">')
                self.assertIn(
                    '<link href="https://fonts.googleapis.com/css2?'
                    'family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
                    html,
                )
                self.assertIn(
                    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
                    html,
                )
                self.assertNotIn('family=Poppins', html)


if __name__ == '__main__':
    unittest.main()
