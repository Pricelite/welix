import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthenticatedUser = vi.fn();
const getAccountSnapshot = vi.fn();
const createStripeClient = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthenticatedUser,
}));

vi.mock("@/lib/billing", () => ({
  getAccountSnapshot,
}));

vi.mock("@/lib/stripe", () => ({
  createStripeClient,
}));

describe("stripe checkout api route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv, NODE_ENV: "test" };
    delete process.env.STRIPE_PRICE_ID_STARTER;
    delete process.env.STRIPE_PRICE_ID_PRO;
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it("refuses starter checkout when the starter price is missing", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1", email: "artisan@example.com" });
    getAccountSnapshot.mockResolvedValue({ profile: null, subscription: null });

    const { POST } = await import("@/app/api/stripe/checkout/route");
    const response = await POST(
      new Request("http://localhost/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "starter" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toMatch(/Aucun tarif Stripe/i);
    expect(createStripeClient).not.toHaveBeenCalled();
  });

  it("creates a checkout session when the plan is configured", async () => {
    process.env.STRIPE_PRICE_ID_PRO = "price_pro_123";
    process.env.NEXT_PUBLIC_APP_URL = "https://welix.test";

    getAuthenticatedUser.mockResolvedValue({ id: "user-1", email: "artisan@example.com" });
    getAccountSnapshot.mockResolvedValue({ profile: null, subscription: null });

    const sessionsCreate = vi.fn().mockResolvedValue({ url: "https://checkout.stripe.test/session" });
    createStripeClient.mockReturnValue({
      checkout: {
        sessions: {
          create: sessionsCreate,
        },
      },
    });

    const { POST } = await import("@/app/api/stripe/checkout/route");
    const response = await POST(
      new Request("http://localhost/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.url).toBe("https://checkout.stripe.test/session");
    expect(sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: "https://welix.test/abonnement?success=true",
        cancel_url: "https://welix.test/abonnement?canceled=true",
        line_items: [{ price: "price_pro_123", quantity: 1 }],
      }),
    );
  });
});
