"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export function StripeCheckoutButton() {
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "pro" }),
    });
    const data = (await response.json()) as { url?: string; error?: string };
    setLoading(false);

    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <button className="primary-button large-button" type="button" onClick={checkout}>
      {loading ? <Loader2 className="spin-icon" size={18} /> : <ArrowRight size={18} />}
      Passer à Pro
    </button>
  );
}
