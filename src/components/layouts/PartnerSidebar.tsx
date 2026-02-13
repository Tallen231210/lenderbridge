/**
 * Partner portal sidebar navigation.
 * Clean white sidebar with monochrome Lucide icons (Vercel-inspired).
 * Includes notification bell with unread count badge.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Coins,
  Bell,
  BookOpen,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/partner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partner/deals", label: "My Deals", icon: FileText },
  { href: "/partner/deals/new", label: "Submit Deal", icon: PlusCircle },
  { href: "/partner/commissions", label: "Commissions", icon: Coins },
  { href: "/partner/notifications", label: "Notifications", icon: Bell },
  { href: "/partner/resources", label: "Resources", icon: BookOpen },
];

export function PartnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-white border-r border-gray-200">
      {/* Logo / Brand + Notification Bell */}
      <div className="flex items-center justify-between h-14 px-5 border-b border-gray-200">
        <Link href="/partner/dashboard" className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight text-black">
            LenderBridge
          </span>
        </Link>
        <NotificationBell href="/partner/notifications" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/partner/dashboard" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-black"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-xs text-gray-500">Partner Portal</span>
        </div>
      </div>
    </aside>
  );
}
