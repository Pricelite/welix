import { hasActiveSubscription } from "@/lib/billing";

describe("billing", () => {
  it("identifies active subscription-like statuses", () => {
    expect(hasActiveSubscription("active")).toBe(true);
    expect(hasActiveSubscription("trialing")).toBe(true);
    expect(hasActiveSubscription("past_due")).toBe(true);
    expect(hasActiveSubscription("canceled")).toBe(false);
  });
});
