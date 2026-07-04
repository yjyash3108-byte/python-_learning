import { NotificationsInbox } from "@/components/notifications/notifications-inbox";
import { getDashboardStats, getNotifications } from "@/lib/data/dashboard";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const [notifications, stats] = await Promise.all([getNotifications(), getDashboardStats()]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">Inbox</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground text-3d-glow">Notifications</h1>
      </div>
      <NotificationsInbox
        initialNotifications={notifications}
        unreadCount={stats?.unread_notifications}
      />
    </div>
  );
}
