"use client";
import Link from "next/link";

export function Navbar() {
  return (
    <div className="flex flex-1 items-center justify-between">
      <div className="flex items-center gap-4">
        <Link 
          href="/"
          className="font-brand text-lg font-semibold text-macchiato-text hover:text-macchiato-mauve transition-colors"
        >
          A17.chat
        </Link>
      </div>
    </div>
  );
}
