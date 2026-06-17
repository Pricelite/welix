import { Download, Filter, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { quoteRows } from "@/lib/data";

export default function DevisHistoryPage() {
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
        <div className="app-table detailed-table">
          {quoteRows.map((quote) => (
            <div className="app-table-row" key={quote.id}>
              <span>{quote.id}</span>
              <span>{quote.date}</span>
              <span>{quote.client}</span>
              <span>{quote.trade}</span>
              <strong>{quote.amount}</strong>
              <span className={`status status-${quote.status.toLowerCase()}`}>
                {quote.status}
              </span>
              <button className="icon-button" aria-label={`Envoyer ${quote.id}`}>
                <Send size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
