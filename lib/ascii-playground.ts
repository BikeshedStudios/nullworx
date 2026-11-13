import { DEFAULT_SETTINGS, type WavesSettings } from "../components/white-journey/original-ascii/renderer";
import { PROCEDURAL_DEFAULTS, type ProceduralSettings } from "../components/white-journey/procedural-settings";
import { playgroundNumber, playgroundParams, queryNumber, type PlaygroundContract, type PreviewSize } from "./playground";

export type AsciiSettings = WavesSettings & { mode: "procedural" | "video"; paused: boolean; preview: PreviewSize };
export const asciiControls = {
  cellSize: { label: "Cell size", min: 4, max: 24, step: 1 },
  speed: { label: "Animation speed", min: 0.25, max: 2.5, step: 0.05 },
  noiseScale: { label: "Noise scale", min: 0.25, max: 5, step: 0.05 },
  waveTension: { label: "Wave tension", min: 0, max: 1, step: 0.01 },
  waveTwist: { label: "Wave twist", min: 0, max: 2, step: 0.05 },
  interactionIntensity: { label: "Pointer intensity", min: 0, max: 2, step: 0.05 },
} as const;
const defaults: AsciiSettings = { ...DEFAULT_SETTINGS, ...PROCEDURAL_DEFAULTS, mode: "procedural", paused: false, preview: "desktop" };
export function asciiDefaults(mode: AsciiSettings["mode"]): AsciiSettings {
  return mode === "video" ? { ...defaults, ...DEFAULT_SETTINGS, cellSize: 12, mode } : { ...defaults };
}

function normalize(value: Partial<Record<keyof AsciiSettings, unknown>>): AsciiSettings {
  const mode = value.mode === "video" ? "video" : "procedural";
  const d = asciiDefaults(mode);
  const number = (key: keyof typeof asciiControls) => { const c = asciiControls[key]; return playgroundNumber(value[key], c.min, c.max, d[key], c.step); };
  const bool = (key: "paused" | "invert" | "cursorInteraction") => typeof value[key] === "boolean" ? value[key] : d[key];
  const ramp = value.characters;
  return {
    ...d, mode,
    characters: typeof ramp === "string" && ramp.trim() && Array.from(ramp).length <= 48 && /^[\x20-\x7e]+$/.test(ramp) ? ramp : d.characters,
    color: typeof value.color === "string" && /^#[0-9a-f]{6}$/i.test(value.color) ? value.color.toLowerCase() : d.color,
    cellSize: mode === "procedural" && value.cellSize === 0 ? 0 : number("cellSize"),
    speed: number("speed"), interactionIntensity: number("interactionIntensity"),
    // The original 2D wave path has no noise/tension/twist API.
    noiseScale: mode === "video" ? number("noiseScale") : d.noiseScale,
    waveTension: mode === "video" ? number("waveTension") : d.waveTension,
    waveTwist: mode === "video" ? number("waveTwist") : d.waveTwist,
    invert: bool("invert"), cursorInteraction: bool("cursorInteraction"), paused: bool("paused"),
    preview: value.preview === "mobile" ? "mobile" : "desktop",
  };
}
export function proceduralSettings(s: AsciiSettings): ProceduralSettings {
  const { characters, cellSize, color, speed, cursorInteraction, interactionIntensity, invert } = s;
  return { characters, cellSize, color, speed, cursorInteraction, interactionIntensity, invert };
}
export function videoSettings(s: AsciiSettings): WavesSettings {
  const { characters, cellSize, color, speed, cursorInteraction, interactionIntensity, invert, noiseScale, waveTension, waveTwist, intensity } = s;
  return { characters, cellSize, color, speed, cursorInteraction, interactionIntensity, invert, noiseScale, waveTension, waveTwist, intensity };
}
export const asciiPlayground: PlaygroundContract<AsciiSettings> = {
  defaults, path: "/effects/ascii-waves", directory: "components/white-journey",
  files: ["procedural-ascii.tsx", "procedural-settings.ts", "procedural-ascii.module.css", "use-preview-activity.ts", "home-koi-field.tsx", "home-koi-field.module.css", "local-video-field.tsx", "featured-media.ts", "original-ascii/renderer.ts", "original-ascii/glyphAtlas.ts"],
  normalize,
  parse(query) {
    const f = playgroundParams(query, "aw");
    if (!f) return { ...defaults };
    const values: Partial<Record<keyof AsciiSettings, unknown>> = { mode: f("mode"), characters: f("characters"), color: f("color"), preview: f("preview") };
    for (const key of Object.keys(asciiControls) as (keyof typeof asciiControls)[]) values[key] = queryNumber(f(key));
    for (const key of ["paused", "invert", "cursorInteraction"] as const) values[key] = f(key) === "1" ? true : f(key) === "0" ? false : undefined;
    return normalize(values);
  },
  query(value) {
    const s = normalize(value);
    const fields = { ...proceduralSettings(s), ...(s.mode === "video" ? { noiseScale: s.noiseScale, waveTension: s.waveTension, waveTwist: s.waveTwist } : {}), paused: s.paused, preview: s.preview };
    return new URLSearchParams({ aw: "1", mode: s.mode, ...Object.fromEntries(Object.entries(fields).map(([key, v]) => [key, typeof v === "boolean" ? v ? "1" : "0" : String(v)])) }).toString();
  },
  usage(value) {
    const s = normalize(value);
    const settings = JSON.stringify(s.mode === "video" ? videoSettings(s) : proceduralSettings(s), null, 2);
    return `"use client";

import { useState } from "react";
import { HomeKoiField } from "./components/white-journey/home-koi-field";

const settings = ${settings};

export function MyInterface() {
  const [paused, setPaused] = useState(${s.paused});${s.mode === "video" ? "\n  const [videoSettings, setVideoSettings] = useState(settings);" : ""}
  return <HomeKoiField
    mode="${s.mode}"
    ${s.mode === "video" ? "videoSettings={videoSettings}\n    onVideoSettingsChange={setVideoSettings}" : "proceduralSettings={settings}"}
    paused={paused}
    onPausedChange={setPaused}
  />;
}
`;
  },
};
