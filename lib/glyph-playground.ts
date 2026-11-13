import { FORGE_STUDIES } from "./forge-studies";
import { playgroundNumber, playgroundParams, playgroundText, queryNumber, type PlaygroundContract, type PreviewSize } from "./playground";

export type GlyphSettings = {
  text: string;
  durationMs: number;
  frameMs: number;
  seed: number;
  paused: boolean;
  preview: PreviewSize;
};

export const glyphControls = {
  text: { label: "Preview text", maxLength: 80 },
  durationMs: { label: "Animation duration", min: 200, max: 5000, step: 20 },
  frameMs: { label: "Frame cadence", min: 20, max: 160, step: 1 },
  seed: { label: "Deterministic seed", min: 0, max: 2147483647, step: 1 },
} as const;

const defaults: GlyphSettings = { text: "HELLO WORLD", durationMs: 840, frameMs: 38, seed: 17, paused: false, preview: "desktop" };

function validate(value: Partial<Record<keyof GlyphSettings, unknown>>): GlyphSettings {
  const number = (key: "durationMs" | "frameMs" | "seed") => {
    const { min, max, step } = glyphControls[key];
    return key === "seed" && !Number.isInteger(value[key]) ? defaults[key] : playgroundNumber(value[key], min, max, defaults[key], step);
  };
  return {
    text: playgroundText(value.text, defaults.text, glyphControls.text.maxLength),
    durationMs: number("durationMs"), frameMs: number("frameMs"), seed: number("seed"),
    paused: typeof value.paused === "boolean" ? value.paused : defaults.paused,
    preview: value.preview === "desktop" || value.preview === "mobile" ? value.preview : defaults.preview,
  };
}

export const glyphPlayground: PlaygroundContract<GlyphSettings> = {
  defaults, path: "/effects/glyph-morph", directory: "components/forge-factory-01",
  files: FORGE_STUDIES[1].files, normalize: validate,
  parse(query) {
    const field = playgroundParams(query, "gm");
    if (!field) return { ...defaults };
    const paused = field("paused");
    return validate({ text: field("text"), durationMs: queryNumber(field("durationMs")), frameMs: queryNumber(field("frameMs")), seed: queryNumber(field("seed")), paused: paused === "1" ? true : paused === "0" ? false : undefined, preview: field("preview") });
  },
  query(value) {
    const s = validate(value);
    return new URLSearchParams({ gm: "1", text: s.text, durationMs: String(s.durationMs), frameMs: String(s.frameMs), seed: String(s.seed), paused: s.paused ? "1" : "0", preview: s.preview }).toString();
  },
  usage(value) {
    const s = validate(value);
    return `"use client";

import { GlyphMorph } from "./components/forge-factory-01/glyph-morph";

export function MyInterface() {
  return (
    <GlyphMorph
      text={${JSON.stringify(s.text)}}
      durationMs={${s.durationMs}}
      frameMs={${s.frameMs}}
      seed={${s.seed}}
      paused={${s.paused}}
    />
  );
}
`;
  },
};
