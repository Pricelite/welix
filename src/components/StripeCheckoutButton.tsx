"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export function StripeCheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setError(data.error || "Impossible de démarrer le paiement pour le moment.");
    } catch {
      setError("Impossible de démarrer le paiement pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="primary-button large-button" type="button" onClick={checkout}>
        {loading ? <Loader2 className="spin-icon" size={18} /> : <ArrowRight size={18} />}
        Passer à Pro
      </button>
      {error ? <p className="auth-error">{error}</p> : null}
    </>
  );
}
