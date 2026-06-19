"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import React, { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/reinitialiser-mot-de-passe`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage("Email envoyé. Ouvre le lien reçu pour choisir un nouveau mot de passe.");
      }
    } catch {
      setError("Impossible d'envoyer l'email pour le moment. Réessaie dans un instant.");
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
          <p className="section-kicker">Récupération</p>
          <h1>Récupérez votre accès.</h1>
          <p>
            Entrez votre email professionnel. Welix vous enverra un lien pour choisir un
            nouveau mot de passe.
          </p>
          <div className="auth-proof">
            <CheckCircle2 size={18} />
            <span>Le lien de réinitialisation arrive sur l&apos;email du compte</span>
          </div>
        </div>

        <form className="auth-panel" onSubmit={submitReset}>
          <div className="auth-panel-head">
            <Sparkles size={20} />
            <div>
              <h2>Mot de passe oublié</h2>
              <p>Nous vous envoyons un lien sécurisé pour repartir proprement.</p>
            </div>
          </div>

          <label>
            Email professionnel
            <input name="email" type="email" placeholder="vous@entreprise.fr" required />
          </label>

          {message ? <p className="auth-success">{message}</p> : null}
          {error ? <p className="auth-error">{error}</p> : null}

          <button className="primary-button auth-submit" type="submit" disabled={loading}>
            {loading ? <Loader2 className="spin-icon" size={17} /> : null}
            Envoyer le lien
            <ArrowRight size={17} />
          </button>

          <p className="auth-switch">
            <Link href="/connexion">Retour à la connexion</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
