# Add an effect

1. Add a small React component and scoped styles under `components/`. Respect reduced motion and release animation/WebGL resources on unmount.
2. Add its metadata to `lib/effect-registry.ts`. For a simple copyable component, extend `lib/forge-studies.ts` and the existing playground selector instead.
3. Connect the preview in `app/effects/[slug]/page.tsx`; add a card preview in `components/white-journey/effect-cards.tsx` if useful. No homepage edit is needed.
4. Include controls, error/loading states and installation/usage. Mark experimental work honestly. Keep source allowlists fixed on the server.
5. Add focused behavior/browser checks and update the registry documentation. Update the expected registry count in validation/tests when adding an effect.
6. Run `pnpm verify` and relevant Playwright tests. Record code and media rights separately; do not commit uncertain footage or derivatives.
