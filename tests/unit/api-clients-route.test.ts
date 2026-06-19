import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthenticatedUser = vi.fn();
const fetchClientRecord = vi.fn();
const createSupabaseAdminClient = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthenticatedUser,
}));

vi.mock("@/lib/crm-server", async () => {
  const actual = await vi.importActual<typeof import("@/lib/crm-server")>("@/lib/crm-server");
  return {
    ...actual,
    fetchClientRecord,
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

describe("clients api routes", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("creates a client with sanitized values", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    fetchClientRecord.mockResolvedValue({ id: "client-1", name: "Maison Laurent" });

    const insertChain = createThenableQuery({ data: { id: "client-1" }, error: null });
    const admin = {
      from: vi.fn((table: string) => {
        if (table === "clients") {
          return insertChain;
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };
    createSupabaseAdminClient.mockReturnValue(admin);

    const { POST } = await import("@/app/api/clients/route");
    const response = await POST(
      new Request("http://localhost/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Maison Laurent",
          contact: "<b>Claire</b>",
          email: "claire@example.com",
          city: "Lyon",
        }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        name: "Maison Laurent",
        contact: "Claire",
      }),
    );
    expect(body.ok).toBe(true);
    expect(body.client).toEqual({ id: "client-1", name: "Maison Laurent" });
  });

  it("refuses deletion when dependent quotes or invoices exist", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });

    const quotesChain = createThenableQuery({ count: 1, error: null });
    const invoicesChain = createThenableQuery({ count: 0, error: null });
    const clientsChain = createThenableQuery({ error: null });

    const admin = {
      from: vi.fn((table: string) => {
        if (table === "quotes") {
          return quotesChain;
        }

        if (table === "invoices") {
          return invoicesChain;
        }

        if (table === "clients") {
          return clientsChain;
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };
    createSupabaseAdminClient.mockReturnValue(admin);

    const { DELETE } = await import("@/app/api/clients/[id]/route");
    const response = await DELETE(new Request("http://localhost/api/clients/client-1"), {
      params: Promise.resolve({ id: "client-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toMatch(/Archive-le plutôt que de le supprimer/i);
  });
});
