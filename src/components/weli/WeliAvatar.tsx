"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { WeliAnimation } from "@/components/weli/WeliAnimation";
import { useWeli } from "@/components/weli/WeliContext";
import {
  type WeliExpression,
  weliAntennaVariants,
  weliBodyVariants,
} from "@/components/weli/WeliAnimations";

type WeliAvatarProps = {
  expression: WeliExpression;
  interactive?: boolean;
  compact?: boolean;
  onClick?: () => void;
};

export function WeliAvatar({
  expression,
  interactive = false,
  compact = false,
  onClick,
}: WeliAvatarProps) {
  const { pointer } = useWeli();
  const eyeOffsetX = (pointer.x - 0.5) * 3.2;
  const eyeOffsetY = (pointer.y - 0.5) * 2.2;
  const headRotate = (pointer.x - 0.5) * 6;

  const avatarBody = (
    <>
      <motion.div animate={expression} className="weli-antenna" variants={weliAntennaVariants}>
        <span />
      </motion.div>

      <motion.div
        animate={expression}
        className="weli-robot"
        style={{ rotate: headRotate }}
        variants={weliBodyVariants}
      >
        <div className="weli-head">
          <motion.div
            className={cn("weli-eyes", `is-${expression}`)}
            style={{
              x: eyeOffsetX,
              y: eyeOffsetY,
            }}
          >
            <span className="weli-eye left" />
            <span className="weli-eye right" />
          </motion.div>
          <span className="weli-mouth" />
        </div>

        <div className="weli-arms" aria-hidden="true">
          <span className="weli-arm left" />
          <span className="weli-arm right" />
        </div>

        <div className="weli-torso">
          <div className="weli-badge">
            <Sparkles size={compact ? 11 : 12} />
            <span>W</span>
          </div>
        </div>

        <div className="weli-legs" aria-hidden="true">
          <span className="weli-leg left" />
          <span className="weli-leg right" />
        </div>

        <WeliAnimation />
      </motion.div>
    </>
  );

  return (
    <div className={cn("weli-shell", compact && "weli-shell-compact")}>
      {interactive ? (
        <button
          aria-label="Ouvrir l'assistant Weli"
          className={cn("weli-avatar", "weli-avatar-button", compact && "compact")}
          onClick={onClick}
          type="button"
        >
          {avatarBody}
        </button>
      ) : (
        <div className={cn("weli-avatar", compact && "compact")}>{avatarBody}</div>
      )}
    </div>
  );
}

