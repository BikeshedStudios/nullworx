# Nullworx Distribution 01 — implementation handoff

Source baseline: public main 2f7ff49bfff893bd5d777e891982b7d82c1d282d.
This is a review candidate. No production deployment or product publication is authorized.

## Decisions
- Free effects/source remain available without registration.
- Known Buy Me a Coffee URL is used for the optional support CTA.
- Gumroad product CTA is disabled until the exact product URL is verified and published.
- Gumroad MCP is for the private creator workflow, not a public runtime dependency.
- Drops uses Brevo double opt-in. Without all three server settings the form is disabled and the landing page is an honest preview.
- No local subscriber database, tracking pixel, or marketing cookie.

## Configure before enabling
1. Verify the Brevo sending domain and double-opt-in email template; use Brevo's DOI URL placeholder.
2. Obtain the contact list ID and DOI template ID; check that the Brevo account has Transactional Email/SMTP access for this endpoint.
3. Store BREVO_API_KEY, BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID in server-side secrets, never NEXT_PUBLIC. Set them before rebuilding production.
4. Put a trusted per-IP edge rate limit in Caddy first. The in-process per-email cooldown and aggregate cap are defense in depth only.
5. Confirm public Privacy and About disclosures, contact/deletion route, and retention policy.
6. Test double opt-in to an owned address, confirm membership in Brevo, and unsubscribe.
7. Only after a real rights-cleared Gumroad ZIP exists: test free download and payment, then set NEXT_PUBLIC_GUMROAD_PRODUCT_URL.

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
