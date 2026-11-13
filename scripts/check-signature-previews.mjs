#!/usr/bin/env node
/** Validate the public approved captures against a committed receipt created from the local baseline. */
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, sep, extname } from 'node:path';

const root = process.cwd();
const folder = resolve(root, 'public/signature-hero-01');
const receiptFile = resolve(root, 'docs/signature-hero-01/PREVIEW_RECEIPT.json');
const fail = (message) => { throw new Error('Signature Hero preview verification: ' + message); };
const expected = new Set(['carbon-1440', 'carbon-390', 'porcelain-1440', 'porcelain-390', 'cobalt-1440', 'cobalt-390']);
let receipt;
try { receipt = JSON.parse(readFileSync(receiptFile, 'utf8')); } catch { fail('Missing/invalid PREVIEW_RECEIPT.json'); }
if (receipt.schema !== 1 || !Array.isArray(receipt.assets) || receipt.assets.length !== 6) fail('Expected schema 1 and six assets');
if (!receipt.approval?.reference || !/^[a-f0-9]{64}$/.test(receipt.approval.baselineSha256)) fail('Missing approved baseline provenance');
const seen = new Set();
for (const asset of receipt.assets) {
  if (!asset || typeof asset.path !== 'string' || typeof asset.sha256 !== 'string') fail('Missing path or SHA-256');
  const name = asset.path.split('/').at(-1);
  const ext = extname(name).toLowerCase();
  if (ext !== '.png' && ext !== '.webp') fail('Use original PNG/WebP; no re-encoding');
  const base = name.slice(0, -ext.length);
  if (!expected.has(base) || seen.has(base)) fail('Unexpected/duplicate asset: ' + name);
  seen.add(base);
  if (base !== `${asset.preset}-${asset.viewport}`) fail('Preset/viewport mismatch: ' + name);
  if (!asset.sourcePath || asset.sourcePath.startsWith('/') || asset.sourcePath.split('/').includes('..')) fail('Expected source-relative provenance');
  const full = resolve(root, asset.path);
  if (!full.startsWith(folder + sep)) fail('Asset escapes public showcase folder');
  let stat;
  try { stat = lstatSync(full); } catch { fail('Missing file ' + asset.path); }
  if (!stat.isFile() || stat.isSymbolicLink()) fail('Not a regular file: ' + asset.path);
  const data = readFileSync(full);
  const digest = createHash('sha256').update(data).digest('hex');
  if (digest !== asset.sha256) fail('SHA mismatch: ' + asset.path);
  if (asset.sourceSha256 !== asset.sha256) fail('Source and copied bytes mismatch: ' + asset.path);
  if (asset.approvedSha256 !== asset.sha256) fail('Approved baseline mismatch: ' + asset.path);
  if (!Number.isInteger(asset.width) || !Number.isInteger(asset.height) || asset.width <= 0 || asset.height <= 0) fail('Missing valid dimensions: ' + asset.path);
  if (ext === '.png') {
    if (data.length < 24 || data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || data.toString('ascii', 12, 16) !== 'IHDR') fail('Invalid PNG: ' + asset.path);
    if (data.readUInt32BE(16) !== asset.width || data.readUInt32BE(20) !== asset.height || asset.width !== asset.viewport) fail('PNG dimensions differ from receipt: ' + asset.path);
  }
}
if (seen.size !== 6) fail('Missing approved capture variants');
const disk = readdirSync(folder).sort();
const allowed = receipt.assets.map(a => a.path.split('/').at(-1)).sort();
if (JSON.stringify(disk) !== JSON.stringify(allowed)) fail('Unexpected public assets in showcase folder');
console.log('PASS: six exact approved Signature Hero image hashes, no extra assets');
