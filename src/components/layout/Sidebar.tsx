"use client";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const chats = useLiveQuery(() => db.getChats(), []);
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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
   * Creates a new chat and navigates to it
   */
  const handleNewChat = async () => {
    const newChat = await db.createChat();
    router.push(`/chat/${newChat.id}`);
  };

  const renderChatItem = (chat: { id: string; title?: string; updated_at: Date }) => (
    <Link
      key={chat.id}
      href={`/chat/${chat.id}`}
      className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all hover:bg-macchiato-surface0/70 ${
        pathname === `/chat/${chat.id}` 
          ? "bg-macchiato-surface0" 
          : ""
      }`}
    >
      <div className="flex-1 min-w-0">
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
  );

  return (
    <div className={`flex h-full flex-col bg-macchiato-mantle transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-full'}`}>
      {/* Header */}
      <div className={`px-4 py-4 ${isCollapsed ? 'px-2' : ''}`}>
        {/* Collapse Button and Title */}
        <div className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center flex-1 justify-center">
              <h1 className="text-lg font-medium text-macchiato-text">A17.chat</h1>
            </div>
          )}
          
          {/* Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className={`flex items-center justify-center rounded-lg text-macchiato-text hover:bg-macchiato-surface0 transition-colors ${
              isCollapsed ? 'w-8 h-8' : 'w-8 h-8'
            }`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeftIcon className="h-4 w-4" />
          </button>
        </div>

        {!isCollapsed && (
          <>
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
          </>
        )}

        {/* Collapsed state buttons */}
        {isCollapsed && (
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={handleNewChat}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-macchiato-red hover:bg-macchiato-red/90 text-white transition-colors"
              title="New Chat"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-macchiato-surface0 hover:bg-macchiato-surface1 text-macchiato-text transition-colors"
              title="Search"
            >
              <SearchIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Chat History */}
      {!isCollapsed && (
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

          {/* Empty State */}
          {chats?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-macchiato-subtext0 text-sm">No conversations yet</p>
            </div>
          )}
        </div>
      )}

      {/* Login Button */}
      {!isCollapsed && (
        <div className="border-t border-macchiato-surface0 p-4">
          <button className="flex items-center gap-2 text-sm text-macchiato-text hover:text-macchiato-mauve transition-colors">
            <span>Login</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Icon Components
function TrashIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function PlusIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function SearchIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ArrowRightIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function PanelLeftIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
    </svg>
  );
}
