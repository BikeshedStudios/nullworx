/**
 * Stable component identifiers and their compatible recipe versions.
 *
 * The registry is deliberately small: a recipe may only target a component and
 * version listed here. Adding a component is an explicit product decision, not
 * an arbitrary import path supplied by a user or an agent.
 */
export const DESIGN_COMPONENTS = {
  "signature-hero": {
    id: "signature-hero",
    version: "1.0.0",
    family: "type",
    label: "Signature Hero",
    route: "/kits/signature-hero",
    description: "Editorial hero with live type, material light and three approved directions.",
    dependencies: ["react@19.3.1", "react-dom@19.3.1", "@paper-design/shaders-react@0.0.82"],
    install: "Copy components/signature-hero/ and keep the bundled fonts and notices.",
  },
  "orbit-bento": {
    id: "orbit-bento",
    version: "1.0.0",
    family: "signal",
    label: "Orbit Bento 02",
    route: "/kits/bento-duo#orbit",
    description: "Connected editorial project interface with native controls and project-scoped state.",
    dependencies: ["react@19.3.1", "react-dom@19.3.1"],
    install: "Copy components/bento-duo/orbit/ and keep the MIT notice.",
  },
  "foil-reactor": {
    id: "foil-reactor",
    version: "1.0.0",
    family: "material",
    label: "Foil Reactor",
    route: "/kits/bento-duo#foil",
    description: "Material-led interface with one shared virtual light across every surface.",
    dependencies: ["react@19.3.1", "react-dom@19.3.1"],
    install: "Copy components/bento-duo/foil/ and keep the MIT notice.",
  },
} as const;

export const COMPONENT_IDS = ["signature-hero", "orbit-bento", "foil-reactor"] as const;
export type ComponentId = (typeof COMPONENT_IDS)[number];
export type ComponentFamily = "type" | "signal" | "material";

export function isComponentId(value: unknown): value is ComponentId {
  return typeof value === "string" && (COMPONENT_IDS as readonly string[]).includes(value);
}

export function componentContract(id: ComponentId) {
  return DESIGN_COMPONENTS[id];
}
