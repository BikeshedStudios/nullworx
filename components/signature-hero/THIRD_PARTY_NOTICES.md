# Signature Hero 01 — source and licensing notices

This local owner-review candidate is not licensed for customer distribution.
No third-party license is replaced by the candidate's `UNLICENSED` package marker.

| Material | Origin | Applicable terms / included record |
| --- | --- | --- |
| Living Type implementation, settings contract, mask hooks | NULLWORX draft PR #5, `c40a3f96bc6da0500179998f508d6abadc895af9`, `registry/nullworx/living-type-01/` | Source draft explicitly had no assigned project license. Owner authorized local reuse. Confirm rights and assign terms before external distribution. |
| Paper MeshGradient | `@paper-design/shaders-react@0.0.82`; transitive `@paper-design/shaders@0.0.82` | Apache-2.0. No upstream shader source vendored or modified. `licenses/PAPER_SHADERS_LICENSE.txt`, `licenses/PAPER_SHADERS_NOTICE.txt` |
| Unbounded Variable ASCII subset | Reference's embedded Fontsource Variable Unbounded 5.3.0; subset U+0020–007E | OFL-1.1, `licenses/UNBOUNDED_OFL.txt`; font remains OFL. Reference records no Reserved Font Name. Embedded subset SHA-256 `3e99d2422c4a5c962cbd13889295e0d7d5273c844aeff1a2b35f9c54c4721d2b`. |
| Instrument Serif Latin italic | Unmodified `@fontsource/instrument-serif@5.3.0/files/instrument-serif-latin-400-italic.woff2` | OFL-1.1, `licenses/INSTRUMENT_SERIF_OFL.txt`. Self-hosted, no font CDN. |
| Existing public baseline | NULLWORX main `2f7ff49bfff893bd5d777e891982b7d82c1d282d` | MIT, Copyright (c) 2026 CipherCuttle; original notice retained in `licenses/BASELINE_MIT.txt`. Public permissions remain intact. No public effect component was copied into the hero. |
| New hero composition and presets | This isolated worktree | Local owner review only; `LICENSE.txt`. No customer license assigned. |

Paper's required notice is included verbatim in the export:

    Paper Shaders
    Copyright 2026 Paper

    Powered by Paper Shaders:
    https://shaders.paper.design

Local adaptations of Living Type: make first paint/failures readable without a
technical overlay or nested recovery control, enlarge the ink-height allowance from 74% to 88%, lower the shader pixel cap from 1,500,000 to 200,000, remove an
unnecessary font state reset, and document necessary post-hydration capability
updates for current lint. Original font, recipe parser, mask algorithm and lazy
MeshGradient integration are retained. Per-file original/current hashes appear
in the source manifest.

The host's React/framework dependencies retain their own licenses. No media,
stock image, customer logo, illustration or generated artwork is included.

Distribution review follows [Apache section 4](https://www.apache.org/licenses/LICENSE-2.0),
the [OFL bundling FAQ](https://openfontlicense.org/ofl-faq/), and the
[MIT notice requirement](https://opensource.org/license/mit). Apache notices and
font OFLs accompany the export; neither prevents bundling in a commercial package
when its conditions are met. That does not establish ownership of NULLWORX's
unlicensed experimental reference or approve a customer license.
