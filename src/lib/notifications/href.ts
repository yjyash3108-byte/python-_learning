import type { Notification } from "@/types/models";

export function notificationHref(n: Notification): string | null {
  if (n.type === "follow" && n.reference_id) return `/profile/${n.reference_id}`;
  if ((n.type === "like" || n.type === "comment") && n.reference_id) {
    return `/feed?post=${n.reference_id}`;
  }
  return null;
}
