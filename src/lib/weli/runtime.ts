import type { ClientRecord, QuoteRecord } from "@/lib/workspace";
import type { WeliActiveContext, WeliActiveClientContext, WeliActiveQuoteContext } from "@/lib/weli/types";

type WeliSelectionEventDetail = Partial<WeliActiveContext>;

function canUseWindow() {
  return typeof window !== "undefined";
}

export function buildWeliClientContext(client: ClientRecord): WeliActiveClientContext {
  return {
    id: client.id,
    name: client.name,
    city: client.city,
    email: client.email,
    contact: client.contact,
  };
}

export function buildWeliQuoteContext(quote: QuoteRecord): WeliActiveQuoteContext {
  return {
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    clientId: quote.clientId,
    clientName: quote.clientName,
    status: quote.status,
    total: quote.total,
    trade: quote.trade,
  };
}

export function dispatchWeliSelection(detail: WeliSelectionEventDetail) {
  if (!canUseWindow()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<WeliSelectionEventDetail>("weli:selection", {
      detail,
    }),
  );
}

export function clearWeliSelection() {
  dispatchWeliSelection({
    client: null,
    quote: null,
  });
}
