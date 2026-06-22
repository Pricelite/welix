import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ClientRecord = {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  city: string | null;
  revenue: number;
  archivedAt: string | null;
  lastQuoteId: string | null;
  lastQuoteNumber: string | null;
  createdAt: string | null;
};

export type QuoteRecord = {
  id: string;
  quoteNumber: string;
  clientId: string | null;
  clientName: string;
  trade: string | null;
  status: string;
  date: string | null;
  description: string;
  material: string | null;
  labor: string | null;
  estimatedTime: string | null;
  recommendedPrice: number;
  vatRate: number;
  subtotal: number;
  vat: number;
  total: number;
  amount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  quoteId: string | null;
  quoteNumber: string | null;
  status: string;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  subtotal: number;
  vat: number;
  total: number;
  amount: number;
  createdAt: string | null;
};

export type DashboardNotification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "success" | "warning" | "info";
};

export type DashboardGoal = {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
};

export type DashboardSnapshot = {
  metrics: {
    revenue: number;
    clientCount: number;
    quoteCount: number;
    invoiceCount: number;
    pendingQuotes: number;
  };
  monthlyRevenue: Array<{
    month: string;
    value: number;
  }>;
  activity: Array<{
    id: string;
    title: string;
    detail: string;
    time: string;
  }>;
  notifications: DashboardNotification[];
  goals: DashboardGoal[];
  latestQuotes: QuoteRecord[];
  latestInvoices: InvoiceRecord[];
};

type ClientQueryRow = {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  city: string | null;
  revenue: number | null;
  archived_at: string | null;
  created_at: string | null;
  last_quote_id: string | null;
  last_quote: { quote_number: string | null }[] | { quote_number: string | null } | null;
};

type QuoteQueryRow = {
  id: string;
  quote_number: string;
  client_id: string | null;
  trade: string | null;
  status: string;
  date: string | null;
  description: string;
  material: string | null;
  labor: string | null;
  estimated_time: string | null;
  recommended_price: number | null;
  vat_rate: number | null;
  subtotal: number | null;
  vat: number | null;
  total: number | null;
  amount: number | null;
  created_at: string | null;
  updated_at: string | null;
  client: { id: string; name: string | null }[] | { id: string; name: string | null } | null;
};

type InvoiceQueryRow = {
  id: string;
  invoice_number: string;
  client_id: string;
  quote_id: string | null;
  status: string;
  issued_at: string | null;
  due_at: string | null;
  paid_at: string | null;
  subtotal: number | null;
  vat: number | null;
  total: number | null;
  amount: number | null;
  created_at: string | null;
  client: { id: string; name: string | null }[] | { id: string; name: string | null } | null;
  quote: { quote_number: string | null }[] | { quote_number: string | null } | null;
};

type BasicClientRow = Omit<ClientQueryRow, "last_quote">;
type BasicQuoteRow = Omit<QuoteQueryRow, "client">;
type BasicInvoiceRow = Omit<InvoiceQueryRow, "client" | "quote">;

const clientSelect =
  "id, name, contact, email, city, revenue, archived_at, created_at, last_quote_id, last_quote:quotes!clients_last_quote_id_fkey(quote_number)";
const quoteSelect =
  "id, quote_number, client_id, trade, status, date, description, material, labor, estimated_time, recommended_price, vat_rate, subtotal, vat, total, amount, created_at, updated_at, client:clients!quotes_client_id_fkey(id, name)";
const invoiceSelect =
  "id, invoice_number, client_id, quote_id, status, issued_at, due_at, paid_at, subtotal, vat, total, amount, created_at, client:clients!invoices_client_id_fkey(id, name), quote:quotes!invoices_quote_id_fkey(quote_number)";
const clientBaseSelect =
  "id, name, contact, email, city, revenue, archived_at, created_at, last_quote_id";
const quoteBaseSelect =
  "id, quote_number, client_id, trade, status, date, description, material, labor, estimated_time, recommended_price, vat_rate, subtotal, vat, total, amount, created_at, updated_at";
const invoiceBaseSelect =
  "id, invoice_number, client_id, quote_id, status, issued_at, due_at, paid_at, subtotal, vat, total, amount, created_at";

function pickSingle<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function isMissingSchemaResource(message: string) {
  return /schema cache|could not find the table|relationship between/i.test(message);
}

function formatRelativeTime(dateValue: string | null) {
  if (!dateValue) {
    return "Date inconnue";
  }

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} min`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `Il y a ${diffHours} h`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
}

function normalizeClient(row: ClientQueryRow): ClientRecord {
  const lastQuote = pickSingle(row.last_quote);

  return {
    id: row.id,
    name: row.name,
    contact: row.contact,
    email: row.email,
    city: row.city,
    revenue: row.revenue ?? 0,
    archivedAt: row.archived_at,
    lastQuoteId: row.last_quote_id,
    lastQuoteNumber: lastQuote?.quote_number ?? null,
    createdAt: row.created_at,
  };
}

function normalizeQuote(row: QuoteQueryRow): QuoteRecord {
  const client = pickSingle(row.client);

  return {
    id: row.id,
    quoteNumber: row.quote_number,
    clientId: row.client_id,
    clientName: client?.name || "Client non renseigne",
    trade: row.trade,
    status: row.status,
    date: row.date,
    description: row.description,
    material: row.material,
    labor: row.labor,
    estimatedTime: row.estimated_time,
    recommendedPrice: row.recommended_price ?? 0,
    vatRate: row.vat_rate ?? 0,
    subtotal: row.subtotal ?? 0,
    vat: row.vat ?? 0,
    total: row.total ?? 0,
    amount: row.amount ?? row.total ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeInvoice(row: InvoiceQueryRow): InvoiceRecord {
  const client = pickSingle(row.client);
  const quote = pickSingle(row.quote);

  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    clientId: row.client_id,
    clientName: client?.name || "Client non renseigne",
    quoteId: row.quote_id,
    quoteNumber: quote?.quote_number ?? null,
    status: row.status,
    issuedAt: row.issued_at,
    dueAt: row.due_at,
    paidAt: row.paid_at,
    subtotal: row.subtotal ?? 0,
    vat: row.vat ?? 0,
    total: row.total ?? 0,
    amount: row.amount ?? row.total ?? 0,
    createdAt: row.created_at,
  };
}

function buildClientMap(clients: ClientRecord[]) {
  return new Map(clients.map((client) => [client.id, client]));
}

function buildQuoteMap(quotes: QuoteRecord[]) {
  return new Map(quotes.map((quote) => [quote.id, quote]));
}

function normalizeQuoteFromBasic(
  row: BasicQuoteRow,
  clientsById: Map<string, ClientRecord>,
): QuoteRecord {
  const client = row.client_id ? clientsById.get(row.client_id) : null;

  return normalizeQuote({
    ...row,
    client: client ? { id: client.id, name: client.name } : null,
  });
}

function normalizeInvoiceFromBasic(
  row: BasicInvoiceRow,
  clientsById: Map<string, ClientRecord>,
  quotesById: Map<string, QuoteRecord>,
): InvoiceRecord {
  const client = clientsById.get(row.client_id);
  const quote = row.quote_id ? quotesById.get(row.quote_id) : null;

  return normalizeInvoice({
    ...row,
    client: client ? { id: client.id, name: client.name } : null,
    quote: quote ? { quote_number: quote.quoteNumber } : null,
  });
}

export const listClientsForUser = cache(async (userId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clients")
    .select(clientSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error && isMissingSchemaResource(error.message)) {
    const fallback = await supabase
      .from("clients")
      .select(clientBaseSelect)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (fallback.error) {
      throw new Error(`Impossible de charger les clients: ${fallback.error.message}`);
    }

    return ((fallback.data as BasicClientRow[] | null) ?? []).map((row) =>
      normalizeClient({ ...row, last_quote: null }),
    );
  }

  if (error) {
    throw new Error(`Impossible de charger les clients: ${error.message}`);
  }

  return ((data as ClientQueryRow[] | null) ?? []).map(normalizeClient);
});

export const listQuotesForUser = cache(async (userId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(quoteSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error && isMissingSchemaResource(error.message)) {
    const fallback = await supabase
      .from("quotes")
      .select(quoteBaseSelect)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (fallback.error) {
      throw new Error(`Impossible de charger les devis: ${fallback.error.message}`);
    }

    const clientsById = buildClientMap(await listClientsForUser(userId));

    return ((fallback.data as BasicQuoteRow[] | null) ?? []).map((row) =>
      normalizeQuoteFromBasic(row, clientsById),
    );
  }

  if (error) {
    throw new Error(`Impossible de charger les devis: ${error.message}`);
  }

  return ((data as QuoteQueryRow[] | null) ?? []).map(normalizeQuote);
});

export const listInvoicesForUser = cache(async (userId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(invoiceSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error && /could not find the table/i.test(error.message)) {
    return [];
  }

  if (error && isMissingSchemaResource(error.message)) {
    const fallback = await supabase
      .from("invoices")
      .select(invoiceBaseSelect)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (fallback.error) {
      if (/could not find the table/i.test(fallback.error.message)) {
        return [];
      }

      throw new Error(`Impossible de charger les factures: ${fallback.error.message}`);
    }

    const clientsById = buildClientMap(await listClientsForUser(userId));
    const quotesById = buildQuoteMap(await listQuotesForUser(userId));

    return ((fallback.data as BasicInvoiceRow[] | null) ?? []).map((row) =>
      normalizeInvoiceFromBasic(row, clientsById, quotesById),
    );
  }

  if (error) {
    throw new Error(`Impossible de charger les factures: ${error.message}`);
  }

  return ((data as InvoiceQueryRow[] | null) ?? []).map(normalizeInvoice);
});

function buildGoals(revenue: number, clientCount: number, quoteCount: number): DashboardGoal[] {
  const revenueTarget = Math.max(5000, Math.ceil(Math.max(revenue, 1) / 5000) * 5000);
  const clientTarget = Math.max(10, Math.ceil(Math.max(clientCount, 1) / 10) * 10);
  const quoteTarget = Math.max(12, Math.ceil(Math.max(quoteCount, 1) / 12) * 12);

  return [
    {
      id: "revenue",
      label: "Objectif de chiffre d'affaires",
      current: revenue,
      target: revenueTarget,
      unit: "EUR",
    },
    {
      id: "clients",
      label: "Objectif de clients actifs",
      current: clientCount,
      target: clientTarget,
      unit: "clients",
    },
    {
      id: "quotes",
      label: "Objectif de devis emis",
      current: quoteCount,
      target: quoteTarget,
      unit: "devis",
    },
  ];
}

export const getDashboardSnapshot = cache(async (userId: string): Promise<DashboardSnapshot> => {
  const now = new Date();
  const lateInvoiceThreshold = now.toISOString().slice(0, 10);
  const [clients, quotes, invoices] = await Promise.all([
    listClientsForUser(userId),
    listQuotesForUser(userId),
    listInvoicesForUser(userId),
  ]);
  const activeClients = clients.filter((client) => !client.archivedAt);
  const latestQuotes = quotes.slice(0, 4);
  const latestInvoices = invoices.slice(0, 4);
  const acceptedQuote =
    quotes.find((quote) => quote.status.toLowerCase().includes("accept")) ?? null;
  const lateInvoice =
    invoices.find(
      (invoice) =>
        !invoice.status.toLowerCase().includes("pay") &&
        typeof invoice.dueAt === "string" &&
        invoice.dueAt < lateInvoiceThreshold,
    ) ?? null;
  const newestClient = activeClients[0] ?? null;
  const revenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);

  const metrics = {
    revenue: Number(revenue.toFixed(2)),
    clientCount: activeClients.length,
    quoteCount: quotes.length,
    invoiceCount: invoices.length,
    pendingQuotes: quotes.filter((quote) => !quote.status.toLowerCase().includes("accept")).length,
  };

  const monthlyRevenue = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index), 1);
    date.setHours(0, 0, 0, 0);

    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const value = invoices
      .filter((invoice) => {
        const createdAt = invoice.createdAt ? new Date(invoice.createdAt) : null;
        return (
          createdAt &&
          !Number.isNaN(createdAt.getTime()) &&
          `${createdAt.getFullYear()}-${createdAt.getMonth()}` === monthKey
        );
      })
      .reduce((sum, invoice) => sum + invoice.total, 0);

    return {
      month: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date),
      value,
    };
  });

  const activity = [
    ...latestQuotes.slice(0, 3).map((quote) => ({
      id: `quote-${quote.id}`,
      title: `Devis ${quote.status.toLowerCase()}`,
      detail: `${quote.quoteNumber} - ${quote.clientName}`,
      time: formatRelativeTime(quote.updatedAt || quote.createdAt),
    })),
    ...latestInvoices.slice(0, 2).map((invoice) => ({
      id: `invoice-${invoice.id}`,
      title: `Facture ${invoice.status.toLowerCase()}`,
      detail: `${invoice.invoiceNumber} - ${invoice.clientName}`,
      time: formatRelativeTime(invoice.paidAt || invoice.issuedAt || invoice.createdAt),
    })),
  ].slice(0, 5);

  const notifications: DashboardNotification[] = [];

  if (acceptedQuote) {
    notifications.push({
      id: `quote-${acceptedQuote.id}`,
      title: "Devis accepte",
      detail: `${acceptedQuote.clientName} a valide ${acceptedQuote.quoteNumber}.`,
      time: formatRelativeTime(acceptedQuote.updatedAt || acceptedQuote.createdAt),
      tone: "success",
    });
  }

  if (lateInvoice) {
    notifications.push({
      id: `invoice-${lateInvoice.id}`,
      title: "Facture en retard",
      detail: `${lateInvoice.invoiceNumber} attend encore un reglement client.`,
      time: formatRelativeTime(lateInvoice.dueAt),
      tone: "warning",
    });
  }

  if (newestClient) {
    notifications.push({
      id: `client-${newestClient.id}`,
      title: "Nouveau client ajoute",
      detail: `${newestClient.name} est maintenant visible dans la relation client.`,
      time: formatRelativeTime(newestClient.createdAt),
      tone: "info",
    });
  }

  return {
    metrics,
    monthlyRevenue,
    activity,
    notifications: notifications.slice(0, 3),
    goals: buildGoals(metrics.revenue, metrics.clientCount, metrics.quoteCount),
    latestQuotes,
    latestInvoices,
  };
});
