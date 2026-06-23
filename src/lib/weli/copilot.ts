import { WELI_IDENTITY } from "@/lib/weli/persona";
import type {
  WeliCopilotContext,
  WeliMemoryItem,
  WeliReply,
  WeliSuggestedAction,
} from "@/lib/weli/types";

function findRelevantMemory(memory: WeliMemoryItem[], normalized: string) {
  return memory.filter((item) => normalized.includes(item.label.toLowerCase())).slice(0, 2);
}

function extractMemoryIntent(message: string): WeliReply["memoryToSave"] | undefined {
  const normalized = message.trim();

  const hourlyRateMatch = normalized.match(/taux horaire(?: habituel)?(?: est| =)?\s*(\d+(?:[.,]\d+)?)\s*€/i);
  if (hourlyRateMatch) {
    return {
      category: "pricing",
      label: "Taux horaire habituel",
      value: `${hourlyRateMatch[1].replace(",", ".")} €/h`,
    };
  }

  const supplierMatch = normalized.match(/fournisseur(?: principal| préféré)?(?: est)?\s*:?\s*(.+)/i);
  if (supplierMatch) {
    return {
      category: "supplier",
      label: "Fournisseur principal",
      value: supplierMatch[1].trim(),
    };
  }

  const writingMatch = normalized.match(/j'utilise souvent(?: la formule| le style)?\s*:?\s*(.+)/i);
  if (writingMatch) {
    return {
      category: "writing",
      label: "Formulation favorite",
      value: writingMatch[1].trim(),
    };
  }

  return undefined;
}

function actionByKind(kind: WeliSuggestedAction["kind"], context: WeliCopilotContext) {
  return context.page.suggestedActions.find((action) => action.kind === kind);
}

function buildActiveContextLead(context: WeliCopilotContext) {
  const clientLead = context.activeContext?.client
    ? `Tu travailles actuellement sur le client ${context.activeContext.client.name}. `
    : "";
  const quoteLead = context.activeContext?.quote
    ? `Le devis actif est ${context.activeContext.quote.quoteNumber} pour ${context.activeContext.quote.clientName}. `
    : "";

  return `${clientLead}${quoteLead}`;
}

export function buildWeliReply(message: string, context: WeliCopilotContext): WeliReply {
  const normalized = message.toLowerCase().trim();
  const relevantMemory = findRelevantMemory(context.memory, normalized);
  const workspaceLead = context.workspace
    ? `${context.workspace.companyName || "Ton entreprise"} suit actuellement ${context.workspace.clientCount} clients, ${context.workspace.quoteCount} devis et ${context.workspace.invoiceCount} factures. `
    : "";
  const activeContextLead = buildActiveContextLead(context);
  const memoryPrefix =
    relevantMemory.length > 0
      ? `Je garde aussi en tête ${relevantMemory.map((item) => `"${item.label}"`).join(" et ")}. `
      : "";

  if (/modifier|ouvrir|retrouver|fiche en cours/i.test(normalized) && /client|contact|fiche/i.test(normalized)) {
    return {
      expertise: "Expert Clients",
      suggestedAction: actionByKind("open-clients", context),
      memoryToSave: extractMemoryIntent(message),
      content:
        `${workspaceLead}${activeContextLead}${memoryPrefix}` +
        (context.activeContext?.client
          ? `Je peux te rouvrir directement la fiche de ${context.activeContext.client.name} pour ajuster les coordonnées, le contact ou la ville.`
          : "Je peux t'ouvrir l'espace clients et te guider vers la bonne fiche ou en préparer une nouvelle."),
    };
  }

  if (/modifier|ouvrir|retrouver|relire/i.test(normalized) && /devis|chiffrage|prix|marge/i.test(normalized)) {
    return {
      expertise: "Expert Devis",
      suggestedAction: actionByKind("open-quotes", context) ?? actionByKind("create-quote", context),
      memoryToSave: extractMemoryIntent(message),
      content:
        `${workspaceLead}${activeContextLead}${memoryPrefix}` +
        (context.activeContext?.quote
          ? `Je peux te rouvrir directement ${context.activeContext.quote.quoteNumber} pour relire le chiffrage, le statut et les montants.`
          : "Je peux t'ouvrir l'espace devis, retrouver le bon document ou préparer un nouveau brouillon structuré."),
    };
  }

  if (/devis|chiffrage|prix|marge|quantit/i.test(normalized)) {
    return {
      expertise: "Expert Devis",
      suggestedAction: actionByKind("create-quote", context),
      memoryToSave: extractMemoryIntent(message),
      content:
        `${workspaceLead}${activeContextLead}${memoryPrefix}Pour un devis solide, je vérifie d'abord le métier, le type de chantier, les dimensions, les matériaux, l'accès, les délais et les contraintes. ` +
        `S'il manque une information essentielle, je préfère la faire préciser plutôt que de chiffrer au hasard. ` +
        `Je peux ensuite te guider poste par poste et te signaler les prestations souvent oubliées.`,
    };
  }

  if (/client|contact|fiche/i.test(normalized)) {
    return {
      expertise: "Expert Clients",
      suggestedAction: actionByKind("open-clients", context),
      memoryToSave: extractMemoryIntent(message),
      content:
        `${workspaceLead}${activeContextLead}${memoryPrefix}Une fiche client utile doit te faire gagner du temps au prochain devis : coordonnées propres, contact principal, ville, contexte chantier et préférences notables. ` +
        `Si tu veux, je peux te proposer la structure idéale d'une fiche client vraiment exploitable.`,
    };
  }

  if (/relance|email|mail|réponse client|reponse client/i.test(normalized)) {
    return {
      expertise: "Expert Commercial",
      suggestedAction: actionByKind("draft-email", context),
      memoryToSave: extractMemoryIntent(message),
      content:
        `${workspaceLead}${activeContextLead}${memoryPrefix}Je peux préparer une relance courte, professionnelle et rassurante. ` +
        `L'objectif est de relancer sans pression inutile, tout en rappelant la valeur de la proposition envoyée.`,
    };
  }

  if (/facture|tva|paiement/i.test(normalized)) {
    return {
      expertise: "Expert Facturation",
      suggestedAction: actionByKind("open-billing", context),
      memoryToSave: extractMemoryIntent(message),
      content:
        `${workspaceLead}${activeContextLead}${memoryPrefix}Sur la facturation, je peux t'aider à vérifier la TVA, les montants, les échéances et les points de cohérence avant envoi. ` +
        `Dès qu'une donnée relève d'une hypothèse, je la présente comme une estimation à valider.`,
    };
  }

  if (/comment|commencer|débuter|debuter|pas à pas|pas a pas/i.test(normalized)) {
    return {
      expertise: context.page.expertise,
      suggestedAction: context.page.suggestedActions[0],
      memoryToSave: extractMemoryIntent(message),
      content:
        `${workspaceLead}${activeContextLead}${memoryPrefix}Le plus simple est d'avancer par étapes courtes : 1. clarifier l'objectif de la page, 2. vérifier les informations obligatoires, 3. préparer l'action utile, 4. relire avant validation. ` +
        `Sur cette page, ma priorité est : ${context.page.objective.toLowerCase()}`,
    };
  }

  return {
    expertise: context.page.expertise,
    suggestedAction: context.page.suggestedActions[0],
    memoryToSave: extractMemoryIntent(message),
    content:
      `${workspaceLead}${activeContextLead}${memoryPrefix}${WELI_IDENTITY.promise} ` +
      `Sur ${context.page.pageLabel}, je peux t'aider à aller plus vite, éviter les oublis et préparer une action concrète plutôt que simplement répondre à une question.`,
  };
}
