import { describe, expect, it } from "vitest";
import { TriggerClock, phaseAt } from "@/components/material-core/trigger-clock";
import { TOTAL_MS } from "@/components/material-core/types";

describe("material one-shot clock", () => {
  it("runs the complete ordered phase chain on time, independent of reversing scroll", () => {
    const c = new TriggerClock();
    expect(c.scroll(0.63)).toBe(true);
    const phases = [c.phase];
    for (let i = 0; i < 150; i++) {
      c.scroll(i % 2 ? 0.1 : 0.9);
      c.tick(40);
      if (phases.at(-1) !== c.phase) phases.push(c.phase);
      if (c.phase === "COMPLETE") break;
    }
    expect(phases).toEqual(["WINDUP", "ACTIVE", "SETTLING", "COMPLETE"]);
    expect(c.runId).toBe(1);
    expect(c.elapsedMs).toBe(TOTAL_MS);
  });
  it("allows a new run only after completion AND a new hysteresis exit", () => {
    const c = new TriggerClock();
    c.scroll(.7); c.scroll(.1);
    for (let i = 0; i < 140; i++) c.tick(40);
    expect(c.trigger()).toBe(false);
    expect(c.scroll(.7)).toBe(false);
    expect(c.scroll(.1)).toBe(false);
    expect(c.phase).toBe("IDLE");
    expect(c.scroll(.7)).toBe(true);
    expect(c.runId).toBe(2);
  });
  it("reset re-arms without losing the monotonically increasing run id", () => {
    const c = new TriggerClock(); c.trigger(); c.tick(40); c.reset();
    expect(c.running).toBe(false);
    expect(c.trigger()).toBe(true);
    expect(c.runId).toBe(2);
  });
  it("clamps giant catch-up deltas, negative time and pauses", () => {
    const c = new TriggerClock(); c.trigger(); c.tick(60000);
    expect(c.elapsedMs).toBeCloseTo(40.001);
    c.tick(-100); c.paused = true; c.tick(400);
    expect(c.elapsedMs).toBeCloseTo(40.001);
  });
  it("manual inspection is paused and does not create births from a new run", () => {
    const c = new TriggerClock(); c.seek(1500); c.tick(40);
    expect(c.elapsedMs).toBe(1500); expect(c.runId).toBe(0);
    expect(c.trigger()).toBe(false);
    expect(phaseAt(380)).toBe("ACTIVE");
    expect(phaseAt(2880)).toBe("SETTLING");
  });
});
