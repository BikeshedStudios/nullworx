#!/usr/bin/env bash
# Builds an explicitly selected committed snapshot on a matching Linux/glibc builder.
set -euo pipefail
[[ $# -ge 2 && $# -le 3 && $1 =~ ^[0-9a-f]{40}$ && $2 == /* ]] || {
  echo 'Usage: ops/deploy/build-release.sh FULL_COMMIT_SHA ABSOLUTE_OUTPUT_DIRECTORY [unavailable|ascii-loop30-direct-permission]' >&2; exit 2;
}
commit=$1
output=$2
media=${3:-ascii-loop30-direct-permission}
[[ $media == unavailable || $media == ascii-loop30-direct-permission ]] || { echo 'Unreviewed media mode' >&2; exit 2; }
[[ $(node -p 'process.versions.node') == 24.20.0 ]] || { echo 'Node 24.20.0 required' >&2; exit 1; }
[[ $(uname -s) == Linux ]] || { echo 'Linux builder required' >&2; exit 1; }
getconf GNU_LIBC_VERSION >/dev/null
git cat-file -e "$commit^{commit}"
mkdir -p "$output"
output=$(realpath "$output")
[[ ! -e "$output/nullworx-$commit.tar.gz" ]] || { echo 'Artifact already exists; use a new output directory' >&2; exit 1; }
build_dir=$(mktemp -d)
trap 'rm -rf -- "$build_dir"' EXIT
git archive "$commit" | tar -x -C "$build_dir"
cd "$build_dir"
test -f ops/deploy/smoke-http.mjs
test -f ops/deploy/smoke-browser.mjs
node ops/deploy/check-public-assets.mjs
[[ $(node -p 'JSON.parse(require("fs").readFileSync("package.json")).packageManager') == pnpm@12.15.0 ]]
# Clean environment: never import owner secrets or a developer .env into a release.
export RELEASE_COMMIT="$commit" RELEASE_OUTPUT="$output" RELEASE_MEDIA="$media"
env -i PATH="$PATH" HOME="$HOME" CI=1 NEXT_TELEMETRY_DISABLED=1 \
  PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}" \
  RELEASE_COMMIT="$commit" RELEASE_OUTPUT="$output" RELEASE_MEDIA="$media" \
  NEXT_PUBLIC_SITE_URL=https://nullworx.space \
  bash <<'BUILD'
set -euo pipefail
[[ $(pnpm --version) == 12.15.0 ]]
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm validate:effects
pnpm validate:registry
pnpm test --maxWorkers=1 --no-file-parallelism
pnpm build
pnpm check:secrets
pnpm exec playwright install chromium
export PLAYGROUND_01C_RECEIPTS="$RELEASE_OUTPUT/playgrounds" PLAYGROUND_01A_RECEIPTS="$RELEASE_OUTPUT/magnetic" PLAYGROUND_01B_RECEIPTS="$RELEASE_OUTPUT/text"
export FORGE_REVIEW_DIR="$RELEASE_OUTPUT/forge" SIGNATURE_REVIEW_DIR="$RELEASE_OUTPUT/signature" POLISH_EVIDENCE="$RELEASE_OUTPUT/polish"
export LAUNCH_REPORT_DIR="$RELEASE_OUTPUT/launch" DISCOVERY_VISUAL_REPORT_DIR="$RELEASE_OUTPUT/launch/discovery" E2E_REPORT="$RELEASE_OUTPUT/e2e.json"
mkdir -p "$PLAYGROUND_01C_RECEIPTS"
ffmpeg -nostdin -n -hide_banner -loglevel error -f lavfi -i testsrc2=size=320x180:rate=24 -t 6 -c:v libvpx-vp9 -threads 1 -pix_fmt yuv420p "$PLAYGROUND_01C_RECEIPTS/synthetic-test.webm"
export ASCII_TEST_VIDEO="$PLAYGROUND_01C_RECEIPTS/synthetic-test.webm" POLISH_VIDEO="$PLAYGROUND_01C_RECEIPTS/synthetic-test.webm"
CLEAN_CLONE=1 pnpm exec playwright test --reporter=line --workers=1
bash ops/deploy/check.sh
pnpm test:launch
pnpm test:distribution
pnpm test:distribution:site
node tests/distribution/ascii-playground-consumers.mjs
# Verify the exact copied A/C source in fresh consumers through this build's HTTP endpoint.
pnpm start --port 3373 > "$RELEASE_OUTPUT/frontier-source-server.log" 2>&1 &
frontier_source_pid=$!
trap 'kill "$frontier_source_pid" 2>/dev/null || true' EXIT
node --input-type=module <<'FRONTIER_READY'
for (let n = 0; ; n++) {
  if (await fetch('http://127.0.0.1:3373/api/effects/visual-frontier/source').then(r => r.ok).catch(() => false)) break;
  if (n > 100) throw new Error('Exact-source server did not start');
  await new Promise(resolve => setTimeout(resolve, 200));
}
FRONTIER_READY
FRONTIER_BASE_URL=http://127.0.0.1:3373 FRONTIER_CONSUMER_RECEIPTS="$RELEASE_OUTPUT/frontier-consumers" pnpm test:distribution:frontier
kill "$frontier_source_pid"; wait "$frontier_source_pid" 2>/dev/null || true
trap - EXIT
node ops/deploy/check-public-assets.mjs
if [[ $RELEASE_MEDIA == ascii-loop30-direct-permission ]]; then
  # Only this committed receipt may configure the final build; arbitrary owner
  # environment values and local .env files never enter the builder.
  export NEXT_PUBLIC_ASCII_FEATURED_MEDIA
  NEXT_PUBLIC_ASCII_FEATURED_MEDIA=$(node -e 'process.stdout.write(JSON.stringify(require("./ops/deploy/ascii-featured-media.json")))')
  pnpm build
  # Existing private-media listener must already be provisioned and authorized.
  # No media enters the artifact. This check refuses missing/wrong served bytes.
  pnpm start --port 3372 > "$RELEASE_OUTPUT/product-server.log" 2>&1 &
  product_pid=$!
  trap 'kill "$product_pid" 2>/dev/null || true' EXIT
  node --input-type=module <<'READY'
for (let n = 0; ; n++) {
  if (await fetch('http://127.0.0.1:3372').then(r => r.ok).catch(() => false)) break;
  if (n > 150) throw new Error('Product server did not start');
  await new Promise(resolve => setTimeout(resolve, 200));
}
READY
  pnpm test:product --base-url http://127.0.0.1:3372 --report "$RELEASE_OUTPUT/product.json"
  kill "$product_pid"; wait "$product_pid" 2>/dev/null || true
  trap - EXIT
fi
node --input-type=module <<'MANIFEST'
import {writeFileSync, readFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import os from 'node:os';
const asset = readdirSync('.next/static/chunks', {recursive: true}).filter(name => name.endsWith('.js')).sort()[0];
if (!asset) throw new Error('No immutable JS asset found');
writeFileSync('release.json', JSON.stringify({
  schema: 1, commit: process.env.RELEASE_COMMIT, builtAt: new Date().toISOString(),
  site: 'https://nullworx.space', media: process.env.RELEASE_MEDIA,
  ...(process.env.RELEASE_MEDIA === 'ascii-loop30-direct-permission'
    ? {featuredMedia: JSON.parse(readFileSync('ops/deploy/ascii-featured-media.json', 'utf8'))} : {}),
  node: process.versions.node,
  platform: process.platform, arch: process.arch, glibc: process.report.getReport().header.glibcVersionRuntime,
  pnpm: '12.15.0', tests: 'passed',
  lockSha256: createHash('sha256').update(readFileSync('pnpm-lock.yaml')).digest('hex'),
  buildId: readFileSync('.next/BUILD_ID', 'utf8').trim(), builder: os.hostname(),
  asset: {path: '/_next/static/chunks/' + asset, sha256: createHash('sha256').update(readFileSync('.next/static/chunks/' + asset)).digest('hex')},
}, null, 2) + '\n');
MANIFEST
# No ignored video, environment files, source maps from a dirty tree or repository credentials.
# The whole dependency tree is retained for next start (no app config changes needed).
tar --exclude='.next/cache' --exclude='.next/trace' \
  -czf "$RELEASE_OUTPUT/nullworx-$RELEASE_COMMIT.tar.gz" \
  .next node_modules public package.json pnpm-lock.yaml next.config.ts release.json \
  ops/deploy/smoke-http.mjs ops/deploy/ascii-featured-media.json
BUILD
cd "$output"
sha256sum "nullworx-$commit.tar.gz" > "nullworx-$commit.tar.gz.sha256"
echo "Release artifact and checksum: $output"
