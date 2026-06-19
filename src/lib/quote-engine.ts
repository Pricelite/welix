import type { z } from "zod";
import { formatCurrency } from "@/lib/format";
import { quoteExtractionSchema } from "@/lib/schemas";

export type QuoteExtraction = z.infer<typeof quoteExtractionSchema>;

type QuoteComputation = {
  description: string;
  material: string;
  labor: string;
  estimatedTime: string;
  recommendedPrice: number;
  vatRate: number;
  vatAmount: number;
  subtotal: number;
  total: number;
};

const tradeProfiles: Array<{
  match: RegExp;
  trade: string;
  hourlyRate: number;
  surfaceRate: number;
  defaultMaterials: string[];
}> = [
  {
    match: /(parquet|sol|revêtement|stratifié|plinthe)/i,
    trade: "Revêtements de sol",
    hourlyRate: 58,
    surfaceRate: 34,
    defaultMaterials: ["sous-couche", "consommables de pose", "protections de chantier"],
  },
  {
    match: /(peinture|mur|plafond|enduit)/i,
    trade: "Peinture",
    hourlyRate: 52,
    surfaceRate: 18,
    defaultMaterials: ["protection", "préparation des supports", "consommables"],
  },
  {
    match: /(chauffe-eau|plomberie|sanitaire|ballon|eau)/i,
    trade: "Plomberie",
    hourlyRate: 72,
    surfaceRate: 0,
    defaultMaterials: ["raccords", "fixations", "consommables hydrauliques"],
  },
  {
    match: /(élect|tableau|prise|luminaire|câble)/i,
    trade: "Électricité",
    hourlyRate: 74,
    surfaceRate: 0,
    defaultMaterials: ["câblage", "protections", "consommables électriques"],
  },
];

function round(value: number) {
  return Number(value.toFixed(2));
}

export function inferTradeProfile(prompt: string) {
  return (
    tradeProfiles.find((profile) => profile.match.test(prompt)) ?? {
      trade: "Travaux généraux",
      hourlyRate: 60,
      surfaceRate: 12,
      defaultMaterials: ["fournitures courantes", "protections", "consommables"],
    }
  );
}

export function fallbackExtractQuoteContext(prompt: string): QuoteExtraction {
  const profile = inferTradeProfile(prompt);
  const surfaceMatch = prompt.match(/(\d+(?:[.,]\d+)?)\s*(m2|m²)/i);
  const durationMatch = prompt.match(/(\d+(?:[.,]\d+)?)\s*(h|heure|heures|jour|jours)/i);
  const distanceMatch = prompt.match(/(\d+(?:[.,]\d+)?)\s*km/i);
  const lower = prompt.toLowerCase();

  const surface = surfaceMatch ? Number(surfaceMatch[1].replace(",", ".")) : null;
  let durationHours: number | null = null;
  if (durationMatch) {
    const value = Number(durationMatch[1].replace(",", "."));
    durationHours = /jour/i.test(durationMatch[2]) ? value * 7 : value;
  }

  return {
    trade: profile.trade,
    service: prompt.trim().slice(0, 160),
    surface,
    urgency: /(urgent|rapidement|dès que possible)/i.test(lower) ? "haute" : "normale",
    materials: profile.defaultMaterials,
    durationHours,
    distanceKm: distanceMatch ? Number(distanceMatch[1].replace(",", ".")) : null,
  };
}

export function computeQuoteFromExtraction(extraction: QuoteExtraction): QuoteComputation {
  const profile = inferTradeProfile(`${extraction.trade} ${extraction.service}`);
  const durationHours =
    extraction.durationHours ?? Math.max(2, extraction.surface ? extraction.surface / 12 : 4);
  const surfaceCost = extraction.surface ? extraction.surface * profile.surfaceRate : 0;
  const laborCost = durationHours * profile.hourlyRate;
  const distanceCost = extraction.distanceKm ? extraction.distanceKm * 0.85 : 0;
  const materialBase =
    extraction.materials.length > 0
      ? extraction.materials.length * 22 + (extraction.surface ? extraction.surface * 3.2 : 65)
      : extraction.surface
        ? extraction.surface * 4
        : 80;
  const urgencyMultiplier =
    extraction.urgency === "haute" ? 1.15 : extraction.urgency === "faible" ? 0.97 : 1;

  const subtotal = round((laborCost + surfaceCost + distanceCost + materialBase) * urgencyMultiplier);
  const vatRate = 10;
  const vatAmount = round(subtotal * (vatRate / 100));
  const total = round(subtotal + vatAmount);

  const materialLabel =
    extraction.materials.length > 0
      ? extraction.materials.join(", ")
      : profile.defaultMaterials.join(", ");

  return {
    description: `${extraction.service}. Intervention métier : ${extraction.trade}.`,
    material: `${materialLabel}. Fournitures ajustées selon le chantier.`,
    labor: `${round(durationHours)} h estimées, déplacement et exécution compris.`,
    estimatedTime: durationHours >= 7 ? `${round(durationHours / 7)} jour(s)` : `${round(durationHours)} h`,
    recommendedPrice: subtotal,
    vatRate,
    vatAmount,
    subtotal,
    total,
  };
}

export function formatQuoteSummary(extraction: QuoteExtraction) {
  const computed = computeQuoteFromExtraction(extraction);

  return {
    ...computed,
    summary: `${extraction.trade} • ${extraction.service} • ${formatCurrency(computed.total)} TTC`,
  };
}
