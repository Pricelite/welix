import type { WeliPageProfile } from "@/lib/weli/types";

const DEFAULT_PAGE_PROFILE: WeliPageProfile = {
  pageLabel: "Welix",
  title: "Je reste disponible si besoin.",
  bubble: "Je peux vous aider à utiliser cette page plus sereinement.",
  opening:
    "Je suis là pour t'aider à comprendre cette page, retrouver une action utile ou préparer la prochaine étape.",
  expertise: "Expert Welix",
  objective: "Aider à comprendre la page et faire gagner du temps sur les prochaines actions.",
  quickActions: [
    {
      id: "understand-page",
      label: "Comprendre cette page",
      prompt: "Explique-moi clairement à quoi sert cette page.",
    },
    {
      id: "guide-step-by-step",
      label: "Me guider",
      prompt: "Guide-moi pas à pas sur cette page.",
    },
  ],
  proactiveHints: [
    "Si une action semble bloquante, je peux te proposer la prochaine étape concrète.",
  ],
  suggestedActions: [
    {
      id: "open-quotes",
      kind: "open-quotes",
      label: "Ouvrir les devis",
      description: "Retrouver l'historique commercial ou préparer un nouveau devis.",
    },
  ],
};

const PAGE_PROFILES: Array<{
  match: (pathname: string) => boolean;
  profile: WeliPageProfile;
}> = [
  {
    match: (pathname) => pathname === "/",
    profile: {
      pageLabel: "la landing page",
      title: "Bonjour, je suis Weli.",
      bubble: "Je peux vous aider à découvrir Welix sans vous ralentir.",
      opening:
        "Bonjour. Je suis Weli. Je peux te présenter Welix, t'expliquer le parcours ou te guider vers le bon point de départ.",
      expertise: "Expert Welix",
      objective: "Présenter clairement la valeur de Welix et rassurer les nouveaux utilisateurs.",
      quickActions: [
        {
          id: "how-welix-works",
          label: "Comment ça marche",
          prompt: "Montre-moi comment fonctionne Welix.",
        },
        {
          id: "why-weli",
          label: "Pourquoi Weli",
          prompt: "Explique-moi ce qui rend Weli différent d'un logiciel classique.",
        },
        {
          id: "first-steps",
          label: "Par où commencer",
          prompt: "Par quoi commencer pour tester l'application ?",
        },
      ],
      proactiveHints: [
        "L'objectif n'est pas d'ajouter un outil de plus, mais d'enlever des heures d'administratif.",
      ],
      suggestedActions: [
        {
          id: "create-account",
          kind: "create-client",
          label: "Créer un espace test",
          description: "Démarrer avec l'inscription et découvrir le parcours réel.",
        },
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/dashboard"),
    profile: {
      pageLabel: "le tableau de bord",
      title: "Bienvenue dans le cockpit Welix.",
      bubble: "Je peux t'expliquer les chiffres et les prochaines actions utiles.",
      opening:
        "Le tableau de bord centralise les indicateurs utiles. Je peux t'aider à lire l'activité, les objectifs et les signaux prioritaires.",
      expertise: "Expert Analyse",
      objective: "Prioriser les actions qui font gagner du temps ou améliorent le taux de transformation.",
      quickActions: [
        {
          id: "read-dashboard",
          label: "Lire les chiffres",
          prompt: "Explique-moi les cartes du tableau de bord.",
        },
        {
          id: "business-priorities",
          label: "Priorités",
          prompt: "Quelles sont les prochaines actions prioritaires à partir de ce tableau de bord ?",
        },
      ],
      proactiveHints: [
        "Un bon tableau de bord doit aider à décider, pas seulement à regarder des chiffres.",
      ],
      suggestedActions: [
        {
          id: "review-margin",
          kind: "review-margin",
          label: "Contrôler les marges",
          description: "Relire les devis récents et détecter les zones à faible rentabilité.",
        },
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/clients"),
    profile: {
      pageLabel: "les clients",
      title: "Je peux te montrer comment retrouver un client rapidement.",
      bubble: "Recherche, tri, archivage : je peux t'aider à prendre en main l'espace clients.",
      opening:
        "Je peux t'expliquer comment créer, modifier, archiver ou retrouver une fiche client dans Welix.",
      expertise: "Expert Clients",
      objective: "Structurer les fiches clients pour gagner du temps sur les devis et les relances.",
      quickActions: [
        {
          id: "create-client",
          label: "Créer une fiche",
          prompt: "Comment créer une fiche client propre ?",
        },
        {
          id: "find-client",
          label: "Retrouver un client",
          prompt: "Comment retrouver un client rapidement ?",
        },
        {
          id: "archive-client",
          label: "Archiver",
          prompt: "Quand faut-il archiver un client ?",
        },
      ],
      proactiveHints: [
        "Une fiche client bien tenue évite de ressaisir les mêmes informations à chaque devis.",
      ],
      suggestedActions: [
        {
          id: "open-clients",
          kind: "open-clients",
          label: "Préparer une fiche type",
          description: "Standardiser les coordonnées et préférences utiles pour les futurs devis.",
        },
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/devis/nouveau"),
    profile: {
      pageLabel: "la création de devis",
      title: "Besoin d'aide pour créer un devis ?",
      bubble: "Je peux te guider pour ton premier devis étape par étape.",
      opening:
        "Je peux t'aider à structurer un premier devis, choisir les bonnes informations et relire le chiffrage avant validation.",
      expertise: "Expert Devis",
      objective: "Produire un devis clair, crédible et exploitable sans oublier les postes utiles.",
      quickActions: [
        {
          id: "first-quote",
          label: "Premier devis",
          prompt: "Aide-moi à créer mon premier devis.",
        },
        {
          id: "missing-info",
          label: "Infos essentielles",
          prompt: "Quelles informations faut-il saisir ici avant de chiffrer ?",
        },
        {
          id: "quote-review",
          label: "Relire le devis",
          prompt: "Comment relire un devis avant envoi ?",
        },
      ],
      proactiveHints: [
        "Je peux te signaler les postes souvent oubliés, les marges faibles et les descriptions trop vagues.",
      ],
      suggestedActions: [
        {
          id: "create-quote",
          kind: "create-quote",
          label: "Pré-remplir un devis",
          description: "Structurer les postes, les observations et les points de vigilance avant validation.",
        },
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/devis"),
    profile: {
      pageLabel: "les devis",
      title: "Je peux t'aider à suivre les devis.",
      bubble: "Statuts, duplication, relecture : je peux t'expliquer l'espace devis.",
      opening:
        "Dans cet espace, je peux t'aider à retrouver un devis, comprendre les statuts et gagner du temps dans le suivi commercial.",
      expertise: "Expert Commercial",
      objective: "Suivre les devis, limiter les oublis de relance et améliorer le taux de signature.",
      quickActions: [
        {
          id: "quote-statuses",
          label: "Statuts",
          prompt: "Explique-moi les statuts des devis.",
        },
        {
          id: "duplicate-quote",
          label: "Dupliquer",
          prompt: "Comment dupliquer un devis ?",
        },
        {
          id: "follow-up",
          label: "Relancer",
          prompt: "Quelle relance simple puis-je envoyer après un devis resté sans réponse ?",
        },
      ],
      proactiveHints: [
        "Une relance bien placée peut faire gagner un chantier sans baisser le prix.",
      ],
      suggestedActions: [
        {
          id: "open-quote-workspace",
          kind: "open-quotes",
          label: "Ouvrir le devis actif",
          description: "Retrouver un devis précis ou préparer un nouveau brouillon dans l'historique.",
        },
        {
          id: "draft-email",
          kind: "draft-email",
          label: "Préparer une relance",
          description: "Rédiger un message court, professionnel et facile à envoyer.",
        },
      ],
    },
  },
];

export function getWeliPageProfile(pathname: string) {
  return PAGE_PROFILES.find((entry) => entry.match(pathname))?.profile ?? DEFAULT_PAGE_PROFILE;
}
