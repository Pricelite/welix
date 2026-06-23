import { getAuthenticatedUser } from "@/lib/auth";
import { getAccountSnapshot } from "@/lib/billing";
import { jsonError, jsonSuccess } from "@/lib/http";
import { listClientsForUser, listInvoicesForUser, listQuotesForUser } from "@/lib/workspace";
import type { WeliWorkspaceSnapshot } from "@/lib/weli/types";

export async function GET() {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      return jsonSuccess({ workspace: null });
    }

    const [{ profile }, clients, quotes, invoices] = await Promise.all([
      getAccountSnapshot(user.id),
      listClientsForUser(user.id),
      listQuotesForUser(user.id),
      listInvoicesForUser(user.id),
    ]);

    const workspace: WeliWorkspaceSnapshot = {
      companyName: profile?.company_name || null,
      trade: profile?.trade || null,
      userName: profile?.full_name || user.email || null,
      clientCount: clients.filter((client) => !client.archivedAt).length,
      quoteCount: quotes.length,
      invoiceCount: invoices.length,
      revenue: invoices.reduce((sum, invoice) => sum + invoice.total, 0),
      latestClients: clients.slice(0, 3).map((client) => ({
        id: client.id,
        name: client.name,
        city: client.city,
      })),
      latestQuotes: quotes.slice(0, 3).map((quote) => ({
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        clientName: quote.clientName,
        status: quote.status,
        total: quote.total,
      })),
      latestInvoices: invoices.slice(0, 3).map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        status: invoice.status,
        total: invoice.total,
      })),
    };

    return jsonSuccess({ workspace });
  } catch (error) {
    return jsonError(error, "Impossible de charger le contexte Weli");
  }
}
