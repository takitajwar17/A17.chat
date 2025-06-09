"use client";

import { MarkdownContent } from "@/components/markdown/markdown-chunker";
import { memo, useMemo } from "react";
import BranchButton from "./BranchButton";
import CopyButton from "./CopyButton";
import { ModelRegistry } from "@/lib/constants/models";

interface MessageItemProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
  timestamp?: Date;
  chatId?: string;
  messageIndex?: number;
  currentModel?: string; // The model that was used for this specific message
}

/**
 * Individual message component with semantic styling
 * Features proper message bubbles, markdown rendering, and action buttons
 */
const MessageItem = memo(function MessageItem({ 
  role, 
  content, 
  isLoading = false,
  timestamp,
  chatId,
  messageIndex,
  currentModel
}: MessageItemProps) {
  
  /**
   * Get display name for the current model
   */
  const modelDisplayName = useMemo(() => {
    if (!currentModel || role !== "assistant") return "Assistant";
    return ModelRegistry[currentModel]?.name || currentModel;
  }, [currentModel, role]);

  /**
   * Format timestamp for display
   */
  const formattedTime = useMemo(() => {
    if (!timestamp) return "";
    
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(timestamp);
  }, [timestamp]);

  /**
   * Determines if branching is available for this message
   * Only assistant messages with valid chat/message context can be branched
   */
  const canBranch = useMemo(() => {
    return role === "assistant" && 
           !isLoading && 
           chatId && 
           typeof messageIndex === "number" && 
           messageIndex >= 0;
  }, [role, isLoading, chatId, messageIndex]);

  /**
   * Determines if copy is available for this message
   * Available for assistant messages with content
   */
  const canCopy = useMemo(() => {
    return role === "assistant" && 
           !isLoading && 
           content.trim().length > 0;
  }, [role, isLoading, content]);

  return (
    <div className={`flex w-full ${role === "user" ? "justify-end" : "justify-start"} message-fade-in`}>
      <div className={`flex ${role === "user" ? "max-w-[80%]" : "w-full"} flex-col gap-2`}>
        {/* Message Content */}
        <div
          className={`relative ${
            role === "user" 
              ? "message-bubble message-user bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
              : "text-foreground"
          } ${isLoading ? "message-typing" : ""}`}
        >
          {role === "assistant" ? (
            <div className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <MarkdownContent content={content} />
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed m-0 word-wrap-break-word">
              {content}
            </p>
          )}
          
          {/* Loading indicator for streaming messages */}
          {isLoading && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 bg-muted rounded-full animate-pulse"></div>
                <div className="h-1.5 w-1.5 bg-muted rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="h-1.5 w-1.5 bg-muted rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Message Footer */}
        <div className={`flex items-center justify-between px-2 ${role === "user" ? "flex-row-reverse" : ""}`}>
          {/* Left side: Model/User info and timestamp */}
          <div className="flex items-center gap-2">
            {role === "assistant" && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                <SparklesIcon className="h-3 w-3 text-background" />
              </div>
            )}
            <span className="text-xs text-muted">
              {role === "user" ? "You" : modelDisplayName}
            </span>
            {timestamp && (
              <>
                <div className="h-1 w-1 rounded-full bg-muted opacity-50"></div>
                <span className="text-xs text-muted">
                  {formattedTime}
                </span>
              </>
            )}
          </div>
          
          {/* Right side: Action buttons for assistant messages */}
          {role === "assistant" && (
            <div className="flex items-center gap-1">
              {canCopy && (
                <CopyButton
                  content={content}
                  className="opacity-60 hover:opacity-100"
                />
              )}
              {canBranch && (
                <BranchButton
                  chatId={chatId!}
                  messageIndex={messageIndex!}
                  messageContent={content}
                  className="opacity-60 hover:opacity-100"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Sparkles icon for assistant messages
function SparklesIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

export default MessageItem;
