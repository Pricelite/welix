import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  trade: string | null;
  phone: string | null;
  address: string | null;
  stripe_customer_id: string | null;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string;
  stripe_price_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
};

type StripeSubscriptionLike = {
  id: string;
  customer: string | { id: string } | null;
  status: string;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  current_period_start: number | null;
  current_period_end: number | null;
  items: {
    data: Array<{
      price?: {
        id: string;
      } | null;
    }>;
  };
  metadata: Record<string, string>;
};

function toIsoDate(timestamp: number | null | undefined) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

function toReadableError(prefix: string, error: unknown) {
  if (error instanceof Error) {
    return new Error(`${prefix}: ${error.message}`);
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = typeof error.message === "string" ? error.message : "Erreur inconnue";
    return new Error(`${prefix}: ${message}`);
  }

  return new Error(prefix);
}

export async function upsertProfileFromUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const admin = createSupabaseAdminClient();
  const metadata = user.user_metadata ?? {};
  const fullName = typeof metadata.full_name === "string" ? metadata.full_name : null;
  const companyName = typeof metadata.company_name === "string" ? metadata.company_name : null;
  const trade = typeof metadata.trade === "string" ? metadata.trade : null;
  const phone = typeof metadata.phone === "string" ? metadata.phone : null;
  const address = typeof metadata.address === "string" ? metadata.address : null;

  const { error } = await admin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: fullName,
      company_name: companyName,
      trade,
      phone,
      address,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw toReadableError("Impossible de synchroniser le profil", error);
  }
}

export async function getAccountSnapshot(userId: string) {
  const supabase = await createSupabaseServerClient();

  const [{ data: profile, error: profileError }, { data: subscription, error: subscriptionError }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (profileError) {
    return {
      profile: null,
      subscription: null,
    };
  }

  if (subscriptionError) {
    return {
      profile: (profile as ProfileRow | null) ?? null,
      subscription: null,
    };
  }

  return {
    profile: (profile as ProfileRow | null) ?? null,
    subscription: (subscription as SubscriptionRow | null) ?? null,
  };
}

export function hasActiveSubscription(status?: string | null) {
  return status === "active" || status === "trialing" || status === "past_due";
}

async function updateProfileStripeCustomer(userId: string, customerId: string | null, email?: string | null) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: email ?? null,
        stripe_customer_id: customerId,
      },
      { onConflict: "id" },
    );

  if (error) {
    throw toReadableError("Impossible de mettre à jour le client Stripe", error);
  }
}

async function resolveUserIdForSubscription(input: {
  userId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
}) {
  const admin = createSupabaseAdminClient();

  if (input.userId) {
    return input.userId;
  }

  if (input.subscriptionId) {
    const { data: existingSubscription } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", input.subscriptionId)
      .maybeSingle();

    if ((existingSubscription as { user_id?: string } | null)?.user_id) {
      return (existingSubscription as { user_id: string }).user_id;
    }
  }

  if (input.customerId) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", input.customerId)
      .maybeSingle();

    if ((profile as { id?: string } | null)?.id) {
      return (profile as { id: string }).id;
    }
  }

  return null;
}

export async function syncStripeSubscription(
  subscription: StripeSubscriptionLike,
  fallbackUserId?: string | null,
) {
  const admin = createSupabaseAdminClient();
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null;
  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const userId = await resolveUserIdForSubscription({
    userId: typeof subscription.metadata.userId === "string" ? subscription.metadata.userId : fallbackUserId,
    customerId,
    subscriptionId: subscription.id,
  });

  if (!userId) {
    throw new Error(`Unable to resolve user for subscription ${subscription.id}`);
  }

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status: subscription.status,
      current_period_start: toIsoDate(subscription.current_period_start),
      current_period_end: toIsoDate(subscription.current_period_end),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: toIsoDate(subscription.canceled_at),
    },
    { onConflict: "stripe_subscription_id" },
  );

  if (error) {
    throw toReadableError("Impossible de synchroniser l'abonnement", error);
  }

  if (customerId) {
    await updateProfileStripeCustomer(userId, customerId);
  }

  return userId;
}

export async function syncCheckoutSession(input: {
  userId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  email?: string | null;
}) {
  const userId = await resolveUserIdForSubscription({
    userId: input.userId,
    customerId: input.customerId,
    subscriptionId: input.subscriptionId,
  });

  if (!userId) {
    throw new Error("Unable to resolve user for checkout session");
  }

  if (input.customerId) {
    await updateProfileStripeCustomer(userId, input.customerId, input.email);
  }

  return userId;
}
