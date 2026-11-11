import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, cp, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { checkConsumer } from './interactions.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const output = await mkdtemp(join(tmpdir(), 'nullworx-consumers-'));
console.log(`Receipts and isolated consumers: ${output}`);
const children = [];
async function fixtureManifest(cwd) {
  const files = {};
  async function walk(dir, prefix = '') {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (['node_modules', '.next', 'dist'].includes(entry.name)) continue;
      const name = join(prefix, entry.name);
      if (entry.isDirectory()) await walk(join(dir, entry.name), name);
      else files[name] = createHash('sha256').update(await readFile(join(dir, entry.name))).digest('hex');
    }
  }
  await walk(cwd);
  return files;
}
const cli = ['dlx', 'shadcn@4.23.0'];
// This already-public commit contains the exact deployed Magnetic Focus closure.
// Remote failure must fail the test; there is no local-source install path.
const githubRef = process.env.NULLWORX_PUBLIC_REGISTRY_SHA ?? '4cd0e4b6f8efc95dfd2e4fd2e641c7d194ac378e';
assert.match(githubRef, /^[a-f0-9]{40}$/, 'Use a full public commit SHA');
const githubRegistry = `BikeshedStudios/nullworx#${githubRef}`;
const rawBase = `https://raw.githubusercontent.com/BikeshedStudios/nullworx/${githubRef}/`;
const remoteFiles = [];
async function remoteFile(path) {
  const response = await fetch(rawBase + path, { signal: AbortSignal.timeout(30_000) });
  assert.equal(response.status, 200, `Public GitHub file unavailable: ${path}`);
  const content = await response.text();
  remoteFiles.push({ path, url: response.url, sha256: createHash('sha256').update(content).digest('hex') });
  return content;
}
async function run(cwd, name, command, args) {
  const env = { ...process.env, CI: '1', NEXT_TELEMETRY_DISABLED: '1' };
  delete env.GITHUB_TOKEN;
  delete env.GH_TOKEN;
  const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = `$ ${command} ${args.join(' ')}\n`;
  child.stdout.on('data', data => { log += data; });
  child.stderr.on('data', data => { log += data; });
  const code = await new Promise((ok, fail) => { child.on('error', fail); child.on('close', ok); });
  await writeFile(join(output, `${name}.log`), log + `\nexit=${code}\n`);
  assert.equal(code, 0, `${name}: ${log.slice(-3000)}`);
  console.log(`${name}: PASS`);
}
async function put(path, content) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, content); }
async function template(kind, file) { return readFile(join(root, 'tests/distribution/fixtures', kind, file + '.template')); }
async function start(cwd, kind, port) {
  const child = spawn('pnpm', ['start', '--port', String(port)], { cwd, detached: true, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  let log = '';
  child.stdout.on('data', data => { log += data; }); child.stderr.on('data', data => { log += data; });
  child.on('close', () => writeFile(join(output, `${kind}-server.log`), log));
  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 150; i++) {
    if (child.exitCode !== null) throw new Error(log);
    if (await fetch(url).then(r => r.ok).catch(() => false)) return url;
    await new Promise(ok => setTimeout(ok, 200));
  }
  throw new Error(`${kind} startup timed out: ${log}`);
}
let browser;
const results = { output, node: process.version, shadcn: '4.23.0', githubRef, installMode: 'Public GitHub source registry; both clean consumers; no local install fallback', remoteFiles, consumers: [] };
try {
  await run(output, 'schema', 'pnpm', [...cli, 'registry', 'validate', githubRegistry]);
  const source = JSON.parse(await readFile(join(root, 'registry.json'), 'utf8')).items[0];
  const remoteRegistry = JSON.parse(await remoteFile('registry.json'));
  assert.equal(remoteRegistry.items.length, 1);
  assert.deepEqual(remoteRegistry.items[0].files, source.files, 'Public registry must declare the reviewed file closure');
  for (const file of source.files) {
    assert.equal(await remoteFile(file.path), await readFile(join(root, file.path), 'utf8'), 'Public source must match this checkout');
  }
  const license = await remoteFile('LICENSE');
  assert.equal(license, await readFile(join(root, 'LICENSE'), 'utf8'), 'Public MIT notice must match this checkout');
  browser = await chromium.launch({ headless: true });
  for (const [i, kind] of ['vite', 'next'].entries()) {
    const cwd = join(output, kind);
    await cp(join(root, 'tests/distribution/fixtures', kind), cwd, { recursive: true });
    for (const file of await readdir(cwd)) if (file.endsWith('.template')) {
      // Templates remain inert in the source repository's TS/lint graph.
      const destination = file.slice(0, -9);
      const appFile = kind === 'next' && ['page.tsx', 'layout.tsx'].includes(destination);
      await put(join(cwd, appFile ? 'app' : '', destination), await readFile(join(cwd, file)));
    }
    await put(join(cwd, 'Demo.tsx'), await template('shared', 'Demo.tsx'));
    await put(join(cwd, kind === 'next' ? 'app/globals.css' : 'globals.css'), await template('shared', 'globals.css'));
    await put(join(cwd, 'NULLWORX-LICENSE'), license);
    await run(cwd, `${kind}-install`, 'pnpm', ['install', '--frozen-lockfile']);
    const itemAddress = `BikeshedStudios/nullworx/magnetic-focus#${githubRef}`;
    const beforeInstall = await fixtureManifest(cwd);
    await run(cwd, `${kind}-dry-run`, 'pnpm', [...cli, 'add', itemAddress, '--dry-run']);
    assert.deepEqual(await fixtureManifest(cwd), beforeInstall, 'Dry-run must not write files');
    await assert.rejects(readFile(join(cwd, 'components/nullworx/magnetic-focus.tsx')), { code: 'ENOENT' });
    await run(cwd, `${kind}-cli-add`, 'pnpm', [...cli, 'add', itemAddress, '--yes']);
    const afterInstall = await fixtureManifest(cwd);
    for (const [path, hash] of Object.entries(beforeInstall)) assert.equal(afterInstall[path], hash, `Installer changed unrelated file: ${path}`);
    assert.deepEqual(Object.keys(afterInstall).filter(path => !(path in beforeInstall)).sort(), source.files.map(file => file.target.replace('@components/', 'components/')).sort());
    const manifest = [];
    for (const file of source.files) {
      const target = file.target.replace('@components/', 'components/');
      const actual = await readFile(join(cwd, target), 'utf8');
      const canonical = await readFile(join(root, file.path), 'utf8');
      assert.equal(actual, canonical, 'Installed source must be byte-identical to the canonical source');
      manifest.push({ source: file.path, target, canonicalSha256: createHash('sha256').update(canonical).digest('hex'), installedSha256: createHash('sha256').update(actual).digest('hex') });
    }
    await run(cwd, `${kind}-typecheck`, 'pnpm', ['typecheck']);
    await run(cwd, `${kind}-build`, 'pnpm', ['build']);
    const url = await start(cwd, kind, Number(process.env.CONSUMER_PORT ?? 3440) + i);
    const proof = await checkConsumer(browser, url, join(output, kind));
    results.consumers.push({ kind, cwd, url, itemAddress, manifest, proof });
    await writeFile(join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  }
  console.log('Consumer installation, typecheck, build and browser interactions: PASS');
} catch (error) {
  results.failure = String(error.stack ?? error);
  throw error;
} finally {
  await writeFile(join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  await browser?.close();
  for (const child of children) { try { process.kill(-child.pid, 'SIGTERM'); } catch { /* Already stopped. */ } }
}
