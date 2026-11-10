#!/usr/bin/env python3
"""Render the public statistics section and aggregate CSV from reviewed JSON."""
import argparse
import csv
from html import escape
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
START, END = '<!-- STATISTICS:BEGIN -->', '<!-- STATISTICS:END -->'


def bars(chart, label):
    out = [f'<ol class="stat-bars" aria-label="{escape(label)}">']
    for row in chart['items']:
        out.append(f'<li data-stat-id="{row["id"]}" data-count="{row["count"]}" data-base="{chart["denominator"]}">'
                   f'<div class="stat-row"><span>{escape(row["label"])}</span>'
                   f'<strong>{row["count"]} <span class="stat-percent">({row["percentage"]:.1f}%)</span></strong></div>'
                   f'<div class="stat-track" aria-hidden="true"><span style="width:{row["percentage"]}%"></span></div></li>')
    out.append('</ol>')
    return '\n'.join(out)


def body(d):
    n = d['counts']['eligible_public_submissions']
    charts = d['charts']
    def finding(chart, key):
        return next(row for row in charts[chart]['items'] if row['id'] == key)
    cost = finding('cost_influence', 'yes_or_partly')
    upfront = finding('barriers', 'upfront')
    payment = finding('help', 'safe_payment_plan')
    return f'''{START}
<section class="page-hero"><div class="wrap reading-width">
  <p class="eyebrow">Statistics · release {d['release_id']}</p>
  <h1>What owners have told us.</h1>
  <p class="lede"><strong>{n} submissions</strong> are included in this first checked snapshot. Each records permission for anonymous campaign use and is counted once.</p>
  <p class="date-line">Reviewed <time datetime="{d['reviewed_on']}">10 November 2026</time> · Included responses: <strong>24 May–7 July 2026</strong></p>
  <p>This is a self-selected collection of experiences, not a representative survey or independently verified clinical evidence. Most included responses are from the United States.</p>
  <div class="button-row"><a class="button" href="assets/reports/wrs-statistics-2026-11-10.pdf" download>Download the 2-page briefing (PDF)</a><a class="button secondary" href="#method">How the figures were checked</a></div>
  <nav class="page-jumps" aria-label="Statistics sections"><a href="#geography">Who responded</a><a href="#answers">Barriers and support</a><a href="#uk">UK responses</a><a href="#correction">Why the count changed</a></nav>
</div></section>
<section class="section"><div class="wrap">
  <div class="section-heading"><h2>Three findings from these {n} submissions.</h2><p>These describe the included responses across countries. They are not UK rates or estimates for all pet owners.</p></div>
  <div class="card-grid three statistics-highlights">
    <article class="content-card"><p class="stat-big">{cost['count']} <span>of {n}</span></p><h3>Cost was part of the decision.</h3><p><strong>{cost['percentage']:.1f}%</strong> selected “Yes” or “Partly” when asked whether cost was part of the decision.</p></article>
    <article class="content-card"><p class="stat-big">{upfront['count']} <span>of {n}</span></p><h3>Upfront payment was a barrier.</h3><p><strong>{upfront['percentage']:.1f}%</strong> selected “Had to pay upfront”. Other barriers could also be selected.</p></article>
    <article class="content-card"><p class="stat-big">{payment['count']} <span>of {n}</span></p><h3>A safe payment plan might have helped.</h3><p><strong>{payment['percentage']:.1f}%</strong> selected that option. This is an owner preference, not an assessment that borrowing would have been suitable.</p></article>
  </div>
</div></section>
<section class="section section-tinted" id="geography"><div class="wrap two-column">
  <div><h2>Who responded?</h2><p><strong>{n} included submissions.</strong> Geography is self-reported. Smaller location groups are combined; these are not six named countries.</p>{bars(charts['geography'], 'Geography of included submissions')}</div>
  <aside class="notice"><h3>International evidence. UK action first.</h3><p><strong>195 of {n} submissions (83.0%) are from the United States.</strong> We cannot apply the combined results to the UK.</p><p>The UK work starts with Ollie’s experience and a small UK subset, alongside independent research and professional input. A later US stage will need its own partners and proposals.</p><p><a href="#uk">See the UK counts separately</a></p></aside>
</div></section>
<section class="section" id="answers"><div class="wrap">
  <div class="section-heading"><h2>Barriers and possible help.</h2><p>Every included submission answered both questions. Percentages use <strong>{n} submissions</strong> as the denominator. People could select more than one option, so the percentages do not add to 100%.</p></div>
  <div class="two-column statistics-columns">
    <article class="content-card"><h3>Barriers selected</h3><p class="small-note">Question: “{escape(charts['barriers']['question'])}” · {charts['barriers']['multiple_option_submissions']} submissions selected multiple options.</p>{bars(charts['barriers'], 'Barriers selected by included submissions')}<p class="small-note">Unclear policy cover and reimbursement waiting are combined to protect small groups. Each submission is counted once within that combined category.</p></article>
    <article class="content-card"><h3>What might have helped</h3><p class="small-note">Question: “{escape(charts['help']['question'])}” · {charts['help']['multiple_option_submissions']} submissions selected multiple options.</p>{bars(charts['help'], 'Support options selected by included submissions')}<p class="small-note">Selecting a grant or payment plan does not establish eligibility, availability or financial suitability. No assistance service is being offered here.</p></article>
  </div>
</div></section>
<section class="section section-tinted" id="uk"><div class="wrap reading-width">
  <p class="eyebrow">United Kingdom · {d['uk']['submissions']} included submissions</p><h2>A small UK starting point.</h2>
  <p>We report these as counts because the UK subset is small. It is not representative of UK owners. The support answers can overlap.</p>
  <ul class="uk-counts">{''.join(f'<li><strong>{row["count"]} of {d["uk"]["submissions"]}</strong><span>{escape(row["label"])}</span></li>' for row in d['uk']['items'])}</ul>
  <p>Other UK answer breakdowns are not published in this release. These counts identify questions worth investigating; they do not rank every UK barrier or demonstrate that a proposed change will work.</p>
  <div class="notice"><h3>What we propose to test.</h3><p>At one UK hospital, can an owner understand the amount payable now, the actual status of any insurance payment, and who will give them the next answer?</p><p>A proposed small trial would record unresolved payment barriers and staff time as well as owner understanding. A clearer explanation cannot, by itself, make an unaffordable bill affordable. No hospital or insurer has agreed to a trial.</p><p><a href="what-needs-to-change.html#first-pilot">Read the first proposed UK intervention</a></p></div>
</div></section>
<section class="section"><div class="wrap">
  <div class="section-heading"><h2>More context from the same submissions.</h2><p>These charts also use {n} as the denominator. Categories are grouped where needed to avoid releasing very small cells.</p></div>
  <div class="two-column statistics-columns">
    <article class="content-card"><h3>Was cost part of the decision?</h3>{bars(charts['cost_influence'], 'Cost influence answers')}<p class="small-note">“Yes” and “Partly” are combined. “No”, “I am not sure” and “Prefer not to say” form the other group.</p></article>
    <article class="content-card"><h3>Insurance answers</h3>{bars(charts['insurance'], 'Insurance answers')}<p class="small-note">These are the selected answers, not checks against insurance policies. “Yes” and “I am not sure” are grouped together; three answers describing insurance difficulties form another group.</p></article>
  </div>
  <details class="stat-details"><summary>See the care options people selected</summary><p class="small-note">Question: “{escape(charts['care']['question'])}” · {charts['care']['multiple_option_submissions']} submissions selected multiple options. No extra categories were inferred from written stories.</p>{bars(charts['care'], 'Care options selected by included submissions')}<p class="small-note">“Other” and “I am not sure” are grouped. These answers can include care discussed, delayed or stopped; they do not mean every treatment was received.</p></details>
</div></section>
<section class="section section-tinted" id="method"><div class="wrap reading-width">
  <p class="eyebrow">Method and limitations</p><h2>What the numbers represent.</h2>
  <ol class="plain-list">
    <li><strong>Source and dates.</strong> We reviewed the connected owner-response Google Sheet on 10 November 2026. Its current-form records run from 24 May to 3 September 2026. The included, public-use subset runs from 24 May to 7 July. The review date is not a claim that new stories arrived that day. Completeness against the live Fillout account has not yet been independently reconciled.</li>
    <li><strong>Counting submissions.</strong> The sheet contains 295 rows with 294 distinct form submission IDs. One ID appears twice; its structured answers and permission match. We retained the latest timestamp. These are submissions, not proven distinct people, animals or emergencies. A person could use a new submission ID more than once.</li>
    <li><strong>Publication permission.</strong> We included only the 235 submissions recording “Yes, anonymously” to “Can we use your story anonymously as part of this campaign?” The other 59 record contact-first or private-research-only choices and are excluded. Follow-up contact permission is a separate choice. This relies on the stored question and answer; the complete historical form notice has not been reconstructed.</li>
    <li><strong>Direct answers only.</strong> No themes were added by scanning written accounts. Each submission counts at most once per displayed category. All included submissions answered the published questions, so each question has a base of 235 and no missing answers. Multiple selections can make category totals exceed 235. Percentages are rounded to one decimal place.</li>
    <li><strong>Small groups.</strong> This release does not display category cells below five. We combine the smaller location categories; unclear-policy and reimbursement-wait barriers; “Other”/unsure care answers; and the insurance and cost-answer groups described beside their charts. UK figures are selected counts only, with no detailed cross-tabulations or individual records. This threshold is a precaution, not a guarantee of anonymity on its own.</li>
    <li><strong>Checks and limits.</strong> We checked IDs, stored permission values, exact fixed-option parsing and arithmetic. No overt test marker or exact repeated full-content submission was found in the included set during a limited quality check. Experiences have not been clinically or financially corroborated. Self-selection, recall and the US-heavy audience limit interpretation. No population rates, causal claims, provider comparisons or price comparisons can be inferred.</li>
  </ol>
  <p>The 41 legacy Google Form entries are kept separate from this release. Professional Insight is also separate; professional percentages remain unpublished while its small sample and release process are reviewed.</p>
  <div class="button-row"><a class="button secondary" href="data/releases/2026-11-10-v1.csv" download>Download aggregate tables (CSV)</a><a class="button secondary" href="data/releases/2026-11-10-v1.json" download>Download aggregate data (JSON)</a></div>
  <p class="small-note">The downloads contain the published groups only. They do not contain submission IDs, names, contact details, written stories or medical records.</p>
</div></section>
<section class="section" id="correction"><div class="wrap reading-width"><h2>Why the earlier count changed.</h2>
  <p>The earlier total of 402 combined 361 rows in a processed table with a 41-entry historical aggregate. The processed table contained 279 distinct generated IDs, with 82 additional rows sharing those IDs. That does not mean 82 duplicate people.</p>
  <p>This release uses the current form’s source records and its original submission IDs instead. The current source, older processed table and legacy series are different bases; subtracting permissions from 402 would not be a valid correction. The new count describes an explicitly defined public-use subset, not stories being deleted.</p>
  <p>The old automatic chart refresh remains disabled. Each new statistical release needs its own checks and collection dates; this page is a fixed snapshot.</p>
  <p><a class="text-link" href="first-pattern-update.html">Read the dated project update</a></p>
</div></section>
<section class="section section-tinted"><div class="wrap reading-width"><h2>Use the findings accurately.</h2>
  <div class="notice"><p><strong>Suggested wording:</strong> “In Waiting Room Stories’ first checked snapshot, 115 of 235 submissions with permission for anonymous campaign use selected upfront payment as a barrier. The self-selected sample is predominantly US-based and does not represent all pet owners.”</p></div>
  <p class="section-link">For companies, lawmakers, researchers and journalists: use the <a href="assets/reports/wrs-statistics-2026-11-10.pdf">two-page briefing</a> with its limitations, and <a href="get-involved.html#contact-routes">contact Ollie</a> about the proposed UK work.</p>
  <p>Independent context: the <a href="https://www.gov.uk/cma-cases/veterinary-services-market-for-pets-review">CMA veterinary market investigation and reforms</a> and <a href="https://www.rcvs.org.uk/veterinary-professionals/conduct-and-guidance/supporting-guidance/11-communication-and-consent">RCVS communication and consent guidance</a>. These sources do not validate this sample or extend UK requirements to the US.</p>
  <p><a class="text-link" href="share.html">Share an owner experience</a></p>
</div></section>
{END}'''


def csv_text(d):
    out = io.StringIO(newline='')
    writer = csv.writer(out, lineterminator='\n')
    writer.writerow(['release_id','collection_start','collection_end','population','question','category','count','denominator','percentage','unit'])
    for key, chart in d['charts'].items():
        for row in chart['items']:
            writer.writerow([d['release_id'],d['collection_period']['start'],d['collection_period']['end'],
                'Included submissions across countries',chart['question'],row['label'],row['count'],chart['denominator'],f'{row["percentage"]:.1f}','submissions'])
    for row in d['uk']['items']:
        writer.writerow([d['release_id'],d['collection_period']['start'],d['collection_period']['end'],
            'UK subset','Selected UK counts only',row['label'],row['count'],d['uk']['submissions'],'','submissions; counts only'])
    return out.getvalue()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    data_text = (ROOT/'data/public_patterns_sample.json').read_text()
    data = json.loads(data_text)
    if data['release_id'] != '2026-11-10-v1':
        raise SystemExit('This renderer belongs to the dated v1 report. Review its narrative before adding a new release.')
    page_path = ROOT/'patterns.html'
    page = page_path.read_text()
    rendered = body(data)
    if START in page:
        before, rest = page.split(START,1)
        _, after = rest.split(END,1)
    else:
        before, rest = page.split('  <main id="main" tabindex="-1">',1)
        before += '  <main id="main" tabindex="-1">\n'
        _, after = rest.split('  </main>',1)
        after = '\n  </main>' + after
    new_page = before + rendered + after
    csv_content = csv_text(data)
    destination = ROOT/'data/releases'
    outputs = {page_path:new_page, destination/f'{data["release_id"]}.json':data_text,
               destination/f'{data["release_id"]}.csv':csv_content}
    for path, text in outputs.items():
        if args.check:
            if not path.exists() or path.read_text() != text:
                raise SystemExit(f'Statistics output differs from reviewed aggregate: {path.name}')
        else:
            path.parent.mkdir(parents=True,exist_ok=True)
            path.write_text(text)
    print('Statistics HTML, frozen JSON and CSV match.' if args.check else 'Statistics HTML and aggregate downloads rendered.')
