import { getAuthenticatedUser } from "@/lib/auth";
import { ApiError, jsonError, jsonSuccess, parseJson } from "@/lib/http";
import { weliMemorySchema } from "@/lib/schemas";
import { sanitizePlainText } from "@/lib/sanitize";
import { clearWeliMemoriesForUser, createWeliMemoryForUser, listWeliMemoriesForUser } from "@/lib/weli/server";

export async function GET() {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      return jsonSuccess({ memories: [] });
    }

    const memories = await listWeliMemoriesForUser(user.id);
    return jsonSuccess({ memories });
  } catch (error) {
    return jsonError(error, "Impossible de charger la mémoire Weli");
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    const body = await parseJson(request, weliMemorySchema);
    const memory = await createWeliMemoryForUser(user.id, {
      label: sanitizePlainText(body.label, 120),
      value: sanitizePlainText(body.value, 500),
      category: body.category,
    });

    return jsonSuccess({ ok: true, memory });
  } catch (error) {
    return jsonError(error, "Impossible d'enregistrer la mémoire Weli");
  }
}

export async function DELETE() {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    await clearWeliMemoriesForUser(user.id);
    return jsonSuccess({ ok: true });
  } catch (error) {
    return jsonError(error, "Impossible de vider la mémoire Weli");
  }
}
