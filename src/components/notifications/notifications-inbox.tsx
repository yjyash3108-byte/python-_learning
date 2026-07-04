"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPatch, apiPost } from "@/lib/api/client";
import type { Notification } from "@/types/models";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

import { notificationHref } from "@/lib/notifications/href";

type NotificationsInboxProps = {
  initialNotifications: Notification[];
  unreadCount?: number;
};

export function NotificationsInbox({
  initialNotifications,
  unreadCount,
}: NotificationsInboxProps) {
  const router = useRouter();
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
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark all as read");
    } finally {
      setLoading(false);
    }
  }

  async function handleClick(n: Notification) {
    if (!n.is_read) await markRead(n.id);
    const href = notificationHref(n);
    if (href) router.push(href);
  }

  return (
    <GlassPanel depth="md" className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">All notifications</h2>
          {unreadCount ? (
            <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          ) : (
            <p className="text-sm text-muted-foreground">You&apos;re all caught up</p>
          )}
        </div>
        {notifications.some((n) => !n.is_read) && (
          <Button type="button" size="sm" variant="outline" disabled={loading} onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      {notifications.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No notifications yet. Likes, comments, and new followers will show up here.
        </p>
      ) : (
        <ul className="divide-y divide-white/8">
          {notifications.map((n) => {
            const href = notificationHref(n);
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`flex w-full gap-3 px-1 py-4 text-left transition hover:bg-white/[0.03] ${
                    n.is_read ? "opacity-70" : ""
                  }`}
                >
                  <div
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      n.is_read ? "bg-transparent" : "bg-indigo-400"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{n.message}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                      {n.actor_name && <span>· {n.actor_name}</span>}
                      {href && (
                        <Link
                          href={href}
                          className="text-indigo-400 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </GlassPanel>
  );
}
