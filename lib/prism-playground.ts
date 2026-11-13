import { FORGE_STUDIES } from "./forge-studies";
import { playgroundNumber, playgroundParams, playgroundText, queryNumber, type PlaygroundContract, type PreviewSize } from "./playground";

export type PrismSettings = { text: string; speed: number; intensity: number; paused: boolean; preview: PreviewSize };

export const prismControls = {
  text: { label: "Preview text", maxLength: 80 },
  speed: { label: "Animation speed", min: 0.25, max: 2.5, step: 0.05 },
  intensity: { label: "Color intensity", min: 0, max: 1, step: 0.01 },
} as const;

const defaults: PrismSettings = { text: "Somewhere else.", speed: 1, intensity: 0.75, paused: false, preview: "desktop" };

function validate(value: Partial<Record<keyof PrismSettings, unknown>>): PrismSettings {
  return {
    text: playgroundText(value.text, defaults.text, prismControls.text.maxLength),
    speed: playgroundNumber(value.speed, prismControls.speed.min, prismControls.speed.max, defaults.speed, prismControls.speed.step),
    intensity: playgroundNumber(value.intensity, prismControls.intensity.min, prismControls.intensity.max, defaults.intensity, prismControls.intensity.step),
    paused: typeof value.paused === "boolean" ? value.paused : defaults.paused,
    preview: value.preview === "desktop" || value.preview === "mobile" ? value.preview : defaults.preview,
  };
}

export const prismPlayground: PlaygroundContract<PrismSettings> = {
  defaults, path: "/effects/prism-text", directory: "components/forge-factory-01",
  files: FORGE_STUDIES[2].files, normalize: validate,
  parse(query) {
    const field = playgroundParams(query, "pt");
    if (!field) return { ...defaults };
    const paused = field("paused");
    return validate({ text: field("text"), speed: queryNumber(field("speed")), intensity: queryNumber(field("intensity")), paused: paused === "1" ? true : paused === "0" ? false : undefined, preview: field("preview") });
  },
  query(value) {
    const s = validate(value);
    return new URLSearchParams({ pt: "1", text: s.text, speed: String(s.speed), intensity: String(s.intensity), paused: s.paused ? "1" : "0", preview: s.preview }).toString();
  },
  usage(value) {
    const s = validate(value);
    return `"use client";

import { PrismText } from "./components/forge-factory-01/prism-text";

export function MyInterface() {
  return (
    <PrismText
      text={${JSON.stringify(s.text)}}
      speed={${s.speed}}
      intensity={${s.intensity}}
      paused={${s.paused}}
    />
  );
}
`;
  },
};
