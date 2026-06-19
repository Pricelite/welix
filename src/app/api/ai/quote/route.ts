import { getAuthenticatedUser } from "@/lib/auth";
import { extractQuoteContext } from "@/lib/ai-quote";
import { ApiError, jsonError, jsonSuccess, parseJson } from "@/lib/http";
import { computeQuoteFromExtraction } from "@/lib/quote-engine";
import { aiQuoteRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    const body = await parseJson(request, aiQuoteRequestSchema);
    const result = await extractQuoteContext(body.prompt);
    const quote = computeQuoteFromExtraction(result.extraction);

    return jsonSuccess({
      quote,
      extraction: result.extraction,
      source: result.source,
      warning: result.warning,
    });
  } catch (error) {
    return jsonError(error, "Erreur serveur lors de l'analyse IA");
  }
}
