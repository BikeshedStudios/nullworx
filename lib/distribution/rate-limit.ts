// Single-process safety guard only. Configure a trusted edge-level rate limit
// at Caddy before enabling public signups; restarts/multiple workers reset this.
export function createRateLimiter(maxPerHour = 30, cooldownMs = 5 * 60 * 1000) {
  const last = new Map<string, number>();
  let recent: number[] = [];

  return (identityHash: string, now = Date.now()): boolean => {
    recent = recent.filter((time) => now - time < 60 * 60 * 1000);
    for (const [key, time] of last) {
      if (now - time >= cooldownMs) last.delete(key);
    }
    const previous = last.get(identityHash);
    if ((previous !== undefined && now - previous < cooldownMs) || recent.length >= maxPerHour) {
      return false;
    }
    last.set(identityHash, now);
    recent.push(now);
    return true;
  };
}

export const canRequestDoi = createRateLimiter();
