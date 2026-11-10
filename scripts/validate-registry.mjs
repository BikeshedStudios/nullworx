import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Fast closure gate. The distribution suite also runs the official shadcn schema
// validator, builds the registry, and installs with the real pinned CLI.
export function validateRegistry(root = process.cwd()) {
  const registry = JSON.parse(readFileSync(resolve(root, 'registry.json'), 'utf8'));
  assert.equal(registry.$schema, 'https://ui.shadcn.com/schema/registry.json');
  assert.equal(registry.name, 'nullworx');
  assert.equal(registry.items?.length, 1, 'Only the tested pilot may be listed');
  const [item] = registry.items;
  assert.equal(item.name, 'magnetic-focus');
  assert.equal(item.type, 'registry:component');
  for (const key of ['dependencies', 'devDependencies', 'registryDependencies']) {
    assert.equal(item[key]?.length ?? 0, 0, `Unexpected hidden dependency: ${key}`);
  }
  const expected = new Map([
    ['magnetic-focus.tsx', { type: 'registry:component', imports: ['react', './use-reduced-motion', './magnetic-focus.module.css'] }],
    ['magnetic-focus.module.css', { type: 'registry:file', imports: [] }],
    ['use-reduced-motion.ts', { type: 'registry:hook', imports: ['react'] }],
  ]);
  assert.equal(item.files?.length, expected.size, 'Unexpected registry source count');
  for (const file of item.files) {
    const name = file.path.split('/').at(-1);
    const spec = expected.get(name);
    assert.ok(spec, `Unexpected or duplicate file: ${file.path}`);
    assert.equal(file.type, spec.type, `Unexpected type: ${file.path}`);
    assert.equal(file.target, `@components/nullworx/${name}`, 'Preserve relative imports in one target folder');
    assert.equal(file.path, `components/forge-factory-01/${name}`, 'Use canonical sources only');
    assert.equal(file.content, undefined, 'Source registry must read current canonical files');
    const absolute = resolve(root, file.path);
    assert.equal(realpathSync(absolute), absolute, 'Registry sources may not be symlinks');
    const content = readFileSync(absolute, 'utf8');
    assert.ok(content.trim().length > 32, `Empty/truncated source: ${file.path}`);
    if (name.endsWith('.css')) {
      assert.doesNotMatch(content, /@import\b|url\s*\(/i, 'Pilot CSS must be self-contained');
    } else {
      assert.doesNotMatch(content, /\brequire\s*\(|\bimport\s*\(/, 'Unexpected dynamic dependency');
      const imports = [...content.matchAll(/\b(?:import|export)\s+(?:[^;]*?\s+from\s+)?["']([^"']+)["']/g)].map(m => m[1]);
      assert.deepEqual([...new Set(imports)].sort(), [...spec.imports].sort(), `Unexpected import closure: ${file.path}`);
      assert.match(content, /^"use client";/, 'Retain the Next.js client boundary');
    }
    expected.delete(name);
  }
  assert.equal(expected.size, 0, 'Missing required registry files');
  return registry;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  validateRegistry();
  console.log('Magnetic Focus local registry closure: PASS (3 canonical files, no hidden runtime dependencies beyond React)');
}
