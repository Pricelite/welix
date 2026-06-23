"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Euro,
  Hammer,
  Loader2,
  PackageCheck,
  Percent,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { WELI_CREATE_QUOTE_STORAGE_KEY, type WeliQuotePrefill } from "@/lib/weli/storage";

type GeneratedQuote = {
  description: string;
  material: string;
  labor: string;
  estimatedTime: string;
  recommendedPrice: number;
  vatRate: number;
  vatAmount: number;
  total: number;
};

type ClientOption = {
  id: string;
  name: string;
};

const fallbackQuote: GeneratedQuote = {
  description:
    "Remplacement d'un chauffe-eau \u00e9lectrique 200 L avec d\u00e9pose de l'ancien \u00e9quipement, raccordements et contr\u00f4le de mise en service.",
  material:
    "Chauffe-eau 200 L, groupe de s\u00e9curit\u00e9, raccords di\u00e9lectriques, flexibles, fixations et consommables.",
  labor:
    "D\u00e9pose, \u00e9vacuation, pose du nouveau ballon, raccordement hydraulique et \u00e9lectrique, essais.",
  estimatedTime: "3 h 30",
  recommendedPrice: 1280,
  vatRate: 10,
  vatAmount: 128,
  total: 1408,
};

export function AiQuoteGenerator({ clients }: { clients: ClientOption[] }) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [prompt, setPrompt] = useState("Remplacement d'un chauffe-eau 200 L");
  const [status, setStatus] = useState<"done" | "generating">("generating");
  const [quote, setQuote] = useState<GeneratedQuote>(fallbackQuote);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "saving">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedPrefill =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(WELI_CREATE_QUOTE_STORAGE_KEY)
        : null;

    if (storedPrefill) {
      try {
        const parsed = JSON.parse(storedPrefill) as WeliQuotePrefill;
        if (typeof parsed.prompt === "string" && parsed.prompt.trim()) {
          setPrompt(parsed.prompt.trim());
        }
        if (typeof parsed.clientId === "string" && parsed.clientId.trim()) {
          setClientId(parsed.clientId);
        }
      } catch {
        // ignore corrupted prefill
      } finally {
        window.sessionStorage.removeItem(WELI_CREATE_QUOTE_STORAGE_KEY);
      }
    }

    generateQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getGeneratedItems(currentQuote: GeneratedQuote) {
    return [
      { label: "Description", value: currentQuote.description, icon: WandSparkles },
      { label: "Mat\u00e9riel", value: currentQuote.material, icon: PackageCheck },
      { label: "Main d'\u0153uvre", value: currentQuote.labor, icon: Hammer },
      { label: "Temps estim\u00e9", value: currentQuote.estimatedTime, icon: Clock3 },
      {
        label: "Prix conseill\u00e9",
        value: `${formatCurrency(currentQuote.recommendedPrice)} HT`,
        icon: Euro,
      },
      {
        label: "TVA",
        value: `${currentQuote.vatRate}% - ${formatCurrency(currentQuote.vatAmount)}`,
        icon: Percent,
      },
    ];
  }

  async function generateQuote() {
    setStatus("generating");
    setSaveState("idle");
    setError("");
    const minimumDelay = new Promise((resolve) => window.setTimeout(resolve, 900));

    try {
      const response = await fetch("/api/ai/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = (await response.json()) as { error?: string; quote?: GeneratedQuote };

      if (!response.ok) {
        setError(data.error || "Impossible de g\u00e9n\u00e9rer le devis.");
        setQuote(fallbackQuote);
      } else if (data.quote) {
        setQuote(data.quote);
      }
    } catch {
      setQuote(fallbackQuote);
      setError("Impossible de g\u00e9n\u00e9rer le devis pour le moment.");
    }

    await minimumDelay;
    setStatus("done");
  }

  async function saveQuote() {
    if (!clientId) {
      setError("S\u00e9lectionne d'abord un client.");
      return;
    }

    setSaveState("saving");
    setError("");

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          trade: "G\u00e9n\u00e9ral",
          description: quote.description,
          material: quote.material,
          labor: quote.labor,
          estimatedTime: quote.estimatedTime,
          recommendedPrice: quote.recommendedPrice,
          vatRate: quote.vatRate,
          vatAmount: quote.vatAmount,
          total: quote.total,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error || "Impossible d'enregistrer le devis.");
        setSaveState("idle");
        return;
      }

      setSaveState("saved");
    } catch {
      setError("Impossible d'enregistrer le devis pour le moment.");
      setSaveState("idle");
    }
  }

  const isGenerating = status === "generating";
  const generatedItems = getGeneratedItems(quote);
  const hasClients = clients.length > 0;

  return (
    <section className="ai-quote-interface">
      <div className="workspace-panel ai-input-panel">
        <div className="panel-title">
          <div>
            <p className="section-kicker">Assistant IA</p>
            <h2>{"\u00c9cris le besoin, Welix pr\u00e9pare le devis."}</h2>
            <p className="ai-supporting-copy">
              Decris le chantier comme tu le ferais oralement. L&apos;interface met ensuite le resultat en forme.
            </p>
          </div>
          <Sparkles size={20} />
        </div>

        <div className="ai-prompt-chips" aria-label="Rep\u00e8res de saisie">
          <span>Surface</span>
          <span>Materiaux</span>
          <span>Urgence</span>
          <span>Temps estime</span>
        </div>

        <label className="ai-prompt-label">
          Client
          <select
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            aria-label="Client du devis"
            disabled={!hasClients}
          >
            {hasClients ? (
              clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))
            ) : (
              <option value="">{"Ajoute d'abord un client"}</option>
            )}
          </select>
        </label>

        <label className="ai-prompt-label">
          Demande artisan
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            aria-label="Demande artisan"
          />
        </label>

        <button
          className="primary-button ai-generate-button"
          type="button"
          onClick={generateQuote}
          disabled={isGenerating}
        >
          {isGenerating ? "G\u00e9n\u00e9ration en cours" : "G\u00e9n\u00e9rer le devis"}
          <Sparkles size={17} />
        </button>

        <div className="ai-generation-steps" aria-label={"\u00c9tapes de g\u00e9n\u00e9ration"}>
          <span className={isGenerating ? "active" : "done"}>Analyse du chantier</span>
          <span className={isGenerating ? "active delay-one" : "done"}>
            {"Calcul du mat\u00e9riel"}
          </span>
          <span className={isGenerating ? "active delay-two" : "done"}>Estimation du prix</span>
        </div>

        {!hasClients ? (
          <p className="auth-error">
            Ajoute au moins un client avant d&apos;enregistrer un devis.
          </p>
        ) : null}
      </div>

      <div className="workspace-panel ai-result-panel">
        <div className="ai-result-header">
          <div>
            <p className="section-kicker">{"R\u00e9sultat g\u00e9n\u00e9r\u00e9"}</p>
            <h2>{prompt}</h2>
            <p className="ai-supporting-copy">
              Verifie les postes proposes, ajuste si besoin puis enregistre le devis dans l&apos;historique.
            </p>
          </div>
          <span className={`ai-status ${isGenerating ? "loading" : "ready"}`}>
            {isGenerating ? "Welix travaille" : "Pr\u00eat"}
          </span>
        </div>

        {isGenerating ? (
          <div className="ai-skeleton" aria-label={"G\u00e9n\u00e9ration du devis"}>
            <span />
            <span />
            <span />
            <span />
          </div>
        ) : (
          <>
            <div className="ai-result-grid">
              {generatedItems.map((item) => {
                const Icon = item.icon;
                return (
                  <article className="ai-result-card" key={item.label}>
                    <Icon size={18} />
                    <div>
                      <span>{item.label}</span>
                      <p>{item.value}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="ai-total-card">
              <div>
                <span>Total TTC</span>
                <strong>{formatCurrency(quote.total)}</strong>
              </div>
              <CheckCircle2 size={22} />
            </div>

            {saveState === "saved" ? (
              <p className="auth-success">
                {"Devis enregistr\u00e9. Tu peux maintenant le retrouver dans l'historique."}
              </p>
            ) : (
              <button
                className="secondary-button ai-send-button"
                type="button"
                onClick={saveQuote}
                disabled={saveState === "saving" || !hasClients}
              >
                {saveState === "saving" ? <Loader2 className="spin-icon" size={17} /> : null}
                Enregistrer le devis
                <ArrowRight size={17} />
              </button>
            )}

            {error ? <p className="auth-error">{error}</p> : null}
          </>
        )}
      </div>
    </section>
  );
}
