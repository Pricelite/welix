import { createOpenAIClient } from "@/lib/openai";
import { fallbackExtractQuoteContext } from "@/lib/quote-engine";
import { quoteExtractionSchema } from "@/lib/schemas";
import { sanitizePlainText } from "@/lib/sanitize";
import { WELI_QUOTE_SYSTEM_PROMPT } from "@/lib/weli-prompt";

function extractJsonObject(input: string) {
  const start = input.indexOf("{");
  const end = input.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return input.slice(start, end + 1);
}

export async function extractQuoteContext(prompt: string) {
  const sanitizedPrompt = sanitizePlainText(prompt, 2000);

  if (!process.env.OPENAI_API_KEY) {
    return {
      extraction: fallbackExtractQuoteContext(sanitizedPrompt),
      source: "fallback" as const,
      warning: "OPENAI_API_KEY manquante. Extraction heuristique utilisée.",
    };
  }

  try {
    const client = createOpenAIClient();
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      input: [
        {
          role: "system",
          content: WELI_QUOTE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content:
            `Analyse ce besoin chantier et extrais seulement les données structurées utiles à la préparation d'un devis.\n\n` +
            `Besoin utilisateur : ${sanitizedPrompt}`,
        },
      ],
    });

    const jsonText = extractJsonObject(response.output_text || "");
    if (!jsonText) {
      throw new Error("Réponse IA non exploitable");
    }

    const parsed = quoteExtractionSchema.parse(JSON.parse(jsonText));
    return {
      extraction: parsed,
      source: "openai" as const,
      warning: null,
    };
  } catch {
    return {
      extraction: fallbackExtractQuoteContext(sanitizedPrompt),
      source: "fallback" as const,
      warning: "La réponse IA n'a pas pu être exploitée. Extraction heuristique utilisée.",
    };
  }
}
