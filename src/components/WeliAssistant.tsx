"use client";

import React from "react";
import { WeliAvatar } from "@/components/weli/WeliAvatar";
import { WeliBubble } from "@/components/weli/WeliBubble";
import { WeliChat } from "@/components/weli/WeliChat";
import { useWeli } from "@/components/weli/WeliContext";

export function WeliAssistant() {
  const {
    bubbleOpen,
    chatOpen,
    closeChat,
    expression,
    messages,
    openChat,
    pageLabel,
    preset,
    sendMessage,
  } = useWeli();

  return (
    <>
      <div className="weli-assistant" data-testid="weli-assistant">
        <WeliBubble
          message={preset.bubble}
          onOpenChat={openChat}
          open={bubbleOpen && !chatOpen}
          title={preset.title}
        />
        <WeliAvatar expression={expression} interactive onClick={openChat} />
      </div>

      <WeliChat
        expression={expression}
        messages={messages}
        onClose={closeChat}
        onSendMessage={sendMessage}
        open={chatOpen}
        pageLabel={pageLabel}
        quickActions={preset.quickActions}
      />
    </>
  );
}

