"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FollowListDialog } from "@/components/profile/follow-list-dialog";

type FollowStatsProps = {
  userId: string;
  followers: number;
  following: number;
  profileName?: string;
  className?: string;
};

export function FollowStats({
  userId,
  followers,
  following,
  profileName,
  className,
}: FollowStatsProps) {
  const [dialogType, setDialogType] = useState<"followers" | "following" | null>(null);

  return (
    <>
      <div className={cn("grid grid-cols-2 gap-4 text-center", className)}>
        <button
          type="button"
          onClick={() => setDialogType("followers")}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-indigo-400/30 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label={`${followers} followers. Click to view list.`}
        >
          <p className="text-2xl font-bold text-foreground">{followers}</p>
          <p className="text-xs text-muted-foreground">Followers</p>
        </button>
        <button
          type="button"
          onClick={() => setDialogType("following")}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-indigo-400/30 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label={`${following} following. Click to view list.`}
        >
          <p className="text-2xl font-bold text-foreground">{following}</p>
          <p className="text-xs text-muted-foreground">Following</p>
        </button>
      </div>

      <FollowListDialog
        userId={userId}
        type={dialogType}
        open={dialogType !== null}
        onOpenChange={(open) => {
          if (!open) setDialogType(null);
        }}
        profileName={profileName}
      />
    </>
  );
}
