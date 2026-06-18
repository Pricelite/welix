import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { syncCheckoutSession, syncStripeSubscription } from "@/lib/billing";
import { createStripeClient } from "@/lib/stripe";

function normalizeSubscription(subscription: {
  id: string;
  customer: string | { id: string } | null;
  status: string;
  cancel_at_period_end?: boolean | null;
  canceled_at?: number | null;
  current_period_start?: number | null;
  current_period_end?: number | null;
  items?: {
    data?: Array<{
      price?: {
        id: string;
      } | null;
    }>;
  };
  metadata?: Record<string, string>;
}) {
  return {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    canceled_at: subscription.canceled_at ?? null,
    current_period_start: subscription.current_period_start ?? null,
    current_period_end: subscription.current_period_end ?? null,
    items: {
      data: subscription.items?.data ?? [],
    },
    metadata: subscription.metadata ?? {},
  };
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET manquant" }, { status: 500 });
  }

  const stripe = createStripeClient();
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature Stripe manquante" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Signature Stripe invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId =
          typeof session.metadata?.userId === "string"
            ? session.metadata.userId
            : session.client_reference_id;
        const customerId = typeof session.customer === "string" ? session.customer : null;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        const resolvedUserId = await syncCheckoutSession({
          userId,
          customerId,
          subscriptionId,
          email: session.customer_details?.email ?? session.customer_email,
        });

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncStripeSubscription(normalizeSubscription(subscription), resolvedUserId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await syncStripeSubscription(normalizeSubscription(subscription));
        break;
      }
      default:
        break;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook Stripe non traité" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
