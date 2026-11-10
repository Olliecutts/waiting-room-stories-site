import fs from 'node:fs';

// This is deliberately a hold, not a validator or approval for future statistics.
// Restoring numerical publication requires a separate reviewed methods/release change.
export function validatePublicationHold(payload, dataset) {
  const expected = {
    schema_version: 'wrs_publication_hold_v1',
    dataset,
    status: 'under_review',
    last_updated: '2026-11-10',
    message: 'Numerical reporting is paused while methods, permissions and small groups are checked.',
    evidence_url: 'https://waitingroom.kingchillithepug.com/patterns.html'
  };
  if (!['owner', 'professional'].includes(dataset)) throw new Error('Unknown dataset');
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') throw new Error('Expected a publication-hold object');
  if (JSON.stringify(Object.keys(payload).sort()) !== JSON.stringify(Object.keys(expected).sort())) {
    throw new Error('Publication hold must contain only the approved status fields; no counts, charts or extra data');
  }
  for (const [key, value] of Object.entries(expected)) {
    if (payload[key] !== value) throw new Error(`Unexpected publication-hold field: ${key}`);
  }
  return true;
}

export function validateHoldFile(filePath, dataset) {
  try {
    validatePublicationHold(JSON.parse(fs.readFileSync(filePath, 'utf8')), dataset);
    console.log(`Publication hold verified (${dataset}): ${filePath}`);
  } catch (error) {
    console.error(`Publication hold validation failed (${dataset}): ${error.message}`);
    process.exitCode = 1;
  }
}
