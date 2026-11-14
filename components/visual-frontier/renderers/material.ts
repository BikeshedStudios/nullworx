// The raymarched and node-material studies deliberately use different geometry.
import type { Engine, Variant } from '../types';
export async function create(host: HTMLElement, variant: Variant, signal: AbortSignal): Promise<Engine> {
  return variant ? (await import('./mineral')).create(host,signal) : (await import('./quicksilver')).create(host,signal);
}
