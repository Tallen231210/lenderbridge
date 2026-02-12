/**
 * Partner portal sidebar navigation.
 * Shows deal management, commissions, notifications, and resources links.
 * Includes notification bell with unread count badge.
 * Responsive — collapses to sheet on mobile.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const NAV_ITEMS = [
  { href: "/partner/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/partner/deals", label: "My Deals", icon: "📋" },
  { href: "/partner/deals/new", label: "Submit Deal", icon: "➕" },
  { href: "/partner/commissions", label: "Commissions", icon: "💰" },
  { href: "/partner/notifications", label: "Notifications", icon: "🔔" },
  { href: "/partner/resources", label: "Resources", icon: "📚" },
];

export function PartnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-white border-r border-gray-200">
      {/* Logo / Brand + Notification Bell */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <Link href="/partner/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-700">LenderBridge</span>
        </Link>
        <NotificationBell href="/partner/notifications" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/partner/dashboard" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm text-gray-600">Partner Portal</span>
        </div>
      </div>
    </aside>
  );
}
