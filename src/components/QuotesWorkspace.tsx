"use client";

import React, { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ToastItem, ToastViewport } from "@/components/ToastViewport";
import { formatCurrency } from "@/lib/format";
import type { ClientRecord, QuoteRecord } from "@/lib/workspace";

type QuoteDraft = {
  clientId: string;
  trade: string;
  description: string;
  material: string;
  labor: string;
  estimatedTime: string;
  recommendedPrice: string;
  vatRate: string;
  status: string;
};

const quoteStatuses = ["Brouillon", "Envoyé", "Accepté", "Refusé", "Payé"] as const;
const pageSize = 7;

function buildToast(title: string, message: string, tone: ToastItem["tone"]): ToastItem {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    message,
    tone,
  };
}

function getStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case "accepté":
    case "accepte":
      return "status-accepte";
    case "envoyé":
    case "envoye":
      return "status-envoye";
    case "refusé":
    case "refuse":
      return "status-relance";
    case "payé":
    case "paye":
      return "status-accepte";
    default:
      return "status-brouillon";
  }
}

function createEmptyQuoteDraft(clients: ClientRecord[]): QuoteDraft {
  return {
    clientId: clients.find((client) => !client.archivedAt)?.id || clients[0]?.id || "",
    trade: "Général",
    description: "",
    material: "",
    labor: "",
    estimatedTime: "",
    recommendedPrice: "0",
    vatRate: "10",
    status: "Brouillon",
  };
}

function buildQuotePayload(draft: QuoteDraft) {
  const recommendedPrice = Number(draft.recommendedPrice || 0);
  const vatRate = Number(draft.vatRate || 0);
  const vatAmount = Number(((recommendedPrice * vatRate) / 100).toFixed(2));
  const total = Number((recommendedPrice + vatAmount).toFixed(2));

  return {
    clientId: draft.clientId,
    trade: draft.trade,
    description: draft.description,
    material: draft.material,
    labor: draft.labor,
    estimatedTime: draft.estimatedTime,
    recommendedPrice,
    vatRate,
    vatAmount,
    total,
    status: draft.status,
  };
}

function toDraft(quote: QuoteRecord): QuoteDraft {
  return {
    clientId: quote.clientId || "",
    trade: quote.trade || "Général",
    description: quote.description,
    material: quote.material || "",
    labor: quote.labor || "",
    estimatedTime: quote.estimatedTime || "",
    recommendedPrice: String(quote.recommendedPrice),
    vatRate: String(quote.vatRate || 10),
    status: quote.status,
  };
}

export function QuotesWorkspace({
  initialQuotes,
  clients,
}: {
  initialQuotes: QuoteRecord[];
  clients: ClientRecord[];
}) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "amount" | "client">("recent");
  const [page, setPage] = useState(1);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<QuoteDraft>(createEmptyQuoteDraft(clients));
  const [saving, setSaving] = useState(false);
  const [deletingQuoteId, setDeletingQuoteId] = useState<string | null>(null);
  const [busyQuoteId, setBusyQuoteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [listPulse, setListPulse] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setQuotes(initialQuotes);
  }, [initialQuotes]);

  useEffect(() => {
    if (!toasts.length) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 3800);

    return () => window.clearTimeout(timer);
  }, [toasts]);

  const activeClients = useMemo(() => clients.filter((client) => !client.archivedAt), [clients]);
  const filteredQuotes = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return quotes
      .filter((quote) => {
        if (statusFilter !== "all" && quote.status !== statusFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const haystack = [
          quote.quoteNumber,
          quote.clientName,
          quote.trade,
          quote.description,
          quote.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .sort((left, right) => {
        if (sortBy === "amount") {
          return right.total - left.total;
        }

        if (sortBy === "client") {
          return left.clientName.localeCompare(right.clientName, "fr");
        }

        return (right.createdAt || "").localeCompare(left.createdAt || "");
      });
  }, [deferredQuery, quotes, sortBy, statusFilter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredQuotes.length / pageSize)), [filteredQuotes]);
  const safePage = Math.min(page, totalPages);
  const visibleQuotes = useMemo(
    () => filteredQuotes.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredQuotes, safePage],
  );

  const showToast = useCallback((title: string, message: string, tone: ToastItem["tone"]) => {
    setToasts((current) => [...current, buildToast(title, message, tone)]);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingQuoteId("new");
    setDraft(createEmptyQuoteDraft(clients));
  }, [clients]);

  const openEditModal = useCallback((quote: QuoteRecord) => {
    setEditingQuoteId(quote.id);
    setDraft(toDraft(quote));
  }, []);

  const closeModal = useCallback(() => {
    if (saving) {
      return;
    }

    setEditingQuoteId(null);
  }, [saving]);

  async function submitQuote() {
    if (!draft.clientId || !draft.description.trim()) {
      showToast(
        "Informations manquantes",
        "Choisis un client et renseigne une description avant d'enregistrer le devis.",
        "error",
      );
      return;
    }

    const payload = buildQuotePayload(draft);
    const snapshot = quotes;

    setSaving(true);
    setListPulse(true);

    try {
      const response = await fetch(
        editingQuoteId === "new" ? "/api/quotes" : `/api/quotes/${editingQuoteId}`,
        {
          method: editingQuoteId === "new" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            editingQuoteId === "new"
              ? payload
              : {
                  clientId: payload.clientId,
                  trade: payload.trade,
                  description: payload.description,
                  material: payload.material,
                  labor: payload.labor,
                  estimatedTime: payload.estimatedTime,
                  recommendedPrice: payload.recommendedPrice,
                  vatRate: payload.vatRate,
                  vat: payload.vatAmount,
                  total: payload.total,
                  status: payload.status,
                },
          ),
        },
      );
      const data = (await response.json()) as { error?: string; quote?: QuoteRecord };

      if (!response.ok || !data.quote) {
        showToast("Action annulée", data.error || "Impossible d'enregistrer le devis.", "error");
        return;
      }

      const nextQuote = data.quote;
      setQuotes((current) =>
        editingQuoteId === "new"
          ? [nextQuote, ...current]
          : current.map((quote) => (quote.id === nextQuote.id ? nextQuote : quote)),
      );
      setEditingQuoteId(null);
      showToast(
        editingQuoteId === "new" ? "Devis créé" : "Devis mis à jour",
        editingQuoteId === "new"
          ? "Le devis a bien été ajouté."
          : "Les modifications du devis ont été enregistrées.",
        "success",
      );
    } catch {
      setQuotes(snapshot);
      showToast("Erreur réseau", "Le devis n'a pas pu être enregistré.", "error");
    } finally {
      setSaving(false);
      window.setTimeout(() => setListPulse(false), 500);
    }
  }

  async function updateStatus(quote: QuoteRecord, status: string) {
    const snapshot = quotes;
    setBusyQuoteId(quote.id);
    setQuotes((current) =>
      current.map((item) => (item.id === quote.id ? { ...item, status } : item)),
    );

    try {
      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json()) as { error?: string; quote?: QuoteRecord };

      if (!response.ok || !data.quote) {
        setQuotes(snapshot);
        showToast(
          "Statut inchangé",
          data.error || "Impossible de changer le statut du devis.",
          "error",
        );
        return;
      }

      const nextQuote = data.quote;
      setQuotes((current) =>
        current.map((item) => (item.id === nextQuote.id ? nextQuote : item)),
      );
      showToast(
        "Statut mis à jour",
        `Le devis est maintenant en statut ${status.toLowerCase()}.`,
        "success",
      );
    } catch {
      setQuotes(snapshot);
      showToast("Erreur réseau", "Le statut n'a pas pu être mis à jour.", "error");
    } finally {
      setBusyQuoteId(null);
    }
  }

  async function duplicateQuote(quote: QuoteRecord) {
    setBusyQuoteId(quote.id);

    try {
      const response = await fetch(`/api/quotes/${quote.id}/duplicate`, {
        method: "POST",
      });
      const data = (await response.json()) as { error?: string; quote?: QuoteRecord };

      if (!response.ok || !data.quote) {
        showToast(
          "Duplication refusée",
          data.error || "Impossible de dupliquer le devis.",
          "error",
        );
        return;
      }

      setQuotes((current) => [data.quote as QuoteRecord, ...current]);
      showToast("Devis dupliqué", "Une copie du devis a été créée en brouillon.", "success");
    } catch {
      showToast("Erreur réseau", "La duplication n'a pas pu être finalisée.", "error");
    } finally {
      setBusyQuoteId(null);
    }
  }

  async function deleteQuote() {
    if (!deletingQuoteId) {
      return;
    }

    const snapshot = quotes;
    setBusyQuoteId(deletingQuoteId);
    setQuotes((current) => current.filter((quote) => quote.id !== deletingQuoteId));

    try {
      const response = await fetch(`/api/quotes/${deletingQuoteId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setQuotes(snapshot);
        showToast(
          "Suppression impossible",
          data.error || "Le devis n'a pas pu être supprimé.",
          "error",
        );
        return;
      }

      setDeletingQuoteId(null);
      showToast("Devis supprimé", "Le devis a été supprimé définitivement.", "success");
    } catch {
      setQuotes(snapshot);
      showToast("Erreur réseau", "La suppression n'a pas pu être finalisée.", "error");
    } finally {
      setBusyQuoteId(null);
    }
  }

  const preview = useMemo(() => buildQuotePayload(draft), [draft]);

  return (
    <>
      <section className="workspace-panel crm-toolbar-panel">
        <div className="crm-toolbar">
          <div className="crm-filters">
            <label className="search-box crm-search-box">
              <Search size={17} />
              <span className="sr-only">Rechercher un devis</span>
              <input
                onChange={(event) => {
                  const value = event.target.value;
                  startTransition(() => {
                    setPage(1);
                    setQuery(value);
                  });
                }}
                placeholder="Rechercher un devis"
                value={query}
              />
            </label>

            <select
              className="crm-select"
              onChange={(event) => {
                const nextFilter = event.target.value;
                startTransition(() => {
                  setPage(1);
                  setStatusFilter(nextFilter);
                });
              }}
              value={statusFilter}
            >
              <option value="all">Tous les statuts</option>
              {quoteStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              className="crm-select"
              onChange={(event) => {
                const nextSort = event.target.value as "recent" | "amount" | "client";
                startTransition(() => setSortBy(nextSort));
              }}
              value={sortBy}
            >
              <option value="recent">Tri : plus récents</option>
              <option value="amount">Tri : montant</option>
              <option value="client">Tri : client</option>
            </select>
          </div>

          <button className="primary-button small-button" onClick={openCreateModal} type="button">
            <Plus size={16} />
            Créer un devis
          </button>
        </div>
      </section>

      <section className={`workspace-panel crm-list-panel ${listPulse ? "is-pulsing" : ""}`}>
        <div className="panel-title">
          <div>
            <h2>Tous les devis</h2>
            <p>
              {filteredQuotes.length
                ? `${filteredQuotes.length} devis dans la vue actuelle`
                : "Aucun devis ne correspond à cette recherche"}
            </p>
          </div>
        </div>

        {listPulse ? (
          <div className="crm-inline-skeleton" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        ) : null}

        {visibleQuotes.length ? (
          <>
            <div className="app-table detailed-table crm-table">
              {visibleQuotes.map((quote) => (
                <div className="app-table-row crm-table-row" key={quote.id}>
                  <div>
                    <strong>{quote.quoteNumber}</strong>
                    <span>{quote.date || "-"}</span>
                  </div>
                  <span>{quote.clientName}</span>
                  <span>{quote.trade || "-"}</span>
                  <strong>{formatCurrency(quote.amount)}</strong>
                  <select
                    className={`crm-status-select ${getStatusClass(quote.status)}`}
                    disabled={busyQuoteId === quote.id}
                    onChange={(event) => updateStatus(quote, event.target.value)}
                    value={quote.status}
                  >
                    {quoteStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <div className="card-actions inline-actions">
                    <button
                      className="secondary-button small-button"
                      onClick={() => openEditModal(quote)}
                      type="button"
                    >
                      <Pencil size={15} />
                      Modifier
                    </button>
                    <button
                      className="secondary-button small-button"
                      disabled={busyQuoteId === quote.id}
                      onClick={() => duplicateQuote(quote)}
                      type="button"
                    >
                      <Copy size={15} />
                      Dupliquer
                    </button>
                    <button
                      className="danger-button small-button"
                      disabled={busyQuoteId === quote.id}
                      onClick={() => setDeletingQuoteId(quote.id)}
                      type="button"
                    >
                      <Trash2 size={15} />
                      Supprimer
                    </button>
                    <button
                      aria-label={`Envoyer ${quote.quoteNumber}`}
                      className="icon-button"
                      onClick={() => updateStatus(quote, "Envoyé")}
                      type="button"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination-bar">
              <span>
                Page {safePage} sur {totalPages}
              </span>
              <div className="button-cluster">
                <button
                  className="secondary-button small-button"
                  disabled={safePage === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  type="button"
                >
                  <ChevronLeft size={15} />
                  Précédent
                </button>
                <button
                  className="secondary-button small-button"
                  disabled={safePage === totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  type="button"
                >
                  Suivant
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state-panel">
            <Send size={22} />
            <strong>Aucun devis à afficher</strong>
            <p>Crée un devis, duplique un modèle existant ou ajuste tes filtres pour le retrouver.</p>
            <button className="secondary-button small-button" onClick={openCreateModal} type="button">
              <Plus size={15} />
              Créer un devis
            </button>
          </div>
        )}
      </section>

      {editingQuoteId ? (
        <div className="overlay-backdrop" role="presentation">
          <div
            aria-modal="true"
            className="overlay-card form-overlay-card quote-form-card"
            role="dialog"
          >
            <div className="panel-title">
              <div>
                <h2>{editingQuoteId === "new" ? "Créer un devis" : "Modifier le devis"}</h2>
                <p>Prépare un document professionnel, clair pour le client et simple à suivre.</p>
              </div>
            </div>

            <div className="simple-form-grid quote-dialog-grid">
              <label>
                Client
                <select
                  className="crm-select"
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, clientId: event.target.value }))
                  }
                  value={draft.clientId}
                >
                  {activeClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Métier
                <input
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, trade: event.target.value }))
                  }
                  value={draft.trade}
                />
              </label>
              <label className="quote-dialog-full">
                Description
                <textarea
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={4}
                  value={draft.description}
                />
              </label>
              <label className="quote-dialog-full">
                Matériel
                <textarea
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, material: event.target.value }))
                  }
                  rows={3}
                  value={draft.material}
                />
              </label>
              <label className="quote-dialog-full">
                {"Main d'œuvre"}
                <textarea
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, labor: event.target.value }))
                  }
                  rows={3}
                  value={draft.labor}
                />
              </label>
              <label>
                Temps estimé
                <input
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, estimatedTime: event.target.value }))
                  }
                  placeholder="1 journée"
                  value={draft.estimatedTime}
                />
              </label>
              <label>
                Statut
                <select
                  className="crm-select"
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, status: event.target.value }))
                  }
                  value={draft.status}
                >
                  {quoteStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Sous-total HT
                <input
                  inputMode="decimal"
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, recommendedPrice: event.target.value }))
                  }
                  value={draft.recommendedPrice}
                />
              </label>
              <label>
                TVA (%)
                <input
                  inputMode="decimal"
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, vatRate: event.target.value }))
                  }
                  value={draft.vatRate}
                />
              </label>
            </div>

            <div className="quote-preview-strip">
              <div>
                <span>TVA calculée</span>
                <strong>{formatCurrency(preview.vatAmount)}</strong>
              </div>
              <div>
                <span>Total TTC</span>
                <strong>{formatCurrency(preview.total)}</strong>
              </div>
            </div>

            <div className="overlay-actions">
              <button className="secondary-button small-button" onClick={closeModal} type="button">
                Annuler
              </button>
              <button
                className="primary-button small-button"
                disabled={saving}
                onClick={submitQuote}
                type="button"
              >
                {editingQuoteId === "new" ? "Créer le devis" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        busy={busyQuoteId === deletingQuoteId}
        confirmLabel="Supprimer définitivement"
        description="Cette action retire le devis de Welix. Si une facture y est liée, l'API refusera la suppression pour protéger l'historique."
        onCancel={() => setDeletingQuoteId(null)}
        onConfirm={deleteQuote}
        open={Boolean(deletingQuoteId)}
        title="Supprimer ce devis ?"
        tone="danger"
      />

      <ToastViewport
        onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
        toasts={toasts}
      />
    </>
  );
}
