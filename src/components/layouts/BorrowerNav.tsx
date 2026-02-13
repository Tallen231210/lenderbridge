/**
 * Borrower portal top navigation bar.
 * Clean white nav with black text (Vercel-inspired).
 * Borrowers have a simple, read-only view of their deals.
 */
"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function BorrowerNav() {
  return (
    <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-gray-200">
      <Link href="/borrower/dashboard" className="flex items-center gap-2">
        <span className="text-base font-semibold tracking-tight text-black">
          LenderBridge
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-500">Borrower Portal</span>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
