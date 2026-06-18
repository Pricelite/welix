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

const fallbackQuote: GeneratedQuote = {
  description:
    "Remplacement d'un chauffe-eau électrique 200L avec dépose de l'ancien équipement, raccordements et contrôle de mise en service.",
  material:
    "Chauffe-eau 200L, groupe de sécurité, raccords diélectriques, flexibles, fixations et consommables.",
  labor:
    "Dépose, évacuation, pose du nouveau ballon, raccordement hydraulique et électrique, essais.",
  estimatedTime: "3 h 30",
  recommendedPrice: 1280,
  vatRate: 10,
  vatAmount: 128,
  total: 1408,
};

export function AiQuoteGenerator() {
  const [clientName, setClientName] = useState("");
  const [prompt, setPrompt] = useState("Remplacement d'un chauffe-eau 200L");
  const [status, setStatus] = useState<"done" | "generating">("generating");
  const [quote, setQuote] = useState<GeneratedQuote>(fallbackQuote);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "saving">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    generateQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function formatEuro(value: number) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function getGeneratedItems(currentQuote: GeneratedQuote) {
    return [
      { label: "Description", value: currentQuote.description, icon: WandSparkles },
      { label: "Matériel", value: currentQuote.material, icon: PackageCheck },
      { label: "Main d'oeuvre", value: currentQuote.labor, icon: Hammer },
      { label: "Temps estimé", value: currentQuote.estimatedTime, icon: Clock3 },
      {
        label: "Prix conseillé",
        value: `${formatEuro(currentQuote.recommendedPrice)} HT`,
        icon: Euro,
      },
      {
        label: "TVA",
        value: `${currentQuote.vatRate}% - ${formatEuro(currentQuote.vatAmount)}`,
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
        setError(data.error || "Impossible de générer le devis.");
        setQuote(fallbackQuote);
      } else if (data.quote) {
        setQuote(data.quote);
      }
    } catch {
      setQuote(fallbackQuote);
      setError("Impossible de générer le devis pour le moment.");
    }

    await minimumDelay;
    setStatus("done");
  }

  async function saveQuote() {
    setSaveState("saving");
    setError("");

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          trade: "Général",
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

  return (
    <section className="ai-quote-interface">
      <div className="workspace-panel ai-input-panel">
        <div className="panel-title">
          <div>
            <p className="section-kicker">Assistant IA</p>
            <h2>Écris le besoin, Welix prépare le devis.</h2>
          </div>
          <Sparkles size={20} />
        </div>

        <label className="ai-prompt-label">
          Nom du client
          <input
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            placeholder="Maison Laurent"
            aria-label="Nom du client"
          />
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
          {isGenerating ? "Génération en cours" : "Générer le devis"}
          <Sparkles size={17} />
        </button>

        <div className="ai-generation-steps" aria-label="Étapes de génération">
          <span className={isGenerating ? "active" : "done"}>Analyse du chantier</span>
          <span className={isGenerating ? "active delay-one" : "done"}>Calcul du matériel</span>
          <span className={isGenerating ? "active delay-two" : "done"}>Estimation du prix</span>
        </div>
      </div>

      <div className="workspace-panel ai-result-panel">
        <div className="ai-result-header">
          <div>
            <p className="section-kicker">Résultat généré</p>
            <h2>{prompt}</h2>
          </div>
          <span className={`ai-status ${isGenerating ? "loading" : "ready"}`}>
            {isGenerating ? "Welix travaille" : "Prêt"}
          </span>
        </div>

        {isGenerating ? (
          <div className="ai-skeleton" aria-label="Génération du devis">
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
                <strong>{formatEuro(quote.total)}</strong>
              </div>
              <CheckCircle2 size={22} />
            </div>

            {saveState === "saved" ? (
              <p className="auth-success">
                Devis enregistré. Tu peux maintenant le retrouver dans l&apos;historique.
              </p>
            ) : (
              <button
                className="secondary-button ai-send-button"
                type="button"
                onClick={saveQuote}
                disabled={saveState === "saving"}
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
