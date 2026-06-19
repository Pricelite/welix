"use client";

import { useEffect, useState } from "react";
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

  const filteredClients = clients
    .filter((client) => {
      if (visibility === "active" && client.archivedAt) {
        return false;
      }

      if (visibility === "archived" && !client.archivedAt) {
        return false;
      }

      if (!query.trim()) {
        return true;
      }

      const haystack = [client.name, client.contact, client.email, client.city]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query.trim().toLowerCase());
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

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleClients = filteredClients.slice((safePage - 1) * pageSize, safePage * pageSize);

  function showToast(title: string, message: string, tone: ToastItem["tone"]) {
    setToasts((current) => [...current, buildToast(title, message, tone)]);
  }

  function openCreateModal() {
    setEditingClientId("new");
    setDraft(emptyDraft);
  }

  function openEditModal(client: ClientRecord) {
    setEditingClientId(client.id);
    setDraft({
      name: client.name,
      contact: client.contact || "",
      email: client.email || "",
      city: client.city || "",
    });
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setEditingClientId(null);
    setDraft(emptyDraft);
  }

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
        showToast("Action annulée", data.error || "Impossible d'enregistrer le client.", "error");
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
        creating ? "Client créé" : "Client mis à jour",
        creating
          ? "La fiche client a bien été ajoutée."
          : "Les informations du client ont été enregistrées.",
        "success",
      );
    } catch {
      setClients(snapshot);
      showToast("Erreur réseau", "La modification n'a pas pu être enregistrée.", "error");
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
        showToast("Action refusée", data.error || "Impossible de mettre à jour le client.", "error");
        return;
      }

      const nextClient = data.client;
      setClients((current) =>
        current.map((item) => (item.id === nextClient.id ? nextClient : item)),
      );
      showToast(
        archived ? "Client archivé" : "Client restauré",
        archived
          ? "Le client a été retiré des listes actives."
          : "Le client est de nouveau visible dans les listes actives.",
        "success",
      );
    } catch {
      setClients(snapshot);
      showToast("Erreur réseau", "Impossible de mettre à jour l'état du client.", "error");
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
          data.error || "Le client n'a pas pu être supprimé.",
          "error",
        );
        return;
      }

      showToast("Client supprimé", "La fiche client a été supprimée définitivement.", "success");
      setDeletingClientId(null);
    } catch {
      setClients(snapshot);
      showToast("Erreur réseau", "La suppression n'a pas pu être finalisée.", "error");
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
                  setPage(1);
                  setQuery(event.target.value);
                }}
                placeholder="Rechercher un client"
                value={query}
              />
            </label>

            <select
              className="crm-select"
              onChange={(event) => {
                setPage(1);
                setVisibility(event.target.value as "active" | "archived" | "all");
              }}
              value={visibility}
            >
              <option value="active">Clients actifs</option>
              <option value="archived">{"Clients archivés"}</option>
              <option value="all">Tous les clients</option>
            </select>

            <select
              className="crm-select"
              onChange={(event) => setSortBy(event.target.value as "recent" | "name" | "revenue")}
              value={sortBy}
            >
              <option value="recent">{"Tri : plus récents"}</option>
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

      <section className={`workspace-panel crm-list-panel ${listPulse ? "is-pulsing" : ""}`}>
        <div className="panel-title">
          <div>
            <h2>Fiches clients</h2>
            <p>
              {filteredClients.length
                ? `${filteredClients.length} résultat(s) dans la vue actuelle`
                : "Aucun client ne correspond à cette recherche"}
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
                      {client.archivedAt ? (
                        <span className="status status-brouillon">Archivé</span>
                      ) : null}
                    </div>
                    <p>{client.contact || "Contact à renseigner"}</p>
                  </div>
                  <dl>
                    <div>
                      <dt>E-mail</dt>
                      <dd>{client.email || "À renseigner"}</dd>
                    </div>
                    <div>
                      <dt>Ville</dt>
                      <dd>{client.city || "À renseigner"}</dd>
                    </div>
                    <div>
                      <dt>CA signé</dt>
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
            <UsersRound size={22} />
            <strong>Aucun client à afficher</strong>
            <p>Ajoute une première fiche ou ajuste tes filtres pour retrouver un client.</p>
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
                <h2>{editingClientId === "new" ? "Créer un client" : "Modifier le client"}</h2>
                <p>Renseigne une fiche propre et complète pour faciliter le suivi commercial.</p>
              </div>
            </div>

            <div className="simple-form-grid">
              <label>
                Nom du client
                <input
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Maison Laurent"
                  value={draft.name}
                />
              </label>
              <label>
                Contact
                <input
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, contact: event.target.value }))
                  }
                  placeholder="Claire Laurent"
                  value={draft.contact}
                />
              </label>
              <label>
                E-mail
                <input
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="contact@client.fr"
                  type="email"
                  value={draft.email}
                />
              </label>
              <label>
                Ville
                <input
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, city: event.target.value }))
                  }
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
                {editingClientId === "new" ? "Créer le client" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        busy={busyClientId === deletingClientId}
        confirmLabel="Supprimer définitivement"
        description="Cette action retire la fiche client de Welix. Si des devis ou factures existent déjà, l'API refusera la suppression."
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
