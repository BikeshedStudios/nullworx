import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { validateRegistry } from '../../scripts/validate-registry.mjs';

const root = resolve(import.meta.dirname, '../..');
test('canonical registry has a valid source closure', () => { validateRegistry(root); });
for (const [label, mutate] of [
  ['target path escape', r => { r.items[0].files[0].target = '../outside.tsx'; }],
  ['source path escape', r => { r.items[0].files[0].path = '../magnetic-focus.tsx'; }],
  ['duplicate instead of hook', r => { r.items[0].files[2] = r.items[0].files[0]; }],
  ['missing stylesheet', r => { r.items[0].files.splice(1, 1); }],
  ['phantom dependency', r => { r.items[0].dependencies = ['unreviewed']; }],
  ['stale embedded content', r => { r.items[0].files[0].content = 'old source'; }],
]) {
  test(`registry rejects ${label}`, () => {
    const temp = mkdtempSync(join(tmpdir(), 'nullworx-registry-test-'));
    try {
      mkdirSync(join(temp, 'components'), { recursive: true });
      cpSync(join(root, 'components/forge-factory-01'), join(temp, 'components/forge-factory-01'), { recursive: true });
      const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'));
      mutate(registry); writeFileSync(join(temp, 'registry.json'), JSON.stringify(registry));
      assert.throws(() => validateRegistry(temp));
    } finally { rmSync(temp, { recursive: true }); }
  });
}
for (const [label, file, extra] of [
  ['undeclared package import', 'magnetic-focus.tsx', '\nimport x from "undeclared-library";'],
  ['side-effect import', 'use-reduced-motion.ts', '\nimport "./missing.css";'],
  ['dynamic import', 'use-reduced-motion.ts', '\nimport("./missing");'],
  ['CSS asset dependency', 'magnetic-focus.module.css', '\na { background: url(./missing.png); }'],
]) {
  test(`registry rejects ${label}`, () => {
    const temp = mkdtempSync(join(tmpdir(), 'nullworx-registry-test-'));
    try {
      cpSync(join(root, 'registry.json'), join(temp, 'registry.json'));
      mkdirSync(join(temp, 'components'), { recursive: true });
      cpSync(join(root, 'components/forge-factory-01'), join(temp, 'components/forge-factory-01'), { recursive: true });
      const path = join(temp, 'components/forge-factory-01', file);
      writeFileSync(path, readFileSync(path, 'utf8') + extra);
      assert.throws(() => validateRegistry(temp));
    } finally { rmSync(temp, { recursive: true }); }
  });
}
