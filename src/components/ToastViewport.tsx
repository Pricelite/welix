"use client";

import React, { memo } from "react";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

export type ToastItem = {
  id: string;
  title: string;
  message: string;
  tone: "success" | "error";
};

function ToastViewportComponent({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <LazyMotion features={domAnimation}>
      <div aria-live="polite" className="toast-viewport">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <m.article
              animate={{ opacity: 1, x: 0, y: 0 }}
              className={`toast-card ${toast.tone}`}
              exit={{ opacity: 0, x: 24, scale: 0.98 }}
              initial={{ opacity: 0, x: 24, y: 10 }}
              key={toast.id}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
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
            </m.article>
          ))}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}

export const ToastViewport = memo(ToastViewportComponent);
