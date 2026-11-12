/**
 * Verified published Gumroad product. Keep Creator Pack (unpublished) separate.
 * Premium source is delivered by Gumroad; no public code ZIP in this repository.
 */
const previewRoot =
  "https://raw.githubusercontent.com/BikeshedStudios/nullworx/e95993ff393294b5d858ea055be829391414f650/docs/bento-duo-01/previews/";

export const BENTO_DUO = {
  name: "Nullworx Bento Duo 01",
  path: "/kits/bento-duo",
  checkoutUrl: "https://bikeshedstudios.gumroad.com/l/dordxw",
  price: 39,
  priceCurrency: "EUR",
  version: "0.1.0",
  license: "MIT",
  kits: [
    {
      slug: "orbit",
      label: "01 / EDITORIAL SYSTEM",
      name: "Orbit Bento 02",
      description:
        "A typographic project interface where the brief, work index, search, and theme controls belong to the same working system.",
      detail: "Connected controls / responsive composition / paper and type",
      desktop: { src: previewRoot + "orbit-1440.png", width: 1440, height: 1550 },
      mobile: { src: previewRoot + "orbit-390.png", width: 390, height: 2976 },
    },
    {
      slug: "foil",
      label: "02 / MATERIAL SYSTEM",
      name: "Foil Reactor",
      description:
        "A material-led interface built around one shared virtual light. Its responsive surfaces and controls react together.",
      detail: "Coordinated lighting / surface states / interactive material",
      desktop: { src: previewRoot + "foil-1440.png", width: 1440, height: 1434 },
      mobile: { src: previewRoot + "foil-390.png", width: 390, height: 2736 },
    },
  ],
} as const;
