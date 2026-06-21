import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getServerEnv, isProductionEnvironment } from "@/lib/env";
import { getSiteUrl } from "@/lib/site";

function isConfigured(value?: string | null) {
  return Boolean(value && value.trim().length > 0);
}

export async function GET() {
  const env = getServerEnv();
  const isProduction = isProductionEnvironment();
  const requestHeaders = await headers();
  const authorization = requestHeaders.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : null;
  const canReadDetailedChecks =
    !isProduction || !env.HEALTHCHECK_TOKEN || bearerToken === env.HEALTHCHECK_TOKEN;

  const checks = {
    appUrl: getSiteUrl(),
    environment: process.env.NODE_ENV || "development",
    productionMode: isProductionEnvironment(),
    supabase: {
      publicUrl: isConfigured(env.NEXT_PUBLIC_SUPABASE_URL),
      anonKey: isConfigured(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      serviceRole: isConfigured(env.SUPABASE_SERVICE_ROLE_KEY),
    },
    openai: {
      configured: isConfigured(env.OPENAI_API_KEY),
      model: env.OPENAI_MODEL || null,
    },
    stripe: {
      secretKey: isConfigured(env.STRIPE_SECRET_KEY),
      webhookSecret: isConfigured(env.STRIPE_WEBHOOK_SECRET),
      publishableKey: isConfigured(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      proPriceId: isConfigured(env.STRIPE_PRICE_ID_PRO),
      starterPriceId: isConfigured(env.STRIPE_PRICE_ID_STARTER),
    },
    sentry: {
      dsn: isConfigured(env.NEXT_PUBLIC_SENTRY_DSN),
      org: isConfigured(env.SENTRY_ORG),
      project: isConfigured(env.SENTRY_PROJECT),
      authToken: isConfigured(env.SENTRY_AUTH_TOKEN),
      environment: env.SENTRY_ENVIRONMENT || null,
    },
    analytics: {
      provider: env.NEXT_PUBLIC_ANALYTICS_PROVIDER || null,
      configured:
        (env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "ga" && isConfigured(env.NEXT_PUBLIC_GA_ID)) ||
        (env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "plausible" && isConfigured(env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN)) ||
        (env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "umami" && isConfigured(env.NEXT_PUBLIC_UMAMI_WEBSITE_ID)) ||
        false,
    },
    email: {
      provider: env.TRANSACTIONAL_EMAIL_PROVIDER || "supabase-auth",
      supportEmail: env.SUPPORT_EMAIL || null,
    },
  };

  return NextResponse.json(
    {
      ok: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      productionMode: isProduction,
      appUrl: getSiteUrl(),
      checks: canReadDetailedChecks ? checks : undefined,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
