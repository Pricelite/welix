import { getAuthenticatedUser } from "@/lib/auth";
import { ApiError, jsonError, jsonSuccess } from "@/lib/http";
import { deleteWeliMemoryForUser } from "@/lib/weli/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    const { id } = await context.params;

    if (!id) {
      throw new ApiError("Memoire introuvable", 400);
    }

    await deleteWeliMemoryForUser(user.id, id);
    return jsonSuccess({ ok: true });
  } catch (error) {
    return jsonError(error, "Impossible de supprimer la mémoire Weli");
  }
}
