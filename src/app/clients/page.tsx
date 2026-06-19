import { AppShell } from "@/components/AppShell";
import { ClientsWorkspace } from "@/components/ClientsWorkspace";
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
      <ClientsWorkspace initialClients={clients} />
    </AppShell>
  );
}
