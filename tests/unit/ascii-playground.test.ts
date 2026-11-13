import { describe, expect, it } from "vitest";
import ts from "typescript";
import { readFileSync } from "node:fs";
import { asciiPlayground as contract, asciiDefaults, asciiControls } from "@/lib/ascii-playground";

describe("ASCII settings and generated usage", () => {
  for (const mode of ["procedural", "video"] as const) {
    it(`${mode}: round-trips all supported settings and deterministic TSX`, () => {
      const s = { ...asciiDefaults(mode), characters: ' ."<>{}\\#@', cellSize: 8, color: "#89abcd", speed: 1.5, invert: true, cursorInteraction: false, interactionIntensity: 0.5, paused: true, preview: "mobile" as const, ...(mode === "video" ? { noiseScale: 3, waveTwist: 0.8, waveTension: 0.7 } : {}) };
      expect(contract.parse(contract.query(s))).toEqual(s);
      const usage = contract.usage(s);
      expect(usage).toBe(contract.usage(s));
      expect(usage).toContain(JSON.stringify(s.characters));
      expect(usage).toContain("useState(true)");
      expect(usage).not.toContain("preview=");
      expect(usage).not.toContain("blob:");
      expect(ts.transpileModule(usage, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX }, reportDiagnostics: true }).diagnostics).toEqual([]);
      if (mode === "procedural") for (const key of ["noiseScale", "waveTension", "waveTwist", "intensity"]) expect(usage).not.toContain(`"${key}"`);
      else { expect(usage).toContain('mode="video"'); expect(usage).toContain("videoSettings={videoSettings}"); }
    });
  }
  it.each(["", "aw=2", "aw=1&aw=1", "aw=1&characters=%ZZ", `aw=1&characters=${"a".repeat(2100)}`])("rejects malformed whole queries: %s", query => expect(contract.parse(query)).toEqual(contract.defaults));
  it.each(["", "%20", "%00", "%0A", "%7f", "%E2%98%83", "a".repeat(49), "one&characters=two"])("rejects invalid ramps %s", value => expect(contract.parse(`aw=1&characters=${value}`).characters).toBe(contract.defaults.characters));
  it.each(["NaN", "Infinity", "-1", "0x1", "1e0", "", "1&speed=2", "10000"])("rejects invalid numeric fields %s", value => expect(contract.parse(`aw=1&speed=${value}`).speed).toBe(1));
  it("normalizes unsupported, unsafe and duplicate fields without media serialization", () => {
    const s = contract.parse("aw=1&mode=video&noiseScale=3&color=red&paused=yes&preview=giant&file=secret.mp4&src=blob:secret&speed=1&speed=2");
    expect(s).toEqual({ ...asciiDefaults("video"), noiseScale: 3 });
    expect(contract.query(s)).not.toMatch(/secret|src=|file=/);
    expect(contract.parse("aw=1&noiseScale=3&waveTwist=2")).toEqual(contract.defaults);
    expect(contract.parse("aw=1&mode=video&cellSize=0").cellSize).toBe(12);
    expect(contract.normalize({ ...contract.defaults, intensity: 100 })).toEqual(contract.defaults);
  });
  it("defaults and source closure preserve actual renderer APIs", () => {
    expect(asciiDefaults("video")).toMatchObject({ characters: " .:-+*=%@#", color: "#ffffff", cellSize: 12, noiseScale: 2, speed: 1, waveTension: 0.5, waveTwist: 0.1 });
    expect(contract.defaults).toMatchObject({ characters: " .:-=+*#%@", color: "spectrum", cellSize: 0 });
    for (const [key, control] of Object.entries(asciiControls)) {
      expect(contract.normalize({ ...asciiDefaults("video"), [key]: control.max })[key as keyof typeof asciiControls]).toBe(control.max);
      expect(contract.normalize({ ...asciiDefaults("video"), [key]: Infinity })[key as keyof typeof asciiControls]).toBe(asciiDefaults("video")[key as keyof typeof asciiControls]);
    }
    for (const file of contract.files) expect(readFileSync(`${contract.directory}/${file}`, "utf8")).not.toMatch(/from ["']@\/|XMLHttpRequest|sendBeacon/);
  });
});
