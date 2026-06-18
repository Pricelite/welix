import { CheckCircle2, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { getAccountSnapshot } from "@/lib/billing";
import { requireAuthenticatedUser } from "@/lib/auth";

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
  const hasActivePlan = subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <AppShell active="/abonnement" eyebrow="Billing" title="Abonnement">
      <section className="subscription-layout">
        <article className="workspace-panel subscription-card">
          <div className="subscription-icon">
            <Sparkles size={24} />
          </div>
          <p className="section-kicker">Welix Pro</p>
          <h2>Un assistant complet pour gérer tes devis.</h2>
          <div className="subscription-price">
            <strong>29 EUR</strong>
            <span>/ mois</span>
          </div>
          <p className={`status ${hasActivePlan ? "status-accepté" : "status-brouillon"}`}>
            {getSubscriptionLabel(subscription?.status)}
          </p>
          {subscription?.current_period_end ? (
            <p className="secure-note">
              Prochaine échéance :{" "}
              {new Date(subscription.current_period_end).toLocaleDateString("fr-FR")}
            </p>
          ) : null}
          <StripeCheckoutButton />
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
            Paiement sécurisé par Stripe Checkout.
          </div>
        </article>
      </section>
    </AppShell>
  );
}
