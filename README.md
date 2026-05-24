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
- `privacy.html`
- `styles.css`
- `site.js`
- `CNAME`
- `data/public_patterns_sample.json`
- `assets/images/waiting-room-header-side-heart.png`
- `assets/images/waiting-room-launch-square.jpg`
- `assets/images/waiting-room-core-line.jpg`

It intentionally excludes private project files, source bundles, handoff files, internal lane state, deployment history notes, automation docs, and non-public response data.

## GitHub Pages Setup

Use this package as the root of the separate public GitHub repository.

1. Copy the contents of this folder to the root of `Olliecutts/waiting-room-stories-site`.
2. Commit and push to the repository's `main` branch.
3. In GitHub, open Settings > Pages.
4. Set the publishing source to deploy from `main` / root.
5. Set the custom domain to:

```text
waitingroom.kingchillithepug.com
```

The included `CNAME` file should contain the same domain.

## DNS Needed Later

DNS for `kingchillithepug.com` is hosted at Name.com. After GitHub accepts the custom domain, add or replace the subdomain record there:

```text
Type: CNAME
Host: waitingroom
Value: olliecutts.github.io
TTL: Automatic / default
```

Do not include `https://` or the repository name in the DNS value.

## Safety

This export should contain public pages, public-safe aggregate data, and approved public images only. It must not contain raw stories, owner names, pet names, email addresses, contact details, exact locations, vet names, insurer names, claim numbers, private response files, or internal handoff files.
