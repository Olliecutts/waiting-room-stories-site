#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { validateStatistics } from './validate-statistics.mjs';
const path = process.argv[2] || new URL('../data/public_patterns_sample.json', import.meta.url);
validateStatistics(JSON.parse(await readFile(path, 'utf8')));
console.log('Owner statistics validated: aggregate-only schema, counts, denominators, fixed labels and disclosure thresholds.');
