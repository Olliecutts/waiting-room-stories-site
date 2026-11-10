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
| `patterns.html` | Read the evidence status, limits and independent context |
| `first-pattern-update.html` | Read the dated 10 November correction and next steps |
| `what-needs-to-change.html` | Read four proposed UK research questions |
| `professionals.html` | Contribute professional experience separately |
| `get-involved.html` | Contact Ollie or use the two approved share graphics |
| `about.html` | Understand Chilli’s origin story and the two missions |
| `privacy.html` | Understand participation choices and the remaining operational privacy review |

Seven older routes remain as redirects to the relevant current page or section. Keep these URLs working.

## Numerical publication is on hold

Both aggregate JSON URLs currently return a fixed nonnumeric review-status object. Public chart hydration has been removed. The two refresh jobs are explicitly disabled in source and no longer scheduled. Their old fetch/integration steps are retained for a future reviewed repair, not immediate reactivation.

The source checks only validate this publication hold. **Passing checks is not approval or methodological validation for future statistics.** See [automatic data refresh](docs/automatic-data-refresh.md) for what must be established before numerical publication returns.

This change removes the current small-cell payloads; it does not erase older public Git history or cached copies. No raw submissions were inspected or changed as part of the website repair.

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
node --test tests/publication-hold.test.mjs
```

The static checks cover current routes, legacy redirects, local links and fragments, image alternatives/dimensions, share-caption consistency and the refresh hold. The tests check that aggregate or extra data cannot pass the hold validator. Responsive browser checks remain necessary for layout changes.

## Artwork and interaction

The approved Chilli flower-hat artwork and original Chilli photographs remain in use. Only two assets are active in `data/share_assets.json`. Do not add new public artwork without Ollie’s approval.

Share captions are rendered in HTML so the toolkit works without JavaScript. Keep their text in sync with `data/share_assets.json`; the static checker detects differences. JavaScript only enhances the mobile navigation and copy buttons. No analytics scripts or advertising pixels are added.

## Delivery boundaries

Ollie approved the UK-first direction and website repair on 10 November 2026. Deliver changes through an isolated branch and reviewed pull request, preserving unrelated work. GitHub Pages deploys merged `main` after validation. Verify the deployed pages and data URLs.

Do not publish or schedule social posts, send outreach, activate a fundraising programme, change private form/storage systems or incur costs under website-repair authority. New numerical publication needs the evidence and permission checks described above.

Never add raw responses, identifying owner or professional details, unapproved quotations, private medical records or secrets. Use the verified public project contact route; do not substitute private contact details.
