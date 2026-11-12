import { describe, expect, it } from "vitest";
import { dropsSchema } from "../../lib/distribution/schema";
import { createRateLimiter } from "../../lib/distribution/rate-limit";
import { isGumroadProductUrl, isBuyMeACoffeeUrl } from "../../lib/site";

describe("Distribution safety contracts", () => {
  it("accepts the creator's Gumroad product URLs", () => {
    expect(isGumroadProductUrl("https://bikeshedstudios.gumroad.com/l/creator-pack")).toBe(true);
    expect(isGumroadProductUrl("https://gumroad.com/l/another-creators-pack")).toBe(false);
    expect(isGumroadProductUrl("https://other.gumroad.com/l/malicious")).toBe(false);
    expect(isGumroadProductUrl("https://bikeshedstudios.gumroad.com/")).toBe(false);
    expect(isGumroadProductUrl("javascript:alert(1)")).toBe(false);
  });
  it("validates the support URL origin", () => {
    expect(isBuyMeACoffeeUrl("https://buymeacoffee.com/bikeshedstudios")).toBe(true);
    expect(isBuyMeACoffeeUrl("https://buymeacoffee.com.evil.invalid/bikeshedstudios")).toBe(false);
  });
  it("rejects unexpected fields and invalid email addresses", () => {
    expect(dropsSchema.safeParse({ email: "dev@example.org", source: "drops" }).success).toBe(true);
    expect(dropsSchema.safeParse({ email: "bad", source: "drops" }).success).toBe(false);
    expect(dropsSchema.safeParse({ email: "dev@example.org", source: "drops", role: "admin" }).success).toBe(false);
  });
  it("bounds repeated and total requests", () => {
    const allowed = createRateLimiter(2, 1000);
    expect(allowed("a", 1000)).toBe(true);
    expect(allowed("a", 1001)).toBe(false);
    expect(allowed("b", 1002)).toBe(true);
    expect(allowed("c", 1003)).toBe(false);
    expect(allowed("c", 3601001)).toBe(true);
  });
});
