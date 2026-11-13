import type { MetadataRoute } from "next";
import { assertDiscoveryManifest } from "@/lib/discovery/eligibility";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  assertDiscoveryManifest();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/lab/", "/kits/signature-hero", "/media/", "/tools/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
