"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { WeliAssistant } from "@/components/WeliAssistant";
import { WeliContextProvider, type WeliPreset } from "@/components/weli/WeliContext";
import type { WeliMessage } from "@/components/weli/WeliChat";
import type { WeliExpression } from "@/components/weli/WeliAnimations";

const weliPresets: Array<{
  match: (pathname: string) => boolean;
  label: string;
  preset: WeliPreset;
}> = [
  {
    match: (pathname) => pathname === "/",
    label: "la landing page",
    preset: {
      title: "Bonjour, je suis Weli.",
      bubble: "Je peux vous aider à découvrir Welix sans vous ralentir.",
      opening:
        "Bonjour. Je suis Weli. Je peux te présenter Welix, t'expliquer le parcours ou te guider vers le bon point de départ.",
      quickActions: [
        "Montre-moi comment fonctionne Welix",
        "Par quoi commencer pour tester l'application ?",
        "Quelle est la promesse principale de Welix ?",
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/devis/nouveau"),
    label: "la création de devis",
    preset: {
      title: "Besoin d'aide pour créer un devis ?",
      bubble: "Je peux te guider pour ton premier devis étape par étape.",
      opening:
        "Je peux t'aider à structurer un premier devis, à choisir les bonnes informations et à comprendre le résultat généré.",
      quickActions: [
        "Aide-moi à créer mon premier devis",
        "Quelles informations faut-il saisir ici ?",
        "Comment relire un devis avant envoi ?",
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/devis"),
    label: "les devis",
    preset: {
      title: "Je peux t'aider à suivre les devis.",
      bubble: "Statuts, duplication, relecture : je peux t'expliquer l'espace devis.",
      opening:
        "Dans cet espace, je peux t'aider à retrouver un devis, comprendre les statuts et gagner du temps dans le suivi commercial.",
      quickActions: [
        "Explique-moi les statuts des devis",
        "Comment dupliquer un devis ?",
        "Comment retrouver rapidement un devis précis ?",
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/clients"),
    label: "les clients",
    preset: {
      title: "Je peux te montrer comment retrouver un client rapidement.",
      bubble: "Recherche, tri, archivage : je peux t'aider à prendre en main l'espace clients.",
      opening:
        "Je peux t'expliquer comment créer, modifier, archiver ou retrouver une fiche client dans Welix.",
      quickActions: [
        "Comment créer une fiche client propre ?",
        "Comment archiver un client ?",
        "Comment retrouver un client rapidement ?",
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/dashboard"),
    label: "le tableau de bord",
    preset: {
      title: "Bienvenue dans le cockpit Welix.",
      bubble: "Je peux t'expliquer les chiffres et les prochaines actions utiles.",
      opening:
        "Le tableau de bord centralise les indicateurs utiles. Je peux t'aider à lire l'activité, les objectifs et les signaux prioritaires.",
      quickActions: [
        "Explique-moi les cartes du tableau de bord",
        "À quoi servent les notifications ?",
        "Comment interpréter les objectifs ?",
      ],
    },
  },
];

function getPreset(pathname: string) {
  return (
    weliPresets.find((entry) => entry.match(pathname)) ?? {
      label: "Welix",
      preset: {
        title: "Je reste disponible si besoin.",
        bubble: "Je peux t'aider à utiliser cette page plus sereinement.",
        opening:
          "Je suis là pour t'aider à comprendre cette page, à retrouver une action ou à préparer une prochaine étape.",
        quickActions: [
          "Que puis-je faire ici ?",
          "Aide-moi à comprendre cette page",
          "Guide-moi pas à pas",
        ],
      },
    }
  );
}

function buildReply(message: string, pathname: string) {
  const normalized = message.toLowerCase();

  if (/premier devis|créer un devis|creer un devis/.test(normalized)) {
    return "Commence par choisir le client, décris clairement le besoin, puis vérifie le chiffrage avant l'enregistrement final.";
  }

  if (/client|fiche client|retrouver un client/.test(normalized)) {
    return "Une bonne fiche client contient le nom, le contact, l'email, la ville et un historique propre pour faciliter les devis suivants.";
  }

  if (/dashboard|objectif|notification|chiffre/.test(normalized)) {
    return "Le tableau de bord sert surtout à prioriser : regarde les devis en attente, les notifications importantes et l'évolution du chiffre d'affaires.";
  }

  if (/commencer|débuter|debuter|pas à pas/.test(normalized)) {
    return pathname.startsWith("/clients")
      ? "Je te conseille de commencer par créer une fiche client complète, puis de générer un premier devis depuis cet espace."
      : "Le meilleur point de départ est de créer un client, puis un premier devis pour valider tout le parcours Welix.";
  }

  return "Je peux déjà t'aider à utiliser Welix, expliquer une page ou te guider étape par étape. Plus tard, on pourra brancher OpenAI ici sans refaire l'interface.";
}

function isCustomWeliStateEvent(
  event: Event,
): event is CustomEvent<{ expression?: WeliExpression; message?: string }> {
  return typeof event === "object" && event !== null && "detail" in event;
}

export function WeliProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [expression, setExpression] = useState<WeliExpression>("idle");
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });
  const { label, preset } = useMemo(() => getPreset(pathname), [pathname]);
  const [messages, setMessages] = useState<WeliMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: preset.opening,
    },
  ]);

  useEffect(() => {
    setBubbleOpen(true);
    setExpression(pathname === "/" ? "happy" : "idle");
    setMessages([
      {
        id: `welcome-${pathname}`,
        role: "assistant",
        content: preset.opening,
      },
    ]);
  }, [pathname, preset.opening]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;

      setPointer({
        x: Math.min(Math.max(event.clientX / width, 0), 1),
        y: Math.min(Math.max(event.clientY / height, 0), 1),
      });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useEffect(() => {
    const idleSequence: WeliExpression[] = ["idle", "thinking", "idle", "sleeping", "idle"];
    let index = 0;

    const interval = window.setInterval(() => {
      if (chatOpen) {
        return;
      }

      index = (index + 1) % idleSequence.length;
      setExpression(idleSequence[index] ?? "idle");
    }, 4200);

    return () => window.clearInterval(interval);
  }, [chatOpen]);

  useEffect(() => {
    function handleExternalState(event: Event) {
      if (!isCustomWeliStateEvent(event)) {
        return;
      }

      const nextExpression = event.detail?.expression;
      const nextMessage = event.detail?.message;

      if (nextExpression) {
        setExpression(nextExpression);
      }

      if (typeof nextMessage === "string" && nextMessage.trim()) {
        setMessages((current) => [
          ...current,
          {
            id: `external-${Date.now()}`,
            role: "assistant",
            content: nextMessage.trim(),
          },
        ]);
      }
    }

    window.addEventListener("weli:state", handleExternalState as EventListener);
    return () => window.removeEventListener("weli:state", handleExternalState as EventListener);
  }, []);

  const openChat = useCallback(() => {
    setBubbleOpen(false);
    setChatOpen(true);
    setExpression("speaking");
  }, []);

  const closeChat = useCallback(() => {
    setChatOpen(false);
    setExpression("idle");
  }, []);

  const dismissBubble = useCallback(() => {
    setBubbleOpen(false);
  }, []);

  const sendMessage = useCallback(
    (message: string) => {
      if (typeof message !== "string") {
        return;
      }

      const safeMessage = message.trim();

      if (!safeMessage) {
        return;
      }

      setChatOpen(true);
      setExpression("thinking");
      setMessages((current) => [
        ...current,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: safeMessage,
        },
      ]);

      window.setTimeout(() => {
        setExpression("speaking");
        setMessages((current) => [
          ...current,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: buildReply(safeMessage, pathname),
          },
        ]);
      }, 320);

      window.setTimeout(() => setExpression("idle"), 1700);
    },
    [pathname],
  );

  const value = useMemo(
    () => ({
      pathname,
      pageLabel: label,
      preset,
      expression,
      bubbleOpen,
      chatOpen,
      pointer,
      messages,
      openChat,
      closeChat,
      dismissBubble,
      sendMessage,
      updateExpression: setExpression,
    }),
    [
      pathname,
      label,
      preset,
      expression,
      bubbleOpen,
      chatOpen,
      pointer,
      messages,
      openChat,
      closeChat,
      dismissBubble,
      sendMessage,
    ],
  );

  return (
    <WeliContextProvider value={value}>
      {children}
      <WeliAssistant />
    </WeliContextProvider>
  );
}
