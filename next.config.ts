import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";
const scriptSourcePolicy = [
  "'self'",
  "'unsafe-inline'",
  !isProduction ? "'unsafe-eval'" : "",
  "https://js.stripe.com",
  "https://www.googletagmanager.com",
  "https://plausible.io",
  "https://cloud.umami.is",
  "https://va.vercel-scripts.com",
]
  .filter(Boolean)
  .join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSourcePolicy}`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.openai.com https://*.supabase.co https://api.stripe.com https://*.ingest.sentry.io https://region1.google-analytics.com https://www.google-analytics.com https://plausible.io https://cloud.umami.is",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  isProduction ? "upgrade-insecure-requests" : "",
]
  .filter(Boolean)
  .join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.104"],
  webpack(config, { dev }) {
    if (dev) {
      // Persistent webpack cache is unstable on Windows for this project and
      // can leave dangling pack files in .next/cache between reloads.
      config.cache = false;
    }

    return config;
  },
  async headers() {
    const sharedSecurityHeaders = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin",
      },
      {
        key: "Cross-Origin-Resource-Policy",
        value: "same-origin",
      },
      {
        key: "Content-Security-Policy",
        value: contentSecurityPolicy,
      },
      ...(isProduction
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
          ]
        : []),
    ];

    return [
      {
        source: "/(.*)",
        headers: sharedSecurityHeaders,
      },
      {
        source: "/api/health",
        headers: [
          ...sharedSecurityHeaders,
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/api/stripe/webhook",
        headers: [
          ...sharedSecurityHeaders,
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
};

const sentryEnabled = Boolean(
  process.env.NEXT_PUBLIC_SENTRY_DSN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT &&
    process.env.SENTRY_AUTH_TOKEN,
);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      tunnelRoute: "/monitoring",
      widenClientFileUpload: true,
    })
  : nextConfig;
