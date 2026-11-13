export type ProceduralSettings = { characters: string; cellSize: number; color: string; speed: number; cursorInteraction: boolean; interactionIntensity: number; invert: boolean };
export const PROCEDURAL_DEFAULTS: ProceduralSettings = { characters: " .:-=+*#%@", cellSize: 0, color: "spectrum", speed: 1, cursorInteraction: true, interactionIntensity: 1, invert: false };
