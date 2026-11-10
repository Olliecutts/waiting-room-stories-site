#!/usr/bin/env node
import { validateHoldFile } from './validate-publication-hold.mjs';
validateHoldFile(process.argv[2] || 'data/professional_patterns_sample.json', 'professional');
