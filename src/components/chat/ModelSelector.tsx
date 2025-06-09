"use client";

import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/ui/dropdown";
import { ModelRegistry } from "@/lib/constants/models";
import React, { useState, useRef } from "react";

interface ModelSelectorProps {
  currentModel: keyof typeof ModelRegistry;
  onModelChange: (model: keyof typeof ModelRegistry) => void;
}

/**
 * Clean model selector component with search and upload buttons beside the model
 */
function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  const modelConfig = ModelRegistry[currentModel] || ModelRegistry["gpt-4o"];
  
  // State for search toggle
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Handle file upload logic here
      console.log('Selected files:', Array.from(files));
      // You can add your file processing logic here
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,text/*,.pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

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
        onClick={handleSearchToggle}
        className={`flex items-center gap-1.5 px-2 h-7 text-xs rounded-lg transition-colors border-2 ${
          isSearchActive 
            ? "bg-macchiato-mauve/20 text-macchiato-mauve border-macchiato-mauve/50" 
            : "text-macchiato-text hover:bg-macchiato-surface0/50 border-macchiato-surface0"
        }`}
        aria-label="Search"
        aria-pressed={isSearchActive}
      >
        <GlobeIcon className="h-3.5 w-3.5" />
        <span>Search</span>
      </button>
      
      <button
        onClick={handleFileUpload}
        className="flex h-7 w-7 items-center justify-center transition-colors rounded-lg border-2 text-macchiato-subtext0 hover:text-macchiato-text hover:bg-macchiato-surface0/50 border-macchiato-surface0"
        aria-label="Upload file"
      >
        <ClipIcon className="h-3.5 w-3.5" />
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

function GlobeIcon(props: React.ComponentProps<"svg">) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function ClipIcon(props: React.ComponentProps<"svg">) {
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
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export default ModelSelector;
