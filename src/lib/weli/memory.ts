import type { WeliMemoryItem } from "@/lib/weli/types";

const STORAGE_KEY = "welix:weli-memory";

function safeParseMemory(input: string | null): WeliMemoryItem[] {
  if (!input) {
    return [];
  }

  try {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? (parsed as WeliMemoryItem[]) : [];
  } catch {
    return [];
  }
}

export function readWeliMemory() {
  if (typeof window === "undefined") {
    return [];
  }

  return safeParseMemory(window.localStorage.getItem(STORAGE_KEY));
}

export function writeWeliMemory(memory: WeliMemoryItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
}

export function createMemoryItem(
  item: Omit<WeliMemoryItem, "id" | "createdAt">,
): WeliMemoryItem {
  return {
    ...item,
    id: `memory-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
}
