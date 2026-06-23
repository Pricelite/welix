import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { WeliProvider } from "@/components/weli/WeliProvider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("WeliAssistant", () => {
  it("renders the mascot from the provider and opens the assistant modal", () => {
    render(
      <WeliProvider>
        <div>Page de test</div>
      </WeliProvider>,
    );

    expect(screen.getByTestId("weli-assistant")).toBeInTheDocument();
    expect(screen.getByText(/bonjour, je suis weli\./i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /ouvrir l'assistant weli/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /weli pour la landing page/i })).toBeInTheDocument();
  });
});

