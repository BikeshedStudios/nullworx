import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
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
const githubRef = process.env.NULLWORX_PUBLIC_REGISTRY_SHA;
if (githubRef) assert.match(githubRef, /^[a-f0-9]{40}$/, 'Use a full public commit SHA');
const githubRegistry = githubRef ? `BikeshedStudios/nullworx#${githubRef}` : null;
async function run(cwd, name, command, args) {
  const child = spawn(command, args, { cwd, env: { ...process.env, CI: '1', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
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
const server = createServer(async (req, res) => {
  if (req.url !== '/magnetic-focus.json') { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', 'application/json');
  res.end(await readFile(join(output, 'registry/magnetic-focus.json')));
});
let browser;
const results = { output, node: process.version, shadcn: '4.23.0', installMode: githubRef ? `GitHub source registry at ${githubRef}; both clean consumers; no local install fallback` : 'local HTTP (Vite) and local JSON (Next) registry with real shadcn CLI; GitHub remote NOT proven', consumers: [] };
try {
  await run(root, 'schema', 'pnpm', [...cli, 'registry', 'validate', githubRegistry ?? './registry.json']);
  await run(root, 'registry-build', 'pnpm', [...cli, 'build', '--output', join(output, 'registry')]);
  const built = JSON.parse(await readFile(join(output, 'registry/magnetic-focus.json'), 'utf8'));
  const source = JSON.parse(await readFile(join(root, 'registry.json'), 'utf8')).items[0];
  assert.equal(built.files.length, source.files.length);
  for (const file of built.files) assert.equal(file.content, await readFile(join(root, file.path), 'utf8'));
  await new Promise(ok => server.listen(0, '127.0.0.1', ok));
  const address = `http://127.0.0.1:${server.address().port}/magnetic-focus.json`;
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
    await cp(join(root, 'LICENSE'), join(cwd, 'NULLWORX-LICENSE'));
    await run(cwd, `${kind}-install`, 'pnpm', ['install', '--frozen-lockfile']);
    // Exercise both supported local address forms with actual installs.
    const itemAddress = githubRef ? `BikeshedStudios/nullworx/magnetic-focus#${githubRef}` : kind === 'vite' ? address : join(output, 'registry/magnetic-focus.json');
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
  await new Promise(ok => server.close(ok));
  for (const child of children) { try { process.kill(-child.pid, 'SIGTERM'); } catch { /* Already stopped. */ } }
}
