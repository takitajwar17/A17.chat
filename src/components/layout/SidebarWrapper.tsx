"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

/**
 * Wrapper component that manages sidebar collapse state
 * Provides the T3 chat-like sidebar with collapse functionality
 */
export function SidebarWrapper() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  /**
   * Toggle sidebar collapse state
   */
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`flex h-full bg-macchiato-mantle transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
    </div>
  );
} 