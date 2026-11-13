## Permanent product contracts

Before changing homepage, media, effects, distribution or release gates, read `docs/PRODUCT_BASELINES.md` and the referenced source/release receipts. Preserve all accepted feature sets. Add a blocking regression test for every accepted behavior; never replace an accepted default from an older experiment. Verify actual provisioned LOOP30 bytes for fish deployment gates; fixtures and procedural fallback cannot attest fish autoplay. Preserve dirty worktrees/indexes and immutable evidence. New product branches start from the latest accepted unified checkpoint.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
