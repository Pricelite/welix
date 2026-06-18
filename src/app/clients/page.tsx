import { UsersRound } from "lucide-react";
import { AddClientForm } from "@/components/AddClientForm";
import { AppShell } from "@/components/AppShell";
import { requireAuthenticatedUser } from "@/lib/auth";
import { listClientsForUser } from "@/lib/workspace";

export default async function ClientsPage() {
  const user = await requireAuthenticatedUser();
  const clients = await listClientsForUser(user.id);

  return (
    <AppShell
      active="/clients"
      eyebrow="Relation client"
      title="Liste des clients"
      action="Nouveau devis"
    >
      <AddClientForm />

      <section className="workspace-panel">
        <div className="panel-title">
          <div>
            <h2>Clients actifs</h2>
            <p>
              {clients.length
                ? `${clients.length} client(s) enregistré(s)`
                : "Aucun client pour le moment"}
            </p>
          </div>
        </div>

        {clients.length ? (
          <div className="client-grid">
            {clients.map((client) => (
              <article className="client-card" key={client.id}>
                <div className="avatar">
                  <UsersRound size={18} />
                </div>
                <div>
                  <h3>{client.name}</h3>
                  <p>{client.contact || "Contact à renseigner"}</p>
                </div>
                <dl>
                  <div>
                    <dt>Email</dt>
                    <dd>{client.email || "À renseigner"}</dd>
                  </div>
                  <div>
                    <dt>Ville</dt>
                    <dd>{client.city || "À renseigner"}</dd>
                  </div>
                  <div>
                    <dt>CA signé</dt>
                    <dd>{client.revenue || "0 EUR"}</dd>
                  </div>
                  <div>
                    <dt>Dernier devis</dt>
                    <dd>{client.last_quote || "Aucun devis"}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state-text">
            Commence par ajouter un client avec le formulaire ci-dessus.
          </p>
        )}
      </section>
    </AppShell>
  );
}
