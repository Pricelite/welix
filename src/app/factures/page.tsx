import Link from "next/link";
import { Download, ReceiptText, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { requireAuthenticatedUser } from "@/lib/auth";
import { formatCurrency, formatDisplayDate } from "@/lib/format";
import { listInvoicesForUser } from "@/lib/workspace";

export default async function InvoicesPage() {
  const user = await requireAuthenticatedUser();
  const invoices = await listInvoicesForUser(user.id);

  return (
    <AppShell active="/factures" eyebrow="Facturation" title="Factures">
      <section className="dashboard-hero-panel">
        <div>
          <p className="section-kicker">Documents</p>
          <h2>{"Factures propres, pr\u00eates \u00e0 envoyer ou \u00e0 t\u00e9l\u00e9charger en PDF."}</h2>
        </div>
        <Link className="primary-button large-button" href="/api/pdf/quote">
          <Download size={18} />
          {"T\u00e9l\u00e9charger un PDF"}
        </Link>
      </section>

      <section className="workspace-panel latest-quotes-panel">
        <div className="panel-title">
          <div>
            <h2>{"Derni\u00e8res factures"}</h2>
            <p>Suivi des paiements et documents clients</p>
          </div>
          <ReceiptText size={18} />
        </div>

        {invoices.length ? (
          <div className="linear-table">
            {invoices.map((invoice) => (
              <div className="linear-table-row" key={invoice.id}>
                <span>{invoice.invoiceNumber}</span>
                <strong>{invoice.clientName}</strong>
                <span>{formatDisplayDate(invoice.issuedAt || invoice.createdAt)}</span>
                <span>{formatCurrency(invoice.amount)}</span>
                <span className="status">{invoice.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state-text">
            {"Aucune facture n'est encore enregistr\u00e9e. La base est pr\u00eate pour les futures synchronisations Stripe et exports."}
          </p>
        )}

        <button className="secondary-button auth-submit" type="button">
          Envoyer les relances
          <Send size={17} />
        </button>
      </section>
    </AppShell>
  );
}
