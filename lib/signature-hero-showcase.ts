/** Static review-gallery metadata only. No paid source or runtime premium dependencies. */
export const SIGNATURE_HERO_SHOWCASE = {
  path: "/kits/signature-hero",
  productName: "Signature Hero 01",
  availability: "Private release candidate — not available to purchase",
  presets: [
    {
      slug: "carbon", name: "Carbon", label: "01 / Carbon",
      description: "The dark, high-contrast editorial direction.",
      desktop: "/signature-hero-01/carbon-1440.png",
      mobile: "/signature-hero-01/carbon-390.png",
    },
    {
      slug: "porcelain", name: "Porcelain", label: "02 / Porcelain",
      description: "The light, restrained editorial direction.",
      desktop: "/signature-hero-01/porcelain-1440.png",
      mobile: "/signature-hero-01/porcelain-390.png",
    },
    {
      slug: "cobalt", name: "Cobalt", label: "03 / Cobalt",
      description: "The vivid blue, material-led editorial direction.",
      desktop: "/signature-hero-01/cobalt-1440.png",
      mobile: "/signature-hero-01/cobalt-390.png",
    },
  ],
} as const;
