"use client";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

export function Sidebar() {
  const chats = useLiveQuery(() => db.getChats(), []);
  const pathname = usePathname();
  const router = useRouter();

  /**
   * Formats a date to display in the chat list
   * Uses a user-friendly format showing recent relative time
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
    } else if (diffInHours < 168) { // Within a week
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
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
   * Handles chat deletion with confirmation and navigation
   */
  const handleDeleteChat = useCallback(
    async (e: React.MouseEvent, chatId: string) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        await db.deleteChat(chatId);
        // Navigate away if we're currently viewing the deleted chat
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

  return (
    <div className="flex h-full w-full flex-col bg-macchiato-mantle border-r border-macchiato-surface0">
      {/* Header Section */}
      <div className="flex items-center px-6 py-6 border-b border-macchiato-surface0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-macchiato-mauve to-macchiato-pink">
            <SparklesIcon className="h-5 w-5 text-macchiato-crust" />
          </div>
          <h1 className="font-display text-xl font-semibold text-macchiato-text">
            A17.chat
          </h1>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="px-4 py-4">
        <Button 
          onClick={handleNewChat} 
          className="w-full justify-start gap-3 h-11 bg-macchiato-surface0 hover:bg-macchiato-surface1 text-macchiato-text border-0 font-medium transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2">
        <nav className="space-y-1" aria-label="Chat History">
          {chats?.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="text-macchiato-subtext0 text-sm">
                No chats yet. Start a new conversation!
              </div>
            </div>
          ) : (
            chats?.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={`sidebar-item group flex items-center justify-between rounded-xl px-3 py-3 text-sm transition-all hover:bg-macchiato-surface0/70 ${
                  pathname === `/chat/${chat.id}` 
                    ? "bg-macchiato-surface0 border-l-2 border-macchiato-mauve shadow-sm" 
                    : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <span className="line-clamp-1 block font-medium text-macchiato-text leading-tight">
                      {chat.title || "New Chat"}
                    </span>
                  </div>
                  <span className="block text-xs text-macchiato-subtext0 mt-1">
                    {formatDate(chat.updated_at)}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="opacity-0 group-hover:opacity-100 ml-2 rounded-lg p-1.5 text-macchiato-subtext0 hover:bg-macchiato-surface1 hover:text-macchiato-red transition-all duration-200"
                  aria-label={`Delete chat: ${chat.title || "New Chat"}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </Link>
            ))
          )}
        </nav>
      </div>


    </div>
  );
}

// Icon Components with better styling
function TrashIcon(props: React.ComponentProps<"svg">) {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function PlusIcon(props: React.ComponentProps<"svg">) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function SparklesIcon(props: React.ComponentProps<"svg">) {
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
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}
