# The Waiting Room Stories Project Static Site

Public website files for The Waiting Room Stories Project.

Target domain: `waitingroom.kingchillithepug.com`.

## Public Pages

- Home: `index.html`
- Share: `share.html`
- Patterns: `patterns.html`
- Evidence so far: `evidence-so-far.html`
- Change: `what-needs-to-change.html`
- About: `about.html`
- Help spread the project: `help-spread.html`
- Ways to help: `ways-to-help.html`
- Roadmap: `roadmap.html`
- Contact: `contact.html`
- For professionals: `professionals.html`
- FAQ: `faq.html`
- How stories are used: `privacy.html`

`updates.html` remains a plain unlinked placeholder. It is not part of the main public navigation.

## Current Structure

The Phase A restructure makes each page more specific:

- Home is the campaign landing page with a Chilli-led hero, three visitor paths, live snapshot, pattern teaser, origin hook, roadmap teaser, professional teaser, and final CTA.
- Share is focused on owner story submission only.
- Get involved owns supporter tools: share buttons, ready-made captions, share graphics, and direct-send guidance.
- Patterns is the evidence/data page with headline interpretation cards and charts.
- Evidence so far is a plain-English evidence explainer based on grouped public patterns.
- Roadmap is the public mission timeline.
- About is the Chilli origin page.
- Professionals is the main professional insight route.
- Ways to Help is the role selector.
- Contact is a short practical email route page.

## Assets

The current visual identity uses the approved Chilli flower-hat side-heart/header artwork from Ollie's desktop asset folder:

- `assets/images/waiting-room-header-side-heart.png`

The old placeholder mark is not used as the main site identity. The launch-square social graphic is not used on public site pages.

## Local Test

From the repo root:

```bash
python3 -m http.server 8787 --directory campaigns/car_park_stories/site
```

Then open:

```text
http://127.0.0.1:8787/
```

## Safety Rules

- Do not deploy until Ollie approves.
- Do not add full stories, names, emails, pet names, vet names, insurer names, exact locations, claim numbers, or contact details.
- Keep the site non-anti-vet.
- Keep Contact, For professionals, and FAQ informational only. They should not imply emergency support, bill payment, charity/fund status, or advice.
- The form link should remain a link, not an embed, until a later human decision.
- This is not a donation, charity, emergency support, veterinary advice, legal advice, financial advice, or insurance advice site.

## Pattern Data

The patterns page reads `data/public_patterns_sample.json` as its saved project update.

Live pattern data should come only from a reviewed grouped-pattern JSON endpoint or file using schema `wrs_public_patterns_v2`.

Any replacement data must contain grouped categories and percentages only. It must not include story text, names, emails, contact details, pet names, vet names, insurer names, exact locations, claim numbers, quotes, or review notes. Fixed-answer charts should show concrete public answer labels. Written `Other` answers should be reviewed and safely grouped where possible; if they cannot be grouped yet, they should count in the denominator but not appear as a vague public chart segment.

## Share Assets

The Share page reads `data/share_assets.json` for the "Help spread the project" section.

The current file points to the first four approved public share graphics under:

- `assets/share/care-existed-love-existed-money-did-not.png`
- `assets/share/emergency-care-out-of-reach.png`
- `assets/share/share-your-emergency-vet-care-story.png`
- `assets/share/share-your-emergency-vet-care-story-cushion.png`

Only add or replace image URLs after Ollie approves the assets for public use.

## Current public structure

The streamlined public site uses these main pages:

- `index.html` — campaign landing page
- `share.html` — owner story submission route
- `patterns.html` — evidence summary and live chart patterns
- `what-needs-to-change.html` — change goals and roadmap milestones
- `get-involved.html` — share toolkit, share graphics, professional and press routes
- `about.html` — Chilli origin story and project purpose
- `privacy.html` — how stories are used, privacy boundaries, and FAQ

Older route pages remain as simple redirects to the nearest current page.
