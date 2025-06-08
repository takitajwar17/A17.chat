"use client";

import { useCallback, useRef, useEffect } from "react";

interface InputAreaProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
}

/**
 * Modern input area component with clean design and grouped icons
 * Features auto-resizing textarea, speech bubble icon container, and smooth interactions
 */
function InputArea({ input, handleInputChange, handleSubmit, disabled }: InputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Auto-resize textarea based on content
   * Maintains proper height constraints for better UX
   */
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";
    
    // Calculate new height (min 44px, max 200px)
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 200);
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
      <div className="relative flex items-end gap-3 rounded-xl border border-macchiato-surface0 bg-macchiato-surface0/30 p-4 transition-all duration-200 hover:border-macchiato-surface1 focus-within:border-macchiato-surface1">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-macchiato-text placeholder:text-macchiato-subtext0 focus:outline-none focus:ring-0 focus:border-transparent disabled:opacity-50 text-sm leading-relaxed min-h-[20px] max-h-[176px] overflow-y-auto"
          style={{ outline: 'none', boxShadow: 'none' }}
        />

        {/* Icon Group - Speech Bubble Style */}
        <div className="flex items-center bg-macchiato-surface1 rounded-full px-2 py-1 gap-1">
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center text-macchiato-subtext0 hover:text-macchiato-text transition-colors rounded-full hover:bg-macchiato-surface0"
            aria-label="Happy face"
          >
            <HappyIcon className="h-4 w-4" />
          </button>
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-macchiato-mauve text-macchiato-crust transition-all duration-200 hover:bg-macchiato-mauve/90 focus:outline-none focus:ring-2 focus:ring-macchiato-mauve/50 disabled:bg-macchiato-surface1 disabled:text-macchiato-subtext0"
            aria-label="Send message"
          >
            {disabled ? (
              <LoadingIcon className="h-3 w-3 animate-spin" />
            ) : (
              <SendIcon className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

// Icon components
function HappyIcon(props: React.ComponentProps<"svg">) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

function SendIcon(props: React.ComponentProps<"svg">) {
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
      <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
      <path d="M6 12h16" />
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
