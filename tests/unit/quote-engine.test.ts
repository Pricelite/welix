import { computeQuoteFromExtraction, fallbackExtractQuoteContext } from "@/lib/quote-engine";

describe("quote-engine", () => {
  it("extracts structured context from a parquet request", () => {
    const extraction = fallbackExtractQuoteContext(
      "Remplacement urgent de 20 m2 de parquet avec déplacement de 18 km",
    );

    expect(extraction.trade).toBe("Revêtements de sol");
    expect(extraction.surface).toBe(20);
    expect(extraction.urgency).toBe("haute");
    expect(extraction.distanceKm).toBe(18);
  });

  it("computes deterministic totals from extraction", () => {
    const quote = computeQuoteFromExtraction({
      trade: "Plomberie",
      service: "Remplacement d'un chauffe-eau 200L",
      surface: null,
      urgency: "normale",
      materials: ["chauffe-eau", "raccords", "groupe de sécurité"],
      durationHours: 4,
      distanceKm: 12,
    });

    expect(quote.recommendedPrice).toBeGreaterThan(0);
    expect(quote.total).toBeGreaterThan(quote.recommendedPrice);
    expect(quote.vatRate).toBe(10);
    expect(quote.description).toContain("Remplacement");
  });
});
