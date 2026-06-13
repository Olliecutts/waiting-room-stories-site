#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2] || 'data/professional_patterns_sample.json';

const requiredChartKeys = [
  'care_situations_affected',
  'barriers_seen',
  'hardest_for_families',
  'hardest_for_teams',
  'families_do_not_know',
  'would_help_most',
  'who_needs_to_be_part_of_solution'
];

const allowedStatuses = new Set([
  'reviewed_aggregate',
  'not_enough_reviewed_responses'
]);

const allowedEndpointModes = new Set([
  'professional_reviewed_aggregate',
  'professional_not_enough_reviewed_responses',
  'professional_placeholder'
]);

const forbiddenTerms = [
  'name',
  'email',
  'workplace',
  'phone',
  'address',
  'free_text',
  'free text',
  'quote',
  'raw',
  'submission',
  'contact',
  'reviewer',
  'notes',
  'pet_name',
  'story_text',
  'owner_story',
  'vet_name',
  'insurer',
  'claim_detail',
  'claim details'
];

const forbiddenUrlMarkers = [
  'docs.google.com/spreadsheets',
  'docs.google.com/forms',
  'script.google.com/macros/s/',
  'drive.google.com'
];

function fail(message) {
  console.error(`Professional data validation failed: ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`${filePath} is not valid JSON: ${error.message}`);
  }
}

function pathLabel(parts) {
  return parts.length ? parts.join('.') : '<root>';
}

function isAllowedPublicCountPath(parts) {
  return parts.length === 1 && ['public_response_count_enabled', 'public_response_count'].includes(parts[0]);
}

function scan(value, parts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scan(item, parts.concat(String(index))));
    return;
  }

  if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      const nextParts = parts.concat(key);
      const lowerKey = key.toLowerCase();
      const forbiddenKey = forbiddenTerms.find((term) => lowerKey.includes(term));
      if (forbiddenKey && !isAllowedPublicCountPath(nextParts)) {
        fail(`forbidden key "${key}" at ${pathLabel(parts)} matched "${forbiddenKey}"`);
      }
      scan(value[key], nextParts);
    });
    return;
  }

  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    const forbiddenValue = forbiddenTerms.find((term) => lowerValue.includes(term));
    if (forbiddenValue) {
      fail(`forbidden text at ${pathLabel(parts)} matched "${forbiddenValue}"`);
    }
    const forbiddenUrl = forbiddenUrlMarkers.find((term) => lowerValue.includes(term));
    if (forbiddenUrl) {
      fail(`private/source URL marker at ${pathLabel(parts)} matched "${forbiddenUrl}"`);
    }
  }
}

function validateChart(chartKey, chart) {
  if (!chart || typeof chart !== 'object' || Array.isArray(chart)) {
    fail(`charts.${chartKey} must be an aggregate chart object`);
  }

  if (typeof chart.title !== 'string' || !chart.title.trim()) {
    fail(`charts.${chartKey}.title is required`);
  }

  if ('description' in chart && typeof chart.description !== 'string') {
    fail(`charts.${chartKey}.description must be a string when present`);
  }

  if (!Array.isArray(chart.items)) {
    fail(`charts.${chartKey}.items must be an array`);
  }

  chart.items.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      fail(`charts.${chartKey}.items.${index} must be an aggregate object`);
    }
    if (typeof entry.label !== 'string' || !entry.label.trim()) {
      fail(`charts.${chartKey}.items.${index}.label is required`);
    }
    if (typeof entry.percentage !== 'number') {
      fail(`charts.${chartKey}.items.${index}.percentage must be a number`);
    }
    if ('count' in entry && typeof entry.count !== 'number') {
      fail(`charts.${chartKey}.items.${index}.count must be a number when present`);
    }
  });
}

const resolvedPath = path.resolve(inputPath);
const payload = readJson(resolvedPath);

if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
  fail('payload must be a JSON object');
}

if (payload.schema_version !== 'wrs_professional_patterns_v1') {
  fail('schema_version must be wrs_professional_patterns_v1');
}

if (!allowedStatuses.has(payload.status)) {
  fail(`status must be one of: ${Array.from(allowedStatuses).join(', ')}`);
}

if (!allowedEndpointModes.has(payload.endpoint_mode)) {
  fail(`endpoint_mode must be one of: ${Array.from(allowedEndpointModes).join(', ')}`);
}

if (typeof payload.last_updated !== 'string' || !payload.last_updated.trim()) {
  fail('last_updated must be a non-empty string');
}

if (payload.public_response_count_enabled !== false) {
  fail('public_response_count_enabled must remain false');
}

if (payload.public_response_count !== null) {
  fail('public_response_count must remain null');
}

if ('stories_shared_so_far' in payload || 'total_stories' in payload || 'countries_represented' in payload) {
  fail('owner-story count fields must not appear in Professional Insight JSON');
}

if (!payload.charts || typeof payload.charts !== 'object' || Array.isArray(payload.charts)) {
  fail('charts must be an object');
}

const chartKeys = Object.keys(payload.charts).sort();
const expectedKeys = [...requiredChartKeys].sort();
if (JSON.stringify(chartKeys) !== JSON.stringify(expectedKeys)) {
  fail(`chart keys must be exactly: ${expectedKeys.join(', ')}`);
}

requiredChartKeys.forEach((chartKey) => {
  validateChart(chartKey, payload.charts[chartKey]);
});

scan(payload);

console.log(`Professional data validation passed: ${inputPath}`);
