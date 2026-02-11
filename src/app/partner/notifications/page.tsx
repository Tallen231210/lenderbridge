/**
 * Partner notifications page — list of all deal updates and alerts.
 * Newest notifications first. Supports mark individual as read and mark all as read.
 * Unread notifications shown with visual indicator.
 */
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Id } from "../../../../convex/_generated/dataModel";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

export default function PartnerNotificationsPage() {
  const notifications = useQuery(api.notifications.getMyNotifications);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  if (notifications === undefined) {
    return <PageSkeleton />;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to update notifications");
    }
  }

  async function handleMarkRead(notificationId: Id<"notifications">) {
    try {
      await markAsRead({ notificationId });
    } catch {
      toast.error("Failed to mark notification as read");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You'll receive notifications when your deals are updated."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n._id}
              className={`cursor-pointer transition-colors ${
                !n.read ? "bg-blue-50 border-blue-200" : ""
              }`}
              onClick={() => !n.read && handleMarkRead(n._id)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                      )}
                      <p className="text-sm font-medium text-gray-900">
                        {n.title}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatRelativeTime(n.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
