import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { DEFAULT, PRESETS, validate } from "@/components/digital-wake/config";
import {
  parseFish,
  contains,
  SOURCE_SHA,
  type FishData,
} from "@/components/digital-wake/fish";
import {
  parseFinMotion,
  FinWake,
  type FinMotion,
} from "@/components/digital-wake/fin012";
import {
  mediaFacts,
  readyForCapture,
} from "@/components/digital-wake/readiness012";
import { EFFECTS } from "@/lib/effect-registry";
function synthetic() {
  const runs = [6410, 1];
  const fish = parseFish({
    schema: 2,
    sourceSha256: SOURCE_SHA,
    annotationSha256: "synthetic",
    fps: 30,
    duration: 30,
    frameCount: 900,
    width: 640,
    height: 360,
    sourceWidth: 1920,
    sourceHeight: 1080,
    method: "synthetic unit fixture",
    limitation: "No anatomical claim",
    frames: Array.from({ length: 900 }, (_, i) => ({
      i,
      valid: i !== 100,
      rle: runs,
      finRle: runs,
      p: [[10, 10, 120, 80, 30, 1, 0, 0.1, 0, 0.05, 0, 1, 1, 1, 1]],
    })),
  });
  const motion = parseFinMotion(
    {
      schema: 1,
      sourceSha256: SOURCE_SHA,
      fishDataSha256: "synthetic",
      regionSha256: "synthetic",
      fps: 30,
      duration: 30,
      frameCount: 900,
      width: 640,
      height: 360,
      emitters: [{ id: 1, name: "synthetic-fin", start: 0, end: 899 }],
      confidenceMeaning: "Synthetic support count",
      shuffle: {
        "1": Object.fromEntries(
          Array.from({ length: 900 }, (_, i) => [i, 899 - i]),
        ),
      },
      frames: Array.from({ length: 900 }, (_, i) => ({
        i,
        valid: i !== 100,
        regions: [
          {
            id: 1,
            name: "synthetic-fin",
            valid: i !== 100,
            reviewed: true,
            angle: 0,
            speed: 25,
            referenceSpeed: 25,
            noise: 0,
            support: 5,
            rle: runs,
          },
        ],
        p: [[10, 10, 120, 80, 30, 1, 0, 8, 2, 25, -9, 0.1, 0.2, 1, 5, 1, 1, 0]],
      })),
    },
    fish,
  );
  return { fish, motion, wake: new FinWake(fish, motion) };
}
function audit(fish: FishData, motion: FinMotion, wake: FinWake) {
  let count = 0;
  for (const preset of [PRESETS.SUBTLE, PRESETS.EXPRESSIVE])
    for (const variant of ["C", "S"] as const)
      for (const [frame, births] of wake.births(preset, variant).entries())
        for (const birth of births) {
          count++;
          expect(fish.frames[frame].valid).toBe(true);
          expect(
            contains(fish.frames[frame].rle, birth.x, birth.y, 640, 360),
          ).toBe(true);
          const region = motion.frames[frame].regions.find(
            (r) => r.id === birth.track,
          )!;
          expect(region.valid && region.reviewed).toBe(true);
          expect(contains(region.rle, birth.x, birth.y, 640, 360)).toBe(true);
          expect(birth.rgb).toEqual(
            fish.frames[frame].p
              .find((p) => p[0] === birth.x && p[1] === birth.y)!
              .slice(2, 5),
          );
          expect(birth.sourceTime).toBe(frame / 30);
          expect(birth.emitterId).toBe(region.name);
          expect(birth.supportFrames).toBeGreaterThanOrEqual(3);
          if (variant === "C") expect(birth.motionFrame).toBe(frame);
          expect(birth.localVelocity!.every(Number.isFinite)).toBe(true);
        }
  expect(count).toBeGreaterThan(0);
  return count;
}
describe("canonical Digital Wake", () => {
  it("keeps five unique navigable effects and validated accepted presets", () => {
    expect(new Set(EFFECTS.map((e) => e.slug)).size).toBe(5);
    for (const preset of Object.values(PRESETS))
      expect(validate(JSON.parse(JSON.stringify(preset)))).toEqual(preset);
    expect(PRESETS.SUBTLE.bodyEmission).toBe(0);
    expect(PRESETS.EXPRESSIVE.wakeVelocity).toBe(1.7);
    expect(() => validate({ ...DEFAULT, wakeLifetime: NaN })).toThrow();
  });
  it("uses only valid source-colored fish/fin sites and aligned motion frames", () => {
    const f = synthetic();
    audit(f.fish, f.motion, f.wake);
    expect(f.wake.births(PRESETS.SUBTLE)[100]).toEqual([]);
  });
  it("suppresses stationary fins even when the fish body moves", () => {
    const { fish, motion } = synthetic();
    for (const f of motion.frames) {
      f.regions[0].speed = 0;
      for (const p of f.p) {
        p[7] = 100;
        p[8] = 50;
        p[9] = 0;
        p[10] = 0;
      }
    }
    expect(
      new FinWake(fish, motion)
        .births({ ...PRESETS.SUBTLE, bodyEmission: 1 })
        .flat(),
    ).toHaveLength(0);
  });
  it("replays deterministically after seeking and retains cyclic wake history", () => {
    const { wake } = synthetic();
    for (const t of [0, 0.1, 2, 10, 29.99]) {
      const a = wake.particles(t, PRESETS.SUBTLE),
        b = wake.particles(t + 30, PRESETS.SUBTLE);
      expect(a).toEqual(wake.particles(t, PRESETS.SUBTLE));
      expect(a.map((p) => [p.birth.id, p.x, p.y, p.alpha])).toEqual(
        b.map((p) => [p.birth.id, p.x, p.y, p.alpha]),
      );
    }
    const detached = wake
      .particles(2, PRESETS.SUBTLE)
      .filter((p) => p.age > 0.3);
    expect(detached.length).toBeGreaterThan(0);
    expect(
      detached.some((p) => Math.abs(p.x - (p.birth.x + 0.5) / 640) > 0.001),
    ).toBe(true);
    expect(
      wake.particles(0, PRESETS.SUBTLE).some((p) => p.birth.frame > 870),
    ).toBe(true);
  });
  it("rejects source/mask mismatch and nonfinite fin data", () => {
    const { fish, motion } = synthetic();
    expect(() => parseFinMotion({ ...motion, duration: NaN }, fish)).toThrow();
    const copy = structuredClone(motion);
    copy.frames[0].p[0][14] = NaN;
    expect(() => parseFinMotion(copy, fish)).toThrow();
  });
  it("classifies NaN metadata and unsupported codecs without a readiness timeout", async () => {
    const v = Object.assign(new EventTarget(), {
      duration: NaN,
      videoWidth: 0,
      videoHeight: 0,
      currentTime: 0,
      readyState: 0,
      error: null,
    }) as unknown as HTMLVideoElement;
    expect(mediaFacts(v).duration).toBe(null);
    Object.assign(v, { readyState: 2 });
    expect(mediaFacts(v).state).toBe("invalid");
    Object.assign(v, { error: { code: 4, message: "unsupported codec" } });
    await expect(
      readyForCapture(v, () => ({ data: true, renderer: true, error: null })),
    ).rejects.toThrow("unsupported codec");
  });
});
const hasMedia = existsSync("public/media/local/fish-data.json");
describe.skipIf(!hasMedia)(
  "provisioned accepted footage (not a generic anatomical proof)",
  () => {
    it("audits the actual 900-frame mask/fin data and source hash", () => {
      const read = (name: string) => readFileSync("public/media/local/" + name),
        hash = (b: Buffer) => createHash("sha256").update(b).digest("hex");
      expect(hash(read("loop30-v2.mp4"))).toBe(SOURCE_SHA);
      const fish = parseFish(JSON.parse(read("fish-data.json").toString())),
        motion = parseFinMotion(
          JSON.parse(read("fin-motion-012.json").toString()),
          fish,
        );
      expect(hash(read("fish-data.json"))).toBe(motion.fishDataSha256);
      expect(hash(read("fin-regions-012.json"))).toBe(motion.regionSha256);
      const count = audit(fish, motion, new FinWake(fish, motion));
      console.log(
        `Accepted footage audit: ${count} C/S preset births; zero computed-mask, fin-region, RGB or synchronization violations.`,
      );
    });
  },
);
