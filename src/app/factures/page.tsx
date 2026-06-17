import Link from "next/link";
import { Download, ReceiptText, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const invoices = [
  {
    id: "FAC-2026-018",
    client: "Maison Laurent",
    amount: "3 840 EUR",
    status: "Payée",
    date: "17 juin",
  },
  {
    id: "FAC-2026-017",
    client: "Atelier Moreau",
    amount: "2 190 EUR",
    status: "En attente",
    date: "15 juin",
  },
  {
    id: "FAC-2026-016",
    client: "SCI Bellevue",
    amount: "6 420 EUR",
    status: "Brouillon",
    date: "13 juin",
  },
];

export default function InvoicesPage() {
  return (
    <AppShell active="/factures" eyebrow="Facturation" title="Factures">
      <section className="dashboard-hero-panel">
        <div>
          <p className="section-kicker">Documents</p>
          <h2>Factures propres, prêtes à envoyer ou télécharger en PDF.</h2>
        </div>
        <Link className="primary-button large-button" href="/api/pdf/quote">
          <Download size={18} />
          Télécharger un PDF
        </Link>
      </section>

      <section className="workspace-panel latest-quotes-panel">
        <div className="panel-title">
          <div>
            <h2>Dernières factures</h2>
            <p>Suivi des paiements et documents clients</p>
          </div>
          <ReceiptText size={18} />
        </div>
        <div className="linear-table">
          {invoices.map((invoice) => (
            <div className="linear-table-row" key={invoice.id}>
              <span>{invoice.id}</span>
              <strong>{invoice.client}</strong>
              <span>{invoice.date}</span>
              <span>{invoice.amount}</span>
              <span className="status">{invoice.status}</span>
            </div>
          ))}
        </div>
        <button className="secondary-button auth-submit" type="button">
          Envoyer les relances
          <Send size={17} />
        </button>
      </section>
    </AppShell>
  );
}
