"use client";

import React from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";

type StripeCheckoutButtonProps = {
  action?: "checkout" | "portal" | "cancel" | "resume" | "upgrade" | "downgrade";
  label: string;
  plan?: "starter" | "pro";
  priceId?: string;
  variant?: "primary" | "secondary";
};

export function StripeCheckoutButton({
  action = "checkout",
  label,
  plan = "pro",
  priceId,
  variant = "primary",
}: StripeCheckoutButtonProps) {
  const mutation = useMutation({
    mutationFn: async () => {
      const endpoint = action === "checkout" ? "/api/stripe/checkout" : "/api/stripe/manage";
      const payload =
        action === "checkout"
          ? { plan }
          : {
              action,
              priceId,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Action Stripe indisponible");
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      window.location.reload();
    },
  });

  return (
    <>
      <button
        className={variant === "primary" ? "primary-button large-button" : "secondary-button large-button"}
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? <Loader2 className="spin-icon" size={18} /> : <ArrowRight size={18} />}
        {label}
      </button>
      {mutation.error ? <p className="auth-error">{mutation.error.message}</p> : null}
    </>
  );
}
