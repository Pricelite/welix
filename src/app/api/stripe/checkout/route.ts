import { NextResponse } from "next/server";
import { createStripeClient } from "@/lib/stripe";

export async function POST() {
  const priceId = process.env.STRIPE_PRICE_ID_PRO;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!priceId) {
    return NextResponse.json(
      { error: "STRIPE_PRICE_ID_PRO manquant" },
      { status: 500 },
    );
  }

  const stripe = createStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/abonnement?success=true`,
    cancel_url: `${appUrl}/abonnement?canceled=true`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
