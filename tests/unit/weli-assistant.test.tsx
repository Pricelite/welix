import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WeliProvider } from "@/components/weli/WeliProvider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("WeliAssistant", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (input: string | URL | Request) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

        if (url.includes("/api/weli/memory")) {
          return {
            ok: true,
            json: async () => ({ memories: [] }),
          };
        }

        return {
          ok: true,
          json: async () => ({ workspace: null }),
        };
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the mascot from the provider and opens the assistant modal", async () => {
    render(
      <WeliProvider>
        <div>Page de test</div>
      </WeliProvider>,
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(screen.getByTestId("weli-assistant")).toBeInTheDocument();
    expect(screen.getByText(/bonjour, je suis weli\./i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /ouvrir l'assistant weli/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /weli pour la landing page/i })).toBeInTheDocument();
    expect(screen.getByText(/compagnon ia welix/i)).toBeInTheDocument();
    expect(screen.getAllByText(/expert welix/i).length).toBeGreaterThan(0);
  });
});
