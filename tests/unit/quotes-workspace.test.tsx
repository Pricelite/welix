import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QuotesWorkspace } from "@/components/QuotesWorkspace";
import type { ClientRecord, QuoteRecord } from "@/lib/workspace";

const clients: ClientRecord[] = [
  {
    id: "client-1",
    name: "Atelier Martin",
    contact: "Luc Martin",
    email: "luc@example.com",
    city: "Lyon",
    revenue: 0,
    archivedAt: null,
    lastQuoteId: null,
    lastQuoteNumber: null,
    createdAt: new Date().toISOString(),
  },
];

const quote: QuoteRecord = {
  id: "quote-1",
  quoteNumber: "DEV-2026-001",
  clientId: "client-1",
  clientName: "Atelier Martin",
  trade: "Plomberie",
  status: "Brouillon",
  date: new Date().toISOString(),
  description: "Remplacement chauffe-eau",
  material: "Chauffe-eau",
  labor: "Pose et raccordement",
  estimatedTime: "4 h",
  recommendedPrice: 1000,
  vatRate: 10,
  subtotal: 1000,
  vat: 100,
  total: 1100,
  amount: 1100,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("QuotesWorkspace", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a validation toast when description is missing", async () => {
    render(<QuotesWorkspace clients={clients} initialQuotes={[quote]} />);

    fireEvent.click(screen.getByRole("button", { name: /créer un devis/i }));
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /créer le devis|enregistrer/i }));

    expect(
      await screen.findByText(/choisis un client et renseigne une description/i),
    ).toBeInTheDocument();
  });

  it("duplicates a quote and prepends it to the list", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          quote: {
            ...quote,
            id: "quote-2",
            quoteNumber: "DEV-2026-002",
          },
        }),
        { status: 200 },
      ),
    );

    render(<QuotesWorkspace clients={clients} initialQuotes={[quote]} />);

    fireEvent.click(screen.getByRole("button", { name: /dupliquer/i }));

    await waitFor(() => {
      expect(screen.getByText("DEV-2026-002")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/quotes/quote-1/duplicate",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
