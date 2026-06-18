"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ResetPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function bootstrapRecovery() {
      try {
        const supabase = createSupabaseBrowserClient();
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("Lien de réinitialisation invalide ou expiré.");
        }

        if (active) {
          setReady(true);
        }
      } catch (sessionError) {
        if (active) {
          setError(
            sessionError instanceof Error
              ? sessionError.message
              : "Lien de réinitialisation invalide ou expiré.",
          );
        }
      }
    }

    bootstrapRecovery();

    return () => {
      active = false;
    };
  }, []);

  async function submitNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage("Mot de passe mis à jour. Tu peux maintenant te reconnecter.");
        window.setTimeout(() => {
          router.push("/connexion");
          router.refresh();
        }, 1200);
      }
    } catch {
      setError("Impossible de mettre à jour le mot de passe pour le moment.");
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
          <p className="section-kicker">Sécurité</p>
          <h1>Choisis un nouveau mot de passe.</h1>
          <p>Une fois validé, tu pourras revenir sur la page de connexion normalement.</p>
          <div className="auth-proof">
            <CheckCircle2 size={18} />
            <span>Utilise au moins 8 caractères avec un chiffre et un symbole</span>
          </div>
        </div>

        <form className="auth-panel" onSubmit={submitNewPassword}>
          <div className="auth-panel-head">
            <Sparkles size={20} />
            <div>
              <h2>Nouveau mot de passe</h2>
              <p>Le lien reçu par email ouvre cette page de réinitialisation.</p>
            </div>
          </div>

          <label>
            Nouveau mot de passe
            <input
              name="password"
              type="password"
              placeholder="Nouveau mot de passe"
              required
              disabled={!ready}
            />
          </label>

          <label>
            Confirmer le mot de passe
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirmer le mot de passe"
              required
              disabled={!ready}
            />
          </label>

          {message ? <p className="auth-success">{message}</p> : null}
          {error ? <p className="auth-error">{error}</p> : null}

          <button
            className="primary-button auth-submit"
            type="submit"
            disabled={loading || !ready}
          >
            {loading ? <Loader2 className="spin-icon" size={17} /> : null}
            Enregistrer
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
