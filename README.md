# The Waiting Room Stories Project Static Site

Public website files for The Waiting Room Stories Project.

Target domain: `waitingroom.kingchillithepug.com`.

## Public Pages

- Home: `index.html`
- Share: `share.html`
- Patterns: `patterns.html`
- Change: `what-needs-to-change.html`
- About: `about.html`
- Contact: `contact.html`
- For professionals: `professionals.html`
- FAQ: `faq.html`
- How stories are used: `privacy.html`

`updates.html` remains a plain unlinked placeholder. It is not part of the main public navigation.

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
- Do not add raw stories, names, emails, pet names, vet names, insurer names, exact locations, claim numbers, or contact details.
- Keep the site non-anti-vet.
- Keep Contact, For professionals, and FAQ informational only. They should not imply emergency support, bill payment, charity/fund status, or advice.
- The form link should remain a link, not an embed, until a later human decision.
- This is not a donation, charity, emergency support, veterinary advice, legal advice, financial advice, or insurance advice site.

## Pattern Data

The patterns page reads `data/public_patterns_sample.json` as a public-safe fallback.

Live pattern data should come only from a reviewed public-safe aggregate JSON endpoint or file using schema `wrs_public_patterns_v1`.

Any replacement data must contain public-safe aggregate categories and percentages only. It must not include story text, names, emails, contact details, pet names, vet names, insurer names, exact locations, claim numbers, quotes, or private review notes. Categories with fewer than 3 responses should be grouped as `Smaller categories`, except the Country chart, which may show all broad country categories.

## Share Assets

The Share page reads `data/share_assets.json` for the future "Help spread the project" section.

The current file contains placeholders only. Do not add image URLs until approved public assets exist.
