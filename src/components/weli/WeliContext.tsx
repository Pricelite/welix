"use client";

import React, { createContext, useContext } from "react";
import type { WeliMessage } from "@/components/weli/WeliChat";
import type { WeliExpression } from "@/components/weli/WeliAnimations";
import type {
  WeliActiveContext,
  WeliMemoryItem,
  WeliPageProfile,
  WeliSuggestedAction,
  WeliWorkspaceSnapshot,
} from "@/lib/weli/types";

export type WeliState = {
  pathname: string;
  page: WeliPageProfile;
  expression: WeliExpression;
  bubbleOpen: boolean;
  chatOpen: boolean;
  pointer: {
    x: number;
    y: number;
  };
  messages: WeliMessage[];
  memory: WeliMemoryItem[];
  workspace: WeliWorkspaceSnapshot | null;
  activeContext: WeliActiveContext | null;
  openChat: () => void;
  closeChat: () => void;
  dismissBubble: () => void;
  sendMessage: (message: string) => void;
  applySuggestedAction: (action: WeliSuggestedAction) => void;
  rememberItem: (item: Omit<WeliMemoryItem, "id" | "createdAt">) => void;
  forgetItem: (itemId: string) => void;
  clearMemory: () => void;
  updateExpression: (expression: WeliExpression) => void;
};

const WeliContext = createContext<WeliState | null>(null);

export function WeliContextProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: WeliState;
}) {
  return <WeliContext.Provider value={value}>{children}</WeliContext.Provider>;
}

export function useWeli() {
  const context = useContext(WeliContext);

  if (!context) {
    throw new Error("useWeli must be used within WeliProvider.");
  }

  return context;
}
