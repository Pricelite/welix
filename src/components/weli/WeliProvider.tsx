"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { WeliAssistant } from "@/components/WeliAssistant";
import { WeliContextProvider } from "@/components/weli/WeliContext";
import type { WeliMessage } from "@/components/weli/WeliChat";
import type { WeliExpression } from "@/components/weli/WeliAnimations";
import { buildWeliReply } from "@/lib/weli/copilot";
import { createMemoryItem, readWeliMemory, writeWeliMemory } from "@/lib/weli/memory";
import { getWeliPageProfile } from "@/lib/weli/page-context";
import {
  WELI_CREATE_QUOTE_STORAGE_KEY,
  WELI_DRAFT_EMAIL_STORAGE_KEY,
  WELI_OPEN_CLIENT_STORAGE_KEY,
  WELI_OPEN_QUOTE_STORAGE_KEY,
} from "@/lib/weli/storage";
import type {
  WeliActiveContext,
  WeliMemoryItem,
  WeliSuggestedAction,
  WeliWorkspaceSnapshot,
} from "@/lib/weli/types";

function isCustomWeliStateEvent(
  event: Event,
): event is CustomEvent<{ expression?: WeliExpression; message?: string }> {
  return typeof event === "object" && event !== null && "detail" in event;
}

function isWeliSelectionEvent(
  event: Event,
): event is CustomEvent<Partial<WeliActiveContext>> {
  return typeof event === "object" && event !== null && "detail" in event;
}

function mergeMemoryItem(current: WeliMemoryItem[], incoming: WeliMemoryItem) {
  const deduped = current.filter(
    (entry) =>
      entry.id !== incoming.id && !(entry.label === incoming.label && entry.value === incoming.value),
  );

  return [incoming, ...deduped].slice(0, 20);
}

export function WeliProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [expression, setExpression] = useState<WeliExpression>("idle");
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });
  const [memory, setMemory] = useState<WeliMemoryItem[]>([]);
  const [workspace, setWorkspace] = useState<WeliWorkspaceSnapshot | null>(null);
  const [activeContext, setActiveContext] = useState<WeliActiveContext | null>(null);
  const page = useMemo(() => getWeliPageProfile(pathname), [pathname]);
  const [messages, setMessages] = useState<WeliMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: page.opening,
      expertise: page.expertise,
    },
  ]);

  useEffect(() => {
    setMemory(readWeliMemory());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      try {
        const response = await fetch("/api/weli/context", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled) {
            setWorkspace(null);
          }
          return;
        }

        const data = (await response.json()) as { workspace?: WeliWorkspaceSnapshot | null };

        if (!cancelled) {
          setWorkspace(data.workspace ?? null);
        }
      } catch {
        if (!cancelled) {
          setWorkspace(null);
        }
      }
    }

    loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function loadPersistentMemory() {
      try {
        const response = await fetch("/api/weli/memory", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { memories?: WeliMemoryItem[] };
        const remoteMemory = Array.isArray(data.memories) ? data.memories : [];

        if (!cancelled && remoteMemory.length > 0) {
          setMemory(remoteMemory);
        }
      } catch {
        // Keep local memory when the API is unavailable.
      }
    }

    loadPersistentMemory();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    writeWeliMemory(memory);
  }, [memory]);

  useEffect(() => {
    setBubbleOpen(true);
    setExpression(pathname === "/" ? "happy" : "idle");
    setActiveContext(null);
    setMessages([
      {
        id: `welcome-${pathname}`,
        role: "assistant",
        content: page.opening,
        expertise: page.expertise,
      },
    ]);
  }, [pathname, page]);

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
            expertise: page.expertise,
          },
        ]);
      }
    }

    function handleSelection(event: Event) {
      if (!isWeliSelectionEvent(event)) {
        return;
      }

      setActiveContext((current) => ({
        client:
          "client" in event.detail ? event.detail.client ?? null : current?.client ?? null,
        quote:
          "quote" in event.detail ? event.detail.quote ?? null : current?.quote ?? null,
      }));
    }

    window.addEventListener("weli:state", handleExternalState as EventListener);
    window.addEventListener("weli:selection", handleSelection as EventListener);

    return () => {
      window.removeEventListener("weli:state", handleExternalState as EventListener);
      window.removeEventListener("weli:selection", handleSelection as EventListener);
    };
  }, [page.expertise]);

  const rememberItem = useCallback((item: Omit<WeliMemoryItem, "id" | "createdAt">) => {
    const optimisticItem = createMemoryItem(item);

    setMemory((current) => mergeMemoryItem(current, optimisticItem));

    void fetch("/api/weli/memory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(item),
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as { memory?: WeliMemoryItem };
        return data.memory ?? null;
      })
      .then((serverMemory) => {
        if (!serverMemory) {
          return;
        }

        setMemory((current) =>
          mergeMemoryItem(
            current.filter((entry) => entry.id !== optimisticItem.id),
            serverMemory,
          ),
        );
      })
      .catch(() => {
        // Keep optimistic local memory even if persistence fails.
      });
  }, []);

  const forgetItem = useCallback((itemId: string) => {
    setMemory((current) => current.filter((item) => item.id !== itemId));

    void fetch(`/api/weli/memory/${itemId}`, {
      method: "DELETE",
      credentials: "include",
    }).catch(() => {
      // Keep UI responsive even if deletion cannot be synced immediately.
    });
  }, []);

  const clearMemory = useCallback(() => {
    setMemory([]);

    void fetch("/api/weli/memory", {
      method: "DELETE",
      credentials: "include",
    }).catch(() => {
      // Local reset remains useful when the API is unavailable.
    });
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

  const applySuggestedAction = useCallback(
    (action: WeliSuggestedAction) => {
      setChatOpen(true);
      setExpression("success");

      if (typeof window !== "undefined") {
        switch (action.kind) {
          case "create-quote":
            window.sessionStorage.setItem(
              WELI_CREATE_QUOTE_STORAGE_KEY,
              JSON.stringify({
                prompt:
                  "Préparer un devis clair avec les informations essentielles, les postes utiles et les points de vigilance.",
                clientId: activeContext?.client?.id ?? activeContext?.quote?.clientId ?? undefined,
              }),
            );
            router.push("/devis/nouveau");
            break;
          case "create-client":
            window.sessionStorage.setItem(
              WELI_OPEN_CLIENT_STORAGE_KEY,
              JSON.stringify({
                mode: "create",
              }),
            );
            router.push("/clients");
            break;
          case "open-clients":
            window.sessionStorage.setItem(
              WELI_OPEN_CLIENT_STORAGE_KEY,
              JSON.stringify({
                mode: activeContext?.client ? "edit" : "create",
                id: activeContext?.client?.id,
              }),
            );
            router.push("/clients");
            break;
          case "open-quotes":
          case "review-margin":
            window.sessionStorage.setItem(
              WELI_OPEN_QUOTE_STORAGE_KEY,
              JSON.stringify({
                mode: activeContext?.quote ? "edit" : "create",
                id: activeContext?.quote?.id,
              }),
            );
            router.push("/devis");
            break;
          case "open-billing":
            router.push("/factures");
            break;
          case "draft-email":
            window.sessionStorage.setItem(
              WELI_DRAFT_EMAIL_STORAGE_KEY,
              "Relance professionnelle courte, rassurante et orientée action.",
            );
            router.push("/devis");
            break;
          default:
            break;
        }
      }

      setMessages((current) => [
        ...current,
        {
          id: `action-${Date.now()}`,
          role: "assistant",
          content: `${action.label} : ${action.description} Je t'emmène vers le bon espace pour préparer l'action.`,
          expertise: page.expertise,
        },
      ]);

      window.setTimeout(() => setExpression("idle"), 1800);
    },
    [activeContext, page.expertise, router],
  );

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

      const reply = buildWeliReply(safeMessage, {
        pathname,
        page,
        memory,
        workspace,
        activeContext,
      });

      if (reply.memoryToSave) {
        rememberItem(reply.memoryToSave);
      }

      window.setTimeout(() => {
        setExpression(reply.suggestedAction ? "success" : "speaking");
        const nextMessages: WeliMessage[] = [
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: reply.content,
            expertise: reply.expertise,
          },
        ];

        if (reply.suggestedAction) {
          nextMessages.push({
            id: `assistant-action-${Date.now()}`,
            role: "assistant",
            content: `Action proposée : ${reply.suggestedAction.label}. ${reply.suggestedAction.description}`,
            expertise: reply.expertise,
          });
        }

        setMessages((current) => [...current, ...nextMessages]);
      }, 320);

      window.setTimeout(() => setExpression("idle"), 1900);
    },
    [activeContext, memory, page, pathname, rememberItem, workspace],
  );

  const value = useMemo(
    () => ({
      pathname,
      page,
      expression,
      bubbleOpen,
      chatOpen,
      pointer,
      messages,
      memory,
      workspace,
      activeContext,
      openChat,
      closeChat,
      dismissBubble,
      sendMessage,
      applySuggestedAction,
      rememberItem,
      forgetItem,
      clearMemory,
      updateExpression: setExpression,
    }),
    [
      pathname,
      page,
      expression,
      bubbleOpen,
      chatOpen,
      pointer,
      messages,
      memory,
      workspace,
      activeContext,
      openChat,
      closeChat,
      dismissBubble,
      sendMessage,
      applySuggestedAction,
      rememberItem,
      forgetItem,
      clearMemory,
    ],
  );

  return (
    <WeliContextProvider value={value}>
      {children}
      <WeliAssistant />
    </WeliContextProvider>
  );
}
