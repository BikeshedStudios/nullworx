# 01C control reuse inventory and correction

Baseline: local `6c5779b`. Scope: ASCII Waves integration only. Digital Wake remains its separate Beta. No publication actions.

The initial 01C WIP incorrectly introduced `AsciiVideo`, duplicating `LocalVideoField` playback, observers, error handling and object-URL ownership. **Regression identified; rejected.** Its original source and diff are preserved in `evidence/live-playground-01c-20261113T163941Z/pre-reuse-correction-wip.tar.gz` and `pre-reuse-correction.patch`. The corrected implementation removes it from the application.

Inventory completed before the corrected integration. Existing → reused → missing:

| Capability / existing authority | Reused in 01C | Missing integration only |
| --- | --- | --- |
| `original-ascii/renderer.ts`: `WavesSettings`, `DEFAULT_SETTINGS`, `setSettings`, atlas, video upload, pointer, wave clock, freeze, snapshots, dispose | Sole video rendering authority, original shaders and defaults | Immediate suspension gate; one paused redraw; apply settings without reconstructing renderer |
| `original-ascii/glyphAtlas.ts`: calibrated density mapping, bounded 48-glyph atlas | Unchanged rasterization and calibration | Debounce character/cell changes in existing adapter |
| `LocalVideoField`: source/video/canvas refs, Fine 12 / Original 16 / Dense 8, scaled mobile cells | Keep existing adapter and detail presets; single settings input in controlled mode | Optional controlled settings and pause interface; detail presentation reusable by playground |
| `LocalVideoField`: pause/play, explicit reduced-motion opt-in, retry/context recovery, codec errors, buffering, loop, paused seek, measured output monitor | Keep existing event handlers and monitor; standalone controls still work | Shared transport delegates to same handlers; controlled replay uses existing clock/video seek |
| `LocalVideoField`: source notes and procedural switch | Keep working controls | Procedural switch informs shared mode state |
| `HomeKoiField`: file picker, source selection, replacement, URL revoke, procedural fallback, fail-closed featured receipts | Keep source ownership here; no file state or URLs in playground contract | Optional mode/settings/paused/reset props; portable source imports for clean consumers |
| `ProceduralAscii`: original 2D wave formula, teal/violet palette, responsive 9–14px cells, pointer ripple, own clock, pause toolbar | Keep formula, defaults, clock and standalone toolbar | Optional settings/controlled transport; no noise/tension/twist controls because this path has none |
| `usePreviewActivity`: intersection/document visibility and reduced-motion hook | Reused unchanged for procedural and existing preview consumers | None; no second lifecycle observer for the same stage |
| `LiveEffectPreview`: existing preview card pause/replay | Unchanged | None |
| `usePlayground`, `PlaygroundRange`, `PlaygroundActions`, `PlaygroundShare`, `PreviewToolbar`, `SourceCode` | Reused settings state, sliders, transport presentation, share/copy fallback, responsive frames and source viewer | ASCII validation, allowlisted URLs, deterministic TSX and installation source closure |
| Digital Wake `config.ts`: typed `Config`, `DEFAULT`, `PRESETS`, `validate`, JSON export | Inventory only; no migration | None in 01C |
| Digital Wake `App.tsx`: modes original/ASCII/pointillism/hybrid/debug; fin A/B/C/S, wake toggle/emission/velocity/lifetime/curl/fade, masks/spawns/debug, particle budget | Inventory only; unchanged Beta | None in 01C |
| Digital Wake video picker/flow import, play/pause/restart, frame steps/timeline, speed/brightness/contrast/saturation/fit/loop/compare; ASCII size/blend/ramp; point size/density/jitter/distribution; preset save/import/export/receipt | Existing numeric control primitive and state retained within Beta; no borrowing its separate video processing or timeline | None in 01C |
| Digital Wake `engine.ts` `VideoGpuRenderer`, `FinWake`, motion/fin sidecars and deterministic particle timeline | Separate Beta authority; unchanged | None in 01C |

Settings ownership: `usePlayground` owns shared scalar settings. `HomeKoiField` alone owns selected media and its object URL. `LocalVideoField` owns one renderer and playback events; controlled mode reads shared settings, standalone mode retains local detail/transport state. `ProceduralAscii` retains its one existing animation clock. No shared URL contains media.

Before/after diff, final verification and rollback will be linked in `LIVE_PLAYGROUND_UX_01C.md` after the corrected implementation is verified.
