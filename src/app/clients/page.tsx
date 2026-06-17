import { Plus, UsersRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { clientRows } from "@/lib/data";

export default function ClientsPage() {
  return (
    <AppShell
      active="/clients"
      eyebrow="Relation client"
      title="Liste des clients"
      action="Nouveau devis"
    >
      <section className="workspace-panel">
        <div className="panel-title">
          <h2>Clients actifs</h2>
          <button className="secondary-button small-button">
            <Plus size={16} />
            Ajouter
          </button>
        </div>
        <div className="client-grid">
          {clientRows.map((client) => (
            <article className="client-card" key={client.email}>
              <div className="avatar">
                <UsersRound size={18} />
              </div>
              <div>
                <h3>{client.name}</h3>
                <p>{client.contact}</p>
              </div>
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{client.email}</dd>
                </div>
                <div>
                  <dt>Ville</dt>
                  <dd>{client.city}</dd>
                </div>
                <div>
                  <dt>CA signé</dt>
                  <dd>{client.revenue}</dd>
                </div>
                <div>
                  <dt>Dernier devis</dt>
                  <dd>{client.lastQuote}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
