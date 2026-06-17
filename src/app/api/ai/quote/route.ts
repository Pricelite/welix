import { NextResponse } from "next/server";
import { createOpenAIClient } from "@/lib/openai";

const fallbackQuote = {
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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { prompt?: string } | null;
  const prompt = body?.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt manquant" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      quote: fallbackQuote,
      source: "fallback",
      warning: "OPENAI_API_KEY manquant. Résultat de démonstration retourné.",
    });
  }

  const client = createOpenAIClient();
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.5",
    input: [
      {
        role: "system",
        content:
          "Tu es Welix, un assistant devis pour artisans français. Réponds uniquement en JSON valide avec les clés description, material, labor, estimatedTime, recommendedPrice, vatRate, vatAmount, total.",
      },
      {
        role: "user",
        content: `Génère un devis conseillé pour: ${prompt}`,
      },
    ],
  });

  const output = response.output_text;

  try {
    return NextResponse.json({ quote: JSON.parse(output), source: "openai" });
  } catch {
    return NextResponse.json({
      quote: fallbackQuote,
      source: "fallback",
      warning: "La réponse OpenAI n'était pas un JSON valide.",
    });
  }
}
