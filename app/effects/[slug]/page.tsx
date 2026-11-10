import { notFound } from "next/navigation";
import { ForgeFactoryGallery } from "@/app/lab/forge-factory-01/gallery";
import { EffectDocumentation } from "@/components/discovery/effect-documentation";
import { FORGE_STUDIES } from "@/lib/forge-studies";
import { getForgeStudySources } from "@/lib/forge-study-source";
import { EFFECTS } from "@/lib/effect-registry";
import { AsciiStudy } from "@/components/white-journey/ascii-study";
import { DigitalWakePreview } from "@/components/digital-wake/preview";
import { MATERIAL_STUDIES } from "@/lib/material-studies";
import { getMaterialStudySources } from "@/lib/material-study-source";
import { MaterialPlayground } from "@/components/material-effects/material-playground";
import { getDiscoveryEffect } from "@/lib/discovery/manifest";
import { effectMetadata } from "@/lib/discovery/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return EFFECTS.map((effect) => ({ slug: effect.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return effectMetadata((await params).slug);
}

export default async function EffectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const discovery = getDiscoveryEffect(slug);
  if (!discovery) notFound();

  if (slug === "digital-wake") return <DigitalWakePreview />;

  const playground = await (async () => {
    if (slug === "ascii-waves") return <AsciiStudy />;
    const material = MATERIAL_STUDIES.find((effect) => effect.slug === slug);
    if (material) {
      return (
        <MaterialPlayground
          key={material.id}
          initialEffect={material.id}
          sources={await getMaterialStudySources()}
        />
      );
    }
    const study = FORGE_STUDIES.find((effect) => effect.slug === slug);
    if (!study) notFound();
    return <ForgeFactoryGallery initialEffect={study.id} detail sources={await getForgeStudySources()} />;
  })();

  return (
    <>
      {playground}
      {discovery.indexStatus === "index" ? <EffectDocumentation slug={slug} /> : null}
    </>
  );
}
