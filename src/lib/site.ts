import { getAppUrl } from "@/lib/env";

export function getSiteName() {
  return process.env.NEXT_PUBLIC_SITE_NAME || "Welix";
}

export function getSiteUrl() {
  return getAppUrl();
}

export function getDefaultOgImage() {
  return `${getSiteUrl()}/images/welix-hero.png`;
}

export function isIndexableEnvironment() {
  const appUrl = getSiteUrl();
  return process.env.NODE_ENV === "production" && !appUrl.includes("localhost");
}
