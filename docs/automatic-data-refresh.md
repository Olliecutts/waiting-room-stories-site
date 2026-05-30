# Automatic Data Refresh

This repo can refresh the public Patterns data without storing or publishing the private response Sheet.

## How it works

1. The private response Sheet runs the Waiting Room Stories Apps Script.
2. The Apps Script web app returns aggregate-only JSON.
3. GitHub Actions fetches that JSON every 6 hours.
4. The workflow validates the JSON for required public fields and forbidden private markers.
5. If the data changed, the workflow commits only `data/public_patterns_sample.json`.
6. The existing Pages workflow deploys the updated static site.

## Manual setup

1. In the live response Sheet, install the latest combined Apps Script from the private control repo.
2. Run `Process new responses`, then `Export public patterns`.
3. Confirm the generated JSON contains aggregate categories only.
4. Deploy the script as a web app:
   - Deploy > New deployment > Web app
   - Execute as: Me
   - Access: Anyone with the link
5. Copy the web app URL.
6. In this public repo on GitHub, open Settings > Secrets and variables > Actions.
7. Add a repository secret named `WRS_PUBLIC_DATA_URL`.
8. Paste the web app URL as the secret value.
9. Open Actions > Refresh Waiting Room Stories public data.
10. Run the workflow manually once.
11. Confirm `data/public_patterns_sample.json` updates only if the aggregate data changed.
12. Confirm the Pages deployment updates the live site.

## Safety checks

The refresh workflow runs `scripts/validate-public-data.mjs` before committing. It requires:

- `schema_version`
- `stories_shared_so_far`
- `countries_represented`
- `last_updated`
- `charts`

It fails if the public JSON contains private-field markers such as email, pet name, story text field names, quote markers, reviewer markers, submission identifiers, phone, address, claim, vet, or insurer markers.

The Apps Script URL is stored only as the GitHub secret `WRS_PUBLIC_DATA_URL`; it is not committed to this repo.
