import type { Metadata } from "next";
import { SignaturePlayground } from "@/components/signature-hero/playground";
import { parseSignatureQuery } from "@/lib/signature-playground";
import { createPageMetadata } from "@/lib/discovery/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Signature Hero 01 — live Cobalt, Carbon and Porcelain | Nullworx",
  description:
    "An interactive React Signature Hero with Cobalt, Carbon and Porcelain directions, live material and type controls, copyable TSX state and an honest static/reduced-motion fallback.",
  path: "/kits/signature-hero",
  noIndex: true,
  noFollow: true,
});

type Query = Record<string, string | string[] | undefined>;

function queryString(params: Query): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") search.set(key, value);
  }
  return search.toString();
}

export default async function SignatureHeroPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = queryString(await searchParams);
  return <SignaturePlayground initial={parseSignatureQuery(query).config} />;
}
