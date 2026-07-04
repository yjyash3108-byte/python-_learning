"use client";

import { useEffect, useState } from "react";
import { Ban } from "lucide-react";
import Link from "next/link";
import { apiDelete, apiGet } from "@/lib/api/client";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

type BlockedUser = {
  id: string;
  full_name: string;
  username: string | null;
};

export function BlockedUsersPanel() {
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    apiGet<BlockedUser[]>("/blocks")
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function unblock(userId: string) {
    setActionId(userId);
    setError(null);
    try {
      await apiDelete(`/blocks/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to unblock");
    } finally {
      setActionId(null);
    }
  }

  return (
    <GlassPanel depth="sm" className="space-y-4 p-6">
      <div className="flex items-center gap-2">
        <Ban className="h-5 w-5 text-rose-400" />
        <h2 className="font-semibold">Blocked users</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Blocked users cannot message you or appear in your search results.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Ban}
          title="No blocked users"
          description="When you block someone from their profile, they'll appear here."
          className="border-0 bg-transparent py-6"
        />
      ) : (
        <ul className="space-y-2">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div>
                <Link href={`/profile/${u.id}`} className="font-medium hover:text-indigo-300">
                  {u.full_name}
                </Link>
                {u.username && (
                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                )}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={actionId === u.id}
                onClick={() => unblock(u.id)}
              >
                Unblock
              </Button>
            </li>
          ))}
        </ul>
      )}
    </GlassPanel>
  );
}
