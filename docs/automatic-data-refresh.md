# Automatic Data Refresh

This repo can refresh public aggregate JSON without storing or publishing the private response Sheets.

Owner-story data and Professional Insight data are separate. They use separate endpoint secrets, separate workflow files, separate validators, and separate static JSON files.

## Owner-story refresh

1. The private response Sheet runs the Waiting Room Stories Apps Script.
2. The Apps Script web app returns aggregate-only JSON.
3. GitHub Actions fetches that JSON every 6 hours.
4. The workflow validates the JSON for required public fields and forbidden private markers.
5. If the data changed, the workflow commits only `data/public_patterns_sample.json`.
6. The existing Pages workflow deploys the updated static site.

Workflow:

- `Refresh Waiting Room Stories public data`
- `.github/workflows/refresh-public-data.yml`

Secret:

- `WRS_PUBLIC_DATA_URL`

Output:

- `data/public_patterns_sample.json`

Validator:

- `scripts/validate-public-data.mjs`

## Professional Insight refresh

Professional Insight uses a separate public aggregate endpoint. It must not add to the owner story count and must not publish a public Professional response count.

Workflow:

- `Refresh Waiting Room Stories Professional Insight data`
- `.github/workflows/refresh-professional-data.yml`

Secret:

- `WRS_PROFESSIONAL_DATA_URL`

Output:

- `data/professional_patterns_sample.json`

Validator:

- `scripts/validate-professional-data.mjs`

If `WRS_PROFESSIONAL_DATA_URL` is not configured, the workflow exits successfully without changing data. This keeps scheduled runs green while the Professional Insight endpoint is being set up.

## Owner-story manual setup

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

## Professional Insight manual setup

1. In the Professional Insight Sheet, export reviewed aggregate-only Professional Insight JSON.
2. Confirm the generated JSON contains reviewed aggregate charts only.
3. Confirm it does not contain raw responses, names, emails, workplaces, written answers, quote text, submission IDs, contact details, reviewer notes, or row-level data.
4. Deploy the Professional Insight aggregate endpoint as the approved public-safe JSON source.
5. Copy the endpoint URL.
6. In this public repo on GitHub, open Settings > Secrets and variables > Actions.
7. Add a repository secret named `WRS_PROFESSIONAL_DATA_URL`.
8. Paste the endpoint URL as the secret value.
9. Open Actions > Refresh Waiting Room Stories Professional Insight data.
10. Run the workflow manually once.
11. Confirm `data/professional_patterns_sample.json` updates only if the aggregate data changed.
12. Confirm the Pages deployment updates the live site.

## Safety checks

The owner-story refresh workflow runs `scripts/validate-public-data.mjs` before committing. It requires:

- `schema_version`
- `stories_shared_so_far`
- `countries_represented`
- `last_updated`
- `charts`

It fails if the public JSON contains private-field markers such as email, pet name, story text field names, quote markers, reviewer markers, submission identifiers, phone, address, claim, vet, or insurer markers.

The Professional Insight refresh workflow runs `scripts/validate-professional-data.mjs` before committing. It requires:

- `schema_version = wrs_professional_patterns_v1`
- `status` is `reviewed_aggregate` or `not_enough_reviewed_responses`
- `endpoint_mode` is `professional_reviewed_aggregate`, `professional_not_enough_reviewed_responses`, or `professional_placeholder`
- `public_response_count_enabled = false`
- `public_response_count = null`
- exactly the approved Professional Insight chart keys

It fails if Professional Insight JSON contains owner-story count fields or private-field markers such as name, email, workplace, phone, address, raw/free-text markers, quote markers, submission markers, contact markers, reviewer notes, pet/story markers, claim-detail markers, vet, or insurer markers.

Both workflows refuse to commit if any file other than their one expected JSON file changes.

The Apps Script URL is stored only as the GitHub secret `WRS_PUBLIC_DATA_URL`; it is not committed to this repo.

The Professional Insight endpoint URL is stored only as the GitHub secret `WRS_PROFESSIONAL_DATA_URL`; it is not committed to this repo.
