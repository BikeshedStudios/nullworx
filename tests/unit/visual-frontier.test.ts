import { describe, it, expect, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { FRONTIER_STUDIES, FRONTIER_SOURCE_FILES, frontierUsage } from "@/lib/visual-frontier";
import { EFFECTS } from "@/lib/effect-registry";
import { getIndexableEffects } from "@/lib/discovery/eligibility";
import { clamp } from "@/components/visual-frontier/types";
import { gpuSession } from "@/components/visual-frontier/gpu-session";
const read = (name: string) => readFileSync(`components/visual-frontier/${name}`, "utf8");

describe("Visual Frontier publication contracts", () => {
  it("adds exactly the two approved effects without replacing accepted effects", () => {
    expect(EFFECTS.map(e => e.slug)).toEqual(["magnetic-focus", "glyph-morph", "prism-text", "ascii-waves", "digital-wake", "ashfall-type", "seam-erosion", "sediment-reveal", "refractive-type", "impossible-material"]);
    expect(getIndexableEffects().slice(-2).map(e => e.slug)).toEqual(["refractive-type", "impossible-material"]);
    expect(FRONTIER_STUDIES.map(s => s.defaults)).toEqual([[.5,.45],[.5,.55]]);
    expect(FRONTIER_STUDIES.map(s => s.variants)).toEqual([["Spectral mass", "Split signal"],["Quicksilver", "Folded mineral"]]);
  });
  it("bounds inputs and generates complete variant-specific React examples", () => {
    expect([clamp(-1,.5),clamp(2,.5),clamp(NaN,.45),clamp(Infinity,.55)]).toEqual([0,1,.45,.55]);
    for (const kind of ["refractive-type", "impossible-material"] as const) for (const variant of [0,1] as const) {
      const source = frontierUsage(kind,variant,[.25,.75],true);
      expect(source).toContain('"use client"'); expect(source).toContain('mode="full"');
      expect(source).toContain('paused={true}'); expect(source).toContain('{0.25}'); expect(source).not.toContain("@/");
      expect(source).toContain(kind === "refractive-type" ? variant ? 'variant="split-signal"' : 'variant="spectral-mass"' : variant ? 'variant="folded-mineral"' : 'variant="quicksilver"');
    }
  });
  it("exposes a complete portable source closure and preserves exact licensed asset bytes", () => {
    const actual = readdirSync("components/visual-frontier",{recursive:true,withFileTypes:true}).filter(e => e.isFile()).map(e => `${e.parentPath.replace('components/visual-frontier','').replace(/^\//,'')}/${e.name}`.replace(/^\//,'')).sort();
    expect([...FRONTIER_SOURCE_FILES].sort()).toEqual(actual);
    expect(createHash("sha256").update(read("renderers/quicksilver.compiled.json")).digest("hex")).toBe("1f0db6bc4a3996af5960a493ee4a5c130e91879f188ae784b2a0bb5a70a451fa");
    const manifest = JSON.parse(readFileSync("docs/visual-frontier/asset-manifest.json","utf8"));
    for (const name of ["font","harfbuzz"]) {
      const bytes=Buffer.from(JSON.parse(read(`renderers/${name}-data.ts`).split("export const data = ")[1].trim().slice(0,-1)),"base64");
      expect(bytes.length).toBe(manifest[name].bytes); expect(createHash('sha256').update(bytes).digest('hex')).toBe(manifest[name].sha256);
    }
    for (const file of FRONTIER_SOURCE_FILES) {
      const source=read(file);
      if (file.endsWith('.ts') || file.endsWith('.tsx')) expect(source,file).not.toMatch(/from ["'](?:@\/|next\/|ogl|pixi|p5)/);
    }
    expect(read('THIRD_PARTY_NOTICES.md')).toContain('SGI'); expect(read('OFL-SpaceGrotesk.txt')).toContain('SIL OPEN FONT LICENSE');
  });
  it("serializes GPU ownership and waits for context cleanup, including failed startup", async () => {
    const events: string[]=[];let finish: (()=>void) | undefined;
    const a=gpuSession(async()=>{events.push('A started');return ()=>new Promise<void>(resolve=>{events.push('A disposing');finish=resolve;});},()=>{});
    await a.ready;
    const b=gpuSession(async()=>{events.push('C started');return ()=>{events.push('C disposed');};},()=>{});
    await vi.waitFor(()=>expect(events).toContain('A disposing'));
    expect(events).not.toContain('C started');finish!();await b.ready;await b.close();
    expect(events).toEqual(['A started','A disposing','C started','C disposed']);
    const broken=gpuSession(async()=>{throw new Error('GPU unavailable');},()=>{});
    await expect(broken.ready).rejects.toThrow('GPU unavailable');await broken.close();
    const retry=gpuSession(async()=>()=>{},()=>{});await retry.ready;await retry.close();
  });
});
