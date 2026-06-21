import { getAuthenticatedUser } from "@/lib/auth";
import { getAccountSnapshot } from "@/lib/billing";
import { getAppUrl } from "@/lib/env";
import { ApiError, jsonError, jsonSuccess, parseJson } from "@/lib/http";
import { stripeManageSchema } from "@/lib/schemas";
import { createStripeClient } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    const body = await parseJson(request, stripeManageSchema);
    const { profile, subscription } = await getAccountSnapshot(user.id);
    const stripe = createStripeClient();
    const appUrl = getAppUrl({ requireInProduction: true });

    if (body.action === "portal") {
      if (!profile?.stripe_customer_id) {
        throw new ApiError("Aucun client Stripe associé à ce compte", 404);
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${appUrl}/abonnement`,
      });

      return jsonSuccess({ url: session.url });
    }

    if (!subscription?.stripe_subscription_id) {
      throw new ApiError("Aucun abonnement actif à gérer", 404);
    }

    if (body.action === "cancel") {
      const next = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
      return jsonSuccess({
        ok: true,
        subscriptionId: next.id,
        status: next.status,
        cancelAtPeriodEnd: next.cancel_at_period_end,
      });
    }

    if (body.action === "resume") {
      const next = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: false,
      });
      return jsonSuccess({
        ok: true,
        subscriptionId: next.id,
        status: next.status,
        cancelAtPeriodEnd: next.cancel_at_period_end,
      });
    }

    if (!body.priceId) {
      throw new ApiError("Le nouveau tarif Stripe est obligatoire", 400);
    }

    const current = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
    const itemId = current.items.data[0]?.id;

    if (!itemId) {
      throw new ApiError("Aucune ligne d'abonnement Stripe n'a été trouvée", 500);
    }

    const next = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
      proration_behavior: "create_prorations",
      items: [
        {
          id: itemId,
          price: body.priceId,
        },
      ],
    });

    return jsonSuccess({
      ok: true,
      subscriptionId: next.id,
      status: next.status,
      priceId: next.items.data[0]?.price.id ?? null,
    });
  } catch (error) {
    return jsonError(error, "Erreur serveur lors de la gestion de l'abonnement");
  }
}
