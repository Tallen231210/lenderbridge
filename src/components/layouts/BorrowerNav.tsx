/**
 * Borrower portal top navigation bar.
 * Minimal — borrowers have a simple, read-only view of their deals.
 * No sidebar needed; just a top bar with logo and user button.
 */
"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function BorrowerNav() {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      <Link href="/borrower/dashboard" className="flex items-center gap-2">
        <span className="text-xl font-bold text-blue-700">LenderBridge</span>
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Borrower Portal</span>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
