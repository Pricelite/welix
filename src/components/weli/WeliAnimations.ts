import type { Transition, Variants } from "framer-motion";

export type WeliExpression =
  | "idle"
  | "happy"
  | "thinking"
  | "speaking"
  | "sleeping"
  | "warning"
  | "success"
  | "error";

export const weliFloatTransition: Transition = {
  duration: 4.2,
  ease: "easeInOut",
  repeat: Number.POSITIVE_INFINITY,
  repeatType: "mirror",
};

export const weliBodyVariants: Variants = {
  idle: {
    y: [0, -5, 0],
    rotate: [0, -1.5, 0],
    scale: [1, 1.02, 1],
    transition: {
      duration: 4.8,
      ease: "easeInOut",
      repeat: Number.POSITIVE_INFINITY,
    },
  },
  happy: {
    y: [0, -16, 0],
    rotate: [0, -4, 4, 0],
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.9,
      ease: "easeOut",
      repeat: 1,
    },
  },
  thinking: {
    y: [0, -2, 0],
    rotate: [0, -6, -2, 0],
    transition: {
      duration: 1.6,
      ease: "easeInOut",
      repeat: Number.POSITIVE_INFINITY,
    },
  },
  speaking: {
    y: [0, -3, 0],
    rotate: [0, 2, -2, 0],
    transition: {
      duration: 1.2,
      ease: "easeInOut",
      repeat: Number.POSITIVE_INFINITY,
    },
  },
  sleeping: {
    y: [0, 2, 0],
    rotate: [0, 3, 0],
    transition: {
      duration: 3.8,
      ease: "easeInOut",
      repeat: Number.POSITIVE_INFINITY,
    },
  },
  warning: {
    x: [0, -2, 2, 0],
    rotate: [0, -3, 3, 0],
    transition: {
      duration: 0.7,
      ease: "easeInOut",
      repeat: Number.POSITIVE_INFINITY,
    },
  },
  success: {
    y: [0, -18, 0],
    scale: [1, 1.08, 1],
    rotate: [0, -5, 5, 0],
    transition: {
      duration: 1,
      ease: "easeOut",
      repeat: 1,
    },
  },
  error: {
    y: [0, 4, 0],
    rotate: [0, -4, 0],
    transition: {
      duration: 1.4,
      ease: "easeInOut",
      repeat: Number.POSITIVE_INFINITY,
    },
  },
};

export const weliAntennaVariants: Variants = {
  idle: { opacity: 0.75, scale: 1 },
  happy: {
    opacity: [0.75, 1, 0.85],
    scale: [1, 1.16, 1],
    transition: { duration: 0.9, ease: "easeInOut", repeat: 1 },
  },
  thinking: {
    opacity: [0.55, 1, 0.55],
    scale: [1, 1.22, 1],
    transition: { duration: 0.8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY },
  },
  speaking: {
    opacity: [0.65, 0.92, 0.65],
    transition: { duration: 0.7, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY },
  },
  sleeping: { opacity: 0.35, scale: 0.95 },
  warning: {
    opacity: [0.65, 1, 0.65],
    backgroundColor: ["#22c55e", "#f59e0b", "#22c55e"],
    transition: { duration: 0.9, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY },
  },
  success: {
    opacity: [0.7, 1, 0.8],
    scale: [1, 1.3, 1],
    transition: { duration: 1, ease: "easeOut", repeat: 1 },
  },
  error: {
    opacity: [0.35, 0.7, 0.35],
    backgroundColor: ["#22c55e", "#fb7185", "#22c55e"],
    transition: { duration: 1.2, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY },
  },
};

