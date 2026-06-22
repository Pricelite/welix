"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import React, { FormEvent, MouseEvent, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthPanelProps = {
  mode: "connexion" | "inscription";
  errorCode?: string;
  variant?: "page" | "modal";
};

const callbackMessages: Record<string, string> = {
  missing_code: "Le lien de connexion est incomplet. Réessaie depuis l'email reçu.",
  auth_callback_failed:
    "La validation du lien a échoué. Réessaie ou demande un nouvel email.",
};

function getReadableSupabaseError(message: string) {
  const normalizedMessage = message.trim();

  if (/invalid login credentials|invalid_credentials/i.test(normalizedMessage)) {
    return "Email ou mot de passe incorrect.";
  }

  if (/email not confirmed/i.test(normalizedMessage)) {
    return "Ton email n'est pas encore confirmé. Vérifie ta boîte mail.";
  }

  if (/signup is disabled/i.test(normalizedMessage)) {
    return "La création de compte est désactivée pour le moment.";
  }

  if (/user already registered/i.test(normalizedMessage)) {
    return "Un compte existe déjà avec cet email.";
  }

  return normalizedMessage;
}

function getReadableAuthError(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    const normalizedMessage = error.message.trim();

    if (
      /failed to fetch|fetch failed|networkerror|network request failed|load failed/i.test(
        normalizedMessage,
      )
    ) {
      return "Impossible de joindre la connexion sécurisée. Vérifie Internet puis réessaie.";
    }

    if (/invalid public environment|supabaseurl is required|anon key/i.test(normalizedMessage)) {
      return "La configuration de connexion Supabase est incomplète sur cette instance.";
    }

    return normalizedMessage;
  }

  return "La connexion est indisponible pour le moment. Réessaie dans un instant.";
}

export function AuthPanel({ mode, errorCode, variant = "page" }: AuthPanelProps) {
  const isSignup = mode === "inscription";
  const passwordFieldId = isSignup ? "signup-password" : "login-password";
  const router = useRouter();
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const callbackMessage = errorCode ? callbackMessages[errorCode] || "" : "";

  function togglePasswordVisibility(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const input = passwordInputRef.current;

    if (!input) {
      setShowPassword((current) => !current);
      return;
    }

    const nextVisible = input.type === "password";
    input.type = nextVisible ? "text" : "password";
    setShowPassword(nextVisible);
    input.focus({ preventScroll: true });
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const company = String(formData.get("company") || "").trim();
    const trade = String(formData.get("trade") || "").trim();

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = isSignup
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: redirectTo,
              data: {
                company_name: company || null,
                trade: trade || null,
              },
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(getReadableSupabaseError(error.message));
      } else if (isSignup) {
        setMessage("Compte créé. Vérifie ton email pour confirmer l'inscription.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      console.error("AuthPanel submitAuth failed", error);
      setMessage(getReadableAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className={`auth-panel ${variant === "modal" ? "auth-panel-modal" : "auth-panel-floating"}`}
      onSubmit={submitAuth}
    >
      <div className="auth-panel-head">
        <Sparkles size={18} />
        <div>
          <h2>{isSignup ? "Inscription" : "Connexion"}</h2>
          <p>
            {isSignup
              ? "Essayez Welix avec vos propres prestations."
              : "Accédez à votre tableau de bord Welix."}
          </p>
        </div>
      </div>

      {isSignup ? (
        <label>
          Nom de l&apos;entreprise
          <input name="company" placeholder="Bernard Rénovation" />
        </label>
      ) : null}

      <label>
        Email professionnel
        <input name="email" placeholder="vous@entreprise.fr" required type="email" />
      </label>

      <label htmlFor={passwordFieldId}>
        Mot de passe
        <div className="password-field">
          <input
            className="password-field-input"
            id={passwordFieldId}
            name="password"
            placeholder="Mot de passe"
            ref={passwordInputRef}
            required
            type={showPassword ? "text" : "password"}
          />
          <button
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="password-field-toggle"
            onClick={togglePasswordVisibility}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>

      {isSignup ? (
        <label>
          Métier principal
          <select defaultValue="" name="trade">
            <option disabled value="">
              Sélectionner
            </option>
            <option>Plomberie</option>
            <option>Électricité</option>
            <option>Peinture</option>
            <option>Maçonnerie</option>
            <option>Menuiserie</option>
            <option>Couverture</option>
          </select>
        </label>
      ) : null}

      {callbackMessage ? <p className="auth-error">{callbackMessage}</p> : null}
      {message ? <p className="auth-error">{message}</p> : null}

      <button className="primary-button auth-submit" disabled={loading} type="submit">
        {loading ? <Loader2 className="spin-icon" size={17} /> : null}
        {isSignup ? "Créer mon compte" : "Se connecter"}
        <ArrowRight size={17} />
      </button>

      {!isSignup ? (
        <p className="auth-switch">
          <Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
        </p>
      ) : null}

      <p className="auth-switch">
        {isSignup ? "Déjà un compte ?" : "Pas encore inscrit ?"}{" "}
        <Link href={isSignup ? "/connexion" : "/inscription"}>
          {isSignup ? "Se connecter" : "Créer un compte"}
        </Link>
      </p>
    </form>
  );
}
