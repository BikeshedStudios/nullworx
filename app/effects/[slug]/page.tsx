import { notFound } from "next/navigation";
import { ForgeFactoryGallery } from "@/app/lab/forge-factory-01/gallery";
import { FORGE_STUDIES } from "@/lib/forge-studies";
import { getForgeStudySources } from "@/lib/forge-study-source";
import { EFFECTS, findEffect } from "@/lib/effect-registry";
import { AsciiStudy } from "@/components/white-journey/ascii-study";
import { DigitalWakePreview } from "@/components/digital-wake/preview";
export const dynamicParams = false;
export function generateStaticParams() { return EFFECTS.map(effect => ({slug:effect.slug})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {
  const effect = findEffect((await params).slug);
  return {title: effect?.name ?? "Effect not found", description: effect?.description};
}
export default async function EffectPage({params}:{params:Promise<{slug:string}>}) {
  const {slug} = await params;
  if (slug === "digital-wake") return <DigitalWakePreview />;
  if (slug === "ascii-waves") return <AsciiStudy />;
  const study = FORGE_STUDIES.find(effect => effect.slug === slug);
  if (!study) notFound();
  return <ForgeFactoryGallery initialEffect={study.id} detail sources={await getForgeStudySources()} />;
}
