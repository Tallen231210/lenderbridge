/**
 * Admin dashboard sidebar navigation.
 * Shows pipeline, deals, lenders, partners, commissions, activity, and system health links.
 * Only accessible by admin role users.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Pipeline", icon: "📊" },
  { href: "/admin/lenders", label: "Lender Database", icon: "🏦" },
  { href: "/admin/partners", label: "Partners", icon: "🤝" },
  { href: "/admin/commissions", label: "Commissions", icon: "💰" },
  { href: "/admin/activity", label: "Activity Log", icon: "📝" },
  { href: "/admin/system-health", label: "System Health", icon: "🔧" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-white">
      {/* Logo / Brand */}
      <div className="flex items-center h-16 px-6 border-b border-slate-700">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">LenderBridge</span>
          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
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
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm text-slate-300">Admin Dashboard</span>
        </div>
      </div>
    </aside>
  );
}
