"use client";

import React, { memo } from "react";
import { domAnimation, LazyMotion, m } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "neutral";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmDialogComponent({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Annuler",
  tone = "neutral",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={{ opacity: 1 }}
        className="overlay-backdrop"
        initial={{ opacity: 0 }}
        role="presentation"
      >
        <m.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          aria-describedby="confirm-dialog-description"
          aria-modal="true"
          className="overlay-card confirm-card"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          role="dialog"
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={`confirm-icon ${tone}`}>
            <AlertTriangle size={18} />
          </div>
          <div className="confirm-copy">
            <h2>{title}</h2>
            <p id="confirm-dialog-description">{description}</p>
          </div>
          <div className="overlay-actions">
            <Button onClick={onCancel} size="sm" variant="secondary">
              {cancelLabel}
            </Button>
            <Button
              disabled={busy}
              onClick={onConfirm}
              size="sm"
              variant={tone === "danger" ? "danger" : "primary"}
            >
              {confirmLabel}
            </Button>
          </div>
        </m.div>
      </m.div>
    </LazyMotion>
  );
}

export const ConfirmDialog = memo(ConfirmDialogComponent);
