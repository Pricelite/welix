import { beforeEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

describe("health api route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      NEXT_PUBLIC_APP_URL: "https://welix.test",
      NODE_ENV: "production",
      HEALTHCHECK_TOKEN: "secret-health-token",
    };
    headersMock.mockResolvedValue(
      new Headers({
        authorization: "Bearer wrong-token",
      }),
    );
  });

  it("redacts detailed checks in production without the token", async () => {
    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.checks).toBeUndefined();
    expect(body.productionMode).toBe(true);
    expect(body.appUrl).toBe("https://welix.test");
  });

  it("returns detailed checks when the bearer token matches", async () => {
    headersMock.mockResolvedValue(
      new Headers({
        authorization: "Bearer secret-health-token",
      }),
    );

    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.checks).toBeDefined();
    expect(body.checks.supabase.publicUrl).toBe(true);
  });
});
