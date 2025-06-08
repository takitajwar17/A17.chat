"use client";

import { Chat, StoredMessage } from "@/types/database";
import { Message } from "ai";
import { useChat } from "ai/react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { db } from "@/lib/db";
import InputArea from "./InputArea";
import MessageList from "./MessageList";
import ModelSelector from "./ModelSelector";
import { ModelRegistry } from "@/lib/constants/models";

interface ChatInterfaceProps {
  chatId?: string;
}

/**
 * T3-style chat interface with proper layout and scroll behavior
 * Features clean design, auto-scroll, and responsive mobile layout
 */
export default function ChatInterface({ chatId }: ChatInterfaceProps) {
  const [currentModel, setCurrentModel] = useState<keyof typeof ModelRegistry>("gpt-4o");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pendingUserMessage = useRef<string | null>(null);
  const router = useRouter();

  // Fetch stored messages from database
  const storedMessages = useLiveQuery(async () => {
    if (!chatId) return [];
    return await db.getChatMessages(chatId);
  }, [chatId]);

  // Fetch current chat
  const currentChat = useLiveQuery(async () => {
    if (!chatId) return null;
    return await db.chats.get(chatId);
  }, [chatId]) as Chat | null | undefined;

  /**
   * Transform stored messages to AI SDK format
   */
  const transformedMessages: Message[] = (storedMessages || []).map((msg: StoredMessage) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: msg.content,
    createdAt: msg.created_at,
  }));

  /**
   * Handle AI responses with streaming and database storage
   */
  const { messages: sessionMessages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: "/api/chat",
    body: { model: currentModel },
    // Don't use initialMessages to avoid duplication
    
    onFinish: async (message) => {
      try {
        if (!chatId || !pendingUserMessage.current) return;

        // Store user message first
        await db.addMessage({
          chatId,
          role: "user",
          content: pendingUserMessage.current,
        });
        
        // Update chat title if needed
        if (currentChat && !currentChat.title) {
          const title = pendingUserMessage.current.slice(0, 50);
          await db.updateChatTitle(chatId, title);
        }

        // Store assistant message
        await db.addMessage({
          chatId,
          role: "assistant",
          content: message.content,
        });

        // Clear the pending message
        pendingUserMessage.current = null;
      } catch (error) {
        console.error("Error storing messages:", error);
      }
    },
  });

  /**
   * Combine stored messages with current session messages
   * Filter out duplicates by comparing content and timestamp
   */
  const allMessages: Message[] = useMemo(() => {
    const stored = transformedMessages;
    const session = sessionMessages;
    
    // If we have stored messages, show them
    // If we have session messages that aren't in stored yet, append them
    if (stored.length === 0) {
      return session;
    }
    
    // Find session messages that aren't in stored messages yet
    const newSessionMessages = session.filter(sessionMsg => {
      return !stored.some(storedMsg => 
        storedMsg.content === sessionMsg.content && 
        storedMsg.role === sessionMsg.role
      );
    });
    
    return [...stored, ...newSessionMessages];
  }, [transformedMessages, sessionMessages]);

  /**
   * Handle message submission
   */
  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) return;

    try {
      let activeChatId = chatId;

      // Create new chat if none exists
      if (!activeChatId) {
        const newChat = await db.createChat();
        activeChatId = newChat.id;
        router.push(`/chat/${activeChatId}`);
        return; // Let the new chat handle the message
      }

      // Store the current input to save later in onFinish
      pendingUserMessage.current = input.trim();

      // Just submit to AI
      handleSubmit(e);
    } catch (error) {
      console.error("Error submitting message:", error);
    }
  }, [input, chatId, handleSubmit, router]);

  /**
   * Auto-scroll to bottom on new messages
   */
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const scrollToBottom = () => {
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: "smooth",
      });
    };

    // Small delay to ensure content is rendered
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [allMessages]);

  /**
   * Handle scroll position for scroll-to-bottom button
   */
  const handleScroll = useCallback(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollArea;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom && scrollHeight > clientHeight);
  }, []);

  /**
   * Scroll to bottom manually
   */
  const scrollToBottom = useCallback(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    scrollArea.scrollTo({
      top: scrollArea.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="relative flex h-full flex-col bg-macchiato-base">
      {/* Chat Messages Container */}
      <div 
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-44 chat-scroll-container"
      >
        <div className="mx-auto max-w-4xl">
          <MessageList messages={allMessages} isLoading={isLoading} />
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-32 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-macchiato-surface0 text-macchiato-text shadow-lg transition-all duration-200 hover:bg-macchiato-surface1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-macchiato-mauve/50"
          aria-label="Scroll to bottom"
        >
          <ArrowDownIcon className="h-5 w-5" />
        </button>
      )}

      {/* Input Area - Floating Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-macchiato-base/95 backdrop-blur-md border-t border-macchiato-surface0 px-4 sm:px-6 lg:px-8 py-4 shadow-lg">
        <div className="mx-auto max-w-4xl space-y-3">
          <InputArea
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={onSubmit}
            disabled={isLoading}
          />
          
          <ModelSelector
            currentModel={currentModel}
            onModelChange={setCurrentModel}
          />
        </div>
      </div>
    </div>
  );
}

// Arrow down icon for scroll button
function ArrowDownIcon(props: React.ComponentProps<"svg">) {
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
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}
