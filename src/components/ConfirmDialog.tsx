"use client";

import React, { memo } from "react";
import { AlertTriangle } from "lucide-react";

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
    <div className="overlay-backdrop" role="presentation">
      <div
        aria-describedby="confirm-dialog-description"
        aria-modal="true"
        className="overlay-card confirm-card"
        role="dialog"
      >
        <div className={`confirm-icon ${tone}`}>
          <AlertTriangle size={18} />
        </div>
        <div>
          <h2>{title}</h2>
          <p id="confirm-dialog-description">{description}</p>
        </div>
        <div className="overlay-actions">
          <button className="secondary-button small-button" onClick={onCancel} type="button">
            {cancelLabel}
          </button>
          <button
            className={`small-button ${tone === "danger" ? "danger-button" : "primary-button"}`}
            disabled={busy}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export const ConfirmDialog = memo(ConfirmDialogComponent);
