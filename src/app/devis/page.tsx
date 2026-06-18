import { Download, Filter, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { requireAuthenticatedUser } from "@/lib/auth";
import { listQuotesForUser } from "@/lib/workspace";

function getStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case "accepté":
    case "accepte":
      return "status-accepte";
    case "envoyé":
    case "envoye":
      return "status-envoye";
    case "relance":
      return "status-relance";
    default:
      return "status-brouillon";
  }
}

export default async function DevisHistoryPage() {
  const user = await requireAuthenticatedUser();
  const quotes = await listQuotesForUser(user.id);

  return (
    <AppShell
      active="/devis"
      eyebrow="Suivi commercial"
      title="Historique des devis"
      action="Nouveau devis"
    >
      <section className="workspace-panel">
        <div className="panel-title">
          <h2>Tous les devis</h2>
          <div className="button-cluster">
            <button className="secondary-button small-button">
              <Filter size={16} />
              Filtrer
            </button>
            <button className="secondary-button small-button">
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>

        {quotes.length ? (
          <div className="app-table detailed-table">
            {quotes.map((quote) => (
              <div className="app-table-row" key={quote.id}>
                <span>{quote.quote_number}</span>
                <span>{quote.date || "-"}</span>
                <span>{quote.client_name}</span>
                <span>{quote.trade || "-"}</span>
                <strong>{quote.amount || "-"}</strong>
                <span className={`status ${getStatusClass(quote.status)}`}>{quote.status}</span>
                <button className="icon-button" aria-label={`Envoyer ${quote.quote_number}`}>
                  <Send size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state-text">
            Aucun devis enregistré pour le moment. Va sur &quot;Nouveau devis&quot; pour créer le
            premier.
          </p>
        )}
      </section>
    </AppShell>
  );
}
