"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import React, { FormEvent, MouseEvent, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthScreenProps = {
  mode: "connexion" | "inscription";
  errorCode?: string;
};

const callbackMessages: Record<string, string> = {
  missing_code: "Le lien de connexion est incomplet. Réessaie depuis l'email reçu.",
  auth_callback_failed:
    "La validation du lien a échoué. Réessaie ou demande un nouvel email.",
};

export function AuthScreen({ mode, errorCode }: AuthScreenProps) {
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
        setMessage(error.message);
      } else if (isSignup) {
        setMessage("Compte créé. Vérifie ton email pour confirmer l'inscription.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setMessage("La connexion est indisponible pour le moment. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page auth-page-immersive">
      <Link className="brand auth-brand auth-brand-overlay" href="/">
        <span className="brand-mark">W</span>
        <span>Welix</span>
      </Link>

      <section className="auth-layout auth-layout-immersive">
        <div className="auth-hero-frame">
          <Image
            alt="Présentation Welix avec tableau de bord clients, devis et relances"
            className="auth-hero-image"
            fill
            priority
            sizes="100vw"
            src="/images/auth-hero-premium.png"
          />
          <div className="auth-hero-overlay" />

          <div className="auth-proof auth-proof-floating">
            <CheckCircle2 size={18} />
            <span>Moins d&apos;administratif, plus de temps pour le chantier</span>
          </div>

          <form className="auth-panel auth-panel-floating" onSubmit={submitAuth}>
            <div className="auth-panel-head">
              <Sparkles size={20} />
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
              <input name="email" type="email" placeholder="vous@entreprise.fr" required />
            </label>

            <label htmlFor={passwordFieldId}>
              Mot de passe
              <div className="password-field">
                <input
                  className="password-field-input"
                  id={passwordFieldId}
                  ref={passwordInputRef}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  required
                />
                <button
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="password-field-toggle"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={togglePasswordVisibility}
                  type="button"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {isSignup ? (
              <label>
                Métier principal
                <select name="trade" defaultValue="">
                  <option value="" disabled>
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

            <button className="primary-button auth-submit" type="submit" disabled={loading}>
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
                {isSignup ? "Créer un compte" : "Se connecter"}
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
