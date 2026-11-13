"use client";

import { useMemo, useRef, type RefObject } from "react";
import type { Comparison, MaterialKind, MaterialSource } from "../material-core/types";
import { normalizeMaterialOptions } from "../material-core/types";
import type { MaterialDebug, MaterialStatus } from "../material-core/use-material";
import { MaterialSurface } from "./material-surface";
import { MATERIAL_PRESETS } from "./presets";

export type MaterialPlaybackProps = {
  comparison?: Comparison;
  controllerRef?: RefObject<MaterialDebug | null>;
  onStatus?: (status: MaterialStatus) => void;
  intensity?: number;
  density?: number;
};
export type AshfallTypeProps = MaterialPlaybackProps & { lines?: readonly string[]; color?: string };
export type SeamErosionProps = MaterialPlaybackProps & { color?: string };
export type SedimentRevealProps = MaterialPlaybackProps & { src?: string; alt?: string };
const ignoreStatus = () => {};

/** Put the component inside an authored [data-scroll-lane] with a sticky child. */
function MaterialView({ kind, source, comparison = "candidate", controllerRef, onStatus = ignoreStatus, intensity, density }: MaterialPlaybackProps & {
  kind: MaterialKind; source: MaterialSource;
}) {
  const internalRef = useRef<MaterialDebug | null>(null);
  const options = useMemo(() => normalizeMaterialOptions({ intensity, density }), [intensity, density]);
  return <MaterialSurface kind={kind} source={source} mode={comparison} options={options} controller={controllerRef ?? internalRef} onStatus={onStatus} />;
}

export function AshfallType({ lines = MATERIAL_PRESETS.ashfall.lines, color = MATERIAL_PRESETS.ashfall.color, ...playback }: AshfallTypeProps) {
  const source = useMemo<MaterialSource>(() => ({ kind: "text", lines, color }), [lines, color]);
  return <MaterialView kind="ashfall" source={source} {...playback} />;
}
export function SeamErosion({ color = MATERIAL_PRESETS.seam.color, ...playback }: SeamErosionProps) {
  const source = useMemo<MaterialSource>(() => ({ kind: "section", color }), [color]);
  return <MaterialView kind="seam" source={source} {...playback} />;
}
export function SedimentReveal({ src = MATERIAL_PRESETS.sediment.src, alt = MATERIAL_PRESETS.sediment.alt, ...playback }: SedimentRevealProps) {
  const source = useMemo<MaterialSource>(() => ({ kind: "raster", src, alt }), [src, alt]);
  return <MaterialView kind="sediment" source={source} {...playback} />;
}
