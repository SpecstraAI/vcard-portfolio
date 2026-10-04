"""Regression checks for the portfolio's displayed identity."""
import json
from html import unescape
from pathlib import Path
import re
import unittest


class ProfileTests(unittest.TestCase):
    def test_identity_is_consistent(self):
        html = (Path(__file__).resolve().parents[1] / 'index.html').read_text()
        self.assertNotIn('Alex Morgan', html)
        self.assertNotIn('UI/UX Designer', html)
        self.assertIn('<h1 class="name" title="Seth Cohen">Seth Cohen</h1>', html)
        self.assertIn('<title>Seth Cohen — Founder & Engineer | Portfolio</title>', unescape(html))
        self.assertIn('<p class="title">Founder & Engineer</p>', unescape(html))
        self.assertIn('alt="Seth Cohen"', html)
        schema = json.loads(re.search(
            r'<script type="application/ld\+json">(.*?)</script>', html, re.S
        ).group(1))
        self.assertEqual(schema['name'], 'Seth Cohen')
        self.assertEqual(schema['jobTitle'], 'Founder & Engineer')


if __name__ == '__main__':
    unittest.main()
