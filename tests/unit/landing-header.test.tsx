import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { LandingHeader } from "@/components/LandingHeader";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  }),
}));

describe("LandingHeader", () => {
  it("opens the login modal when clicking Connexion", () => {
    render(<LandingHeader />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^connexion$/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /connexion/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email professionnel/i)).toBeInTheDocument();
  });
});
