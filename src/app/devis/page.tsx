import { AppShell } from "@/components/AppShell";
import { QuotesWorkspace } from "@/components/QuotesWorkspace";
import { requireAuthenticatedUser } from "@/lib/auth";
import { listClientsForUser, listQuotesForUser } from "@/lib/workspace";

export default async function DevisHistoryPage() {
  const user = await requireAuthenticatedUser();
  const [quotes, clients] = await Promise.all([
    listQuotesForUser(user.id),
    listClientsForUser(user.id),
  ]);

  return (
    <AppShell
      active="/devis"
      eyebrow="Suivi commercial"
      title="Historique des devis"
      action="Nouveau devis"
    >
      <QuotesWorkspace clients={clients} initialQuotes={quotes} />
    </AppShell>
  );
}
