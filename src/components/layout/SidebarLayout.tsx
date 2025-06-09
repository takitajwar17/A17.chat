"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";

type SidebarLayoutProps = {
  sidebar: React.ReactNode;
  navbar: React.ReactNode;
  children: React.ReactNode;
};

// Context for sidebar collapse state
type SidebarContextType = {
  isCollapsed: boolean;
  toggleCollapse: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarLayout");
  }
  return context;
};

/**
 * T3-style sidebar layout with responsive design
 * Features smooth transitions and proper mobile handling
 */
export function SidebarLayout({ sidebar, navbar, children }: SidebarLayoutProps) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarContextValue = {
    isCollapsed,
    toggleCollapse,
  };

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      <div className="relative flex h-screen bg-macchiato-base overflow-hidden">
        {/* Desktop Sidebar */}
        <nav className="hidden lg:flex flex-shrink-0 border-r border-macchiato-surface0">
          {sidebar}
        </nav>

        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div 
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          >
            <div className="absolute inset-0 bg-macchiato-crust/50 backdrop-blur-sm" />
            <nav className="absolute left-0 top-0 h-full w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out">
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
            
            <div className="flex items-center">
              <Link 
                href="/"
                className="text-lg font-brand font-medium text-macchiato-text hover:text-macchiato-mauve transition-colors"
              >
                A17.chat
              </Link>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden min-h-0">
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
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
