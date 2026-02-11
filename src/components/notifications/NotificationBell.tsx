/**
 * Notification bell icon with unread count badge.
 * Shows in the sidebar navigation for partner and admin portals.
 * Queries the unread count via Convex reactive query for real-time updates.
 */
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

interface NotificationBellProps {
  href: string;
}

export function NotificationBell({ href }: NotificationBellProps) {
  const unreadCount = useQuery(api.notifications.getUnreadCount);

  return (
    <Link href={href} className="relative inline-flex items-center">
      {/* Bell icon (SVG) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Unread badge — only shown when there are unread notifications */}
      {unreadCount !== undefined && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
