import { getAuthenticatedUser } from "@/lib/auth";
import { getAccountSnapshot } from "@/lib/billing";
import { ApiError, jsonError, jsonSuccess, parseJson } from "@/lib/http";
import { stripeCheckoutSchema } from "@/lib/schemas";
import { createStripeClient } from "@/lib/stripe";

function resolvePriceId(plan: "starter" | "pro") {
  if (plan === "starter") {
    return process.env.STRIPE_PRICE_ID_STARTER || process.env.STRIPE_PRICE_ID_PRO;
  }

  return process.env.STRIPE_PRICE_ID_PRO;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    const body = await parseJson(request, stripeCheckoutSchema);
    const priceId = resolvePriceId(body.plan);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!priceId) {
      throw new ApiError("Aucun tarif Stripe n'est configuré pour ce plan", 500);
    }

    const stripe = createStripeClient();
    const { profile, subscription } = await getAccountSnapshot(user.id);

    if (subscription?.stripe_subscription_id && ["active", "trialing", "past_due"].includes(subscription.status)) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: profile?.stripe_customer_id ?? subscription.stripe_customer_id ?? undefined,
        return_url: `${appUrl}/abonnement`,
      });

      return jsonSuccess({ url: portal.url, mode: "portal" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/abonnement?success=true`,
      cancel_url: `${appUrl}/abonnement?canceled=true`,
      allow_promotion_codes: true,
      client_reference_id: user.id,
      customer: profile?.stripe_customer_id ?? undefined,
      customer_email: profile?.stripe_customer_id ? undefined : user.email,
      metadata: {
        userId: user.id,
        userEmail: user.email ?? "",
        plan: body.plan,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          userEmail: user.email ?? "",
          plan: body.plan,
        },
      },
    });

    return jsonSuccess({ url: session.url, mode: "checkout" });
  } catch (error) {
    return jsonError(error, "Erreur serveur lors du démarrage du paiement");
  }
}
