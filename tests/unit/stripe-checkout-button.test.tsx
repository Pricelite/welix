import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";

function renderWithQuery(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("StripeCheckoutButton", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://localhost:3000/abonnement", reload: vi.fn() },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("redirects to checkout url on success", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ url: "https://checkout.stripe.test/session" }), { status: 200 }),
    );

    renderWithQuery(<StripeCheckoutButton label="Passer à Pro" />);
    fireEvent.click(screen.getByRole("button", { name: /passer à pro/i }));

    await waitFor(() => {
      expect(window.location.href).toBe("https://checkout.stripe.test/session");
    });
  });

  it("shows an error when the request fails", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Stripe indisponible" }), { status: 500 }),
    );

    renderWithQuery(<StripeCheckoutButton label="Passer à Pro" />);
    fireEvent.click(screen.getByRole("button", { name: /passer à pro/i }));

    expect(await screen.findByText("Stripe indisponible")).toBeInTheDocument();
  });
});
