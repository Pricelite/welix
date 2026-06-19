"use client";

import React from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

export type ToastItem = {
  id: string;
  title: string;
  message: string;
  tone: "success" | "error";
};

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div aria-live="polite" className="toast-viewport">
      {toasts.map((toast) => (
        <article className={`toast-card ${toast.tone}`} key={toast.id}>
          <div className="toast-icon">
            {toast.tone === "success" ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
          </div>
          <div className="toast-copy">
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button
            aria-label={`Fermer la notification ${toast.title}`}
            className="icon-button"
            onClick={() => onDismiss(toast.id)}
            type="button"
          >
            <X size={15} />
          </button>
        </article>
      ))}
    </div>
  );
}
