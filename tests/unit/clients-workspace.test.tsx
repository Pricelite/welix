import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ClientsWorkspace } from "@/components/ClientsWorkspace";
import type { ClientRecord } from "@/lib/workspace";

const baseClient: ClientRecord = {
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
};

describe("ClientsWorkspace", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a validation toast when name is missing", async () => {
    render(<ClientsWorkspace initialClients={[baseClient]} />);

    fireEvent.click(screen.getByRole("button", { name: /nouveau client/i }));
    fireEvent.click(screen.getByRole("button", { name: /créer le client|enregistrer/i }));

    expect(
      await screen.findByText(/renseigne un nom de client avant de continuer/i),
    ).toBeInTheDocument();
  });

  it("creates a client and updates the list", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          client: {
            ...baseClient,
            id: "client-2",
            name: "Maison Laurent",
            contact: "Claire Laurent",
            email: "claire@example.com",
          },
        }),
        { status: 200 },
      ),
    );

    render(<ClientsWorkspace initialClients={[baseClient]} />);

    fireEvent.click(screen.getByRole("button", { name: /nouveau client/i }));
    fireEvent.change(screen.getByLabelText(/nom du client/i), {
      target: { value: "Maison Laurent" },
    });
    fireEvent.change(screen.getByLabelText(/contact/i), {
      target: { value: "Claire Laurent" },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "claire@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /créer le client/i }));

    await waitFor(() => {
      expect(screen.getByText("Maison Laurent")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/clients",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
