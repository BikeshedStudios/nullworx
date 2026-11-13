import { describe, expect, it } from "vitest";
import { magneticPlayground as contract } from "@/lib/magnetic-playground";

describe("Magnetic Focus settings boundary", () => {
  it("round-trips only supported settings, including escaped labels", () => {
    const settings = { label: 'Make "space" <&> {now} \\ ↗', intensity: 0.23, paused: true, preview: "mobile" as const };
    expect(contract.parse(contract.query(settings))).toEqual(settings);
    const usage = contract.usage(settings);
    expect(usage).toContain('"use client";');
    expect(usage).toContain(`label={${JSON.stringify(settings.label)}}`);
    expect(usage).toContain("intensity={0.23}");
    expect(usage).toContain("paused={true}");
    expect(usage).toContain('from "./components/forge-factory-01/magnetic-focus"');
  });

  it.each(["", "mf=2&label=Wrong", "mf=1&mf=1&label=Wrong", "mf=1&label=%ZZ", "mf=1&label=%E0%A4%A", `mf=1&label=${"a".repeat(2100)}`])("rejects invalid versions, malformed encodings, duplicates and oversized queries: %s", query => {
    expect(contract.parse(query)).toEqual(contract.defaults);
  });

  it.each(["NaN", "Infinity", "-1", "2", "0x1", "1e0", "", "0.2&intensity=0.9"])("falls back for invalid intensity %s", intensity => {
    expect(contract.parse(`mf=1&intensity=${intensity}`).intensity).toBe(contract.defaults.intensity);
  });

  it.each(["", "%20%20", "%00oops", "%0A", "%7F", "a".repeat(81), "one&label=two"])("falls back for invalid labels: %s", label => {
    expect(contract.parse(`mf=1&label=${label}`).label).toBe(contract.defaults.label);
  });

  it("ignores unknown fields, rejects invalid enums and treats executable text as a string", () => {
    expect(contract.parse("mf=1&paused=yes&preview=giant&source=private")).toEqual(contract.defaults);
    const label = '"}; alert("x"); //';
    const settings = contract.parse(`mf=1&label=${encodeURIComponent(label)}`);
    expect(settings.label).toBe(label);
    expect(contract.usage(settings)).toContain(`label={${JSON.stringify(label)}}`);
    expect(contract.query({ ...contract.defaults, intensity: Number.NaN })).toBe(contract.query(contract.defaults));
  });
});
