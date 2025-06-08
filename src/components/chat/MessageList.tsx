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
      <div className="flex h-full flex-col items-center justify-center space-y-8 py-16">
        {/* Welcome Message */}
        <div className="text-center">
          <h1 className="text-3xl font-medium text-macchiato-text mb-8">
            How can I help you?
          </h1>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <ActionButton icon={<CreateIcon />} label="Create" />
            <ActionButton icon={<ExploreIcon />} label="Explore" />
            <ActionButton icon={<CodeIcon />} label="Code" />
            <ActionButton icon={<LearnIcon />} label="Learn" />
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="w-full max-w-2xl space-y-3">
          {suggestedPrompts.map((prompt, index) => (
            <div
              key={index}
              className="text-center p-4 rounded-xl border border-macchiato-surface0/50 bg-transparent text-macchiato-subtext1 hover:bg-macchiato-surface0/30 transition-colors cursor-pointer"
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

// Action Button Component
function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-macchiato-surface0 bg-transparent text-macchiato-text hover:bg-macchiato-surface0/50 transition-colors">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

// Suggested prompts matching the T3 interface
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
