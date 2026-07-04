"use client";

import { useEffect, useState } from "react";
import { apiDelete, apiPost } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FollowActionResponse = {
  message: string;
  is_following: boolean;
  followers: number;
  following: number;
};

type FollowButtonProps = {
  userId: string;
  initialIsFollowing: boolean;
  followers?: number;
  onFollowersChange?: (followers: number) => void;
  onFollowingChange?: (following: number) => void;
  onFollowStateChange?: (isFollowing: boolean) => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
};

export function FollowButton({
  userId,
  initialIsFollowing,
  followers,
  onFollowersChange,
  onFollowingChange,
  onFollowStateChange,
  className,
  size = "sm",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing, userId]);

  async function toggleFollow() {
    if (loading) return;

    const wasFollowing = isFollowing;
    const nextFollowing = !wasFollowing;
    setError(null);
    setIsFollowing(nextFollowing);
    if (followers != null && onFollowersChange) {
      onFollowersChange(followers + (nextFollowing ? 1 : -1));
    }
    setLoading(true);

    try {
      const data = nextFollowing
        ? await apiPost<FollowActionResponse>(`/follow/${userId}`)
        : await apiDelete<FollowActionResponse>(`/follow/${userId}`);

      setIsFollowing(data.is_following);
      onFollowersChange?.(data.followers);
      onFollowingChange?.(data.following);
      onFollowStateChange?.(data.is_following);
    } catch (e) {
      setIsFollowing(wasFollowing);
      if (followers != null && onFollowersChange) {
        onFollowersChange(followers);
      }
      setError(e instanceof Error ? e.message : "Follow action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <Button
        type="button"
        size={size}
        variant={isFollowing ? "outline" : "default"}
        className={cn(!isFollowing && "btn-3d")}
        disabled={loading}
        onClick={toggleFollow}
        aria-pressed={isFollowing}
      >
        {loading ? "…" : isFollowing ? "Following" : "Follow"}
      </Button>
      {error && (
        <p className="max-w-[160px] text-right text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
