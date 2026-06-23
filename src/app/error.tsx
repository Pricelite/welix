"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@/lib/monitoring";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, { area: "route-error", digest: error.digest });
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="section-kicker">Incident</p>
        <h1>Une erreur est survenue</h1>
        <p>Welix a journalisé le problème. Réessaie maintenant ou reviens dans quelques instants.</p>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => reset()} type="button">
            Réessayer
          </button>
          <a className="secondary-button" href="/dashboard">
            Retour au tableau de bord
          </a>
        </div>
      </section>
    </main>
  );
}

