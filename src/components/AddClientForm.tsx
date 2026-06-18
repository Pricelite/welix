"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Loader2, Plus } from "lucide-react";

export function AddClientForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submitClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      contact: String(formData.get("contact") || ""),
      email: String(formData.get("email") || ""),
      city: String(formData.get("city") || ""),
    };

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const raw = await response.text();
      const data = raw ? (JSON.parse(raw) as { error?: string }) : {};

      if (!response.ok) {
        setError(data.error || `Impossible de créer le client (${response.status}).`);
        return;
      }

      form.reset();
      setSuccess("Client créé avec succès.");
      router.refresh();
    } catch {
      setError("Impossible de créer le client pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="workspace-panel simple-form-panel" onSubmit={submitClient}>
      <div className="panel-title">
        <div>
          <h2>Ajouter un client</h2>
          <p>Crée une première fiche client pour alimenter ton espace.</p>
        </div>
      </div>
      <div className="simple-form-grid">
        <label>
          Nom du client
          <input name="name" placeholder="Maison Laurent" required />
        </label>
        <label>
          Contact
          <input name="contact" placeholder="Claire Laurent" />
        </label>
        <label>
          Email
          <input name="email" type="email" placeholder="contact@client.fr" />
        </label>
        <label>
          Ville
          <input name="city" placeholder="Lyon" />
        </label>
      </div>
      {success ? <p className="auth-success">{success}</p> : null}
      {error ? <p className="auth-error">{error}</p> : null}
      <button className="secondary-button small-button" type="submit" disabled={loading}>
        {loading ? <Loader2 className="spin-icon" size={16} /> : <Plus size={16} />}
        Ajouter
      </button>
    </form>
  );
}
