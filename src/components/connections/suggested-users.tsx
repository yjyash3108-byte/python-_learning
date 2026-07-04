"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { FollowButton } from "@/components/profile/follow-button";
import { MessageUserButton } from "@/components/messages/message-user-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import type { SuggestedUser } from "@/lib/data/suggested-users";

type SuggestedUsersProps = {
  initialUsers: SuggestedUser[];
  initialFollowingIds?: string[];
  initialMutualIds?: string[];
  currentUserId?: string;
};

export function SuggestedUsers({
  initialUsers,
  initialFollowingIds = [],
  initialMutualIds = [],
  currentUserId,
}: SuggestedUsersProps) {
  const [following, setFollowing] = useState<Set<string>>(new Set(initialFollowingIds));
  const mutual = new Set(initialMutualIds);

  if (initialUsers.length === 0) return null;

  function handleFollowChange(userId: string, isFollowing: boolean) {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.add(userId);
      else next.delete(userId);
      return next;
    });
  }

  return (
    <GlassPanel depth="md" tilt className="space-y-4 p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-400" />
        <h2 className="font-semibold">People you may know</h2>
      </div>
      <ul className="space-y-3">
        {initialUsers.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 p-3">
            <div className="min-w-0 flex-1">
              <Link href={`/profile/${s.id}`} className="font-medium hover:text-indigo-300">
                {s.full_name}
              </Link>
              <p className="text-xs text-muted-foreground">
                Class {s.grade} · {s.school_name}
              </p>
              <p className="mt-0.5 text-xs text-amber-400/90">{s.reason}</p>
              {s.skills?.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.skills.slice(0, 3).map((sk) => (
                    <Badge key={sk} variant="secondary" className="text-[10px]">
                      {sk}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            {currentUserId !== s.id && (
              <div className="flex shrink-0 items-center gap-2">
                {mutual.has(s.id) && following.has(s.id) && <MessageUserButton userId={s.id} />}
                <FollowButton
                  userId={s.id}
                  initialIsFollowing={following.has(s.id)}
                  onFollowStateChange={(isFollowing) => handleFollowChange(s.id, isFollowing)}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}
