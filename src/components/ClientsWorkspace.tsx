"use client";

import React, { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ToastItem, ToastViewport } from "@/components/ToastViewport";
import { formatCurrency } from "@/lib/format";
import { buildWeliClientContext, clearWeliSelection, dispatchWeliSelection } from "@/lib/weli/runtime";
import { WELI_CREATE_CLIENT_STORAGE_KEY, WELI_OPEN_CLIENT_STORAGE_KEY } from "@/lib/weli/storage";
import type { ClientRecord } from "@/lib/workspace";

type ClientDraft = {
  name: string;
  contact: string;
  email: string;
  city: string;
};

const pageSize = 6;

const emptyDraft: ClientDraft = {
  name: "",
  contact: "",
  email: "",
  city: "",
};

function buildToast(title: string, message: string, tone: ToastItem["tone"]): ToastItem {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    message,
    tone,
  };
}

function createTempClient(draft: ClientDraft): ClientRecord {
  return {
    id: `temp-${Date.now()}`,
    name: draft.name,
    contact: draft.contact || null,
    email: draft.email || null,
    city: draft.city || null,
    revenue: 0,
    archivedAt: null,
    lastQuoteId: null,
    lastQuoteNumber: null,
    createdAt: new Date().toISOString(),
  };
}

export function ClientsWorkspace({ initialClients }: { initialClients: ClientRecord[] }) {
  const [clients, setClients] = useState(initialClients);
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState<"active" | "archived" | "all">("active");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "revenue">("recent");
  const [page, setPage] = useState(1);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ClientDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [busyClientId, setBusyClientId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [listPulse, setListPulse] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

  useEffect(() => {
    if (!toasts.length) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 3800);

    return () => window.clearTimeout(timer);
  }, [toasts]);

  const filteredClients = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return clients
      .filter((client) => {
        if (visibility === "active" && client.archivedAt) {
          return false;
        }

        if (visibility === "archived" && !client.archivedAt) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const haystack = [client.name, client.contact, client.email, client.city]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .sort((left, right) => {
        if (sortBy === "name") {
          return left.name.localeCompare(right.name, "fr");
        }

        if (sortBy === "revenue") {
          return right.revenue - left.revenue;
        }

        return (right.createdAt || "").localeCompare(left.createdAt || "");
      });
  }, [clients, deferredQuery, sortBy, visibility]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredClients.length / pageSize)), [filteredClients]);
  const safePage = Math.min(page, totalPages);
  const visibleClients = useMemo(
    () => filteredClients.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredClients, safePage],
  );
  const activeCount = useMemo(() => clients.filter((client) => !client.archivedAt).length, [clients]);
  const archivedCount = Math.max(clients.length - activeCount, 0);
  const revenueTotal = useMemo(() => clients.reduce((sum, client) => sum + client.revenue, 0), [clients]);

  const showToast = useCallback((title: string, message: string, tone: ToastItem["tone"]) => {
    setToasts((current) => [...current, buildToast(title, message, tone)]);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingClientId("new");
    setDraft(emptyDraft);
    dispatchWeliSelection({
      client: null,
      quote: null,
    });
  }, []);

  const openEditModal = useCallback((client: ClientRecord) => {
    setEditingClientId(client.id);
    setDraft({
      name: client.name,
      contact: client.contact || "",
      email: client.email || "",
      city: client.city || "",
    });
    dispatchWeliSelection({
      client: buildWeliClientContext(client),
      quote: null,
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const openPayload = window.sessionStorage.getItem(WELI_OPEN_CLIENT_STORAGE_KEY);
    const shouldOpen = window.sessionStorage.getItem(WELI_CREATE_CLIENT_STORAGE_KEY);

    if (openPayload) {
      try {
        const parsed = JSON.parse(openPayload) as { mode?: "create" | "edit"; id?: string };

        if (parsed.mode === "edit" && parsed.id) {
          const client = initialClients.find((entry) => entry.id === parsed.id);

          if (client) {
            openEditModal(client);
          }
        } else if (parsed.mode === "create") {
          openCreateModal();
        }
      } catch {
        // Ignore corrupted Weli navigation payload.
      } finally {
        window.sessionStorage.removeItem(WELI_OPEN_CLIENT_STORAGE_KEY);
      }
    } else if (shouldOpen === "open-create") {
      openCreateModal();
      window.sessionStorage.removeItem(WELI_CREATE_CLIENT_STORAGE_KEY);
    }
  }, [initialClients, openCreateModal, openEditModal]);

  const closeModal = useCallback(() => {
    if (saving) {
      return;
    }

    setEditingClientId(null);
    setDraft(emptyDraft);
    clearWeliSelection();
  }, [saving]);

  async function submitClient() {
    if (!draft.name.trim()) {
      showToast("Nom requis", "Renseigne un nom de client avant de continuer.", "error");
      return;
    }

    const creating = editingClientId === "new";
    const optimisticClient = createTempClient({ ...draft, name: draft.name.trim() });
    const snapshot = clients;

    setSaving(true);
    setListPulse(true);

    if (creating) {
      setClients((current) => [optimisticClient, ...current]);
    } else {
      setClients((current) =>
        current.map((client) =>
          client.id === editingClientId
            ? {
                ...client,
                name: draft.name.trim(),
                contact: draft.contact.trim() || null,
                email: draft.email.trim() || null,
                city: draft.city.trim() || null,
              }
            : client,
        ),
      );
    }

    try {
      const response = await fetch(creating ? "/api/clients" : `/api/clients/${editingClientId}`, {
        method: creating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await response.json()) as { error?: string; client?: ClientRecord };

      if (!response.ok || !data.client) {
        setClients(snapshot);
        showToast("Action annul\u00e9e", data.error || "Impossible d'enregistrer le client.", "error");
        return;
      }

      const nextClient = data.client;
      setClients((current) =>
        creating
          ? [nextClient, ...current.filter((client) => client.id !== optimisticClient.id)]
          : current.map((client) => (client.id === nextClient.id ? nextClient : client)),
      );
      setEditingClientId(null);
      setDraft(emptyDraft);
      showToast(
        creating ? "Client cr\u00e9\u00e9" : "Client mis \u00e0 jour",
        creating
          ? "La fiche client a bien \u00e9t\u00e9 ajout\u00e9e."
          : "Les informations du client ont \u00e9t\u00e9 enregistr\u00e9es.",
        "success",
      );
    } catch {
      setClients(snapshot);
      showToast("Erreur r\u00e9seau", "La modification n'a pas pu \u00eatre enregistr\u00e9e.", "error");
    } finally {
      setSaving(false);
      window.setTimeout(() => setListPulse(false), 500);
    }
  }

  async function toggleArchive(client: ClientRecord, archived: boolean) {
    const snapshot = clients;
    setBusyClientId(client.id);
    setListPulse(true);
    setClients((current) =>
      current.map((item) =>
        item.id === client.id
          ? {
              ...item,
              archivedAt: archived ? new Date().toISOString() : null,
            }
          : item,
      ),
    );

    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      const data = (await response.json()) as { error?: string; client?: ClientRecord };

      if (!response.ok || !data.client) {
        setClients(snapshot);
        showToast("Action refus\u00e9e", data.error || "Impossible de mettre \u00e0 jour le client.", "error");
        return;
      }

      const nextClient = data.client;
      setClients((current) => current.map((item) => (item.id === nextClient.id ? nextClient : item)));
      showToast(
        archived ? "Client archiv\u00e9" : "Client restaur\u00e9",
        archived
          ? "Le client a \u00e9t\u00e9 retir\u00e9 des listes actives."
          : "Le client est de nouveau visible dans les listes actives.",
        "success",
      );
    } catch {
      setClients(snapshot);
      showToast("Erreur r\u00e9seau", "Impossible de mettre \u00e0 jour l'\u00e9tat du client.", "error");
    } finally {
      setBusyClientId(null);
      window.setTimeout(() => setListPulse(false), 500);
    }
  }

  async function deleteClient() {
    if (!deletingClientId) {
      return;
    }

    const snapshot = clients;
    setBusyClientId(deletingClientId);
    setClients((current) => current.filter((client) => client.id !== deletingClientId));

    try {
      const response = await fetch(`/api/clients/${deletingClientId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setClients(snapshot);
        showToast(
          "Suppression impossible",
          data.error || "Le client n'a pas pu \u00eatre supprim\u00e9.",
          "error",
        );
        return;
      }

      showToast("Client supprim\u00e9", "La fiche client a \u00e9t\u00e9 supprim\u00e9e d\u00e9finitivement.", "success");
      setDeletingClientId(null);
    } catch {
      setClients(snapshot);
      showToast("Erreur r\u00e9seau", "La suppression n'a pas pu \u00eatre finalis\u00e9e.", "error");
    } finally {
      setBusyClientId(null);
    }
  }

  return (
    <>
      <section className="workspace-panel crm-toolbar-panel">
        <div className="crm-toolbar">
          <div className="crm-filters">
            <label className="search-box crm-search-box">
              <Search size={17} />
              <span className="sr-only">Rechercher un client</span>
              <input
                onChange={(event) => {
                  const value = event.target.value;
                  startTransition(() => {
                    setPage(1);
                    setQuery(value);
                  });
                }}
                placeholder="Rechercher un client"
                value={query}
              />
            </label>

            <select
              className="crm-select"
              onChange={(event) => {
                const nextVisibility = event.target.value as "active" | "archived" | "all";
                startTransition(() => {
                  setPage(1);
                  setVisibility(nextVisibility);
                });
              }}
              value={visibility}
            >
              <option value="active">Clients actifs</option>
              <option value="archived">{"Clients archiv\u00e9s"}</option>
              <option value="all">Tous les clients</option>
            </select>

            <select
              className="crm-select"
              onChange={(event) => {
                const nextSort = event.target.value as "recent" | "name" | "revenue";
                startTransition(() => setSortBy(nextSort));
              }}
              value={sortBy}
            >
              <option value="recent">{"Tri : plus r\u00e9cents"}</option>
              <option value="name">Tri : nom</option>
              <option value="revenue">{"Tri : chiffre d'affaires"}</option>
            </select>
          </div>

          <button className="primary-button small-button" onClick={openCreateModal} type="button">
            <Plus size={16} />
            Nouveau client
          </button>
        </div>
      </section>

      <section className="crm-stat-strip" aria-label="Synthese clients">
        <article className="crm-stat-card">
          <span>Clients actifs</span>
          <strong>{activeCount}</strong>
          <small>Espace visible au quotidien</small>
        </article>
        <article className="crm-stat-card">
          <span>Archives</span>
          <strong>{archivedCount}</strong>
          <small>Historique conserve</small>
        </article>
        <article className="crm-stat-card">
          <span>CA signe</span>
          <strong>{formatCurrency(revenueTotal)}</strong>
          <small>Projection relation client</small>
        </article>
      </section>

      <section className={`workspace-panel crm-list-panel ${listPulse ? "is-pulsing" : ""}`}>
        <div className="panel-title">
          <div>
            <h2>Fiches clients</h2>
            <p>
              {filteredClients.length
                ? `${filteredClients.length} r\u00e9sultat(s) dans la vue actuelle`
                : "Aucun client ne correspond \u00e0 cette recherche"}
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

        {visibleClients.length ? (
          <>
            <div className="client-grid">
              {visibleClients.map((client) => (
                <article
                  className={`client-card crm-card ${client.archivedAt ? "archived" : ""}`}
                  key={client.id}
                >
                  <div className="avatar">
                    <UsersRound size={18} />
                  </div>
                  <div>
                    <div className="crm-card-title">
                      <h3>{client.name}</h3>
                      {client.archivedAt ? <span className="status status-brouillon">Archiv\u00e9</span> : null}
                    </div>
                    <p>{client.contact || "Contact \u00e0 renseigner"}</p>
                  </div>
                  <dl>
                    <div>
                      <dt>E-mail</dt>
                      <dd>{client.email || "\u00c0 renseigner"}</dd>
                    </div>
                    <div>
                      <dt>Ville</dt>
                      <dd>{client.city || "\u00c0 renseigner"}</dd>
                    </div>
                    <div>
                      <dt>CA sign\u00e9</dt>
                      <dd>{formatCurrency(client.revenue)}</dd>
                    </div>
                    <div>
                      <dt>Dernier devis</dt>
                      <dd>{client.lastQuoteNumber || "Aucun devis"}</dd>
                    </div>
                  </dl>
                  <div className="card-actions">
                    <button
                      className="secondary-button small-button"
                      onClick={() => openEditModal(client)}
                      type="button"
                    >
                      <Pencil size={15} />
                      Modifier
                    </button>
                    <button
                      className="secondary-button small-button"
                      disabled={busyClientId === client.id}
                      onClick={() => toggleArchive(client, !client.archivedAt)}
                      type="button"
                    >
                      {client.archivedAt ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                      {client.archivedAt ? "Restaurer" : "Archiver"}
                    </button>
                    <button
                      className="danger-button small-button"
                      disabled={busyClientId === client.id}
                      onClick={() => setDeletingClientId(client.id)}
                      type="button"
                    >
                      <Trash2 size={15} />
                      Supprimer
                    </button>
                  </div>
                </article>
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
                  Pr\u00e9c\u00e9dent
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
          <div className="empty-state-panel premium-empty-state">
            <UsersRound size={22} />
            <strong>Aucun client \u00e0 afficher</strong>
            <p>Ajoute une premi\u00e8re fiche ou ajuste tes filtres pour retrouver un client.</p>
            <button className="secondary-button small-button" onClick={openCreateModal} type="button">
              <Plus size={15} />
              Ajouter un client
            </button>
          </div>
        )}
      </section>

      {editingClientId ? (
        <div className="overlay-backdrop" role="presentation">
          <div aria-modal="true" className="overlay-card form-overlay-card" role="dialog">
            <div className="panel-title">
              <div>
                <h2>{editingClientId === "new" ? "Cr\u00e9er un client" : "Modifier le client"}</h2>
                <p>Renseigne une fiche propre et compl\u00e8te pour faciliter le suivi commercial.</p>
              </div>
            </div>

            <div className="simple-form-grid premium-form-grid">
              <label>
                Nom du client
                <input
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Maison Laurent"
                  value={draft.name}
                />
              </label>
              <label>
                Contact
                <input
                  onChange={(event) => setDraft((current) => ({ ...current, contact: event.target.value }))}
                  placeholder="Claire Laurent"
                  value={draft.contact}
                />
              </label>
              <label>
                E-mail
                <input
                  onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                  placeholder="contact@client.fr"
                  type="email"
                  value={draft.email}
                />
              </label>
              <label>
                Ville
                <input
                  onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))}
                  placeholder="Lyon"
                  value={draft.city}
                />
              </label>
            </div>

            <div className="overlay-actions">
              <button className="secondary-button small-button" onClick={closeModal} type="button">
                Annuler
              </button>
              <button
                className="primary-button small-button"
                disabled={saving}
                onClick={submitClient}
                type="button"
              >
                {editingClientId === "new" ? "Cr\u00e9er le client" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        busy={busyClientId === deletingClientId}
        confirmLabel="Supprimer d\u00e9finitivement"
        description="Cette action retire la fiche client de Welix. Si des devis ou factures existent d\u00e9j\u00e0, l'API refusera la suppression."
        onCancel={() => setDeletingClientId(null)}
        onConfirm={deleteClient}
        open={Boolean(deletingClientId)}
        title="Supprimer ce client ?"
        tone="danger"
      />

      <ToastViewport
        onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
        toasts={toasts}
      />
    </>
  );
}
