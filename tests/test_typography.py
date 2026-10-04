"""Static regression checks for the site's shared font configuration."""

from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]


class TypographyTests(unittest.TestCase):
    def test_shared_stylesheet_uses_helvetica_with_fallbacks(self):
        css = (ROOT / 'assets/css/style.css').read_text()
        self.assertRegex(css, r'--ff-helvetica:\s*Helvetica,\s*Arial,\s*sans-serif;')
        self.assertRegex(css, r'html\s*\{\s*font-family:\s*var\(--ff-helvetica\);\s*\}')
        self.assertNotIn('--ff-poppins', css)

    def test_controls_inherit_site_font(self):
        css = (ROOT / 'assets/css/style.css').read_text()
        for selector in ('button', 'input, textarea'):
            with self.subTest(selector=selector):
                self.assertRegex(css, re.escape(selector) + r'\s*\{[^}]*font:\s*inherit;')

    def test_pages_share_stylesheet_without_google_font_requests(self):
        for name in ('index.html', '404.html'):
            with self.subTest(page=name):
                html = (ROOT / name).read_text()
                self.assertRegex(html, r'<link\s+rel="stylesheet"\s+href="[^"]*assets/css/style\.css">')
                self.assertNotIn('fonts.googleapis.com', html)
                self.assertNotIn('fonts.gstatic.com', html)


if __name__ == '__main__':
    unittest.main()
