# Statistical releases and automatic refresh

Updated: 10 November 2026.

## Current state

The owner data is a fixed, independently checked release: `2026-11-10-v1`. Its 235 included submissions come from the current-form response Sheet and record permission for anonymous campaign use. See [the release note](statistical-release-2026-11-10.md) for the source boundary, duplicate handling, denominator and disclosure rules.

- `data/public_patterns_sample.json` is the validated owner release, mirrored in `data/releases/2026-11-10-v1.json`.
- `patterns.html`, the aggregate CSV and the two-page PDF describe that same dated cohort.
- `data/professional_patterns_sample.json` remains a nonnumeric publication-hold object.
- Both old refresh workflows have no schedule and an explicit `if: ${{ false }}` job guard. Manual dispatch also skips the job.
- The owner validator permits only the fixed aggregate schema and labels. The professional validator rejects numerical or unexpected fields.
- The Pages deployment validates both datasets, the static website and generated owner HTML/CSV/JSON before publishing.

This release does not repair or reactivate the old Apps Script export. Private forms, stored responses, installed scripts, integrations and repository secrets were not changed. No new collection or analytics service was added.

## Why the old exporter remains disabled

The former 402 combined 361 processed rows with a 41-entry legacy aggregate. The processed rows contained 279 distinct generated IDs. The current source Sheet has a different base: 295 rows, 294 platform submission IDs and 235 eligible public-use submissions after applying the stored permission answer. These series cannot be reconciled by simply subtracting exclusions from 402.

The old source also used category bases and processing that differ from this release's direct fixed-option answers. Changing its top-line total would not make it equivalent to the checked release. A timestamp on a recurring export does not establish that new form responses arrived, the integration is complete or a release has been reviewed.

## The next release

1. Reconcile current Fillout Results with the connected response Sheet and inspect integration configuration read-only before claiming that the Sheet contains every completed form. Keep source records, legacy entries and professional responses separate.
2. Prepare only the necessary fields in a private location. Preserve original submission IDs and timestamps, direct option labels and the recorded campaign-use choice. Never copy identifying details or written accounts into this public repository.
3. Retain the latest version of a repeated platform ID. Resolve conflicting equal-timestamp versions privately. Do not equate IDs with proven distinct owners or animals.
4. Exclude contact-first and private-research-only entries from this public release route. Check current permissions, any withdrawals and changes to the collection notice. Follow-up contact permission is separate.
5. Check field definitions, missing answers, multiple selections and grouping. Reject unknown labels. Recheck country-specific disclosure risks and small complements; do not assume a count of five alone guarantees anonymity.
6. Build a candidate aggregate outside any publishing automation. Independently review its source reconciliation, methodology, public copy and downloads. Preserve the previous dated release and describe material corrections.
7. Update the dated renderer and PDF narrative intentionally, then deliver via the usual reviewed pull request and verify the deployed result. A milestone of 500 or 1,000 submissions is not a release criterion.

Automatic refresh is unnecessary at this volume. Consider it only after the live collection/export path has been reconciled and the manual release process is reliable. Do not restore the former schedule as part of a routine copy change.

## Historical schedule and deployment caveat

Before the hold, owner refresh was scheduled daily at 05:37 UTC and professional refresh at 05:47 UTC. The former documentation's “every six hours” statement was incorrect. The jobs committed using the Actions token; do not assume that such a push starts a second workflow. A future automatic deployment chain would need a separately verified route and observed Actions run.

## Rollback

For a presentation regression, fix or revert the affected presentation files. If a numerical release needs withdrawal, replace it with a clear dated correction/status and disable access to the affected current downloads as appropriate. Do not restore the old mixed aggregate or refresh jobs. Public Git history and external cached copies can remain; withdrawal is not a claim of complete erasure.
