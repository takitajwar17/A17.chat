import { BranchChatResponse } from "@/types/chat";
import { db } from "@/lib/db";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export interface UseChatBranchingOptions {
  onBranchSuccess?: (response: BranchChatResponse) => void;
  onBranchError?: (error: Error) => void;
}

/**
 * Custom hook for managing chat branching operations
 * Handles all branching logic client-side using Dexie/IndexedDB directly
 * @param options - Configuration options for branch callbacks
 * @returns Hook return object with branching methods and state
 */
export function useChatBranching(options: UseChatBranchingOptions = {}) {
  const [isBranching, setIsBranching] = useState(false);
  const [branchError, setBranchError] = useState<Error | null>(null);
  const [lastBranchResponse, setLastBranchResponse] = useState<BranchChatResponse | null>(null);
  const router = useRouter();

  /**
   * Creates a new chat branch using client-side database operations
   * @param originalChatId - ID of the chat to branch from
   * @param branchFromMessageIndex - Index of the last message to include (0-based, inclusive)
   * @param newTitle - Optional title for the branched chat
   * @param navigateToBranch - Whether to navigate to the new branch (default: true)
   * @returns Promise that resolves to the branch response
   */
  const createBranch = useCallback(async (
    originalChatId: string,
    branchFromMessageIndex: number,
    newTitle?: string,
    navigateToBranch: boolean = true
  ): Promise<BranchChatResponse> => {
    try {
      console.log(`[Branch] Starting client-side branch operation from chat ${originalChatId} at message ${branchFromMessageIndex}`);
      
      setIsBranching(true);
      setBranchError(null);
      setLastBranchResponse(null);

      // Perform the branching operation using Dexie directly
      const { newChat, messageCount } = await db.branchChat(
        originalChatId,
        branchFromMessageIndex,
        newTitle
      );

      const branchResponse: BranchChatResponse = {
        newChatId: newChat.id,
        branchedChat: {
          id: newChat.id,
          title: newChat.title,
          created_at: newChat.created_at.toISOString(),
          branchedFromChatId: newChat.branchedFromChatId!,
        },
        messageCount,
      };
      
      console.log(`[Branch] Successfully created branch chat ${branchResponse.newChatId}`);
      console.log(`[Branch] Copied ${branchResponse.messageCount} messages`);
      
      setLastBranchResponse(branchResponse);
      
      // Call success callback if provided
      options.onBranchSuccess?.(branchResponse);

      // Navigate to the new branch if requested
      if (navigateToBranch) {
        console.log(`[Branch] Navigating to new branch chat: ${branchResponse.newChatId}`);
        router.push(`/chat/${branchResponse.newChatId}`);
      }

      return branchResponse;

    } catch (error) {
      const branchError = error instanceof Error ? error : new Error("Unknown branching error");
      
      console.error(`[Branch] Error creating branch:`, branchError);
      setBranchError(branchError);
      
      // Call error callback if provided
      options.onBranchError?.(branchError);
      
      throw branchError;
    } finally {
      setIsBranching(false);
    }
  }, [router, options]);

  /**
   * Creates a branch with an auto-generated title based on the branching point
   * @param originalChatId - ID of the chat to branch from
   * @param branchFromMessageIndex - Index of the last message to include
   * @param navigateToBranch - Whether to navigate to the new branch
   * @returns Promise that resolves to the branch response
   */
  const createQuickBranch = useCallback(async (
    originalChatId: string,
    branchFromMessageIndex: number,
    navigateToBranch: boolean = true
  ): Promise<BranchChatResponse> => {
    try {
      // Get the original chat to access its title for better naming
      const originalChat = await db.chats.get(originalChatId);
      const originalTitle = originalChat?.title || 'Untitled Chat';
      
      // Simple branch naming: just the original title (icon will be shown in UI)
      const autoTitle = originalTitle;
      
      console.log(`[Branch] Generated branch title: "${autoTitle}" from original: "${originalTitle}"`);
      
      return createBranch(originalChatId, branchFromMessageIndex, autoTitle, navigateToBranch);
    } catch (error) {
      // Fallback to timestamp-based naming if title generation fails
      console.warn(`[Branch] Failed to generate contextual title, falling back to timestamp:`, error);
      const timestamp = new Date().toLocaleString();
      const fallbackTitle = `Branch from message ${branchFromMessageIndex + 1} (${timestamp})`;
      
      return createBranch(originalChatId, branchFromMessageIndex, fallbackTitle, navigateToBranch);
    }
  }, [createBranch]);

  /**
   * Resets the branching state (error and last response)
   */
  const resetBranchState = useCallback(() => {
    setBranchError(null);
    setLastBranchResponse(null);
  }, []);

  return {
    // State
    isBranching,
    branchError,
    lastBranchResponse,
    
    // Actions
    createBranch,
    createQuickBranch,
    resetBranchState,
    
    // Computed
    hasBranchError: !!branchError,
    hasLastBranch: !!lastBranchResponse,
  };
} 