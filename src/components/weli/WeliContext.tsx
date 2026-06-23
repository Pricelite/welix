"use client";

import React, { createContext, useContext } from "react";
import type { WeliMessage } from "@/components/weli/WeliChat";
import type { WeliExpression } from "@/components/weli/WeliAnimations";

export type WeliPreset = {
  title: string;
  bubble: string;
  opening: string;
  quickActions: string[];
};

export type WeliState = {
  pathname: string;
  pageLabel: string;
  preset: WeliPreset;
  expression: WeliExpression;
  bubbleOpen: boolean;
  chatOpen: boolean;
  pointer: {
    x: number;
    y: number;
  };
  messages: WeliMessage[];
  openChat: () => void;
  closeChat: () => void;
  dismissBubble: () => void;
  sendMessage: (message: string) => void;
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

