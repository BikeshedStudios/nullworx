# Nullworx Distribution 01 — implementation handoff

Source baseline: public main 2f7ff49bfff893bd5d777e891982b7d82c1d282d.
Historical review checklist. Bento Duo 01 was subsequently published on Gumroad at EUR 39 by explicit owner approval; this site integration remains separately gated on CI and deployment authorization.

## Decisions
- Free effects/source remain available without registration.
- Known Buy Me a Coffee URL is used for the optional support CTA.
- Gumroad product CTA is disabled until the exact published product URL is verified and an explicit published flag is set.
- Gumroad MCP is for the private creator workflow, not a public runtime dependency.
- Drops uses Brevo double opt-in. Without the separate activation flag, verified private contact and all three server settings, the form is disabled and the landing page is an honest preview.
- No local subscriber database, tracking pixel, or marketing cookie.

## Configure before enabling
1. Verify the Brevo sending domain and double-opt-in email template; use Brevo's DOI URL placeholder.
2. Obtain the contact list ID and DOI template ID; check that the Brevo account has Transactional Email/SMTP access for this endpoint.
3. Store BREVO_API_KEY, BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID, DROPS_PRIVACY_CONTACT_EMAIL in server-side configuration; keep API keys private, never NEXT_PUBLIC. The privacy contact must be a real private channel, not a public GitHub issue.
4. Put a trusted per-IP edge rate limit in Caddy first. The in-process per-email cooldown and aggregate cap are defense in depth only.
5. Confirm public Privacy and About disclosures, contact/deletion route, and retention policy.
6. Test double opt-in to an owned address, confirm membership in Brevo, unsubscribe and confirm the private contact workflow. Only then set NULLWORX_DROPS_ENABLED=1 and rebuild/deploy with explicit owner approval.
7. Only after a real rights-cleared Gumroad ZIP exists: test free download and payment, verify the product is published in the creator account, then set NEXT_PUBLIC_GUMROAD_PRODUCT_URL plus NEXT_PUBLIC_GUMROAD_PRODUCT_PUBLISHED=1.

## Canonical commerce inventory (2026-11-12)

- **UI Forge Free:** existing individually released MIT effects stay free. No signup required.
- **Signature Hero 01:** owner visually approved (Carbon, Porcelain, Cobalt); local release candidate. Inherited-source licensing/customer terms unresolved, so **no sale or public premium source**.
- **Bento Duo 01:** Orbit Bento 02 + Foil Reactor, now published at EUR 39 on Gumroad: https://bikeshedstudios.gumroad.com/l/dordxw. MIT-licensed customer ZIP is attached for Gumroad delivery (seller reported a successful test download). Public code contains only screenshots/notices, never the paid source. Independent downloaded-ZIP hash and installation remain unverified. Signal Splice is rejected and excluded. Canonical public product page: `/kits/bento-duo`.
- **UI Forge Creator Pack 01:** Gumroad draft created in EUR, 0 EUR minimum with 7 EUR suggested, **unpublished, no download files**. This is a distinct voluntary-support/free-pack concept; do not give away premium-only Duo or Signature Hero files through it.
- **Support:** Buy Me a Coffee at https://buymeacoffee.com/bikeshedstudios; no second donation provider.
- **Newsletter:** Brevo DOI staged but OFF by default. It is not a condition for accessing free effects, kits or purchases.

Product checkout and delivery belong to Gumroad; the Next.js site does not store cards or issue paid download entitlements. Keep unpublished Creator Pack URLs out of NEXT_PUBLIC config. Bento Duo uses a separately reviewed published Gumroad URL and a permanent on-site product page; the site never stores card data or paid entitlements. Do not set the Creator Pack publish flag for Bento Duo.

## Verify
- pnpm install --frozen-lockfile
- pnpm verify
- pnpm test:e2e
- pnpm test:launch
- pnpm test:distribution
- pnpm test:distribution:site
- Check widths 320/390/768/desktop, keyboard/focus, reduced motion and overflow.
- Check API: no configuration 503, bad origin 403, invalid email 400, provider failure 502, success 202.
- Never use real subscriber addresses in automated tests.

## Rollback
Revert the single scoped commit or close the branch, without rewriting main. Before any live deployment preserve the previous production artifact. Unset Brevo configuration and restore that artifact if needed.

## Out of scope
- Credentials, DNS, Caddy rule, release ZIP, Gumroad product creation/publishing, merge and deploy.
