"use client";

import { ModelRegistry } from "@/lib/constants/models";
import React, { useState, useRef, useEffect } from "react";

interface ModelSelectorProps {
  currentModel: keyof typeof ModelRegistry;
  onModelChange: (model: keyof typeof ModelRegistry) => void;
}

/**
 * Enhanced model selector with beautiful modal-style dropdown
 */
function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  const modelConfig = ModelRegistry[currentModel] || ModelRegistry["gpt-4o"];
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Filter models based on search query
  const filteredModels = Object.entries(ModelRegistry).filter(([modelId, model]) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      model.name.toLowerCase().includes(query) ||
      model.provider.toLowerCase().includes(query) ||
      modelId.toLowerCase().includes(query)
    );
  });

  // Group models by provider
  const groupedModels = filteredModels.reduce((acc, [modelId, model]) => {
    const provider = model.provider;
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push([modelId, model]);
    return acc;
  }, {} as Record<string, [string, typeof ModelRegistry[keyof typeof ModelRegistry]][]>);

  const handleModelSelect = (modelId: keyof typeof ModelRegistry) => {
    onModelChange(modelId);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('Selected files:', Array.from(files));
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

      {/* Model Selector Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2 rounded-lg bg-transparent px-3 py-2 text-sm text-macchiato-text hover:bg-macchiato-surface0/50 transition-colors"
        >
          <span className="font-medium">{modelConfig.name}</span>
          <ChevronDownIcon className={`h-3 w-3 text-macchiato-subtext0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Enhanced Modal-Style Dropdown */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
            
            {/* Dropdown Panel */}
            <div className="absolute bottom-full left-0 mb-2 w-80 bg-macchiato-surface0/95 backdrop-blur-xl border border-macchiato-surface1/50 rounded-xl shadow-2xl shadow-black/30 z-50 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-macchiato-surface1/30 bg-macchiato-surface0/60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-macchiato-text">Select Model</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md hover:bg-macchiato-surface1/50 transition-colors"
                  >
                    <XIcon className="h-4 w-4 text-macchiato-subtext0" />
                  </button>
                </div>
                
                {/* Search Input */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-macchiato-subtext0" />
                  <input
                    type="text"
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-macchiato-surface1/30 border border-macchiato-surface1/50 rounded-lg pl-10 pr-4 py-2 text-sm text-macchiato-text placeholder:text-macchiato-subtext0 focus:outline-none focus:ring-2 focus:ring-macchiato-mauve/50 focus:border-macchiato-mauve/50 transition-colors"
                  />
                </div>
              </div>

              {/* Models List */}
              <div className="max-h-80 overflow-y-auto">
                {Object.keys(groupedModels).length === 0 ? (
                  <div className="px-4 py-8 text-center text-macchiato-subtext0 text-sm">
                    No models found matching &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  Object.entries(groupedModels).map(([provider, models]) => (
                    <div key={provider} className="px-2 py-2">
                      {/* Provider Header */}
                      <div className="px-2 py-1 mb-1">
                        <span className="text-xs font-medium text-macchiato-subtext0 uppercase tracking-wide">
                          {provider}
                        </span>
                      </div>
                      
                      {/* Models in this provider */}
                      <div className="space-y-1">
                        {models.map(([modelId, model]) => (
                          <button
                            key={modelId}
                            onClick={() => handleModelSelect(modelId as keyof typeof ModelRegistry)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 ${
                              currentModel === modelId 
                                ? "bg-macchiato-mauve/20 text-macchiato-mauve border border-macchiato-mauve/30" 
                                : "text-macchiato-text hover:bg-macchiato-surface1/40 border border-transparent hover:border-macchiato-surface1/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{model.name}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-macchiato-subtext0 capitalize">
                                    {model.provider}
                                  </span>
                                  <span className="text-xs text-macchiato-subtext0">•</span>
                                  <span className="text-xs text-macchiato-subtext0">
                                    {model.contextWindow.toLocaleString()} tokens
                                  </span>
                                </div>
                              </div>
                              {currentModel === modelId && (
                                <div className="ml-2">
                                  <CheckIcon className="h-4 w-4 text-macchiato-mauve" />
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-macchiato-surface1/30 bg-macchiato-surface0/60">
                <div className="text-xs text-macchiato-subtext0 text-center">
                  {Object.keys(ModelRegistry).length} models available
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search and Upload Buttons */}
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

function XIcon(props: React.ComponentProps<"svg">) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
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
