import { AppShell } from "@/components/AppShell";
import { AiQuoteGenerator } from "@/components/AiQuoteGenerator";

export default function NewQuotePage() {
  return (
    <AppShell
      active="/devis/nouveau"
      eyebrow="Interface IA"
      title="Créer un devis avec l'IA"
    >
      <AiQuoteGenerator />
    </AppShell>
  );
}
