"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type WeliBubbleProps = {
  title: string;
  message: string;
  open: boolean;
  onOpenChat: () => void;
};

export function WeliBubble({ title, message, open, onOpenChat }: WeliBubbleProps) {
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="weli-bubble"
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          initial={{ opacity: 0, y: 18, scale: 0.94 }}
          transition={{ duration: 0.26, ease: "easeOut" }}
        >
          <div className="weli-bubble-head">
            <strong>{title}</strong>
            <button aria-label="Ouvrir le panneau Weli" className="weli-bubble-icon" onClick={onOpenChat} type="button">
              <ArrowUpRight size={14} />
            </button>
          </div>
          <p>{message}</p>
          <button className="weli-bubble-action" onClick={onOpenChat} type="button">
            Ouvrir Weli
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
