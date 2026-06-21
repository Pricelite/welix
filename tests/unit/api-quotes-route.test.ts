import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthenticatedUser = vi.fn();
const fetchQuoteRecord = vi.fn();
const syncClientSnapshot = vi.fn();
const createSupabaseAdminClient = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthenticatedUser,
}));

vi.mock("@/lib/crm-server", async () => {
  const actual = await vi.importActual<typeof import("@/lib/crm-server")>("@/lib/crm-server");
  return {
    ...actual,
    fetchQuoteRecord,
    syncClientSnapshot,
  };
});

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient,
}));

type QueryResult = Record<string, unknown>;

function createThenableQuery(result: QueryResult) {
  const chain = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: QueryResult) => unknown) => Promise.resolve(result).then(resolve),
    catch: (reject: (reason: unknown) => unknown) => Promise.resolve(result).catch(reject),
  };

  return chain;
}

describe("quotes api routes", () => {
  const clientId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("creates a quote and synchronizes the client snapshot", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    fetchQuoteRecord.mockResolvedValue({ id: "quote-1", quoteNumber: "DEV-2026-001" });

    const clientLookupChain = createThenableQuery({ data: { id: clientId }, error: null });
    const insertQuoteChain = createThenableQuery({ data: { id: "quote-1" }, error: null });

    const admin = {
      from: vi.fn((table: string) => {
        if (table === "clients") {
          return clientLookupChain;
        }

        if (table === "quotes") {
          return insertQuoteChain;
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };
    createSupabaseAdminClient.mockReturnValue(admin);

    const { POST } = await import("@/app/api/quotes/route");
    const response = await POST(
      new Request("http://localhost/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          trade: "Plomberie",
          description: "Remplacement chauffe-eau 200L",
          material: "Chauffe-eau, raccords",
          labor: "Pose et raccordement",
          estimatedTime: "4 h",
          recommendedPrice: 1000,
          vatRate: 10,
          vatAmount: 100,
          total: 1100,
          status: "Brouillon",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(insertQuoteChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: clientId,
        trade: "Plomberie",
        total: 1100,
        subtotal: 1000,
      }),
    );
    expect(syncClientSnapshot).toHaveBeenCalledWith(admin, "user-1", clientId);
    expect(body.ok).toBe(true);
  }, 10000);

  it("blocks quote deletion when an invoice is linked", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    fetchQuoteRecord.mockResolvedValue({
      id: "quote-1",
      clientId: "client-1",
      total: 1100,
      recommendedPrice: 1000,
      vatRate: 10,
      status: "Brouillon",
    });

    const invoicesChain = createThenableQuery({ count: 1, error: null });
    const quotesChain = createThenableQuery({ error: null });

    const admin = {
      from: vi.fn((table: string) => {
        if (table === "invoices") {
          return invoicesChain;
        }

        if (table === "quotes") {
          return quotesChain;
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };
    createSupabaseAdminClient.mockReturnValue(admin);

    const { DELETE } = await import("@/app/api/quotes/[id]/route");
    const response = await DELETE(new Request("http://localhost/api/quotes/quote-1"), {
      params: Promise.resolve({ id: "quote-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toMatch(/déjà liée? à une facture/i);
  });
});
