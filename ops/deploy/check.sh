#!/usr/bin/env bash
set -euo pipefail
for script in ops/deploy/*.sh; do bash -n "$script"; done
for script in ops/deploy/*.mjs; do node --check "$script"; done
python3 -m unittest discover -s ops/deploy/tests -p 'test_*.py' -v
node --test ops/deploy/tests/*.test.mjs
if command -v shellcheck >/dev/null; then shellcheck ops/deploy/*.sh; fi
