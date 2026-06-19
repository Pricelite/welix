import dynamic from "next/dynamic";
import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAuthenticatedUser } from "@/lib/auth";
import { listClientsForUser } from "@/lib/workspace";

const AiQuoteGenerator = dynamic(
  () => import("@/components/AiQuoteGenerator").then((module) => module.AiQuoteGenerator),
  {
    loading: () => (
      <div className="workspace-panel" style={{ display: "grid", gap: "16px", padding: "24px" }}>
        <Skeleton style={{ height: "24px", width: "240px" }} />
        <Skeleton style={{ height: "48px", width: "100%" }} />
        <Skeleton style={{ height: "180px", width: "100%" }} />
        <Skeleton style={{ height: "48px", width: "220px" }} />
      </div>
    ),
  },
);

export default async function NewQuotePage() {
  const user = await requireAuthenticatedUser();
  const clients = await listClientsForUser(user.id);

  return (
    <AppShell
      active="/devis/nouveau"
      eyebrow="Interface IA"
      title={"Cr\u00e9er un devis avec l'IA"}
    >
      <AiQuoteGenerator clients={clients.map((client) => ({ id: client.id, name: client.name }))} />
    </AppShell>
  );
}
