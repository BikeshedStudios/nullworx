import { FORGE_STUDIES } from "./forge-studies";
import type { PlaygroundContract, PreviewSize } from "./playground";

export type MagneticSettings = {
  label: string;
  intensity: number;
  paused: boolean;
  preview: PreviewSize;
};

export const magneticControls = {
  label: { label: "Button label", maxLength: 80 },
  intensity: { label: "Pointer intensity", min: 0, max: 1, step: 0.01 },
} as const;

const defaults: MagneticSettings = { label: "ENTER THE FIELD", intensity: 0.68, paused: false, preview: "desktop" };

function validate(value: Partial<Record<keyof MagneticSettings, unknown>>): MagneticSettings {
  return {
    label: typeof value.label === "string" && value.label.trim().length > 0 && value.label.length <= magneticControls.label.maxLength && !/[\u0000-\u001f\u007f]/.test(value.label)
      ? value.label : defaults.label,
    intensity: typeof value.intensity === "number" && Number.isFinite(value.intensity) && value.intensity >= 0 && value.intensity <= 1
      ? Math.round(value.intensity * 100) / 100 : defaults.intensity,
    paused: typeof value.paused === "boolean" ? value.paused : defaults.paused,
    preview: value.preview === "desktop" || value.preview === "mobile" ? value.preview : defaults.preview,
  };
}

export const magneticPlayground: PlaygroundContract<MagneticSettings> = {
  defaults,
  path: "/effects/magnetic-focus",
  directory: "components/forge-factory-01",
  files: FORGE_STUDIES[0].files,
  normalize: validate,
  parse(query) {
    if (query.length > 2048) return { ...defaults };
    try { decodeURIComponent(query.replaceAll("+", " ")); }
    catch { return { ...defaults }; }
    const params = new URLSearchParams(query);
    // Ambiguous duplicate fields never win over the safe default.
    const single = (key: string) => params.getAll(key).length === 1 ? params.get(key) : null;
    if (single("mf") !== "1") return { ...defaults };
    const intensity = single("intensity");
    const paused = single("paused");
    return validate({
      label: single("label"),
      intensity: intensity !== null && /^(?:0(?:\.\d{1,2})?|1(?:\.0{1,2})?)$/.test(intensity) ? Number(intensity) : undefined,
      paused: paused === "1" ? true : paused === "0" ? false : undefined,
      preview: single("preview"),
    });
  },
  query(value) {
    const settings = validate(value);
    return new URLSearchParams({ mf: "1", label: settings.label, intensity: String(settings.intensity), paused: settings.paused ? "1" : "0", preview: settings.preview }).toString();
  },
  usage(value) {
    const settings = validate(value);
    return `"use client";

import { useState } from "react";
import { MagneticFocus } from "./components/forge-factory-01/magnetic-focus";

export function MyInterface() {
  const [activations, setActivations] = useState(0);
  return (
    <div style={{ overflowWrap: "anywhere" }}>
      <MagneticFocus
        label={${JSON.stringify(settings.label)}}
        intensity={${settings.intensity}}
        paused={${settings.paused}}
        onClick={() => setActivations((count) => count + 1)}
      />
      <p role="status">Activated {activations} times</p>
    </div>
  );
}
`;
  },
};
