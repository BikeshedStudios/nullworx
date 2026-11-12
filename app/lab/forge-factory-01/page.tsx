import type { Metadata } from "next";
import { ForgeFactoryGallery } from "./gallery";
import { getForgeStudySources } from "@/lib/forge-study-source";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Forge Effect Factory 01 — internal playground",
  description:
    "Nullworx internal playground for Glyph Morph, Prism Text and Magnetic Focus. Unreleased source review; not part of the public effect gallery.",
  path: "/lab/forge-factory-01",
  noIndex: true,
  noFollow: true,
});

export default async function ForgeFactoryPage() {
  return <ForgeFactoryGallery sources={await getForgeStudySources()} />;
}
