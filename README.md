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
- `updates.html`
- `privacy.html`
- `styles.css`
- `site.js`
- `CNAME`
- `data/public_patterns_sample.json`
- `assets/images/waiting-room-mark.svg`

It intentionally excludes private project files, source bundles, handoff files, internal lane state, deployment history notes, automation docs, and any non-public response data.

## GitHub Pages Setup

Use this package as the root of a separate public GitHub repository.

1. Create a new public repository for the Waiting Room Stories site.
2. Copy the contents of this folder to the root of that repository.
3. Commit and push to the repository's default branch.
4. In GitHub, open Settings > Pages.
5. Set the publishing source to deploy from the default branch root.
6. Set the custom domain to:

```text
waitingroom.kingchillithepug.com
```

The included `CNAME` file should contain the same domain.

## DNS Needed Later

After GitHub accepts the custom domain, add this Namecheap DNS record:

```text
Type: CNAME
Host: waitingroom
Value: olliecutts.github.io
TTL: Automatic / default
```

Do not include `https://` or the repository name in the DNS value.

## Safety

This export should contain public pages and public-safe aggregate/sample data only. It must not contain raw stories, owner names, pet names, email addresses, contact details, exact locations, vet names, insurer names, claim numbers, backend data, private review outputs, or internal project handoff files.
