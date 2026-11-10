"""Synthetic regression cases only: no submission-level project data belongs here."""
import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from uuid import NAMESPACE_URL, uuid5

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('builder', ROOT/'scripts/build-statistics.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


def fixture():
    rows = []
    for i in range(60):
        rows.append({
            'submission_id': str(uuid5(NAMESPACE_URL, f'https://example.invalid/synthetic/{i}')),
            'submitted_at': '2026-06-01 12:00:00',
            'country': ['USA', 'UK', 'Canada', 'Australia'][i//15],
            'cost_part': 'Yes' if i%2 == 0 else 'No',
            'insurance': ['No', 'Yes', 'I had insurance but it ran out'][i%3],
            'care': ', '.join(builder.CARE),
            'barriers': ', '.join(builder.BARRIERS),
            'help': ', '.join(builder.HELP),
            'public_permission': 'Yes, anonymously',
        })
    return {'format': 'wrs_minimised_source_v1', 'reviewed_on': '2026-11-10',
            'source_metadata': {'legacy_entries_separate': 0}, 'rows': rows}


class SourceTests(unittest.TestCase):
    def test_embedded_commas_and_repeated_selection(self):
        label = 'MRI, CT, ultrasound, or other imaging'
        self.assertEqual(builder.parse_options(f'{label}, Surgery, {label}', builder.CARE), {label, 'Surgery'})

    def test_unknown_option_is_rejected_without_echoing_value(self):
        with self.assertRaises(ValueError) as error:
            builder.parse_options('PRIVATE_SENTINEL', builder.CARE)
        self.assertNotIn('PRIVATE_SENTINEL', str(error.exception))

    def test_deduplicates_id_and_uses_submission_denominator(self):
        source = fixture()
        source['rows'].append(copy.deepcopy(source['rows'][0]))
        result = builder.build(source)
        self.assertEqual(result['counts']['duplicate_id_rows_removed'], 1)
        self.assertEqual(result['counts']['eligible_public_submissions'], 60)
        self.assertEqual(result['charts']['barriers']['denominator'], 60)
        self.assertTrue(all(item['count'] == 60 for item in result['charts']['barriers']['items']))

    def test_latest_permission_wins_regardless_of_row_order(self):
        source = fixture()
        later = copy.deepcopy(source['rows'][0])
        later.update(submitted_at='2026-07-01 12:00:00', public_permission='No, private research only')
        source['rows'].insert(0, later)
        result = builder.build(source)
        self.assertEqual(result['counts']['eligible_public_submissions'], 59)
        self.assertEqual(result['source_records_through'], '2026-07-01')
        self.assertEqual(result['collection_period']['end'], '2026-06-01')

    def test_conflicting_timestamp_ties_fail(self):
        source = fixture()
        conflicting = copy.deepcopy(source['rows'][0])
        conflicting['public_permission'] = 'Yes, but please contact me first'
        source['rows'].append(conflicting)
        with self.assertRaisesRegex(ValueError, 'Conflicting versions'):
            builder.build(source)

    def test_unknown_permission_is_not_silently_excluded(self):
        source = fixture()
        source['rows'][0]['public_permission'] = 'unknown'
        with self.assertRaisesRegex(ValueError, 'Unknown permission'):
            builder.build(source)

    def test_small_uk_complement_fails(self):
        source = fixture()
        source['rows'][15]['help'] = ', '.join(x for x in builder.HELP if x != 'A safe payment plan')
        with self.assertRaisesRegex(ValueError, 'Small UK cell'):
            builder.build(source)

    def test_output_cannot_overwrite_source(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)/'synthetic.json'
            before = json.dumps(fixture())
            path.write_text(before)
            result = subprocess.run([sys.executable, str(ROOT/'scripts/build-statistics.py'),
                '--input-json', str(path), '--output-json', str(path)], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('must not overwrite', result.stderr)
            self.assertEqual(path.read_text(), before)

    def test_private_input_path_cannot_be_inside_public_repo(self):
        result = subprocess.run([sys.executable, str(ROOT/'scripts/build-statistics.py'),
            '--input-json', str(ROOT/'not-a-real-input.json'), '--output-json', '/tmp/not-a-real-output.json'],
            capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('outside the public repository', result.stderr)


if __name__ == '__main__':
    unittest.main()
