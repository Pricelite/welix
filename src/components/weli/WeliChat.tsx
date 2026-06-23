"use client";

import React from "react";
import { FormEvent, useMemo, useState } from "react";
import { ArrowUpRight, Send, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { WeliAvatar } from "@/components/weli/WeliAvatar";
import type { WeliExpression } from "@/components/weli/WeliAnimations";

export type WeliMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type WeliChatProps = {
  open: boolean;
  expression: WeliExpression;
  messages: WeliMessage[];
  quickActions: string[];
  pageLabel: string;
  onClose: () => void;
  onSendMessage: (message: string) => void;
};

function isStringMessage(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function WeliChat({
  open,
  expression,
  messages,
  quickActions,
  pageLabel,
  onClose,
  onSendMessage,
}: WeliChatProps) {
  const [draft, setDraft] = useState("");

  const title = useMemo(() => `Weli pour ${pageLabel}`, [pageLabel]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();

    if (!trimmed) {
      return;
    }

    onSendMessage(trimmed);
    setDraft("");
  }

  return (
    <Modal className="weli-chat-modal" onClose={onClose} open={open}>
      <button
        aria-label="Fermer Weli"
        className="landing-auth-close weli-chat-close"
        onClick={onClose}
        type="button"
      >
        <X size={18} />
      </button>

      <div className="weli-chat-layout">
        <aside className="weli-chat-aside">
          <WeliAvatar compact expression={expression} />
          <div>
            <p className="weli-kicker">Compagnon IA Welix</p>
            <h2>{title}</h2>
            <p>
              Weli guide les nouveaux utilisateurs, répond aux questions métier et prépare
              l&apos;architecture d&apos;une future intégration OpenAI.
            </p>
          </div>

          <div className="weli-quick-actions">
            <span>Suggestions</span>
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => {
                  if (isStringMessage(action)) {
                    onSendMessage(action);
                  }
                }}
                type="button"
              >
                <ArrowUpRight size={14} />
                {action}
              </button>
            ))}
          </div>
        </aside>

        <section className="weli-chat-main">
          <div className="weli-chat-stream">
            {messages.map((message) => (
              <article
                className={`weli-chat-message ${message.role === "assistant" ? "assistant" : "user"}`}
                key={message.id}
              >
                <span>{message.role === "assistant" ? "Weli" : "Vous"}</span>
                <p>{message.content}</p>
              </article>
            ))}
          </div>

          <form className="weli-chat-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="weli-message">
              Message pour Weli
            </label>
            <input
              id="weli-message"
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Pose une question ou demande une aide précise..."
              value={draft}
            />
            <button type="submit">
              <Send size={15} />
              Envoyer
            </button>
          </form>
        </section>
      </div>
    </Modal>
  );
}
