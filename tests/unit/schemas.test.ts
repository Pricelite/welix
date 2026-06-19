import { createClientSchema, quotePayloadSchema } from "@/lib/schemas";

describe("schemas", () => {
  it("accepts a valid client payload", () => {
    const parsed = createClientSchema.parse({
      name: "Atelier Martin",
      contact: "Luc Martin",
      email: "luc@example.com",
      city: "Lyon",
    });

    expect(parsed.name).toBe("Atelier Martin");
  });

  it("rejects an invalid quote payload", () => {
    expect(() =>
      quotePayloadSchema.parse({
        clientId: "bad-id",
        trade: "",
        description: "court",
        recommendedPrice: -1,
        vatRate: 140,
        vatAmount: -2,
        total: -3,
      }),
    ).toThrow();
  });
});
