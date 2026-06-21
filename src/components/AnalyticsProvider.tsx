"use client";

import Script from "next/script";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";

export function AnalyticsProvider() {
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiScriptUrl =
    process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://cloud.umami.is/script.js";

  return (
    <>
      {provider === "ga" && googleAnalyticsId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}', { anonymize_ip: true });`}
          </Script>
        </>
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
