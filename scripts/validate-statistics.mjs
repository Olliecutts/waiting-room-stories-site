import { readFile } from 'node:fs/promises';
const labels = JSON.parse(await readFile(new URL('./statistics-labels.json', import.meta.url), 'utf8'));
const fail = message => { throw new Error(message); };
const exactKeys = (value, expected, context) => {
  if (!value || Array.isArray(value) || typeof value !== 'object') fail(`${context}: expected object`);
  if (Object.keys(value).sort().join('|') !== [...expected].sort().join('|')) fail(`${context}: unexpected or missing fields`);
};
const integer = (value, minimum = 0) => Number.isInteger(value) && value >= minimum;
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
export function validateStatistics(data) {
  exactKeys(data, ['schema_version','status','release_id','reviewed_on','source','unit','collection_period',
    'source_records_through','counts','minimum_public_cell_count','charts','uk','method_url'], 'release');
  if (data.schema_version !== 'wrs_owner_statistics_v1' || data.status !== 'reviewed_snapshot' ||
      data.source !== 'current_fillout_response_sheet' || data.unit !== 'distinct_form_submissions') fail('Invalid release identity');
  if (!validDate(data.reviewed_on) || data.release_id !== `${data.reviewed_on}-v1`) fail('Invalid release date or ID');
  exactKeys(data.collection_period, ['start','end'], 'collection period');
  const { start, end } = data.collection_period;
  if (![start,end,data.source_records_through].every(validDate) || start > end || end > data.source_records_through ||
      data.source_records_through > data.reviewed_on) fail('Invalid collection/source/review dates');
  if (data.minimum_public_cell_count !== 5) fail('Unsupported disclosure threshold');
  if (data.method_url !== 'https://waitingroom.kingchillithepug.com/patterns.html#method') fail('Unexpected method URL');
  const c = data.counts;
  exactKeys(c, ['source_rows','distinct_submission_ids','duplicate_id_rows_removed','eligible_public_submissions',
    'excluded_no_unconditional_public_permission','legacy_entries_not_included'], 'counts');
  if (!Object.values(c).every(value => integer(value))) fail('Counts must be nonnegative integers');
  const n = c.eligible_public_submissions;
  if (n < 5 || c.source_rows !== c.distinct_submission_ids + c.duplicate_id_rows_removed ||
      c.distinct_submission_ids !== n + c.excluded_no_unconditional_public_permission) fail('Submission reconciliation failed');
  exactKeys(data.charts, Object.keys(labels), 'charts');
  for (const [key, definition] of Object.entries(labels)) {
    const chart = data.charts[key], multiple = definition.kind === 'multiple_choice';
    exactKeys(chart, ['question','kind','denominator','missing_answers','items', ...(multiple ? ['multiple_option_submissions'] : [])], key);
    if (chart.question !== definition.question || chart.kind !== definition.kind || chart.denominator !== n || chart.missing_answers !== 0) fail(`${key}: question or denominator mismatch`);
    if (multiple && (!integer(chart.multiple_option_submissions) || chart.multiple_option_submissions > n)) fail(`${key}: invalid multi-option count`);
    if (!Array.isArray(chart.items) || chart.items.length !== Object.keys(definition.items).length) fail(`${key}: unexpected item count`);
    const seen = new Set(); let total = 0;
    for (const item of chart.items) {
      exactKeys(item, ['id','label','count','percentage'], `${key} item`);
      if (seen.has(item.id) || definition.items[item.id] !== item.label) fail(`${key}: unknown or duplicate category`);
      seen.add(item.id);
      if (!integer(item.count, 5) || item.count > n) fail(`${key}: unsafe or impossible cell`);
      if (typeof item.percentage !== 'number' || !Number.isFinite(item.percentage) ||
          Math.abs(item.percentage - Math.round(item.count * 1000 / n) / 10) > 0.0001) fail(`${key}: incorrect percentage`);
      total += item.count;
    }
    if (!multiple && total !== n) fail(`${key}: single-answer groups do not reconcile`);
    if (multiple && total < n) fail(`${key}: selections below complete answered denominator`);
  }
  exactKeys(data.uk, ['submissions','unit','items'], 'UK subset');
  if (data.uk.unit !== 'counts_only' || data.uk.submissions !== data.charts.geography.items.find(item => item.id === 'uk').count) fail('UK subset mismatch');
  const ukLabels = {
    cost_yes_or_partly: 'Said cost was part of the decision (Yes or Partly)',
    safe_payment_plan: 'Selected a safe payment plan as something that would have helped',
    direct_insurance_payment: 'Selected insurance paying the vet directly as something that would have helped',
  };
  if (!Array.isArray(data.uk.items) || data.uk.items.length !== 3) fail('Unexpected UK categories');
  const seen = new Set();
  for (const item of data.uk.items) {
    exactKeys(item, ['id','label','count'], 'UK item');
    if (seen.has(item.id) || ukLabels[item.id] !== item.label || !integer(item.count,5) || item.count > data.uk.submissions ||
        (data.uk.submissions-item.count > 0 && data.uk.submissions-item.count < 5)) fail('Invalid UK cell or small complement');
    seen.add(item.id);
  }
  return true;
}
