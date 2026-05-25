# The Waiting Room Stories Project Site

Public-safe static site export for The Waiting Room Stories Project.

Target domain:

```text
waitingroom.kingchillithepug.com
```

## Contents

This package contains only deployable public static site files:

- `index.html`
- `share.html`
- `patterns.html`
- `what-needs-to-change.html`
- `about.html`
- `contact.html`
- `professionals.html`
- `faq.html`
- `privacy.html`
- `styles.css`
- `site.js`
- `CNAME`
- `data/public_patterns_sample.json`
- `assets/images/waiting-room-header-side-heart.png`

It intentionally excludes private project files, handoff files, internal lane state, deployment history notes, automation docs, launch social graphics, and non-public response data.

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

## Assets

The current visual identity uses the approved Chilli flower-hat side-heart/header artwork from Ollie's desktop asset folder:

- `assets/images/waiting-room-header-side-heart.png`

The old placeholder mark is not used as the main site identity. The launch-square social graphic is not used on public site pages.

## GitHub Pages Setup

Use this package as the root of the separate public GitHub repository.

1. Copy the contents of this folder to the root of `Olliecutts/waiting-room-stories-site`.
2. Commit and push to the repository's `main` branch.
3. GitHub Pages should publish from `main` / root with custom domain `waitingroom.kingchillithepug.com`.

## Safety Rules

- Do not add raw stories, names, emails, pet names, vet names, insurer names, exact locations, claim numbers, or contact details.
- Keep the site non-anti-vet.
- Keep Contact, For professionals, and FAQ informational only. They should not imply emergency support, bill payment, charity/fund status, or advice.
- The form link should remain a link, not an embed, until a later human decision.
- This is not a donation, charity, emergency support, veterinary advice, legal advice, financial advice, or insurance advice site.

## Pattern Data

The patterns page reads `data/public_patterns_sample.json`.

Any replacement data must contain public-safe aggregate counts only and no raw response text or identifiers.
