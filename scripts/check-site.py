#!/usr/bin/env python3
"""Check the static routes and publication boundaries without network access."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://waitingroom.kingchillithepug.com/'
CURRENT = {'index.html', 'share.html', 'patterns.html', 'first-pattern-update.html', 'what-needs-to-change.html', 'professionals.html', 'get-involved.html', 'about.html', 'privacy.html'}
ERRORS = []

class Page(HTMLParser):
    def __init__(self, name, content):
        super().__init__(convert_charrefs=True)
        self.name, self.ids, self.links, self.images = name, [], [], []
        self.h1s, self.canonical, self.refresh, self.lang = 0, None, None, None
        self.main, self.skip = False, False
        self.feed(content)
    def handle_starttag(self, tag, items):
        attrs = dict(items)
        if 'id' in attrs: self.ids.append(attrs['id'])
        if tag == 'html': self.lang = attrs.get('lang')
        if tag == 'h1': self.h1s += 1
        if tag == 'main': self.main = True
        if tag == 'a' and attrs.get('href') == '#main': self.skip = True
        if tag == 'link' and attrs.get('rel') == 'canonical': self.canonical = attrs.get('href')
        if tag == 'meta' and attrs.get('http-equiv', '').lower() == 'refresh': self.refresh = attrs.get('content', '')
        if tag == 'img': self.images.append(attrs)
        for key in ('href', 'src'):
            if attrs.get(key): self.links.append(attrs[key])

pages = {}
for path in sorted(ROOT.glob('*.html')):
    source = path.read_text()
    page = pages[path.name] = Page(path.name, source)
    if page.h1s != 1: ERRORS.append(f'{path.name}: expected one h1')
    if not page.lang or not page.main: ERRORS.append(f'{path.name}: missing language or main landmark')
    if len(page.ids) != len(set(page.ids)): ERRORS.append(f'{path.name}: duplicate IDs')
    if path.name in CURRENT:
        if not page.skip or 'main' not in page.ids: ERRORS.append(f'{path.name}: missing skip target')
        expected = BASE + ('' if path.name == 'index.html' else path.name)
        if page.canonical != expected: ERRORS.append(f'{path.name}: incorrect canonical')
    elif not page.refresh or not page.canonical:
        ERRORS.append(f'{path.name}: moved page needs redirect and destination canonical')
    for image in page.images:
        if 'alt' not in image or not image.get('width') or not image.get('height'):
            ERRORS.append(f'{path.name}: image needs alt and dimensions')
    if re.search(r'data-(owner-value|live-stat|home-stat|patterns-page|professional-patterns-page|roadmap-stories|count-up)', source):
        ERRORS.append(f'{path.name}: obsolete numerical hydration hook')

for name, page in pages.items():
    for url in page.links:
        parsed = urlsplit(url)
        if parsed.scheme or parsed.netloc: continue
        filename = unquote(parsed.path) or name
        target = ROOT / filename
        if not target.exists(): ERRORS.append(f'{name}: missing local target {url}')
        if parsed.fragment and filename in pages and parsed.fragment not in pages[filename].ids:
            ERRORS.append(f'{name}: missing fragment {url}')
    if page.refresh:
        destination = page.refresh.split('url=', 1)[-1]
        filename = urlsplit(destination).path
        if filename not in CURRENT: ERRORS.append(f'{name}: redirect not to current content')
        if page.canonical != BASE + filename: ERRORS.append(f'{name}: redirect canonical mismatch')
        fragment = urlsplit(destination).fragment
        if fragment and fragment not in pages[filename].ids: ERRORS.append(f'{name}: redirect fragment missing')

for url in re.findall(r'url\([\"\']?([^\)\"\']+)', (ROOT/'styles.css').read_text()):
    if not urlsplit(url).scheme and not (ROOT/url).exists(): ERRORS.append(f'CSS asset missing: {url}')

assets = json.loads((ROOT/'data/share_assets.json').read_text())['assets']
share_source = (ROOT/'get-involved.html').read_text()
from html import unescape
for asset in assets:
    for key in ('image_path', 'download_path'):
        if not (ROOT/asset[key]).is_file(): ERRORS.append(f'Missing share asset: {asset[key]}')
    if asset['caption'] not in unescape(share_source): ERRORS.append(f"Share caption differs from registry: {asset['id']}")

for workflow in ('refresh-public-data.yml', 'refresh-professional-data.yml'):
    source = (ROOT/'.github/workflows'/workflow).read_text()
    if 'schedule:' in source or 'if: ${{ false }}' not in source:
        ERRORS.append(f'{workflow}: numerical refresh must remain paused')

sitemap = (ROOT/'sitemap.xml').read_text()
expected_urls = {BASE + ('' if name == 'index.html' else name) for name in CURRENT}
if set(re.findall(r'<loc>(.*?)</loc>', sitemap)) != expected_urls: ERRORS.append('Sitemap differs from current pages')

if ERRORS:
    print('\n'.join(ERRORS), file=sys.stderr)
    raise SystemExit(1)
print(f'Static site checks passed: {len(CURRENT)} content pages, {len(pages)-len(CURRENT)} redirects, local links/fragments, share assets and disabled automatic refresh.')
