"use client";

import { useChatBranching } from "@/hooks/useChatBranching";
import { memo, useState } from "react";

interface BranchButtonProps {
  chatId: string;
  messageIndex: number;
  messageContent: string;
  className?: string;
}

/**
 * Branch button component that creates alternative conversation paths
 * Appears on hover over assistant messages, allows branching from that point
 */
const BranchButton = memo(function BranchButton({ 
  chatId, 
  messageIndex, 
  messageContent,
  className = "" 
}: BranchButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { createQuickBranch, isBranching } = useChatBranching({
    onBranchSuccess: (response) => {
      console.log(`[BranchButton] Successfully created branch: ${response.newChatId}`);
      setShowConfirm(false);
    },
    onBranchError: (error) => {
      console.error(`[BranchButton] Branch failed:`, error);
      setShowConfirm(false);
    },
  });

  /**
   * Handles the branch creation process
   */
  const handleBranch = async () => {
    try {
      console.log(`[BranchButton] Creating branch from message ${messageIndex} in chat ${chatId}`);
      await createQuickBranch(chatId, messageIndex);
    } catch (error) {
      console.error(`[BranchButton] Failed to create branch:`, error);
    }
  };

  /**
   * Shows confirmation before branching
   */
  const handleBranchClick = () => {
    setShowConfirm(true);
  };

  /**
   * Cancels the branching operation
   */
  const handleCancel = () => {
    setShowConfirm(false);
  };

  // Show branch button with optional overlays
  return (
    <div className="relative">
      {/* Main branch button - always rendered to maintain layout */}
      <button
        onClick={handleBranchClick}
        disabled={isBranching}
        className={`
          flex items-center gap-1 px-2 py-1 
          text-xs text-muted hover:text-foreground 
          bg-transparent hover:bg-secondary 
          border border-transparent hover:border-border 
          rounded transition-all duration-200
          ${isBranching ? "opacity-50" : ""}
          ${className}
        `}
        title={`Branch conversation from this point (${messageIndex + 1} messages will be copied)`}
      >
        <BranchIcon className="h-3 w-3" />
        <span>Branch</span>
      </button>

      {/* Loading overlay - positioned absolutely to avoid layout shift */}
      {isBranching && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-secondary/90 rounded z-10">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
            <span className="text-xs text-muted">Creating...</span>
          </div>
        </div>
      )}

      {/* Confirmation dialog overlay - positioned absolutely to avoid layout shift */}
      {showConfirm && !isBranching && (
        <div className="absolute top-0 left-0 z-10 flex flex-col gap-2 p-2 bg-secondary border border-border rounded-md shadow-lg min-w-max">
          <p className="text-xs text-foreground whitespace-nowrap">
            Create a new conversation branch from this point?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleBranch}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Create Branch
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * Branch icon component using the GitHub branch SVG
 */
function BranchIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 640 1024"
      fill="currentColor"
    >
      <path d="M512 192c-70.625 0-128 57.344-128 128 0 47.219 25.875 88.062 64 110.281V448c0 0 0 128-128 128-53.062 0-94.656 11.375-128 28.812V302.28099999999995c38.156-22.219 64-63.062 64-110.281 0-70.656-57.344-128-128-128S0 121.34400000000005 0 192c0 47.219 25.844 88.062 64 110.281V721.75C25.844 743.938 0 784.75 0 832c0 70.625 57.344 128 128 128s128-57.375 128-128c0-33.5-13.188-63.75-34.25-86.625C240.375 722.5 270.656 704 320 704c254 0 256-256 256-256v-17.719c38.125-22.219 64-63.062 64-110.281C640 249.34400000000005 582.625 192 512 192zM128 128c35.406 0 64 28.594 64 64s-28.594 64-64 64-64-28.594-64-64S92.594 128 128 128zM128 896c-35.406 0-64-28.625-64-64 0-35.312 28.594-64 64-64s64 28.688 64 64C192 867.375 163.406 896 128 896zM512 384c-35.375 0-64-28.594-64-64s28.625-64 64-64 64 28.594 64 64S547.375 384 512 384z"/>
    </svg>
  );
}

export default BranchButton; 