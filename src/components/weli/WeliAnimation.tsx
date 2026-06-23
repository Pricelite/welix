"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWeli } from "@/components/weli/WeliContext";

export function WeliAnimation() {
  const { expression } = useWeli();

  return (
    <AnimatePresence initial={false}>
      {expression === "happy" || expression === "success" ? (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="weli-sparkles"
          exit={{ opacity: 0, scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <span />
          <span />
          <span />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

