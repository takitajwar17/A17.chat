"use client";

import { Chat } from "@/types/database";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { memo, useMemo } from "react";
import { db } from "@/lib/db";

interface BranchInfoProps {
  currentChat: Chat | null | undefined;
  className?: string;
}

/**
 * Component that displays branch information when viewing a branched chat
 * Shows the original chat title and provides navigation back to the original
 */
const BranchInfo = memo(function BranchInfo({ 
  currentChat, 
  className = "" 
}: BranchInfoProps) {
  const router = useRouter();

  // Get the original chat if this is a branched chat
  const originalChat = useLiveQuery(async () => {
    if (!currentChat?.branchedFromChatId) return null;
    return await db.chats.get(currentChat.branchedFromChatId);
  }, [currentChat?.branchedFromChatId]);

  // Get other branches from the same original chat
  const siblingBranches = useLiveQuery(async () => {
    if (!currentChat?.branchedFromChatId) return [];
    const branches = await db.getBranchedChats(currentChat.branchedFromChatId);
    // Filter out the current chat from siblings
    return branches.filter(branch => branch.id !== currentChat.id);
  }, [currentChat?.branchedFromChatId, currentChat?.id]);

  /**
   * Navigate to the original chat
   */
  const handleGoToOriginal = () => {
    if (originalChat) {
      console.log(`[BranchInfo] Navigating to original chat: ${originalChat.id}`);
      router.push(`/chat/${originalChat.id}`);
    }
  };

  /**
   * Navigate to a sibling branch
   */
  const handleGoToBranch = (branchId: string) => {
    console.log(`[BranchInfo] Navigating to sibling branch: ${branchId}`);
    router.push(`/chat/${branchId}`);
  };

  /**
   * Format the branch creation time
   */
  const branchCreatedTime = useMemo(() => {
    if (!currentChat?.created_at) return "";
    
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(currentChat.created_at));
  }, [currentChat?.created_at]);

  // Don't render if this is not a branched chat
  if (!currentChat?.branchedFromChatId) {
    return null;
  }

  return (
    <div className={`border-b border-border bg-secondary/30 ${className}`}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <BranchIcon className="h-4 w-4 text-muted" />
          <span className="text-muted">Branched from:</span>
          
          {originalChat && (
            <button
              onClick={handleGoToOriginal}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
              title="Go to original chat"
            >
              {originalChat.title || "Untitled Chat"}
            </button>
          )}
          
          <span className="text-muted">•</span>
          <span className="text-muted text-xs">{branchCreatedTime}</span>
        </div>

        {/* Show sibling branches if any exist */}
        {siblingBranches && siblingBranches.length > 0 && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-muted">Other branches:</span>
            <div className="flex gap-1 overflow-x-auto">
              {siblingBranches.slice(0, 3).map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleGoToBranch(branch.id)}
                  className="px-2 py-1 bg-background/50 hover:bg-background/80 border border-border rounded text-muted hover:text-foreground transition-colors whitespace-nowrap"
                  title={`Switch to: ${branch.title || "Untitled"}`}
                >
                  {branch.title?.slice(0, 20) || "Untitled"}
                  {(branch.title?.length || 0) > 20 && "..."}
                </button>
              ))}
              {siblingBranches.length > 3 && (
                <span className="text-muted px-2 py-1">
                  +{siblingBranches.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
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

export default BranchInfo; 