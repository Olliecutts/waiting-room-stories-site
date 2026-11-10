#!/usr/bin/env python3
"""Build a frozen, aggregate-only release from a private minimised source.

Never place the input in this repository. No network, source mutation or publishing.
An output is a release candidate until independently reviewed.
"""
import argparse
from collections import Counter
from datetime import datetime
import json
from pathlib import Path
import re
import unicodedata
from uuid import UUID

PERMISSIONS = {'Yes, anonymously', 'Yes, but please contact me first', 'No, private research only'}
CARE = [
    'Emergency vet or out-of-hours care', 'ICU or hospitalisation',
    'MRI, CT, ultrasound, or other imaging', 'Specialist referral or transfer',
    'Surgery', 'Emergency medication or stabilisation', 'Ongoing treatment after discharge',
    'Cancer treatment or complex medical care',
    'Heart, breathing, neurological, spinal, trauma, poisoning, or other emergency care',
    'I am not sure', 'Other',
]
BARRIERS = [
    'Insurance limit ran out', 'Insurance did not cover it', 'Had to pay upfront',
    'Waiting for reimbursement', 'Diagnostic imaging was unaffordable',
    'ICU/hospitalisation was unaffordable', 'Specialist referral was unaffordable',
    'Surgery or treatment was unaffordable', 'Credit/payment plan was not possible',
    'I did not know what my policy actually covered', 'There was no fast emergency fund or grant', 'Other',
]
HELP = [
    'Insurance that covered more', 'Insurance paying the vet directly', 'A fast emergency grant',
    'A safe payment plan', 'Clearer insurance information before the emergency', 'More time to decide',
    'A charity or fund I could access quickly', 'Someone explaining the options simply', 'Other',
]
COUNTRIES = {'UK', 'USA', 'Canada', 'Australia', 'Other', 'Prefer not to say'}
COST = {'Yes', 'Partly', 'No', 'I am not sure', 'Prefer not to say'}
INSURANCE = {
    'No', 'Yes', 'I am not sure', 'I had insurance but it did not cover this',
    'I had insurance but had to pay upfront first', 'I had insurance but it ran out',
}
QUESTIONS = {
    'geography': 'What country are you in?',
    'cost_influence': 'Was cost part of the decision?',
    'insurance': 'Did you have pet insurance?',
    'barriers': 'What was the main barrier?',
    'help': 'What would have helped most?',
    'care': 'What care was discussed, needed, delayed, or stopped?',
}


def normalise(value):
    return unicodedata.normalize('NFKC', str(value or '')).strip()


def parse_options(value, options):
    """Match complete fixed labels; embedded commas are part of option labels."""
    rest, found = normalise(value), set()
    ordered = sorted(options, key=len, reverse=True)
    while rest:
        rest = re.sub(r'^[,;\n|\s]+', '', rest)
        if not rest:
            break
        match = next((option for option in ordered if rest == option or (
            rest.startswith(option) and re.match(r'[,;\n|\s]', rest[len(option):]))), None)
        if match is None:
            raise ValueError('Unmapped fixed-option value; review privately. No raw value is logged.')
        found.add(match)
        rest = rest[len(match):]
    if not found:
        raise ValueError('Missing required answer; review the denominator before release.')
    return found


def item(key, label, count, denominator):
    if not 5 <= count <= denominator:
        raise ValueError('A proposed public cell is below five or exceeds its denominator; regroup before release.')
    return {'id': key, 'label': label, 'count': count, 'percentage': round(count * 100 / denominator, 1)}


def single_chart(key, rows, groups, field):
    counts = Counter()
    for row in rows:
        found = [group for group, _, values in groups if row[field] in values]
        if len(found) != 1:
            raise ValueError('An answer does not map to exactly one published group.')
        counts[found[0]] += 1
    return {
        'question': QUESTIONS[key], 'kind': 'single_choice_grouped', 'denominator': len(rows),
        'missing_answers': 0,
        'items': [item(group, label, counts[group], len(rows)) for group, label, _ in groups],
    }


def multi_chart(key, rows, groups):
    counts, multi = Counter(), 0
    for row in rows:
        selected = row[key + '_options']
        multi += len(selected) > 1
        for group, _, values in groups:
            if selected & set(values):
                counts[group] += 1
    chart = {
        'question': QUESTIONS[key], 'kind': 'multiple_choice', 'denominator': len(rows),
        'missing_answers': 0, 'multiple_option_submissions': multi,
        'items': [item(group, label, counts[group], len(rows)) for group, label, _ in groups],
    }
    return chart


def build(source):
    if source.get('format') != 'wrs_minimised_source_v1':
        raise ValueError('Unsupported source format.')
    reviewed_on = source['reviewed_on']
    datetime.strptime(reviewed_on, '%Y-%m-%d')
    raw = source['rows']
    latest = {}
    for index, record in enumerate(raw):
        row = {key: normalise(value) for key, value in record.items()}
        UUID(row['submission_id'])
        when = datetime.strptime(row['submitted_at'], '%Y-%m-%d %H:%M:%S')
        if row['public_permission'] not in PERMISSIONS:
            raise ValueError('Unknown permission value: release blocked, value not logged.')
        row['_date'] = when.date().isoformat()
        old = latest.get(row['submission_id'])
        if old and when == old[0] and row != old[2]:
            raise ValueError('Conflicting versions with the same ID and timestamp: review privately.')
        if old is None or (when, index) > (old[0], old[1]):
            latest[row['submission_id']] = (when, index, row)
    distinct = [value[2] for value in latest.values()]
    rows = [row for row in distinct if row['public_permission'] == 'Yes, anonymously']
    if not rows:
        raise ValueError('No eligible submissions.')
    for row in rows:
        if row['country'] not in COUNTRIES or row['cost_part'] not in COST or row['insurance'] not in INSURANCE:
            raise ValueError('Unknown single-choice answer: release blocked, value not logged.')
        for key, options in [('care', CARE), ('barriers', BARRIERS), ('help', HELP)]:
            row[key + '_options'] = parse_options(row[key], options)
    charts = {}
    charts['geography'] = single_chart('geography', rows, [
        ('usa', 'United States', {'USA'}), ('uk', 'United Kingdom', {'UK'}),
        ('canada', 'Canada', {'Canada'}),
        ('other_not_stated', 'Other locations or not stated', {'Australia', 'Other', 'Prefer not to say'}),
    ], 'country')
    charts['cost_influence'] = single_chart('cost_influence', rows, [
        ('yes_or_partly', 'Yes or partly', {'Yes', 'Partly'}),
        ('other_cost_answers', 'No, unsure or preferred not to say', {'No', 'I am not sure', 'Prefer not to say'}),
    ], 'cost_part')
    charts['insurance'] = single_chart('insurance', rows, [
        ('no_insurance', 'No insurance', {'No'}),
        ('insurance_difficulty', 'Had insurance, but cover ran out, did not cover this, or upfront payment was needed', {
            'I had insurance but it did not cover this', 'I had insurance but it ran out',
            'I had insurance but had to pay upfront first'}),
        ('yes_or_unsure', 'Yes, or unsure', {'Yes', 'I am not sure'}),
    ], 'insurance')
    barrier_groups = [
        ('upfront', 'Had to pay upfront', {'Had to pay upfront'}),
        ('treatment_cost', 'Surgery or treatment was unaffordable', {'Surgery or treatment was unaffordable'}),
        ('other_selected', 'Other (selected by respondent)', {'Other'}),
        ('imaging_cost', 'Diagnostic imaging was unaffordable', {'Diagnostic imaging was unaffordable'}),
        ('hospital_cost', 'ICU/hospitalisation was unaffordable', {'ICU/hospitalisation was unaffordable'}),
        ('not_covered', 'Insurance did not cover it', {'Insurance did not cover it'}),
        ('payment_plan', 'Credit/payment plan was not possible', {'Credit/payment plan was not possible'}),
        ('referral_cost', 'Specialist referral was unaffordable', {'Specialist referral was unaffordable'}),
        ('insurance_limit', 'Insurance limit ran out', {'Insurance limit ran out'}),
        ('insurance_information_timing', 'Unclear policy cover or reimbursement wait', {
            'I did not know what my policy actually covered', 'Waiting for reimbursement'}),
        ('no_fast_support', 'There was no fast emergency fund or grant', {'There was no fast emergency fund or grant'}),
    ]
    charts['barriers'] = multi_chart('barriers', rows, barrier_groups)
    help_groups = [
        ('safe_payment_plan', 'A safe payment plan', {'A safe payment plan'}),
        ('fast_grant', 'A fast emergency grant', {'A fast emergency grant'}),
        ('accessible_charity', 'A charity or fund I could access quickly', {'A charity or fund I could access quickly'}),
        ('direct_insurance_payment', 'Insurance paying the vet directly', {'Insurance paying the vet directly'}),
        ('other_selected', 'Other (selected by respondent)', {'Other'}),
        ('more_insurance_cover', 'Insurance that covered more', {'Insurance that covered more'}),
        ('simple_explanation', 'Someone explaining the options simply', {'Someone explaining the options simply'}),
        ('more_time', 'More time to decide', {'More time to decide'}),
        ('clearer_insurance', 'Clearer insurance information before the emergency', {'Clearer insurance information before the emergency'}),
    ]
    charts['help'] = multi_chart('help', rows, help_groups)
    care_groups = [
        ('surgery', 'Surgery', {'Surgery'}), ('hospitalisation', 'ICU or hospitalisation', {'ICU or hospitalisation'}),
        ('imaging', 'MRI, CT, ultrasound, or other imaging', {'MRI, CT, ultrasound, or other imaging'}),
        ('emergency', 'Emergency vet or out-of-hours care', {'Emergency vet or out-of-hours care'}),
        ('stabilisation', 'Emergency medication or stabilisation', {'Emergency medication or stabilisation'}),
        ('referral', 'Specialist referral or transfer', {'Specialist referral or transfer'}),
        ('ongoing', 'Ongoing treatment after discharge', {'Ongoing treatment after discharge'}),
        ('complex_emergency', 'Heart, breathing, neurological, spinal, trauma, poisoning, or other emergency care', {
            'Heart, breathing, neurological, spinal, trauma, poisoning, or other emergency care'}),
        ('cancer_complex', 'Cancer treatment or complex medical care', {'Cancer treatment or complex medical care'}),
        ('other_unsure', 'Other or unsure', {'Other', 'I am not sure'}),
    ]
    charts['care'] = multi_chart('care', rows, care_groups)
    uk = [row for row in rows if row['country'] == 'UK']
    uk_items = [
        ('cost_yes_or_partly', 'Said cost was part of the decision (Yes or Partly)', sum(row['cost_part'] in {'Yes', 'Partly'} for row in uk)),
        ('safe_payment_plan', 'Selected a safe payment plan as something that would have helped', sum('A safe payment plan' in row['help_options'] for row in uk)),
        ('direct_insurance_payment', 'Selected insurance paying the vet directly as something that would have helped', sum('Insurance paying the vet directly' in row['help_options'] for row in uk)),
    ]
    if any(count < 5 or 0 < len(uk) - count < 5 for _, _, count in uk_items):
        raise ValueError('Small UK cell: do not publish without a new disclosure review.')
    return {
        'schema_version': 'wrs_owner_statistics_v1', 'status': 'reviewed_snapshot',
        'release_id': reviewed_on + '-v1', 'reviewed_on': reviewed_on,
        'source': 'current_fillout_response_sheet', 'unit': 'distinct_form_submissions',
        'collection_period': {'start': min(row['_date'] for row in rows), 'end': max(row['_date'] for row in rows)},
        'source_records_through': max(row['_date'] for row in distinct),
        'counts': {
            'source_rows': len(raw), 'distinct_submission_ids': len(distinct),
            'duplicate_id_rows_removed': len(raw) - len(distinct), 'eligible_public_submissions': len(rows),
            'excluded_no_unconditional_public_permission': len(distinct) - len(rows),
            'legacy_entries_not_included': source['source_metadata']['legacy_entries_separate'],
        },
        'minimum_public_cell_count': 5, 'charts': charts,
        'uk': {'submissions': len(uk), 'unit': 'counts_only', 'items': [
            {'id': key, 'label': label, 'count': count} for key, label, count in uk_items]},
        'method_url': 'https://waitingroom.kingchillithepug.com/patterns.html#method',
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input-json', required=True, type=Path)
    parser.add_argument('--output-json', required=True, type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    if args.input_json.absolute().is_relative_to(root) or args.input_json.resolve().is_relative_to(root):
        raise SystemExit('Private inputs must remain outside the public repository.')
    if args.output_json.resolve() == args.input_json.resolve():
        raise SystemExit('Output must not overwrite the private source.')
    output = build(json.loads(args.input_json.read_text()))
    args.output_json.write_text(json.dumps(output, indent=2, ensure_ascii=False) + '\n')
    print('Aggregate candidate written; no submission-level values logged. Independent review required before publication.')
