"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPatch, apiPost } from "@/lib/api/client";
import type { Notification } from "@/types/models";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

interface NotificationsPanelProps {
  initialNotifications: Notification[];
  unreadCount?: number;
}

import { notificationHref } from "@/lib/notifications/href";

export function NotificationsPanel({ initialNotifications, unreadCount }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markRead(id: string) {
    try {
      await apiPatch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark as read");
    }
  }

  async function markAllRead() {
    setLoading(true);
    setError(null);
    try {
      await apiPost("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark all as read");
    } finally {
      setLoading(false);
    }
  }

  if (notifications.length === 0) {
    return (
      <GlassPanel depth="sm" className="p-4 text-sm text-muted-foreground">
        No notifications yet.{" "}
        <Link href="/notifications" className="text-indigo-400 hover:underline">
          Open inbox
        </Link>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel depth="sm" className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Notifications {unreadCount ? `(${unreadCount} new)` : ""}
        </p>
        <div className="flex gap-2">
          <Link href="/notifications" className="text-xs text-indigo-400 hover:underline">
            View all
          </Link>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={loading}
            onClick={markAllRead}
            className="text-xs"
          >
            Mark all read
          </Button>
        </div>
      </div>
      {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
      <ul className="space-y-2">
        {notifications.slice(0, 5).map((n) => {
          const href = notificationHref(n);
          return (
            <li key={n.id}>
              {href ? (
                <Link
                  href={href}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`block text-sm transition-colors ${
                    n.is_read ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {n.message}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`w-full text-left text-sm transition-colors ${
                    n.is_read ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {n.message}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </GlassPanel>
  );
}
