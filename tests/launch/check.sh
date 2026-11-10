#!/usr/bin/env bash
# Requires an existing clean-media production build. All servers are local.
set -euo pipefail
port=${LAUNCH_PORT:-3360}
reports=${LAUNCH_REPORT_DIR:-$(mktemp -d)}
mkdir -p "$reports"
node ops/deploy/check-public-assets.mjs
node --input-type=module - "$port" <<'PORT'
import net from 'node:net';
const server = net.createServer();
server.on('error', error => { console.error(error); process.exitCode = 1; });
server.listen(Number(process.argv[2]), '127.0.0.1', () => server.close());
PORT
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port "$port" > "$reports/server.log" 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true; wait "$server_pid" 2>/dev/null || true' EXIT
export SEO_BASE_URL="http://127.0.0.1:$port"
node --input-type=module <<'READY'
let ready = false;
for (let i = 0; i < 150; i++) {
  if (await fetch(process.env.SEO_BASE_URL).then(r => r.ok).catch(() => false)) { ready = true; break; }
  await new Promise(done => setTimeout(done, 200));
}
if (!ready) throw new Error('Local launch server failed to start');
READY
pnpm exec tsx tests/discovery/verify-built.ts
pnpm exec tsx tests/discovery/http-check.ts
pnpm exec tsx tests/discovery/visual-check.ts
A11Y_REPORT="$reports/digital-wake-accessibility.json" node tests/launch/digital-wake-accessibility.mjs
echo "Launch reports: $reports"
