# Automatic data refresh — publication hold

Updated: 10 November 2026.

## Current state

Numerical publication is paused for both owner and Professional Insight datasets. The website is readable and useful without live charts or counters.

- `data/public_patterns_sample.json` returns the owner publication-hold status.
- `data/professional_patterns_sample.json` returns the professional publication-hold status.
- Each contains only approved nonnumeric status fields. There are no counts, charts or free-text contributions.
- Both refresh workflows have no schedule and an explicit `if: ${{ false }}` job guard. Manual dispatch also skips the job.
- The strict validators reject the former numerical payloads and any unexpected fields.
- The Pages deployment validates the status files and site before upload.

This is a deliberate hold, not a new evidence-processing platform. The private forms, stored responses, installed Apps Script and repository secrets were not changed by this repair.

## Why the hold exists

The earlier public source combined historical and current aggregates. Different questions used different counting bases, unique respondent/episode handling was not demonstrated, and the public release did not establish the interpretation of publication choices. Small categories also appeared despite nominal minimum-category metadata.

Those are reasons to check the release process. Tracked source-code risks do not prove that a particular live submission was used without permission, or that an identifiable privacy breach occurred.

The earlier website also displayed old static figures before JavaScript replaced them, and loaded current figures into the supposedly historical first update. Replacing one count with another would not fix those issues.

## Before restoring any numerical release

1. Identify the installed source/export version and actual field definitions without copying private rows into public tooling.
2. Establish eligible public-use records and how historical consent choices, contact-first entries and private-research-only entries are handled.
3. Establish the counting unit and how duplicate submissions or repeated episodes are treated, including the historical/current boundary.
4. Separate country analyses. “Other” and “Prefer not to say” are answer buckets, not countries.
5. Document the denominator for each question, missing answers, multiple selections and any narrative coding. Do not quietly count two fine codes twice after mapping to the same broad category.
6. Apply a justified small-group rule to published values and prevent reconstruction where relevant. Hiding only the total is insufficient.
7. Prepare a fixed dated release, its limitations and a methods note. An automated export timestamp is not a review timestamp.
8. Have the proposed release checked independently, then obtain Ollie’s approval for public numerical use.
9. Make one reviewed source change that supplies a suitable numeric schema/validator, updates the site copy and explicitly restores any appropriate refresh mechanism.

A submission milestone of 500 or 1,000 is not a release criterion.

## Historical schedule and deployment caveat

Before this hold, the owner workflow was scheduled daily at 05:37 UTC and the professional workflow at 05:47 UTC. The old documentation’s “every six hours” statement was incorrect.

The old jobs committed aggregate files using the Actions token. Do not assume such a push starts a second workflow. Any future automatic deployment chain must be verified against GitHub’s current workflow-trigger rules and observed Actions runs; document a proven route before reactivation.

## Rollback

The source history preserves the previous website. A full revert would also restore unvalidated figures and refresh behaviour. For a visual or copy regression, make a targeted fix or revert only the affected presentation files; preserve the data-publication hold unless a reviewed release has separately superseded it.
