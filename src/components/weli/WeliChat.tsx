"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { ArrowUpRight, BrainCircuit, Send, Trash2, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { WeliAvatar } from "@/components/weli/WeliAvatar";
import type { WeliExpression } from "@/components/weli/WeliAnimations";
import { formatCurrency } from "@/lib/format";
import type {
  WeliActiveContext,
  WeliExpertise,
  WeliMemoryItem,
  WeliQuickAction,
  WeliSuggestedAction,
  WeliWorkspaceSnapshot,
} from "@/lib/weli/types";

export type WeliMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  expertise?: WeliExpertise;
};

type WeliChatProps = {
  open: boolean;
  expression: WeliExpression;
  messages: WeliMessage[];
  quickActions: WeliQuickAction[];
  pageLabel: string;
  objective: string;
  expertise: WeliExpertise;
  memory: WeliMemoryItem[];
  workspace: WeliWorkspaceSnapshot | null;
  activeContext: WeliActiveContext | null;
  suggestedActions: WeliSuggestedAction[];
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onApplySuggestedAction: (action: WeliSuggestedAction) => void;
  onForgetMemory: (itemId: string) => void;
  onClearMemory: () => void;
};

export function WeliChat({
  open,
  expression,
  messages,
  quickActions,
  pageLabel,
  objective,
  expertise,
  memory,
  workspace,
  activeContext,
  suggestedActions,
  onClose,
  onSendMessage,
  onApplySuggestedAction,
  onForgetMemory,
  onClearMemory,
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
            <p>Weli agit comme un collègue : il guide, anticipe, structure et aide à valider.</p>
          </div>

          <div className="weli-quick-actions">
            <span>Expertise active</span>
            <button type="button">
              <BrainCircuit size={14} />
              {expertise}
            </button>
          </div>

          <div className="weli-quick-actions">
            <span>Objectif</span>
            <button type="button">
              <ArrowUpRight size={14} />
              {objective}
            </button>
          </div>

          {workspace ? (
            <div className="weli-quick-actions">
              <span>Contexte Welix</span>
              <button type="button">
                <ArrowUpRight size={14} />
                {workspace.companyName || "Votre entreprise"}
                {workspace.trade ? ` · ${workspace.trade}` : ""}
              </button>
              <button type="button">
                <ArrowUpRight size={14} />
                {workspace.clientCount} clients · {workspace.quoteCount} devis · {workspace.invoiceCount} factures
              </button>
              <button type="button">
                <ArrowUpRight size={14} />
                CA suivi : {formatCurrency(workspace.revenue)}
              </button>
              {workspace.latestQuotes[0] ? (
                <button type="button">
                  <ArrowUpRight size={14} />
                  Dernier devis : {workspace.latestQuotes[0].quoteNumber} · {workspace.latestQuotes[0].clientName}
                </button>
              ) : null}
            </div>
          ) : null}

          {activeContext?.client || activeContext?.quote ? (
            <div className="weli-quick-actions">
              <span>Contexte actif</span>
              {activeContext.client ? (
                <button type="button">
                  <ArrowUpRight size={14} />
                  Client : {activeContext.client.name}
                  {activeContext.client.city ? ` · ${activeContext.client.city}` : ""}
                </button>
              ) : null}
              {activeContext.quote ? (
                <button type="button">
                  <ArrowUpRight size={14} />
                  Devis : {activeContext.quote.quoteNumber} · {activeContext.quote.clientName}
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="weli-quick-actions">
            <span>Suggestions</span>
            {quickActions.map((action) => (
              <button key={action.id} onClick={() => onSendMessage(action.prompt)} type="button">
                <ArrowUpRight size={14} />
                {action.label}
              </button>
            ))}
          </div>

          <div className="weli-quick-actions">
            <span>Actions préparées</span>
            {suggestedActions.map((action) => (
              <button key={action.id} onClick={() => onApplySuggestedAction(action)} type="button">
                <ArrowUpRight size={14} />
                {action.label}
              </button>
            ))}
          </div>

          <div className="weli-quick-actions">
            <div className="weli-memory-head">
              <span>Mémoire Weli</span>
              {memory.length ? (
                <button onClick={onClearMemory} type="button">
                  <Trash2 size={14} />
                  Effacer
                </button>
              ) : null}
            </div>
            {memory.length ? (
              memory.slice(0, 4).map((item) => (
                <button key={item.id} onClick={() => onForgetMemory(item.id)} type="button">
                  <ArrowUpRight size={14} />
                  {item.label} : {item.value}
                </button>
              ))
            ) : (
              <button type="button">
                <ArrowUpRight size={14} />
                Aucune préférence mémorisée pour le moment
              </button>
            )}
          </div>
        </aside>

        <section className="weli-chat-main">
          <div className="weli-chat-stream">
            {messages.map((message) => (
              <article
                className={`weli-chat-message ${message.role === "assistant" ? "assistant" : "user"}`}
                key={message.id}
              >
                <span>{message.role === "assistant" ? (message.expertise ? `Weli · ${message.expertise}` : "Weli") : "Vous"}</span>
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
              placeholder="Demande un devis, une relance, une analyse ou une aide précise..."
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
