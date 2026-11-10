#!/usr/bin/env node
import { validateHoldFile } from './validate-publication-hold.mjs';
validateHoldFile(process.argv[2] || 'data/public_patterns_sample.json', 'owner');
