"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, Crown, Users } from "lucide-react";
import { ClubPostsSection } from "@/components/clubs/club-posts-section";
import { ClubAnalyticsSection } from "@/components/clubs/club-analytics-section";
import { ClubAssistantPanel } from "@/components/clubs/club-assistant-panel";
import { ClubAnnouncementsSection } from "@/components/clubs/club-announcements-section";
import { ClubEventsSection } from "@/components/clubs/club-events-section";
import { ClubMembersSection } from "@/components/clubs/club-members-section";
import { ClubSettingsSection } from "@/components/clubs/club-settings-section";
import { JoinClubButton } from "@/components/clubs/join-club-button";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { apiDelete } from "@/lib/api/client";
import { FREE_MAX_MEMBERS } from "@/lib/clubs/constants";
import type { ClubAnalytics } from "@/types/club-analytics";
import type { ClubAnnouncement, ClubEvent } from "@/types/club-activity";
import type { ClubDetail, ClubMember } from "@/types/club";

type Tab = "feed" | "announcements" | "events" | "members" | "settings" | "analytics" | "assistant";

type ClubDetailContentProps = {
  club: ClubDetail;
  members: ClubMember[];
  events: ClubEvent[];
  announcements: ClubAnnouncement[];
  posts: { id: string; club_id: string; author_id: string; author_name: string; content: string; created_at: string }[];
  analytics: ClubAnalytics | null;
  currentUserId: string;
  isPro: boolean;
};

export function ClubDetailContent({
  club,
  members,
  events,
  announcements,
  posts,
  analytics,
  currentUserId,
  isPro,
}: ClubDetailContentProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>(club.is_member ? "feed" : "announcements");

  const isOwner = club.my_role === "owner";
  const isAdmin = club.my_role === "owner" || club.my_role === "admin";
  const atMemberLimit = !club.is_verified && club.member_count >= FREE_MAX_MEMBERS;

  const tabs: { id: Tab; label: string; adminOnly?: boolean }[] = [
    { id: "feed", label: "Feed" },
    { id: "announcements", label: "Announcements" },
    { id: "events", label: "Events" },
    { id: "members", label: "Members" },
    { id: "settings", label: "Settings", adminOnly: true },
    { id: "assistant", label: "AI Assistant" },
    { id: "analytics", label: "Analytics", adminOnly: true },
  ];

  async function handleDelete() {
    if (!isOwner || !confirm("Delete this club permanently?")) return;
    setDeleting(true);
    setError(null);
    try {
      await apiDelete(`/clubs/${club.id}`);
      router.push("/clubs");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete club");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <Link
        href="/clubs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to clubs
      </Link>

      <GlassPanel depth="md" className="overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-4xl"
              style={{ background: `${club.color}33`, boxShadow: `0 0 40px ${club.color}44` }}
            >
              {club.emoji}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold sm:text-3xl">{club.name}</h1>
                {club.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="mt-1 capitalize text-sm text-muted-foreground">{club.category}</p>
              {club.school_name && (
                <p className="text-sm text-muted-foreground">{club.school_name}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {club.member_count} member{club.member_count === 1 ? "" : "s"}
                </span>
                <span>{club.admin_count} admin{club.admin_count === 1 ? "" : "s"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <JoinClubButton
              clubId={club.id}
              initialIsMember={club.is_member}
              myRole={club.my_role}
              size="default"
            />
            {isOwner && (
              <Button
                variant="destructive"
                size="sm"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? "Deleting…" : "Delete club"}
              </Button>
            )}
          </div>
        </div>

        {club.description && (
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{club.description}</p>
        )}

        {atMemberLimit && isAdmin && !isPro && (
          <GlassPanel depth="sm" className="mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              This club hit the free {FREE_MAX_MEMBERS}-member limit. Upgrade to Pro for unlimited
              members.
            </p>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-cyan-500 px-3 py-1.5 text-sm font-medium text-white btn-3d"
            >
              <Crown className="h-4 w-4" />
              Upgrade
            </Link>
          </GlassPanel>
        )}
      </GlassPanel>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        {tabs
          .filter((t) => !t.adminOnly || isAdmin)
          .map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>

      {tab === "feed" && (
        <ClubPostsSection
          clubId={club.id}
          initialPosts={posts}
          isMember={club.is_member}
          currentUserId={currentUserId}
        />
      )}

      {tab === "announcements" && (
        <ClubAnnouncementsSection
          clubId={club.id}
          initialAnnouncements={announcements}
          isAdmin={isAdmin}
          isVerified={club.is_verified}
        />
      )}

      {tab === "events" && (
        <ClubEventsSection
          clubId={club.id}
          initialEvents={events}
          isAdmin={isAdmin}
          isVerified={club.is_verified}
          isMember={club.is_member}
        />
      )}

      {tab === "members" && (
        <ClubMembersSection
          clubId={club.id}
          initialMembers={members}
          isOwner={isOwner}
          canManageRoles={isAdmin}
          isVerified={club.is_verified}
          currentUserId={currentUserId}
        />
      )}

      {tab === "settings" && isAdmin && <ClubSettingsSection club={club} />}

      {tab === "assistant" && (
        <ClubAssistantPanel
          clubId={club.id}
          clubName={club.name}
          isProClub={club.is_verified}
          isMember={club.is_member}
        />
      )}

      {tab === "analytics" && isAdmin && analytics && (
        <ClubAnalyticsSection analytics={analytics} />
      )}

      {tab === "analytics" && isAdmin && !analytics && (
        <GlassPanel depth="sm" className="p-6 text-sm text-muted-foreground">
          Analytics unavailable.
        </GlassPanel>
      )}

      <GlassPanel depth="sm" className="p-4">
        <p className="text-sm text-muted-foreground">
          Created by{" "}
          <Link
            href={`/profile/${club.creator.id}`}
            className="font-medium text-foreground hover:text-emerald-400"
          >
            {club.creator.full_name}
          </Link>
        </p>
      </GlassPanel>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
