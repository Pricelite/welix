import { CheckCircle2, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getAccountSnapshot, hasActiveSubscription } from "@/lib/billing";

const plans = [
  "Devis IA illimités",
  "PDF professionnels",
  "Clients, factures et relances",
  "Support prioritaire",
];

function getSubscriptionLabel(status?: string | null) {
  switch (status) {
    case "active":
      return "Actif";
    case "trialing":
      return "Essai";
    case "past_due":
      return "Paiement en retard";
    case "canceled":
      return "Résilié";
    case "incomplete":
      return "En attente";
    default:
      return "Aucun abonnement";
  }
}

export default async function SubscriptionPage() {
  const user = await requireAuthenticatedUser();
  const { subscription } = await getAccountSnapshot(user.id);
  const isActive = hasActiveSubscription(subscription?.status);
  const starterPriceId = process.env.STRIPE_PRICE_ID_STARTER || "";
  const proPriceId = process.env.STRIPE_PRICE_ID_PRO || "";
  const currentPriceId = subscription?.stripe_price_id || "";
  const canUpgrade = Boolean(isActive && proPriceId && currentPriceId && currentPriceId !== proPriceId);
  const canDowngrade = Boolean(isActive && starterPriceId && currentPriceId === proPriceId);

  return (
    <AppShell active="/abonnement" eyebrow="Facturation" title="Abonnement">
      <section className="subscription-layout">
        <article className="workspace-panel subscription-card">
          <div className="subscription-icon">
            <Sparkles size={24} />
          </div>
          <p className="section-kicker">Welix Pro</p>
          <h2>Un assistant complet pour gérer les devis, la relation client et la facturation.</h2>
          <div className="subscription-price">
            <strong>29 EUR</strong>
            <span>/ mois</span>
          </div>
          <p className={`status ${isActive ? "status-accepte" : "status-brouillon"}`}>
            {getSubscriptionLabel(subscription?.status)}
          </p>
          {subscription?.current_period_end ? (
            <p className="secure-note">
              Prochaine échéance :{" "}
              {new Date(subscription.current_period_end).toLocaleDateString("fr-FR")}
            </p>
          ) : null}

          {!isActive ? <StripeCheckoutButton action="checkout" label="Passer à Pro" plan="pro" /> : null}
          {isActive ? <StripeCheckoutButton action="portal" label="Gérer la facturation" variant="secondary" /> : null}
          {canUpgrade ? (
            <StripeCheckoutButton action="upgrade" label="Passer à l'offre Pro" priceId={proPriceId} variant="secondary" />
          ) : null}
          {canDowngrade ? (
            <StripeCheckoutButton action="downgrade" label="Revenir à l'offre Starter" priceId={starterPriceId} variant="secondary" />
          ) : null}
          {subscription?.cancel_at_period_end ? (
            <StripeCheckoutButton action="resume" label="Réactiver l'abonnement" variant="secondary" />
          ) : null}
          {isActive && !subscription?.cancel_at_period_end ? (
            <StripeCheckoutButton action="cancel" label="Résilier à l'échéance" variant="secondary" />
          ) : null}
        </article>

        <article className="workspace-panel">
          <div className="panel-title">
            <h2>Inclus dans Pro</h2>
            <CreditCard size={18} />
          </div>
          <div className="plan-feature-list">
            {plans.map((plan) => (
              <div key={plan}>
                <CheckCircle2 size={18} />
                <span>{plan}</span>
              </div>
            ))}
          </div>
          <div className="secure-note">
            <ShieldCheck size={18} />
            Paiement sécurisé par Stripe Checkout, synchronisé avec Supabase.
          </div>
        </article>
      </section>
    </AppShell>
  );
}
