"use client";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const chats = useLiveQuery(() => db.getChats(), []);
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredBranchId, setHoveredBranchId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const branchIconRef = useRef<HTMLDivElement>(null);

  /**
   * Update tooltip position when hovering
   */
  useEffect(() => {
    if (hoveredBranchId && branchIconRef.current) {
      const rect = branchIconRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.right + 8, // 8px offset to the right
        y: rect.top
      });
    } else {
      setTooltipPosition(null);
    }
  }, [hoveredBranchId]);

  /**
   * Formats a date to display in the chat list
   */
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(date);
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);
    }
  };

  /**
   * Format the branch creation time
   */
  const formatBranchTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  // Get branch information for hovered chat
  const branchInfo = useLiveQuery(async () => {
    if (!hoveredBranchId) return null;
    
    const hoveredChat = await db.chats.get(hoveredBranchId);
    if (!hoveredChat?.branchedFromChatId) return null;

    const originalChat = await db.chats.get(hoveredChat.branchedFromChatId);

    return {
      originalChat,
      branchCreatedAt: hoveredChat.created_at,
    };
  }, [hoveredBranchId]);

  /**
   * Groups chats by time period
   */
  const groupedChats = useCallback(() => {
    if (!chats) return { today: [], older: [] };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayChats = chats.filter(chat => new Date(chat.updated_at) >= today);
    const olderChats = chats.filter(chat => new Date(chat.updated_at) < today);
    
    return { today: todayChats, older: olderChats };
  }, [chats]);

  const { today, older } = groupedChats();

  /**
   * Handles chat deletion
   */
  const handleDeleteChat = useCallback(
    async (e: React.MouseEvent, chatId: string) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        await db.deleteChat(chatId);
        if (pathname === `/chat/${chatId}`) {
          router.push("/");
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    },
    [pathname, router]
  );

  /**
   * Navigate to home page for new chat (don't create chat until first message)
   */
  const handleNewChat = () => {
    router.push("/");
  };

  /**
   * Handle navigation to original or sibling branch
   */
  const handleBranchNavigation = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const renderChatItem = (chat: { id: string; title?: string; updated_at: Date; branchedFromChatId?: string }) => (
    <div key={chat.id} className="relative">
      <Link
        href={`/chat/${chat.id}`}
        className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all hover:bg-macchiato-surface0/70 ${
          pathname === `/chat/${chat.id}` 
            ? "bg-macchiato-surface0" 
            : ""
        }`}
      >
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {/* Show branch icon for branched chats with hover functionality */}
          {chat.branchedFromChatId && (
            <div 
              ref={hoveredBranchId === chat.id ? branchIconRef : null}
              className="relative"
              onMouseEnter={() => setHoveredBranchId(chat.id)}
              onMouseLeave={() => setHoveredBranchId(null)}
            >
              <BranchIcon className="h-3 w-3 text-macchiato-subtext0 flex-shrink-0 cursor-help" />
            </div>
          )}
          <span className="line-clamp-1 block text-macchiato-text font-normal">
            {chat.title || "New Chat"}
          </span>
        </div>
        <button
          onClick={(e) => handleDeleteChat(e, chat.id)}
          className="opacity-0 group-hover:opacity-100 ml-2 rounded p-1 text-macchiato-subtext0 hover:text-macchiato-red transition-all duration-200"
          aria-label={`Delete chat: ${chat.title || "New Chat"}`}
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </Link>
    </div>
  );

  // Portal-based tooltip component
  const BranchTooltip = () => {
    if (!hoveredBranchId || !branchInfo || !tooltipPosition) return null;

    const tooltipContent = (
      <div 
        className="fixed w-64 p-3 bg-macchiato-surface0 border border-macchiato-surface1 rounded-lg shadow-xl text-xs z-[99999]"
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
        }}
      >
        <div className="space-y-2">
          {/* Branched from */}
          <div>
            <span className="text-macchiato-subtext0">Branched from:</span>
            {branchInfo.originalChat && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBranchNavigation(branchInfo.originalChat!.id);
                }}
                className="ml-1 text-macchiato-mauve hover:text-macchiato-mauve/80 font-medium underline"
              >
                {branchInfo.originalChat.title || "Untitled Chat"}
              </button>
            )}
          </div>
          
          {/* Branch creation time */}
          <div className="text-macchiato-subtext1">
            {formatBranchTime(branchInfo.branchCreatedAt)}
          </div>
        </div>
      </div>
    );

    // Render tooltip using portal to document body
    return typeof window !== 'undefined' 
      ? createPortal(tooltipContent, document.body)
      : null;
  };

  // Render collapsed state as floating horizontal buttons
  if (isCollapsed) {
    return (
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-macchiato-surface0/90 backdrop-blur-xl border border-macchiato-surface1/50 rounded-lg p-2 shadow-lg">
        <button
          onClick={handleNewChat}
          className="w-8 h-8 flex items-center justify-center rounded-md bg-macchiato-surface0 hover:bg-macchiato-surface1 text-macchiato-text transition-colors border border-macchiato-surface1"
          title="New Chat"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md bg-macchiato-surface0 hover:bg-macchiato-surface1 text-macchiato-text transition-colors border border-macchiato-surface1"
          title="Search"
        >
          <SearchIcon className="h-4 w-4" />
        </button>
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 flex items-center justify-center rounded-md bg-macchiato-surface0 hover:bg-macchiato-surface1 text-macchiato-text transition-colors border border-macchiato-surface1"
          title="Expand sidebar"
        >
          <PanelRightIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Render full sidebar when expanded
  return (
    <div className="flex h-full flex-col bg-macchiato-mantle w-full">
      {/* Header */}
      <div className="px-4 py-4">
        {/* Title and Collapse Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center flex-1 justify-center">
            <Link 
              href="/"
              className="text-lg font-brand font-medium text-macchiato-text hover:text-macchiato-mauve transition-colors"
            >
              A17.chat
            </Link>
          </div>
          
          {/* Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-macchiato-text hover:bg-macchiato-surface0 transition-colors"
            aria-label="Collapse sidebar"
          >
            <PanelLeftIcon className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <Button 
          onClick={handleNewChat} 
          className="w-full justify-center gap-2 h-10 bg-macchiato-red hover:bg-macchiato-red/90 text-white border-0 font-medium rounded-lg mb-4"
        >
          <PlusIcon className="h-4 w-4" />
          New Chat
        </Button>

        {/* Search Bar */}
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-macchiato-subtext0" />
          <input
            type="text"
            placeholder="Search your threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-macchiato-surface0 border-0 rounded-lg pl-10 pr-4 py-2 text-sm text-macchiato-text placeholder:text-macchiato-subtext0 focus:outline-none focus:ring-1 focus:ring-macchiato-surface1"
          />
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4">
        {/* Today Section */}
        {today.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-medium text-macchiato-subtext0 mb-2 px-2">Today</h3>
            <div className="space-y-1">
              {today.map(renderChatItem)}
            </div>
          </div>
        )}

        {/* Older Section */}
        {older.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-medium text-macchiato-subtext0 mb-2 px-2">Older</h3>
            <div className="space-y-1">
              {older.map(renderChatItem)}
            </div>
          </div>
        )}
      </div>

      <BranchTooltip />
    </div>
  );
}

// Trash icon for delete button
function TrashIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

// Plus icon for new chat button
function PlusIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

// Search icon for search functionality
function SearchIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
    </svg>
  );
}

// Panel left icon for collapse
function PanelLeftIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
    </svg>
  );
}

// Panel right icon for expand
function PanelRightIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M15 3v18" />
    </svg>
  );
}

// Branch icon for branched chats using GitHub branch SVG
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
