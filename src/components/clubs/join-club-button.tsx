"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiDelete, apiPost } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Club, ClubActionResponse } from "@/types/club";

type JoinClubButtonProps = {
  clubId: string;
  initialIsMember: boolean;
  myRole?: string | null;
  className?: string;
  size?: "default" | "sm" | "lg";
  fullWidth?: boolean;
};

export function JoinClubButton({
  clubId,
  initialIsMember,
  myRole,
  className,
  size = "sm",
  fullWidth = false,
}: JoinClubButtonProps) {
  const router = useRouter();
  const [isMember, setIsMember] = useState(initialIsMember);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  const isOwner = myRole === "owner";

  async function toggleMembership() {
    if (loading || isOwner) return;

    setError(null);
    setUpgradeRequired(false);
    setLoading(true);

    try {
      if (isMember) {
        await apiDelete<ClubActionResponse>(`/clubs/${clubId}/leave`);
        setIsMember(false);
      } else {
        await apiPost<ClubActionResponse>(`/clubs/${clubId}/join`);
        setIsMember(true);
      }
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Action failed";
      setError(message);
      if (message.toLowerCase().includes("pro") || message.toLowerCase().includes("limit")) {
        setUpgradeRequired(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (isOwner) {
    return (
      <Button size={size} variant="outline" className={cn(fullWidth && "w-full", className)} disabled>
        Owner
      </Button>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1", fullWidth && "w-full")}>
      <Button
        type="button"
        size={size}
        variant={isMember ? "outline" : "default"}
        className={cn(!isMember && "btn-3d", fullWidth && "w-full", className)}
        disabled={loading}
        onClick={toggleMembership}
      >
        {loading ? "…" : isMember ? "Leave" : "Join"}
      </Button>
      {error && (
        <p className="text-center text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      {upgradeRequired && (
        <Link
          href="/upgrade"
          className="text-center text-xs font-medium text-indigo-400 hover:underline"
        >
          Upgrade to Pro
        </Link>
      )}
    </div>
  );
}
