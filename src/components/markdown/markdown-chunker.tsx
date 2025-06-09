import React, { memo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

import type { ComponentPropsWithoutRef } from "react";

interface CodeBlockProps extends ComponentPropsWithoutRef<"code"> {
  inline?: boolean;
  children?: React.ReactNode;
}

export function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";

  const copyToClipboard = async () => {
    if (typeof children === "string") {
      try {
        await navigator.clipboard.writeText(children);
        toast.success("Copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy");
      }
    }
  };

  return !inline ? (
    <div className="group relative">
      <div className="flex items-center justify-between rounded-t bg-[#2e3440] px-4 py-2 text-sm text-neutral-300">
        <span className="font-mono">{lang || "text"}</span>
        <button
          onClick={copyToClipboard}
          className="opacity-0 transition-colors group-hover:opacity-100 hover:text-white">
          <CopyIcon />
        </button>
      </div>
      <SyntaxHighlighter
        {...props}
        style={vscDarkPlus}
        language={lang}
        PreTag="div"
        className="!mt-0 !rounded-t-none">
        {String(children).trim()}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

export const MarkdownContent = memo(function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={
        {
          code: CodeBlock,
          // Convert block elements to divs to prevent nesting issues
          pre: ({ children }) => <div className="markdown-block">{children}</div>,
          p: ({ children }) => <div className="markdown-block">{children}</div>,
          // Pass through other block elements normally
          h1: ({ children }) => <h1>{children}</h1>,
          h2: ({ children }) => <h2>{children}</h2>,
          h3: ({ children }) => <h3>{children}</h3>,
          h4: ({ children }) => <h4>{children}</h4>,
          h5: ({ children }) => <h5>{children}</h5>,
          h6: ({ children }) => <h6>{children}</h6>,
          ul: ({ children }) => <ul className="list-disc list-outside space-y-1 my-2 ml-6">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside space-y-1 my-2 ml-6">{children}</ol>,
          li: ({ children }) => <li className="text-macchiato-text leading-relaxed">{children}</li>,
          blockquote: ({ children }) => <blockquote>{children}</blockquote>,
        } as Components
      }
      unwrapDisallowed={true}
      className="prose prose-invert max-w-none">
      {content}
    </ReactMarkdown>
  );
});
