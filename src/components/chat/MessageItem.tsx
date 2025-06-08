"use client";

import { MarkdownContent } from "@/components/markdown/markdown-chunker";
import { memo, useMemo } from "react";

interface MessageItemProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
  timestamp?: Date;
}

/**
 * Individual message component with T3-style design
 * Features proper message bubbles, markdown rendering, and animations
 */
const MessageItem = memo(function MessageItem({ 
  role, 
  content, 
  isLoading = false,
  timestamp 
}: MessageItemProps) {
  
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

  return (
    <div className={`flex w-full ${role === "user" ? "justify-end" : "justify-start"} message-fade-in`}>
      <div className={`flex ${role === "user" ? "max-w-[85%]" : "w-full"} flex-col gap-2`}>
        {/* Message Content */}
        <div
          className={`relative ${
            role === "user" 
              ? "message-bubble message-user shadow-lg shadow-macchiato-mauve/20" 
              : "text-macchiato-text"
          } ${isLoading ? "message-typing" : ""}`}
        >
          {role === "assistant" ? (
            <div className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <MarkdownContent content={content} />
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed m-0">
              {content}
            </p>
          )}
          
          {/* Loading indicator for streaming messages */}
          {isLoading && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 bg-macchiato-subtext0 rounded-full animate-pulse"></div>
                <div className="h-1.5 w-1.5 bg-macchiato-subtext0 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="h-1.5 w-1.5 bg-macchiato-subtext0 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Timestamp and Role Indicator */}
        <div className={`flex items-center gap-2 px-2 ${role === "user" ? "justify-end" : "justify-start"}`}>
          <div className="flex items-center gap-2">
            {role === "assistant" && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-macchiato-mauve to-macchiato-pink">
                <SparklesIcon className="h-3 w-3 text-macchiato-crust" />
              </div>
            )}
            <span className="text-xs text-macchiato-subtext0">
              {role === "user" ? "You" : "Assistant"}
            </span>
          </div>
          {timestamp && (
            <>
              <div className="h-1 w-1 rounded-full bg-macchiato-subtext0 opacity-50"></div>
              <span className="text-xs text-macchiato-subtext0">
                {formattedTime}
              </span>
            </>
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
