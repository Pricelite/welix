"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function AnalyticsProvider() {
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiScriptUrl =
    process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://cloud.umami.is/script.js";
  const [googleAnalyticsReady, setGoogleAnalyticsReady] = useState(false);

  useEffect(() => {
    if (provider !== "ga" || !googleAnalyticsId || !googleAnalyticsReady) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };

    window.gtag("js", new Date());
    window.gtag("config", googleAnalyticsId, { anonymize_ip: true });
  }, [googleAnalyticsId, googleAnalyticsReady, provider]);

  return (
    <>
      {provider === "ga" && googleAnalyticsId ? (
        <Script
          onLoad={() => setGoogleAnalyticsReady(true)}
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="afterInteractive"
        />
      ) : null}

      {provider === "plausible" && plausibleDomain ? (
        <Script
          data-domain={plausibleDomain}
          defer
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      ) : null}

      {provider === "umami" && umamiWebsiteId ? (
        <Script
          data-website-id={umamiWebsiteId}
          defer
          src={umamiScriptUrl}
          strategy="afterInteractive"
        />
      ) : null}

      <WebVitalsReporter />
    </>
  );
}
