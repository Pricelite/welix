import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthScreen } from "@/components/AuthScreen";

const push = vi.fn();
const refresh = vi.fn();
const signInWithPassword = vi.fn();
const signUp = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword,
      signUp,
    },
  }),
}));

describe("AuthScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to dashboard after successful sign in", async () => {
    signInWithPassword.mockResolvedValue({ error: null });

    render(<AuthScreen mode="connexion" />);
    fireEvent.change(screen.getByLabelText(/email professionnel/i), {
      target: { value: "artisan@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^mot de passe$/i), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/dashboard");
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("shows a confirmation message after successful sign up", async () => {
    signUp.mockResolvedValue({ error: null });

    render(<AuthScreen mode="inscription" />);
    fireEvent.change(screen.getByLabelText(/nom de l'entreprise/i), {
      target: { value: "Martin Rénovation" },
    });
    fireEvent.change(screen.getByLabelText(/email professionnel/i), {
      target: { value: "artisan@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^mot de passe$/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/métier principal/i), {
      target: { value: "Plomberie" },
    });
    fireEvent.click(screen.getByRole("button", { name: /créer mon compte/i }));

    expect(
      await screen.findByText(/compte créé\. vérifie ton email pour confirmer l'inscription\./i),
    ).toBeInTheDocument();
  });
  it("toggles the password visibility", () => {
    render(<AuthScreen mode="connexion" />);

    const passwordInput = screen.getByLabelText(/^mot de passe$/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: /afficher le mot de passe/i }));
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: /masquer le mot de passe/i }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
