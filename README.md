# Waiting Room Stories

The existing static website for [Waiting Room Stories](https://waitingroom.kingchillithepug.com/), led by Ollie Cutts / KingChilliThePug.

## Purpose and current direction

The primary purpose is practical reform of financial access to emergency and specialist veterinary care. The first phase focuses on the UK. US and other international experiences remain welcome for separately analysed later work.

Helping individual animals through verified fundraising is a separate future ambition. The project is not an emergency assistance service, charity, grant provider or veterinary payment intermediary. It has no agreed trial or partnership to announce.

## Pages

| File | Visitor purpose |
| --- | --- |
| `index.html` | Understand the purpose and choose a useful next step |
| `share.html` | Understand the owner form, permissions and service boundary |
| `patterns.html` | Read checked owner statistics, UK counts, methods and downloads |
| `first-pattern-update.html` | Read the dated 10 November correction and next steps |
| `what-needs-to-change.html` | Read four proposed UK research questions |
| `professionals.html` | Contribute professional experience separately |
| `get-involved.html` | Contact Ollie or use the two approved share graphics |
| `about.html` | Understand Chilli’s origin story and the two missions |
| `privacy.html` | Understand participation choices and the remaining operational privacy review |

Seven older routes remain as redirects to the relevant current page or section. Keep these URLs working.

## Current statistical release

The owner release `2026-11-10-v1` contains 235 distinct current-form submissions recording permission for anonymous campaign use. Its source is a snapshot of the connected response Sheet, not a claim to have reconciled every response in the live Fillout account. The included responses run from 24 May to 7 July 2026. It is self-selected and predominantly US-based; the 24 UK submissions are shown separately as selected counts only.

The page is generated as static HTML, so its charts and numbers work without JavaScript. The frozen aggregate JSON, CSV and two-page PDF are public. See [release methods and checks](docs/statistical-release-2026-11-10.md) and the public page for eligibility, denominators, grouping and limitations.

Professional Insight remains on a nonnumeric publication hold. Both old automatic refresh jobs remain disabled and unscheduled. Their processed source is not used by this release. [Refresh documentation](docs/automatic-data-refresh.md) explains the boundary and future review requirements.

The source and release were independently checked. Passing code checks alone is not methodological approval for another release. Private source records were inspected read-only for this release; they are not stored in this repository. Older public Git history and cached copies are not erased by this correction.

## Local preview and checks

From this repository root:

```bash
python3 -m http.server 8787
```

Open `http://127.0.0.1:8787/`. No build system or package install is needed.

```bash
python3 scripts/check-site.py
node --check site.js
node scripts/validate-public-data.mjs
node scripts/validate-professional-data.mjs
node --test tests/*.test.mjs
python3 scripts/render-statistics.py --check
python3 -m unittest discover -s tests -p 'test_*.py'
```

The checks cover routes, links and fragments, image alternatives/dimensions, share captions, disabled refresh jobs, owner schema/arithmetic, the professional hold, consistency of the generated HTML/CSV/JSON, and synthetic source-processing regression cases. Responsive browser checks remain necessary for layout changes.

`scripts/build-statistics.py` accepts only a separately prepared private minimised input outside this repository. It writes an aggregate candidate, not an approved release. Never use real private responses as public test fixtures. `scripts/render-statistics.py` renders a reviewed aggregate; `scripts/build-briefing.py` builds the dated PDF with ReportLab and DejaVu fonts. Visually review the PDF after rebuilding it. CI needs no private data, third-party services or PDF-generation libraries.

## Artwork and interaction

The approved Chilli flower-hat artwork and original Chilli photographs remain in use. Only two assets are active in `data/share_assets.json`. Do not add new public artwork without Ollie’s approval.

Share captions are rendered in HTML so the toolkit works without JavaScript. Keep their text in sync with `data/share_assets.json`; the static checker detects differences. JavaScript only enhances the mobile navigation and copy buttons. No analytics scripts or advertising pixels are added.

## Delivery boundaries

Ollie approved the UK-first direction and website repair on 10 November 2026, then instructed the project to produce public statistics for owners, companies and lawmakers. That instruction authorises this checked release. Deliver changes through an isolated branch and reviewed pull request, preserving unrelated work. GitHub Pages deploys merged `main` after validation. Verify the deployed pages and downloads.

Do not publish or schedule social posts, send outreach, activate a fundraising programme, change private form/storage systems or incur costs under website-repair authority. Any later numerical release needs fresh evidence and permission checks; this snapshot is not approval to reactivate the old exporter.

Never add raw responses, identifying owner or professional details, unapproved quotations, private medical records or secrets. Use the verified public project contact route; do not substitute private contact details.
