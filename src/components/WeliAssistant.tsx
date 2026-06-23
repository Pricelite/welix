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
    page,
    memory,
    workspace,
    activeContext,
    sendMessage,
    applySuggestedAction,
    forgetItem,
    clearMemory,
  } = useWeli();

  return (
    <>
      {!chatOpen ? (
        <div className="weli-assistant" data-testid="weli-assistant">
          <WeliBubble
            message={page.bubble}
            onOpenChat={openChat}
            open={bubbleOpen}
            title={page.title}
          />
          <WeliAvatar expression={expression} interactive onClick={openChat} />
        </div>
      ) : null}

      <WeliChat
        activeContext={activeContext}
        expertise={page.expertise}
        expression={expression}
        memory={memory}
        messages={messages}
        objective={page.objective}
        onApplySuggestedAction={applySuggestedAction}
        onClearMemory={clearMemory}
        onClose={closeChat}
        onForgetMemory={forgetItem}
        onSendMessage={sendMessage}
        open={chatOpen}
        pageLabel={page.pageLabel}
        quickActions={page.quickActions}
        suggestedActions={page.suggestedActions}
        workspace={workspace}
      />
    </>
  );
}
