import { CheckCircle2, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";

const plans = [
  "Devis IA illimités",
  "PDF professionnels",
  "Clients, factures et relances",
  "Support prioritaire",
];

export default function SubscriptionPage() {
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
