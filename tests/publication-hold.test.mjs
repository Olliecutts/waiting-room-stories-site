import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validatePublicationHold } from '../scripts/validate-publication-hold.mjs';

for (const [dataset, file] of [['owner', 'public_patterns_sample.json'], ['professional', 'professional_patterns_sample.json']]) {
  const payload = JSON.parse(fs.readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'));
  test(`${dataset}: approved hold is valid`, () => assert.equal(validatePublicationHold(payload, dataset), true));
  test(`${dataset}: an automatic refresh cannot reintroduce charts or extra fields`, () => {
    assert.throws(() => validatePublicationHold({...payload, charts: {barriers: [{count: 1}]}}, dataset));
    assert.throws(() => validatePublicationHold({...payload, total_stories: 402}, dataset));
    assert.throws(() => validatePublicationHold({...payload, email: 'synthetic@example.invalid'}, dataset));
  });
  test(`${dataset}: changed status and free text cannot bypass the hold`, () => {
    assert.throws(() => validatePublicationHold({...payload, status: 'reviewed_aggregate'}, dataset));
    assert.throws(() => validatePublicationHold({...payload, message: 'Unreviewed replacement'}, dataset));
  });
  test(`${dataset}: swapped or missing dataset is rejected`, () => {
    assert.throws(() => validatePublicationHold({...payload, dataset: dataset === 'owner' ? 'professional' : 'owner'}, dataset));
    const missing = {...payload}; delete missing.dataset;
    assert.throws(() => validatePublicationHold(missing, dataset));
  });
}
