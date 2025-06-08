"use client";

import { usePersistentChat } from "@/hooks/usePersistentChat";
import { ModelRegistry } from "@/lib/constants/models";
import React, { useLayoutEffect, useRef, useState, useCallback } from "react";
import InputArea from "./InputArea";
import MessageList from "./MessageList";
import ModelSelector from "./ModelSelector";

interface ChatInterfaceProps {
  chatId?: string;
}

/**
 * Main chat interface component with T3-style design
 * Features responsive layout, smooth scrolling, and proper state management
 */
function ChatInterface({ chatId }: ChatInterfaceProps) {
  const [model, setModel] = useState<keyof typeof ModelRegistry>("claude-3-5-sonnet-20241022");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    //currentChat
  } = usePersistentChat({
    id: chatId,
    model,
  });

  /**
   * Auto-scroll to bottom when new messages arrive
   * Uses smooth scrolling for better UX
   */
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current && autoScroll) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? "smooth" : "auto",
        block: "end" 
      });
    }
  }, [autoScroll]);

  // Auto-scroll when messages change
  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /**
   * Handle scroll events to determine if auto-scroll should be enabled
   * Disable auto-scroll when user scrolls up, re-enable when at bottom
   */
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold
    
    setAutoScroll(isAtBottom);
  }, []);

  return (
    <div className="relative h-full w-full bg-macchiato-base" role="main" aria-label="Chat Interface">
      {/* Messages Container - Full height with bottom padding for input overlay */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto pb-32 scrollbar-thin scrollbar-thumb-macchiato-surface2 scrollbar-track-transparent hover:scrollbar-thumb-macchiato-overlay0"
        style={{ 
          scrollbarWidth: "thin",
          scrollbarColor: "rgb(91 96 120) transparent"
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        
        {/* Messages */}
        <div className="relative mx-auto w-full max-w-4xl px-4 py-8">
          <MessageList messages={messages} isLoading={isLoading} />
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {!autoScroll && (
        <button
          onClick={() => {
            setAutoScroll(true);
            scrollToBottom();
          }}
          className="absolute right-6 bottom-40 flex h-10 w-10 items-center justify-center rounded-full bg-macchiato-surface0 shadow-lg transition-all duration-200 hover:bg-macchiato-surface1 hover:shadow-xl border border-macchiato-surface1 z-20"
          aria-label="Scroll to bottom"
        >
          <ChevronDownIcon className="h-5 w-5 text-macchiato-text" />
        </button>
      )}

      {/* Input Area - Absolute overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-30 border-t border-macchiato-surface0 bg-macchiato-base/95 backdrop-blur-md shadow-lg">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <InputArea
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            disabled={isLoading}
          />
          
          {/* Model Selector */}
          <div className="mt-3 pt-3 border-t border-macchiato-surface0/50">
            <ModelSelector currentModel={model} onModelChange={setModel} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Chevron down icon for scroll to bottom button
function ChevronDownIcon(props: React.ComponentProps<"svg">) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default ChatInterface;
