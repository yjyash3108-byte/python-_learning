import { Suspense } from "react";
import { FeedSection } from "@/components/feed/feed-section";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import { getFeedPosts } from "@/lib/data/posts";
import { getDashboardStats, getNotifications } from "@/lib/data/dashboard";
import { getCurrentProfile } from "@/lib/data/profile";

export const metadata = { title: "Feed" };

export default async function FeedPage() {
  const [{ posts, hasMore }, stats, notifications, profile] = await Promise.all([
    getFeedPosts(),
    getDashboardStats(),
    getNotifications(),
    getCurrentProfile(),
  ]);

  return (
    <div className="space-y-8">
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Posts", value: stats.posts_count },
            { label: "Projects", value: stats.projects_count },
            { label: "Followers", value: stats.followers_count },
            { label: "Skills", value: stats.skills_count },
          ].map((s) => (
            <div key={s.label} className="stat-card relative z-0 p-4 text-center">
              <p className="stat-value relative z-10">{s.value}</p>
              <p className="relative z-10 mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <NotificationsPanel
          initialNotifications={notifications}
          unreadCount={stats?.unread_notifications}
        />
      )}

      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading feed…</p>
        }
      >
        <FeedSection
          initialPosts={posts}
          initialHasMore={hasMore}
          currentUserId={profile?.id}
        />
      </Suspense>
    </div>
  );
}
