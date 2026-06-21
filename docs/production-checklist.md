# Welix Production Checklist

## 1. Environment Variables

- Set `NEXT_PUBLIC_APP_URL` to the production HTTPS domain.
- Set `NEXT_PUBLIC_SITE_NAME=Welix`.
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Set `SUPABASE_SERVICE_ROLE_KEY` only in the server runtime.
- Set `OPENAI_API_KEY` and confirm `OPENAI_MODEL`.
- Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO`.
- Set `STRIPE_PRICE_ID_STARTER` if the starter plan is exposed.
- Set `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_ENVIRONMENT`.
- Set `SENTRY_AUTH_TOKEN` in CI only if source map upload is enabled.
- Set `NEXT_PUBLIC_ANALYTICS_PROVIDER` and its matching variable:
  `NEXT_PUBLIC_GA_ID` or `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` or `NEXT_PUBLIC_UMAMI_WEBSITE_ID`.
- Set `TRANSACTIONAL_EMAIL_PROVIDER` and `SUPPORT_EMAIL`.

## 2. Secrets and Access

- Verify no secret is exposed through `NEXT_PUBLIC_*` except intentionally public keys and DSN.
- Rotate Stripe, Supabase service role and OpenAI keys before launch if they were used in dev.
- Restrict who can access Vercel, Supabase, Stripe and Sentry admin consoles.
- Store secrets in the deployment platform secret manager, never in git.

## 3. Supabase

- Confirm RLS is enabled on business tables.
- Verify production redirect URLs in Supabase Auth.
- Verify email templates and sender domain in Supabase Auth.
- Confirm automated backups are enabled on the production project.
- Export a schema backup before each major migration.
- Validate webhook retries and logs in Supabase and Stripe.

## 4. Stripe Production

- Switch all keys and price IDs from test to live mode.
- Recreate webhook endpoint in live mode and copy the live `STRIPE_WEBHOOK_SECRET`.
- Test checkout, upgrade, downgrade, cancellation and portal in live mode with a real low-value plan.
- Confirm Stripe tax, legal entity and payout settings.

## 5. Emails

- Confirm password reset emails are delivered from Supabase Auth.
- Verify the support mailbox set in `SUPPORT_EMAIL`.
- Add SPF, DKIM and DMARC on the sending domain.
- Test password reset, signup confirmation and billing lifecycle emails end to end.

## 6. Domain, HTTPS and SEO

- Point the production domain to the hosting platform.
- Enforce HTTPS and verify HSTS once the domain is stable.
- Confirm `robots.txt`, `sitemap.xml` and `manifest.webmanifest` resolve on production.
- Check Open Graph preview and favicon rendering.
- Verify canonical metadata and indexability.

## 7. Monitoring and Logs

- Open `/api/health` after deploy and verify every required section is configured.
- Verify Sentry receives server and client errors.
- Verify analytics loads only when the selected provider variables are present.
- Confirm web vitals reach `/api/monitoring/web-vitals` and are visible in platform logs.
- Add host-level uptime monitoring against `/api/health`.

## 8. Security

- Review CSP after connecting any new external provider.
- Confirm no API route returns sensitive secrets.
- Verify auth redirects and private routes while logged out.
- Re-run `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm build` on CI.
- Confirm Stripe webhook endpoint is not behind public CORS rules.

## 9. Backups and Recovery

- Enable managed database backups in Supabase production.
- Document how to restore the latest backup.
- Export Stripe product and price configuration.
- Keep a release tag for every production deploy.

## 10. Launch Validation

- Create a user account.
- Reset password.
- Create a client.
- Create a quote.
- Export a PDF.
- Start a Stripe checkout.
- Trigger a handled error and verify Sentry ingestion.
- Validate mobile and desktop rendering.
