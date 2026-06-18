import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createOpenAIClient } from "@/lib/openai";

type QuotePayload = {
  description: string;
  material: string;
  labor: string;
  estimatedTime: string;
  recommendedPrice: number;
  vatRate: number;
  vatAmount: number;
  total: number;
};

function buildFallbackQuote(prompt: string): QuotePayload {
  const input = prompt.toLowerCase();

  if (input.includes("parquet") || input.includes("sol")) {
    return {
      description:
        "Remplacement d'un parquet existant avec préparation du support, pose des nouvelles lames et finitions.",
      material:
        "Sous-couche, lames de parquet, plinthes, barres de seuil, colle ou clips et consommables.",
      labor:
        "Dépose si nécessaire, préparation du support, pose du parquet, découpes, ajustements et nettoyage.",
      estimatedTime: "1 jour",
      recommendedPrice: 1850,
      vatRate: 10,
      vatAmount: 185,
      total: 2035,
    };
  }

  if (input.includes("peinture")) {
    return {
      description:
        "Travaux de peinture intérieure avec préparation des supports et application des couches de finition.",
      material:
        "Peinture, sous-couche, bâches de protection, ruban de masquage, rouleaux, pinceaux et consommables.",
      labor:
        "Protection, préparation, rebouchage léger, ponçage, application et nettoyage du chantier.",
      estimatedTime: "1 jour",
      recommendedPrice: 980,
      vatRate: 10,
      vatAmount: 98,
      total: 1078,
    };
  }

  if (input.includes("élect") || input.includes("elect")) {
    return {
      description:
        "Intervention électrique avec fourniture, pose et vérification des équipements nécessaires selon le besoin décrit.",
      material:
        "Appareillage électrique, câbles, protections, gaines, fixations et consommables.",
      labor:
        "Repérage, dépose si besoin, pose, raccordement, tests de sécurité et remise en service.",
      estimatedTime: "4 h",
      recommendedPrice: 1240,
      vatRate: 10,
      vatAmount: 124,
      total: 1364,
    };
  }

  return {
    description: `Intervention artisanale pour: ${prompt}. Devis de démonstration généré en attendant une réponse IA exploitable.`,
    material: "Fournitures adaptées au chantier, consommables et protections selon les besoins.",
    labor: "Préparation, exécution des travaux, contrôle final et nettoyage du chantier.",
    estimatedTime: "4 h",
    recommendedPrice: 1200,
    vatRate: 10,
    vatAmount: 120,
    total: 1320,
  };
}

function extractJsonObject(input: string) {
  const start = input.indexOf("{");
  const end = input.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return input.slice(start, end + 1);
}

function normalizeQuotePayload(payload: Partial<QuotePayload>, prompt: string) {
  const fallback = buildFallbackQuote(prompt);

  return {
    description: typeof payload.description === "string" ? payload.description : fallback.description,
    material: typeof payload.material === "string" ? payload.material : fallback.material,
    labor: typeof payload.labor === "string" ? payload.labor : fallback.labor,
    estimatedTime:
      typeof payload.estimatedTime === "string" ? payload.estimatedTime : fallback.estimatedTime,
    recommendedPrice:
      typeof payload.recommendedPrice === "number"
        ? payload.recommendedPrice
        : fallback.recommendedPrice,
    vatRate: typeof payload.vatRate === "number" ? payload.vatRate : fallback.vatRate,
    vatAmount: typeof payload.vatAmount === "number" ? payload.vatAmount : fallback.vatAmount,
    total: typeof payload.total === "number" ? payload.total : fallback.total,
  };
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser().catch(() => null);

  if (!user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { prompt?: string } | null;
  const prompt = body?.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt manquant" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      quote: buildFallbackQuote(prompt),
      source: "fallback",
      warning: "OPENAI_API_KEY manquant. Résultat de démonstration retourné.",
    });
  }

  try {
    const client = createOpenAIClient();
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      input: [
        {
          role: "system",
          content:
            "Tu es Welix, un assistant devis pour artisans français. Réponds uniquement avec un objet JSON valide contenant exactement les clés description, material, labor, estimatedTime, recommendedPrice, vatRate, vatAmount, total.",
        },
        {
          role: "user",
          content: `Génère un devis conseillé pour ce besoin: ${prompt}`,
        },
      ],
    });

    const rawText = response.output_text || "";
    const jsonText = extractJsonObject(rawText);

    if (jsonText) {
      const parsed = JSON.parse(jsonText) as Partial<QuotePayload>;
      return NextResponse.json({
        quote: normalizeQuotePayload(parsed, prompt),
        source: "openai",
      });
    }

    return NextResponse.json({
      quote: buildFallbackQuote(prompt),
      source: "fallback",
      warning: "La réponse IA n'était pas exploitable. Un devis cohérent avec la demande a été généré.",
    });
  } catch {
    return NextResponse.json({
      quote: buildFallbackQuote(prompt),
      source: "fallback",
      warning: "La réponse IA n'a pas pu être exploitée. Un devis cohérent avec la demande a été généré.",
    });
  }
}
