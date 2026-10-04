import json
import unittest
from html.parser import HTMLParser
from pathlib import Path


class ProfileParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('title', 'h1') or (tag == 'p' and attrs.get('class') == 'title') or (
            tag == 'script' and attrs.get('type') == 'application/ld+json'
        ):
            self.current = (tag, attrs, '')

    def handle_data(self, data):
        if self.current:
            tag, attrs, content = self.current
            self.current = (tag, attrs, content + data)

    def handle_endtag(self, tag):
        if self.current and self.current[0] == tag:
            self.elements.append(self.current)
            self.current = None


class ProfileTests(unittest.TestCase):
    def test_profile_identity_is_consistent(self):
        source = (Path(__file__).resolve().parents[1] / 'index.html').read_text()
        self.assertNotIn('Alex Morgan', source)
        self.assertNotIn('UI/UX Designer', source)
        parser = ProfileParser()
        parser.feed(source)
        elements = {tag: (attrs, text.strip()) for tag, attrs, text in parser.elements}
        self.assertEqual(elements['title'][1], 'Seth Cohen — Founder & Engineer | Portfolio')
        self.assertEqual(elements['h1'], ({'class': 'name', 'title': 'Seth Cohen'}, 'Seth Cohen'))
        self.assertEqual(elements['p'][1], 'Founder & Engineer')
        person = json.loads(elements['script'][1])
        self.assertEqual(person['name'], 'Seth Cohen')
        self.assertEqual(person['jobTitle'], 'Founder & Engineer')


if __name__ == '__main__':
    unittest.main()
