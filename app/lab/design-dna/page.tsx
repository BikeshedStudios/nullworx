import type { Metadata } from "next";
import { DesignDnaLab } from "@/components/design-dna/lab";
import { createPageMetadata } from "@/lib/discovery/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Agent Design DNA 1.0 — validated component recipes | Nullworx Lab",
  description:
    "A typed, versioned recipe system for customizing real Nullworx components with validated palettes, type, copy, motion and layout tokens. Invalid patches fail closed.",
  path: "/lab/design-dna",
  noIndex: true,
  noFollow: true,
});

export default function DesignDnaPage() {
  return <DesignDnaLab />;
}
