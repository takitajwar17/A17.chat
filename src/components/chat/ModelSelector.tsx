"use client";

import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/ui/dropdown";
import { ModelRegistry } from "@/lib/constants/models";
import React from "react";

interface ModelSelectorProps {
  currentModel: keyof typeof ModelRegistry;
  onModelChange: (model: keyof typeof ModelRegistry) => void;
}

/**
 * T3-style model selector component
 * Features clean design and intuitive model switching
 */
function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  const modelConfig = ModelRegistry[currentModel] || ModelRegistry["claude-3-5-sonnet-20241022"];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-macchiato-subtext0">
        <CpuIcon className="h-3.5 w-3.5" />
        <span>Model:</span>
      </div>
      
      <Dropdown>
        <DropdownButton className="group flex items-center gap-2 rounded-lg bg-transparent px-3 py-1.5 text-xs text-macchiato-text hover:bg-macchiato-surface0/50 transition-colors">
          <span className="font-medium">{modelConfig.name}</span>
          <ChevronDownIcon className="h-3 w-3 text-macchiato-subtext0 transition-transform group-data-[state=open]:rotate-180" />
        </DropdownButton>
        
        <DropdownMenu className="min-w-[200px] bg-macchiato-surface0 border border-macchiato-surface1 shadow-lg">
          {Object.entries(ModelRegistry).map(([modelId, model]) => (
            <DropdownItem
              key={modelId}
              onClick={() => onModelChange(modelId as keyof typeof ModelRegistry)}
              className={`px-3 py-2 text-sm hover:bg-macchiato-surface1 cursor-pointer transition-colors ${
                currentModel === modelId 
                  ? "bg-macchiato-mauve/20 text-macchiato-mauve" 
                  : "text-macchiato-text"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-macchiato-subtext0 capitalize">
                    {model.provider}
                  </span>
                </div>
                {currentModel === modelId && (
                  <CheckIcon className="h-4 w-4 text-macchiato-mauve" />
                )}
              </div>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}

// CPU icon for model selector
function CpuIcon(props: React.ComponentProps<"svg">) {
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
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  );
}

// Chevron down icon
function ChevronDownIcon(props: React.ComponentProps<"svg">) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// Check icon for selected model
function CheckIcon(props: React.ComponentProps<"svg">) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default ModelSelector;
