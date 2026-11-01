import type { Metadata } from "next";
import { ForgeFactoryGallery } from "./gallery";
import { getForgeStudySources } from "@/lib/forge-study-source";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Forge Effect Factory 01 — independent unreleased proofs",
  description: "UI Forge live playground: Glyph Morph, Prism Text and Magnetic Focus. Adjust the controls and copy the local review source.",
  path: "/lab/forge-factory-01",
  noIndex: true,
});

export default async function ForgeFactoryPage() {
  return <ForgeFactoryGallery sources={await getForgeStudySources()} />;
}
