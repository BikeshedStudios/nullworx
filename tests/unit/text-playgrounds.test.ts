import { describe, expect, it } from "vitest";
import ts from "typescript";
import { glyphPlayground as glyph } from "@/lib/glyph-playground";
import { prismPlayground as prism } from "@/lib/prism-playground";

for (const [name, contract, version] of [["Glyph", glyph, "gm"], ["Prism", prism, "pt"]] as const) {
  describe(`${name} settings boundary`, () => {
    const text = 'Make "space" </span><script>alert(1)</script> {now} \\ ↗';
    it("round-trips every setting and emits deterministic parseable TSX", () => {
      const settings = { ...contract.defaults, text, paused: true, preview: "mobile" as const };
      // Each contract is intentionally independently typed; both accept these shared fields.
      const query = name === "Glyph" ? glyph.query({ ...glyph.defaults, ...settings }) : prism.query({ ...prism.defaults, ...settings });
      expect(contract.parse(query)).toEqual(settings);
      const usage = name === "Glyph" ? glyph.usage({ ...glyph.defaults, ...settings }) : prism.usage({ ...prism.defaults, ...settings });
      expect(usage).toContain(`text={${JSON.stringify(text)}}`);
      expect(usage).toContain("paused={true}");
      expect(usage).not.toContain("preview=");
      expect(usage).toContain('"use client";');
      const source = ts.createSourceFile("Demo.tsx", usage, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const result = ts.transpileModule(usage, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX }, reportDiagnostics: true });
      expect(result.diagnostics).toEqual([]);
      let textExpressions = 0;
      function inspect(node: ts.Node) {
        if (ts.isJsxAttribute(node) && node.name.getText(source) === "text") {
          expect(node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression && ts.isStringLiteral(node.initializer.expression) && node.initializer.expression.text).toBe(text);
          textExpressions++;
        }
        ts.forEachChild(node, inspect);
      }
      inspect(source);
      expect(textExpressions).toBe(1);
    });

    it.each(["", `${version}=2&text=Wrong`, `${version}=1&${version}=1&text=Wrong`, `${version}=1&text=%ZZ`, `${version}=1&text=%E0%A4%A`, `${version}=1&text=${"a".repeat(2100)}`])("rejects whole malformed or oversized URL: %s", query => {
      expect(contract.parse(query)).toEqual(contract.defaults);
    });

    it.each(["", "%20", "%00oops", "%0A", "%7F", "a".repeat(81), "one&text=two"])("defaults invalid text: %s", text => {
      expect(contract.parse(`${version}=1&text=${text}`).text).toBe(contract.defaults.text);
    });

    it("ignores unknown fields and defaults invalid booleans and preview sizes", () => {
      expect(contract.parse(`${version}=1&paused=yes&preview=giant&source=private&eval=evil`)).toEqual(contract.defaults);
      expect(contract.parse(`${version}=1&text=Good&paused=1&preview=mobile`)).toMatchObject({ text: "Good", paused: true, preview: "mobile" });
      expect(contract.parse(`${version}=1&paused=1&paused=0&preview=mobile&preview=desktop`)).toEqual(contract.defaults);
    });
  });
}

describe("effect-specific settings", () => {
  it.each(["NaN", "Infinity", "-1", "5001", "0x20", "1e3", "", "1000&durationMs=2000"])("Glyph rejects invalid duration %s", duration => {
    expect(glyph.parse(`gm=1&durationMs=${duration}`).durationMs).toBe(glyph.defaults.durationMs);
  });
  it.each(["-1", "2147483648", "2.5", "Infinity", "0x10", "1e2", "1&seed=2"])("Glyph rejects invalid seeds %s", seed => {
    expect(glyph.parse(`gm=1&seed=${seed}`).seed).toBe(17);
  });
  it("Glyph validates cadence and emits all runtime props, including seeded bounds", () => {
    const settings = { text: "Test", durationMs: 2000, frameMs: 80, seed: 2147483647, paused: true, preview: "mobile" as const };
    expect(glyph.parse(glyph.query(settings))).toEqual(settings);
    for (const prop of ["durationMs", "frameMs", "seed", "paused"] as const) expect(glyph.usage(settings)).toContain(`${prop}={${settings[prop]}}`);
    for (const value of [19, 161, NaN, Infinity]) expect(glyph.normalize({ ...glyph.defaults, frameMs: value }).frameMs).toBe(38);
    expect(glyph.normalize({ ...glyph.defaults, seed: 0 }).seed).toBe(0);
    expect(glyph.usage({ ...glyph.defaults, seed: NaN })).toBe(glyph.usage(glyph.defaults));
  });
  it.each(["NaN", "Infinity", "-1", "2.51", "0x1", "1e0", "", "1&speed=2"])("Prism rejects invalid speed %s", speed => {
    expect(prism.parse(`pt=1&speed=${speed}`).speed).toBe(prism.defaults.speed);
  });
  it("Prism keeps every generated prop aligned and normalizes slider steps", () => {
    const settings = { text: "Colors", speed: 1.5, intensity: 0.23, paused: true, preview: "mobile" as const };
    expect(prism.parse(prism.query(settings))).toEqual(settings);
    for (const prop of ["speed", "intensity", "paused"] as const) expect(prism.usage(settings)).toContain(`${prop}={${settings[prop]}}`);
    expect(prism.normalize({ ...prism.defaults, speed: 1.53 }).speed).toBe(1.55);
    expect(prism.parse("pt=1&intensity=0.2&intensity=0.9").intensity).toBe(0.75);
    for (const value of [-1, 2, NaN, Infinity]) expect(prism.normalize({ ...prism.defaults, intensity: value }).intensity).toBe(0.75);
  });
});
