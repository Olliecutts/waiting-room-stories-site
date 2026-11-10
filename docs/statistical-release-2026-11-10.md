# Owner statistical release — 10 November 2026

Release ID: `2026-11-10-v1`. Public methods: [Statistics](https://waitingroom.kingchillithepug.com/patterns.html#method).

## Scope and participation

This is a reviewed snapshot of the connected current-form response Sheet. It is not a claim that the Sheet has been reconciled with all live Fillout Results. Completed form submissions already provide participation records; no new analytics dashboard is needed to count them. Website visits would be a separate measure and are not measured by this release.

| Source reconciliation | Count |
| --- | ---: |
| Current source rows | 295 |
| Distinct original platform submission IDs | 294 |
| Repeated-ID row removed | 1 |
| Distinct submissions recording “Yes, anonymously” | 235 |
| Contact-first or private-research-only choices, excluded here | 59 |
| Legacy form entries, kept separate | 41 |

The repeated ID has matching structured answers and campaign-use permission; the latest timestamp is retained. Stable IDs do not establish unique people, animals or episodes. Multiple IDs from one person remain possible.

Current source records run from 24 May to 3 September 2026. The 235 included submissions run from 24 May to 7 July 2026. Ten November is the review date. Dates are reported from recorded source timestamps without a claim about the original form's timezone configuration.

## Permission and quality checks

Eligibility relies on the stored answer to “Can we use your story anonymously as part of this campaign?” Only “Yes, anonymously” is included. A separate choice about later contact does not override that campaign-use answer. The full historical collection notice has not been reconstructed. The broader account-access, retention and rights-handling review remains an operational task; this document does not certify legal compliance.

Private reads were limited to source metadata, necessary structured fields and a programmatic quality screen. The included set had no blank narrative, overt test marker under the limited check, or exact repeated full content across remaining IDs. These checks are not identity verification, clinical review, invoice validation or proof that every account is genuine. No narrative, name, email address, submission ID or medical record is published.

## Counting and disclosure

All published questions have 235 answered submissions and zero missing answers in this cohort. Percentages are `count / 235 × 100`, rounded to one decimal. Geography, cost influence and insurance are grouped single-choice questions. Care, barriers and possible help allow multiple choices; 58, 29 and 47 included submissions respectively selected multiple options. Category sums can exceed the denominator.

The parser matches full fixed-option labels, including commas inside labels. It never creates themes from narrative keywords. A submission is counted only once per displayed group even when it selected two underlying options.

Grouping protects small cells and keeps the release interpretable:

- Geography combines Australia, Other and Prefer not to say as “Other locations or not stated”. Those answer buckets are not six named countries.
- Cost combines Yes/Partly and, separately, No/unsure/preferred not to say.
- Insurance combines the three cover/upfront-payment difficulty answers and, separately, Yes/unsure.
- Barriers combine unclear policy cover and reimbursement waiting, counting each submission once within the group.
- Care combines Other/unsure.
- UK reporting is limited to 24 submissions and three selected counts: 17 cost Yes/Partly, six safe-payment-plan selections, five direct-insurer-payment selections. Help selections overlap. UK percentages and further cross-tabulations are omitted.

Every published answer cell is at least five. The UK guard also rejects a nonzero complement below five. This is a pragmatic precaution, not a universal anonymisation threshold. Old public releases and external information may affect disclosure risk; historical public data cannot be assumed erased.

## Correction and interpretation

The former 402 combined 361 processed rows with a 41-entry legacy aggregate. Those 361 rows had 279 distinct generated IDs, with 82 additional rows sharing IDs. This is not evidence of 82 duplicate people. The processed source, current raw source and historical series are different bases; 402-to-235 is not a valid subtraction funnel.

The release supports descriptions of what these included submissions selected, questions for further investigation and a carefully bounded UK feasibility proposal. It does not estimate prevalence among all owners; establish overcharging, provider quality or national cost levels; prove medical outcomes were caused by money; or demonstrate that credit, insurance or a proposed reform would have solved a case. Most included submissions are US-based. Professional Insight is excluded and retains its separate publication hold.

## Reproduction and release checks

`scripts/build-statistics.py` consumes a private minimised input held outside the repository. Source rows are never a public CI fixture. `scripts/validate-statistics.mjs` restricts the release schema, labels, arithmetic, dates, denominators and disclosure rules. `scripts/render-statistics.py` creates static HTML, frozen JSON and CSV from the reviewed aggregate. The PDF uses that aggregate for headline cards and tables, with a separately reviewed dated narrative.

The source reconciliation and category calculations were independently recalculated. Synthetic regression tests cover repeated IDs, later permission changes, conflicting ties, embedded commas, unknown values, UK small complements and private-path/output protections. Public-copy review and responsive browser checks supplement these checks. Ollie's current instruction to produce usable public statistics supplies publication authority; it does not authorise outreach, fundraising or private-system changes.

Both old automatic refresh workflows remain disabled. Each future release must undergo its own review. See [refresh documentation](automatic-data-refresh.md).
