"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Euro,
  Hammer,
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
  const [prompt, setPrompt] = useState("Remplacement d'un chauffe-eau 200L");
  const [status, setStatus] = useState<"generating" | "done">("generating");
  const [quote, setQuote] = useState<GeneratedQuote>(fallbackQuote);

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
      {
        label: "Description",
        value: currentQuote.description,
        icon: WandSparkles,
      },
      {
        label: "Matériel",
        value: currentQuote.material,
        icon: PackageCheck,
      },
      {
        label: "Main d'œuvre",
        value: currentQuote.labor,
        icon: Hammer,
      },
      {
        label: "Temps estimé",
        value: currentQuote.estimatedTime,
        icon: Clock3,
      },
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
    const minimumDelay = new Promise((resolve) => window.setTimeout(resolve, 900));

    try {
      const response = await fetch("/api/ai/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = (await response.json()) as { quote?: GeneratedQuote };
      if (data.quote) {
        setQuote(data.quote);
      }
    } catch {
      setQuote(fallbackQuote);
    }

    await minimumDelay;
    setStatus("done");
  }

  const isGenerating = status === "generating";
  const generatedItems = getGeneratedItems(quote);

  return (
    <section className="ai-quote-interface">
      <div className="workspace-panel ai-input-panel">
        <div className="panel-title">
          <div>
            <p className="section-kicker">Assistant IA</p>
            <h2>Écrivez le besoin, Welix prépare le devis.</h2>
          </div>
          <Sparkles size={20} />
        </div>

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
          <span className={isGenerating ? "active" : "done"}>
            Analyse du chantier
          </span>
          <span className={isGenerating ? "active delay-one" : "done"}>
            Calcul du matériel
          </span>
          <span className={isGenerating ? "active delay-two" : "done"}>
            Estimation du prix
          </span>
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

            <button className="secondary-button ai-send-button" type="button">
              Transformer en devis professionnel
              <ArrowRight size={17} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
