#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2] || 'data/public_patterns_sample.json';
const requiredTopLevelFields = [
  'schema_version',
  'stories_shared_so_far',
  'countries_represented',
  'last_updated',
  'charts'
];

const requiredChartKeys = [
  'country',
  'care_needed',
  'main_barriers',
  'insurance_status',
  'outcomes',
  'what_would_have_helped'
];

const forbiddenTerms = [
  'pet_name',
  'email',
  'contact',
  'raw_story',
  'story_text',
  'quote',
  'reviewer',
  'submission_id',
  'vet_name',
  'insurer',
  'claim',
  'phone',
  'address'
];

const forbiddenUrlMarkers = [
  'docs.google.com/spreadsheets',
  'docs.google.com/forms',
  'script.google.com/macros/s/',
  'drive.google.com'
];

function fail(message) {
  console.error(`Public data validation failed: ${message}`);
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

function scan(value, parts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scan(item, parts.concat(String(index))));
    return;
  }

  if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      const lowerKey = key.toLowerCase();
      const forbiddenKey = forbiddenTerms.find((term) => lowerKey.includes(term));
      if (forbiddenKey) {
        fail(`forbidden key "${key}" at ${pathLabel(parts)} matched "${forbiddenKey}"`);
      }
      scan(value[key], parts.concat(key));
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

function validateCharts(charts) {
  if (!charts || typeof charts !== 'object' || Array.isArray(charts)) {
    fail('charts must be an object of aggregate chart arrays');
  }

  Object.entries(charts).forEach(([chartKey, entries]) => {
    if (!Array.isArray(entries)) {
      fail(`charts.${chartKey} must be an array`);
    }
    entries.forEach((entry, index) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        fail(`charts.${chartKey}.${index} must be an aggregate object`);
      }
      if (typeof entry.label !== 'string' || !entry.label.trim()) {
        fail(`charts.${chartKey}.${index}.label is required`);
      }
      if (typeof entry.percentage !== 'number') {
        fail(`charts.${chartKey}.${index}.percentage must be a number`);
      }
      if ('count' in entry && typeof entry.count !== 'number') {
        fail(`charts.${chartKey}.${index}.count must be a number when present`);
      }
    });
  });
}

const resolvedPath = path.resolve(inputPath);
const payload = readJson(resolvedPath);

requiredTopLevelFields.forEach((field) => {
  if (!(field in payload)) {
    fail(`missing required top-level field "${field}"`);
  }
});

if (typeof payload.stories_shared_so_far !== 'number' || payload.stories_shared_so_far < 0) {
  fail('stories_shared_so_far must be a non-negative number');
}

if (typeof payload.countries_represented !== 'number' || payload.countries_represented < 0) {
  fail('countries_represented must be a non-negative number');
}

if (typeof payload.last_updated !== 'string' || !payload.last_updated.trim()) {
  fail('last_updated must be a non-empty string');
}

if (payload.status === 'not_ready') {
  fail('payload status is not_ready');
}

scan(payload);
validateCharts(payload.charts);

requiredChartKeys.forEach((chartKey) => {
  if (!Array.isArray(payload.charts[chartKey])) {
    fail(`missing required chart "${chartKey}"`);
  }
});

console.log(`Public data validation passed: ${inputPath}`);
