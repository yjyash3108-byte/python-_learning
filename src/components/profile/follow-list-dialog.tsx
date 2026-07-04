"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiGet } from "@/lib/api/client";

export type FollowListUser = {
  id: string;
  full_name: string;
  school_name: string;
  grade: number;
  profile_picture_url: string | null;
};

type FollowListDialogProps = {
  userId: string;
  type: "followers" | "following" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileName?: string;
};

export function FollowListDialog({
  userId,
  type,
  open,
  onOpenChange,
  profileName,
}: FollowListDialogProps) {
  const [users, setUsers] = useState<FollowListUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!type) return;
    setLoading(true);
    setError(null);
    try {
      const path = type === "followers" ? `/followers/${userId}` : `/following/${userId}`;
      const data = await apiGet<FollowListUser[]>(path);
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load list");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [type, userId]);

  useEffect(() => {
    if (open && type) {
      load();
    } else if (!open) {
      setUsers([]);
      setError(null);
    }
  }, [open, type, load]);

  const title = type === "followers" ? "Followers" : "Following";
  const description =
    type === "followers"
      ? profileName
        ? `Students following ${profileName}`
        : "Students following this profile"
      : profileName
        ? `Students ${profileName} follows`
        : "Students this profile follows";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(80vh,520px)] overflow-hidden border-white/10 bg-background/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
          {loading && (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {!loading && error && (
            <p className="py-6 text-center text-sm text-destructive">{error}</p>
          )}

          {!loading && !error && users.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {type === "followers" ? "No followers yet." : "Not following anyone yet."}
            </p>
          )}

          {!loading && !error && users.length > 0 && (
            <ul className="space-y-2">
              {users.map((user) => {
                const initials = user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <li key={user.id}>
                    <Link
                      href={`/profile/${user.id}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition hover:border-white/10 hover:bg-white/5"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profile_picture_url ?? undefined} />
                        <AvatarFallback className="bg-indigo-500/20 text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{user.full_name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          Class {user.grade} · {user.school_name}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
