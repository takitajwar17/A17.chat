"use client";
import { Message } from "ai";
import { memo } from "react";
import MessageItem from "./MessageItem";
import { ModelRegistry } from "@/lib/constants/models";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  isAwaitingResponse?: boolean;
  chatId?: string; // Add chatId for branching support
  currentModel?: string; // Add current model for assistant message display
}

/**
 * Message list container with semantic styling and compact spacing
 * Handles the display of all chat messages with proper formatting and branching support
 */
const MessageList = memo(function MessageList({ 
  messages, 
  isLoading, 
  isAwaitingResponse,
  chatId,
  currentModel
}: MessageListProps) {
  
  // Get model display name from registry
  const modelDisplayName = currentModel && ModelRegistry[currentModel] 
    ? ModelRegistry[currentModel].name 
    : undefined;

  // Show welcome message if no messages exist
  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col justify-center space-y-4 py-8 pt-16">
        {/* Welcome Message - Left aligned and bigger */}
        <div className="text-left">
          <h1 className="text-4xl font-medium text-foreground mb-8">
            How can I help you?
          </h1>
          
          {/* Action Buttons - Left aligned */}
          <div className="flex flex-wrap gap-3 mb-6">
            <ActionButton icon={<CreateIcon />} label="Create" />
            <ActionButton icon={<ExploreIcon />} label="Explore" />
            <ActionButton icon={<CodeIcon />} label="Code" />
            <ActionButton icon={<LearnIcon />} label="Learn" />
          </div>
        </div>

        {/* Suggested Prompts - Left aligned and wider */}
        <div className="w-full space-y-3">
          {suggestedPrompts.map((prompt, index) => (
            <div
              key={index}
              className="text-left px-0 py-3 rounded-lg bg-transparent text-muted hover:bg-secondary/30 transition-colors cursor-pointer text-base"
            >
              {prompt}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 py-4">
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;
        const isAssistantMessage = message.role === "assistant";
        const hasContent = message.content.trim().length > 0;
        
        // Show loading dots only for assistant messages that are actively being generated
        // but haven't started streaming content yet (empty content)
        // Once content starts arriving, hide the loading indicator
        const shouldShowLoading = (isLoading || isAwaitingResponse) && isLastMessage && isAssistantMessage && !hasContent;
        
        return (
          <MessageItem
            key={message.id || index}
            role={message.role as "user" | "assistant"}
            content={message.content}
            timestamp={message.createdAt ? new Date(message.createdAt) : new Date()}
            isLoading={shouldShowLoading}
            chatId={chatId}
            messageIndex={index}
            currentModel={currentModel}
          />
        );
      })}
      
      {/* Loading indicator for new assistant messages (gap between send and streaming starts) */}
      {(isLoading || isAwaitingResponse) && messages[messages.length - 1]?.role === "user" && (
        <MessageItem
          role="assistant"
          content=""
          isLoading={true}
          chatId={chatId}
          messageIndex={messages.length}
          currentModel={currentModel}
        />
      )}
    </div>
  );
});

// Action Button Component - Properly sized for left-aligned layout with semantic colors
function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-transparent text-foreground hover:bg-secondary/50 transition-colors">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

// Suggested prompts matching the interface
const suggestedPrompts = [
  "How does AI work?",
  "Are black holes real?",
  "How many Rs are in the word \"strawberry\"?",
  "What is the meaning of life?"
];

// Icon Components
function CreateIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function LearnIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

export default MessageList;
