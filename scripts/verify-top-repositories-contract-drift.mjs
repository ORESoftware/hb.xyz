import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = process.cwd();
const typespec = resolve(root, 'contracts/github-top-repositories.tsp');
const authored = resolve(root, 'contracts/github-top-repositories.schema.json');
const tjsv = resolve(
  root,
  'node_modules/@oresoftware/typespec-json-schema-validator/bin/typespec-json-schema-validator.mjs',
);

const work = await mkdtemp(join(tmpdir(), 'hb-top-repos-tjsv-drift-'));

try {
  const mutated = JSON.parse(await readFile(authored, 'utf8'));
  mutated.$defs.GitHubRepository.properties.stargazers_count.type = 'string';

  const driftedSchema = join(work, 'drifted.schema.json');
  const report = join(work, 'report.json');
  await writeFile(driftedSchema, `${JSON.stringify(mutated, null, 2)}\n`, 'utf8');

  const result = spawnSync(
    process.execPath,
    [
      tjsv,
      'check',
      `--typespec=${typespec}`,
      `--schema=${driftedSchema}`,
      `--report=${report}`,
      '--quiet',
    ],
    {
      cwd: root,
      encoding: 'utf8',
      env: process.env,
    },
  );

  assert.equal(
    result.status,
    2,
    `intentional authority drift must stop evaluation with TJSV exit 2; got ${String(result.status)}\n${result.stdout}\n${result.stderr}`,
  );

  const receipt = JSON.parse(await readFile(report, 'utf8'));
  assert.equal(receipt.status, 'stopped_for_evaluation');
  assert.ok(Array.isArray(receipt.findings) && receipt.findings.length > 0);

  console.log('negative TJSV drift proof passed');
} finally {
  await rm(work, { recursive: true, force: true });
}
