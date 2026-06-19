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

function pickSingle<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
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
    clientName: client?.name || "Client non renseign\u00e9",
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
    clientName: client?.name || "Client non renseign\u00e9",
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

const clientSelect =
  "id, name, contact, email, city, revenue, archived_at, created_at, last_quote_id, last_quote:quotes!clients_last_quote_id_fkey(quote_number)";
const quoteSelect =
  "id, quote_number, client_id, trade, status, date, description, material, labor, estimated_time, recommended_price, vat_rate, subtotal, vat, total, amount, created_at, updated_at, client:clients!quotes_client_id_fkey(id, name)";
const invoiceSelect =
  "id, invoice_number, client_id, quote_id, status, issued_at, due_at, paid_at, subtotal, vat, total, amount, created_at, client:clients!invoices_client_id_fkey(id, name), quote:quotes!invoices_quote_id_fkey(quote_number)";

export const listClientsForUser = cache(async (userId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clients")
    .select(clientSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

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
      label: "Objectif de devis émis",
      current: quoteCount,
      target: quoteTarget,
      unit: "devis",
    },
  ];
}

export const getDashboardSnapshot = cache(async (userId: string): Promise<DashboardSnapshot> => {
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const lateInvoiceThreshold = now.toISOString().slice(0, 10);
  const revenueWindowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

  const [
    { count: clientCount, error: clientCountError },
    { count: quoteCount, error: quoteCountError },
    { count: invoiceCount, error: invoiceCountError },
    { count: pendingQuotes, error: pendingQuotesError },
    { data: latestQuotesRows, error: latestQuotesError },
    { data: latestInvoicesRows, error: latestInvoicesError },
    { data: acceptedQuoteRow, error: acceptedQuoteError },
    { data: lateInvoiceRow, error: lateInvoiceError },
    { data: newestClientRow, error: newestClientError },
    { data: revenueWindowRows, error: revenueWindowError },
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("archived_at", null),
    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .neq("status", "Accepté"),
    supabase
      .from("quotes")
      .select(quoteSelect)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("invoices")
      .select(invoiceSelect)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("quotes")
      .select(quoteSelect)
      .eq("user_id", userId)
      .eq("status", "Accepté")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("invoices")
      .select(invoiceSelect)
      .eq("user_id", userId)
      .neq("status", "Payé")
      .lt("due_at", lateInvoiceThreshold)
      .order("due_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("clients")
      .select(clientSelect)
      .eq("user_id", userId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("invoices")
      .select("total, created_at")
      .eq("user_id", userId)
      .gte("created_at", revenueWindowStart),
  ]);

  if (
    clientCountError ||
    quoteCountError ||
    invoiceCountError ||
    pendingQuotesError ||
    latestQuotesError ||
    latestInvoicesError ||
    acceptedQuoteError ||
    lateInvoiceError ||
    newestClientError ||
    revenueWindowError
  ) {
    throw new Error(
      [
        clientCountError,
        quoteCountError,
        invoiceCountError,
        pendingQuotesError,
        latestQuotesError,
        latestInvoicesError,
        acceptedQuoteError,
        lateInvoiceError,
        newestClientError,
        revenueWindowError,
      ]
        .filter(Boolean)
        .map((error) => error?.message)
        .join(" | "),
    );
  }

  const latestQuotes = ((latestQuotesRows as QuoteQueryRow[] | null) ?? []).map(normalizeQuote);
  const latestInvoices = ((latestInvoicesRows as InvoiceQueryRow[] | null) ?? []).map(normalizeInvoice);
  const acceptedQuote = acceptedQuoteRow ? normalizeQuote(acceptedQuoteRow as QuoteQueryRow) : null;
  const lateInvoice = lateInvoiceRow ? normalizeInvoice(lateInvoiceRow as InvoiceQueryRow) : null;
  const newestClient = newestClientRow ? normalizeClient(newestClientRow as ClientQueryRow) : null;
  const revenueRows = (revenueWindowRows as Array<{ total: number | null; created_at: string | null }> | null) ?? [];
  const revenue = revenueRows.reduce((sum, invoice) => sum + (invoice.total ?? 0), 0);

  const metrics = {
    revenue: Number(revenue.toFixed(2)),
    clientCount: clientCount ?? 0,
    quoteCount: quoteCount ?? 0,
    invoiceCount: invoiceCount ?? 0,
    pendingQuotes: pendingQuotes ?? 0,
  };

  const monthlyRevenue = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index), 1);
    date.setHours(0, 0, 0, 0);

    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const value = revenueRows
      .filter((invoice) => {
        const createdAt = invoice.created_at ? new Date(invoice.created_at) : null;
        return (
          createdAt &&
          !Number.isNaN(createdAt.getTime()) &&
          `${createdAt.getFullYear()}-${createdAt.getMonth()}` === monthKey
        );
      })
      .reduce((sum, invoice) => sum + (invoice.total ?? 0), 0);

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
      title: "Devis accepté",
      detail: `${acceptedQuote.clientName} a validé ${acceptedQuote.quoteNumber}.`,
      time: formatRelativeTime(acceptedQuote.updatedAt || acceptedQuote.createdAt),
      tone: "success",
    });
  }

  if (lateInvoice) {
    notifications.push({
      id: `invoice-${lateInvoice.id}`,
      title: "Facture en retard",
      detail: `${lateInvoice.invoiceNumber} attend encore un règlement client.`,
      time: formatRelativeTime(lateInvoice.dueAt),
      tone: "warning",
    });
  }

  if (newestClient) {
    notifications.push({
      id: `client-${newestClient.id}`,
      title: "Nouveau client ajouté",
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
