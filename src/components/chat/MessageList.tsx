"use client";
import { Message } from "ai";
import { memo } from "react";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

/**
 * Message list container with T3-style layout and spacing
 * Handles the display of all chat messages with proper formatting
 */
const MessageList = memo(function MessageList({ messages, isLoading }: MessageListProps) {
  
  // Show welcome message if no messages exist
  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-6 py-16 pb-40">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-macchiato-mauve to-macchiato-pink shadow-lg">
          <SparklesIcon className="h-8 w-8 text-macchiato-crust" />
        </div>
        
        <div className="space-y-3 text-center">
          <h2 className="text-2xl font-semibold text-macchiato-text">
            Welcome to Chat
          </h2>
          <p className="text-macchiato-subtext0 max-w-md text-balance">
            Start a conversation with AI. Ask questions, get help with coding, 
            or just have a friendly chat.
          </p>
        </div>

        {/* Suggested prompts */}
        <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
          {suggestedPrompts.map((prompt, index) => (
            <div
              key={index}
              className="rounded-xl border border-macchiato-surface0 bg-macchiato-mantle/50 p-4 text-sm text-macchiato-subtext0 hover:bg-macchiato-surface0/50 transition-colors cursor-pointer"
            >
              {prompt}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 py-4 pb-40">
      {messages.map((message, index) => (
        <MessageItem
          key={message.id || index}
          role={message.role as "user" | "assistant"}
          content={message.content}
          timestamp={message.createdAt ? new Date(message.createdAt) : new Date()}
          isLoading={isLoading && index === messages.length - 1 && message.role === "assistant"}
        />
      ))}
      
      {/* Loading indicator for new assistant messages */}
      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <MessageItem
          role="assistant"
          content=""
          isLoading={true}
        />
      )}
    </div>
  );
});

// Suggested prompts for new conversations
const suggestedPrompts = [
  "Help me debug this code snippet",
  "Explain a programming concept",
  "Review my project architecture", 
  "Write a function for me"
];

// Sparkles icon component
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

export default MessageList;
