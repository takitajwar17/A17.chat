"use client";

import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/ui/dropdown";
import { ModelRegistry } from "@/lib/constants/models";
import React from "react";

interface ModelSelectorProps {
  currentModel: keyof typeof ModelRegistry;
  onModelChange: (model: keyof typeof ModelRegistry) => void;
}

/**
 * Clean model selector component with search and upload buttons beside the model
 */
function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  const modelConfig = ModelRegistry[currentModel] || ModelRegistry["gpt-4o"];

  return (
    <div className="flex items-center gap-2">
      {/* Model Selector */}
      <Dropdown>
        <DropdownButton className="group flex items-center gap-2 rounded-lg bg-transparent px-3 py-2 text-sm text-macchiato-text hover:bg-macchiato-surface0/50 transition-colors">
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

      {/* Search and Upload Buttons - Compact, right beside model selector */}
      <button
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-macchiato-text hover:bg-macchiato-surface0/50 rounded-lg transition-colors border border-macchiato-surface0"
        aria-label="Search"
      >
        <SearchIcon className="h-3.5 w-3.5" />
        <span>Search</span>
      </button>
      
      <button
        className="flex h-7 w-7 items-center justify-center text-macchiato-subtext0 hover:text-macchiato-text transition-colors rounded-lg hover:bg-macchiato-surface0/50 border border-macchiato-surface0"
        aria-label="Upload"
      >
        <UploadIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// Icon components
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

function SearchIcon(props: React.ComponentProps<"svg">) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function UploadIcon(props: React.ComponentProps<"svg">) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export default ModelSelector;
