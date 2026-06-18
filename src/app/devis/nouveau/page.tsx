import { AppShell } from "@/components/AppShell";
import { AiQuoteGenerator } from "@/components/AiQuoteGenerator";
import { requireAuthenticatedUser } from "@/lib/auth";

export default async function NewQuotePage() {
  await requireAuthenticatedUser();

  return (
    <AppShell active="/devis/nouveau" eyebrow="Interface IA" title="Créer un devis avec l'IA">
      <AiQuoteGenerator />
    </AppShell>
  );
}
