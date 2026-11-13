// Loopback-only review harness for the existing exact-path private media rewrite.
// File stays outside the repository; hash it before serving any request.
import { createServer } from 'node:http';
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const file = process.argv[2];
assert.ok(file, 'Usage: node scripts/preview-featured-media.mjs /absolute/private/loop30-v2.mp4');
const receipt = JSON.parse(readFileSync(new URL('../ops/deploy/ascii-featured-media.json', import.meta.url)));
const size = statSync(file).size;
assert.equal(size, 12862251);
assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), receipt.sha256);
createServer((req, res) => {
  if (req.url !== receipt.src || !['GET', 'HEAD'].includes(req.method)) { res.writeHead(404).end(); return; }
  let start = 0, end = size - 1;
  const headers = { 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=31536000, immutable' };
  if (req.headers.range) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
    if (!match) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
    start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), size - 1) : end;
    if (start > end || start >= size) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length'] = String(end - start + 1);
  res.writeHead(req.headers.range ? 206 : 200, headers);
  if (req.method === 'HEAD') res.end();
  else { const stream = createReadStream(file, { start, end }); stream.pipe(res); res.on('close', () => stream.destroy()); }
}).listen(3403, '127.0.0.1', () => console.log(`Verified ${receipt.sha256}; read-only LOOP30 review stream on 127.0.0.1:3403`));
