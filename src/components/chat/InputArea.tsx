"use client";

import { useCallback, useRef, useEffect } from "react";

interface InputAreaProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
}

/**
 * Compact input area component with send button on the right
 * Features auto-resizing textarea and clean, minimal design
 */
function InputArea({ input, handleInputChange, handleSubmit, disabled }: InputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Auto-resize textarea based on content with reduced height constraints
   */
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";
    
    // Calculate new height (min 36px, max 120px for more compact design)
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 36), 120);
    textarea.style.height = `${newHeight}px`;
  }, []);

  // Adjust height whenever input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  /**
   * Handle key press events for better UX
   * Enter to submit, Shift+Enter for new line
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !disabled) {
        // Create a synthetic form event
        const form = e.currentTarget.closest("form");
        if (form) {
          const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        }
      }
    }
  }, [input, disabled]);

  /**
   * Handle form submission with validation
   */
  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      handleSubmit(e);
    }
  }, [input, disabled, handleSubmit]);

  return (
    <form onSubmit={onSubmit} className="relative">
      <div className="relative flex items-end gap-3 rounded-xl border border-macchiato-surface0 bg-macchiato-surface0/30 p-3 transition-all duration-200 hover:border-macchiato-surface1 focus-within:border-macchiato-surface1">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-macchiato-text placeholder:text-macchiato-subtext0 focus:outline-none focus:ring-0 focus:border-transparent disabled:opacity-50 text-sm leading-relaxed min-h-[20px] max-h-[96px] overflow-y-auto"
          style={{ outline: 'none', boxShadow: 'none' }}
        />

        {/* Send Button - Compact design with upright arrow */}
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-macchiato-mauve text-macchiato-crust transition-all duration-200 hover:bg-macchiato-mauve/90 focus:outline-none focus:ring-2 focus:ring-macchiato-mauve/50 disabled:bg-macchiato-surface1 disabled:text-macchiato-subtext0"
          aria-label="Send message"
        >
          {disabled ? (
            <LoadingIcon className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  );
}

// Icon components
function ArrowUpIcon(props: React.ComponentProps<"svg">) {
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
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}

function LoadingIcon(props: React.ComponentProps<"svg">) {
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default InputArea;
