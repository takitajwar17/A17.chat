"use client";

import { useState } from "react";

type SidebarLayoutProps = {
  sidebar: React.ReactNode;
  navbar: React.ReactNode;
  children: React.ReactNode;
};

/**
 * T3-style sidebar layout with responsive design
 * Features smooth transitions and proper mobile handling
 */
export function SidebarLayout({ sidebar, navbar, children }: SidebarLayoutProps) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  return (
    <div className="relative flex h-screen bg-macchiato-base overflow-hidden">
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex w-80 flex-shrink-0 border-r border-macchiato-surface0">
        {sidebar}
      </nav>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        >
          <div className="absolute inset-0 bg-macchiato-crust/50 backdrop-blur-sm" />
          <nav className="absolute left-0 top-0 h-full w-80 max-w-[85vw] transform transition-transform duration-300 ease-in-out">
            {sidebar}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex flex-1 flex-col min-w-0 h-full">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-macchiato-surface0 bg-macchiato-base/80 backdrop-blur-sm px-4 py-3 lg:hidden flex-shrink-0">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-macchiato-text hover:bg-macchiato-surface0 transition-colors"
            aria-label="Open sidebar"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-macchiato-mauve to-macchiato-pink">
              <SparklesIcon className="h-4 w-4 text-macchiato-crust" />
            </div>
            <h1 className="font-display text-lg font-semibold text-macchiato-text">
              Chat
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
}

// Menu icon for mobile sidebar toggle
function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1={3} y1={12} x2={21} y2={12} />
      <line x1={3} y1={6} x2={21} y2={6} />
      <line x1={3} y1={18} x2={21} y2={18} />
    </svg>
  );
}

// Sparkles icon for mobile header
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
    </svg>
  );
}
