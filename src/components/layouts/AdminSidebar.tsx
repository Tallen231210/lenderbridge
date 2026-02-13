/**
 * Admin dashboard sidebar navigation.
 * Clean white sidebar with monochrome Lucide icons (Vercel-inspired).
 * Active items use black background with white text.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Building2,
  Users,
  Coins,
  Activity,
  HeartPulse,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Pipeline", icon: LayoutDashboard },
  { href: "/admin/lenders", label: "Lender Database", icon: Building2 },
  { href: "/admin/partners", label: "Partners", icon: Users },
  { href: "/admin/commissions", label: "Commissions", icon: Coins },
  { href: "/admin/activity", label: "Activity Log", icon: Activity },
  { href: "/admin/system-health", label: "System Health", icon: HeartPulse },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-white border-r border-gray-200">
      {/* Logo / Brand */}
      <div className="flex items-center h-14 px-5 border-b border-gray-200">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight text-black">
            LenderBridge
          </span>
          <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === "/admin/dashboard" && pathname.startsWith("/admin/deals")) ||
            (item.href !== "/admin/dashboard" &&
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
          <span className="text-xs text-gray-500">Admin Dashboard</span>
        </div>
      </div>
    </aside>
  );
}
