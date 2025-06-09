"use client";

import { Sidebar } from "./Sidebar";
import { useSidebarContext } from "./SidebarLayout";

/**
 * Wrapper component that connects sidebar to the layout context
 * Provides the T3 chat-like sidebar with collapse functionality
 */
export function SidebarWrapper() {
  const { isCollapsed, toggleCollapse } = useSidebarContext();

  // When collapsed, don't render a column at all - Sidebar renders floating buttons
  if (isCollapsed) {
    return <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />;
  }

  // When expanded, render the full width sidebar
  return (
    <div className="flex h-full bg-macchiato-mantle transition-all duration-300 w-72">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
    </div>
  );
} 