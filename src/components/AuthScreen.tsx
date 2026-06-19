"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import React, { FormEvent, useState } from "react";
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const callbackMessage = errorCode ? callbackMessages[errorCode] || "" : "";

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
    <main className="auth-page">
      <Link className="brand auth-brand" href="/">
        <span className="brand-mark">W</span>
        <span>Welix</span>
      </Link>

      <section className="auth-layout">
        <div className="auth-copy">
          <p className="section-kicker">Assistant devis IA</p>
          <h1>{isSignup ? "Créez votre espace artisan." : "Retour à l'atelier."}</h1>
          <p>
            Gérez les clients, préparez les devis, suivez les relances et gardez une image
            professionnelle sans perdre vos soirées sur l&apos;administratif.
          </p>
          <div className="auth-proof">
            <CheckCircle2 size={18} />
            <span>Configuration initiale en moins de 4 minutes</span>
          </div>
        </div>

        <form className="auth-panel" onSubmit={submitAuth}>
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
          <label>
            Mot de passe
            <input name="password" type="password" placeholder="Mot de passe" required />
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
              {isSignup ? "Se connecter" : "Créer un compte"}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
