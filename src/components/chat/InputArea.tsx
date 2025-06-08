"use client";

import { useCallback, useRef, useEffect } from "react";

interface InputAreaProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
}

/**
 * T3-style input area component with modern design and interactions
 * Features auto-resizing textarea, smooth animations, and proper accessibility
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
      <div className="relative flex items-end gap-3 rounded-2xl border border-macchiato-surface0 bg-macchiato-surface0/50 p-3 transition-all duration-200 hover:border-macchiato-surface1 focus-within:border-macchiato-mauve/50 focus-within:bg-macchiato-surface0/70">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-macchiato-text placeholder:text-macchiato-subtext0 focus:outline-none disabled:opacity-50 text-sm leading-relaxed min-h-[20px] max-h-[176px] overflow-y-auto scrollbar-thin scrollbar-thumb-macchiato-surface2 scrollbar-track-transparent"
          style={{ 
            scrollbarWidth: "thin",
            scrollbarColor: "rgb(91 96 120) transparent" 
          }}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-macchiato-mauve text-macchiato-crust transition-all duration-200 hover:bg-macchiato-mauve/90 focus:outline-none focus:ring-2 focus:ring-macchiato-mauve/50 focus:ring-offset-2 focus:ring-offset-macchiato-base disabled:bg-macchiato-surface1 disabled:text-macchiato-subtext0"
          aria-label="Send message"
        >
          {disabled ? (
            <LoadingIcon className="h-4 w-4 animate-spin" />
          ) : (
            <SendIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Hint Text */}
      <div className="mt-2 flex items-center justify-between text-xs text-macchiato-subtext0">
        <span>
          Press{" "}
          <kbd className="rounded bg-macchiato-surface0 px-1 py-0.5 font-mono">
            Enter
          </kbd>{" "}
          to send,{" "}
          <kbd className="rounded bg-macchiato-surface0 px-1 py-0.5 font-mono">
            Shift + Enter
          </kbd>{" "}
          for new line
        </span>
        <span className="hidden sm:block">
          {input.length > 0 && `${input.length} characters`}
        </span>
      </div>
    </form>
  );
}

// Send icon component
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

// Loading icon component
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
