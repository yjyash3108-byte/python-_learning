"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Shield, ShieldOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { apiDelete, apiPatch, apiPost } from "@/lib/api/client";
import type { ClubActionResponse, ClubMember } from "@/types/club";

type ClubMembersSectionProps = {
  clubId: string;
  initialMembers: ClubMember[];
  isOwner: boolean;
  canManageRoles?: boolean;
  isVerified: boolean;
  currentUserId: string;
};

const ASSIGNABLE_ROLES = [
  { value: "president", label: "President" },
  { value: "vice_president", label: "Vice President" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
] as const;

export function ClubMembersSection({
  clubId,
  initialMembers,
  isOwner,
  canManageRoles = false,
  isVerified,
  currentUserId,
}: ClubMembersSectionProps) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  async function changeRole(userId: string, role: string) {
    setLoadingId(userId);
    setError(null);
    try {
      await apiPatch(`/clubs/${clubId}/members/${userId}/role?role=${encodeURIComponent(role)}`);
      setMembers((prev) =>
        prev.map((m) => (m.user_id === userId ? { ...m, role } : m))
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setLoadingId(null);
    }
  }

  async function promoteAdmin(userId: string) {
    setLoadingId(userId);
    setError(null);
    setUpgradeRequired(false);
    try {
      await apiPost<ClubActionResponse>(`/clubs/${clubId}/admins/${userId}`);
      setMembers((prev) =>
        prev.map((m) => (m.user_id === userId ? { ...m, role: "admin" } : m))
      );
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to add admin";
      setError(msg);
      if (msg.toLowerCase().includes("pro")) setUpgradeRequired(true);
    } finally {
      setLoadingId(null);
    }
  }

  async function demoteAdmin(userId: string) {
    setLoadingId(userId);
    setError(null);
    try {
      await apiDelete<ClubActionResponse>(`/clubs/${clubId}/admins/${userId}`);
      setMembers((prev) =>
        prev.map((m) => (m.user_id === userId ? { ...m, role: "member" } : m))
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove admin");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Members</h2>

      {!isVerified && isOwner && (
        <GlassPanel depth="sm" className="p-4 text-sm text-muted-foreground">
          Free plan: 1 admin (you).{" "}
          <Link href="/upgrade" className="font-medium text-indigo-400 hover:underline">
            Upgrade to Pro
          </Link>{" "}
          to add multiple admins.
        </GlassPanel>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {members.map((member) => (
          <GlassPanel key={member.id} depth="sm" className="flex items-center gap-3 p-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.profile_picture_url ?? undefined} />
              <AvatarFallback>{member.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Link
                href={`/profile/${member.user_id}`}
                className="truncate font-medium hover:text-emerald-400"
              >
                {member.full_name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {member.school_name} · Grade {member.grade}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {member.role === "owner" || !canManageRoles || member.user_id === currentUserId ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                  {member.role.replace(/_/g, " ")}
                </span>
              ) : (
                <select
                  value={member.role}
                  disabled={loadingId === member.user_id}
                  onChange={(e) => changeRole(member.user_id, e.target.value)}
                  className="max-w-[9rem] rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs capitalize"
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              )}
              {isOwner &&
                member.user_id !== currentUserId &&
                member.role !== "owner" &&
                (member.role === "admin" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs"
                    disabled={loadingId === member.user_id}
                    onClick={() => demoteAdmin(member.user_id)}
                  >
                    <ShieldOff className="h-3 w-3" />
                    Remove admin
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs"
                    disabled={loadingId === member.user_id}
                    onClick={() => promoteAdmin(member.user_id)}
                  >
                    <Shield className="h-3 w-3" />
                    Make admin
                  </Button>
                ))}
            </div>
          </GlassPanel>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
          {upgradeRequired && (
            <>
              {" "}
              <Link href="/upgrade" className="text-indigo-400 hover:underline">
                Upgrade to Pro
              </Link>
            </>
          )}
        </p>
      )}
    </section>
  );
}
