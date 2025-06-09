"use client";

import { memo, useState } from "react";

interface CopyButtonProps {
  content: string;
  className?: string;
}

/**
 * Copy button component that copies message content to clipboard
 * Provides visual feedback when copy succeeds or fails
 */
const CopyButton = memo(function CopyButton({ 
  content, 
  className = "" 
}: CopyButtonProps) {
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');

  /**
   * Handles copying content to clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      console.log(`[CopyButton] Successfully copied ${content.length} characters to clipboard`);
      
      setCopyState('success');
      
      // Reset state after showing success feedback
      setTimeout(() => {
        setCopyState('idle');
      }, 2000);
      
    } catch (error) {
      console.error(`[CopyButton] Failed to copy to clipboard:`, error);
      setCopyState('error');
      
      // Reset state after showing error feedback
      setTimeout(() => {
        setCopyState('idle');
      }, 2000);
    }
  };

  // Different button content based on copy state
  const getButtonContent = () => {
    switch (copyState) {
      case 'success':
        return (
          <>
            <CheckIcon className="h-3 w-3" />
            <span>Copied</span>
          </>
        );
      case 'error':
        return (
          <>
            <XIcon className="h-3 w-3" />
            <span>Failed</span>
          </>
        );
      default:
        return (
          <>
            <CopyIcon className="h-3 w-3" />
            <span>Copy</span>
          </>
        );
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={copyState !== 'idle'}
      className={`
        flex items-center gap-1 px-2 py-1 
        text-xs text-muted hover:text-foreground 
        bg-transparent hover:bg-secondary 
        border border-transparent hover:border-border 
        rounded transition-all duration-200
        ${copyState === 'success' ? 'text-success' : ''}
        ${copyState === 'error' ? 'text-error' : ''}
        ${className}
      `}
      title={`Copy message content (${content.length} characters)`}
    >
      {getButtonContent()}
    </button>
  );
});

/**
 * Copy icon component
 */
function CopyIcon(props: React.ComponentProps<"svg">) {
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
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

/**
 * Check icon for success state
 */
function CheckIcon(props: React.ComponentProps<"svg">) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * X icon for error state
 */
function XIcon(props: React.ComponentProps<"svg">) {
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
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export default CopyButton; 