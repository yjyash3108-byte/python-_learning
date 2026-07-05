"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Textarea } from "@/components/ui/textarea";
import { FollowButton } from "@/components/profile/follow-button";
import { MessageUserButton } from "@/components/messages/message-user-button";
import { FollowStats } from "@/components/profile/follow-stats-bar";
import { ProfileShareMenu } from "@/components/profile/profile-share-menu";
import { ProfileAvatarEditor } from "@/components/profile/profile-avatar-editor";
import { ProfileCover } from "@/components/profile/profile-cover";
import { parseCoverThemeFromSocialLinks } from "@/lib/profile/cover-theme";
import { ReportBlockActions } from "@/components/moderation/report-block-actions";
import { SkillsInterestsSection } from "@/components/profile/skills-interests-section";
import { Link2 } from "lucide-react";
import { publicProfileUrl } from "@/lib/slug";
import type { UserProfile } from "@/types/models";

type FollowStatus = {
  followers: number;
  following: number;
  is_following: boolean;
  is_self: boolean;
};

type StudentProfileViewProps = {
  profile: UserProfile;
  followStatus: FollowStatus;
  showEditLink?: boolean;
  canMessage?: boolean;
  onEditProfile?: () => void;
  editableSkills?: string[];
  editableInterests?: string[];
  onSkillsChange?: (skills: string[]) => void;
  onInterestsChange?: (interests: string[]) => void;
  editableBio?: string;
  editingBio?: boolean;
  bioDraft?: string;
  onBioDraftChange?: (value: string) => void;
  onStartEditBio?: () => void;
  onSaveBio?: () => void;
  onCancelBio?: () => void;
  savingBio?: boolean;
};

export function StudentProfileView({
  profile,
  followStatus,
  showEditLink = false,
  canMessage = false,
  onEditProfile,
  editableSkills,
  editableInterests,
  onSkillsChange,
  onInterestsChange,
  editableBio,
  editingBio = false,
  bioDraft = "",
  onBioDraftChange,
  onStartEditBio,
  onSaveBio,
  onCancelBio,
  savingBio = false,
}: StudentProfileViewProps) {
  const [followers, setFollowers] = useState(followStatus.followers);
  const [following, setFollowing] = useState(followStatus.following);
  const [avatarUrl, setAvatarUrl] = useState(profile.profile_picture_url);
  const savedCover = useMemo(
    () => parseCoverThemeFromSocialLinks(profile.social_links),
    [profile.social_links]
  );

  useEffect(() => {
    setAvatarUrl(profile.profile_picture_url);
  }, [profile.profile_picture_url]);

  const skills = editableSkills ?? profile.skills ?? [];
  const interests = editableInterests ?? profile.interests ?? [];
  const bio = editableBio ?? profile.bio ?? "";

  return (
    <div className="space-y-6">
      <GlassPanel depth="lg" static className="overflow-hidden p-0">
        <ProfileCover
          imageUrl={avatarUrl}
          coverPrimary={savedCover?.primary}
          coverAccent={savedCover?.accent}
        />
        <div className="relative px-5 pb-6 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="avatar-ring -mt-14 w-fit rounded-full sm:-mt-16">
              <ProfileAvatarEditor
                fullName={profile.full_name}
                imageUrl={avatarUrl}
                editable={followStatus.is_self}
                socialLinks={profile.social_links ?? undefined}
                onPhotoUpdated={setAvatarUrl}
              />
            </div>
            {!followStatus.is_self && (
              <div className="flex flex-col items-end gap-2 sm:flex-row">
                <FollowButton
                  userId={profile.id}
                  initialIsFollowing={followStatus.is_following}
                  followers={followers}
                  onFollowersChange={setFollowers}
                  onFollowingChange={setFollowing}
                  size="default"
                />
                {canMessage && <MessageUserButton userId={profile.id} />}
                <ReportBlockActions targetType="user" targetId={profile.id} targetLabel={profile.full_name} />
              </div>
            )}
            {showEditLink && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <ProfileShareMenu userId={profile.id} username={profile.username} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={onEditProfile}
                  className="border-white/15 bg-white/5"
                >
                  Edit profile
                </Button>
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {profile.full_name}
            </h1>
            {profile.is_verified && (
              <span className="chip border-cyan-400/30 bg-cyan-500/15 text-cyan-300">Verified</span>
            )}
          </div>
          {profile.username && (
            <p className="mt-0.5 font-medium text-indigo-300">@{profile.username}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            Class {profile.grade} · {profile.school_name}
            {profile.city ? ` · ${profile.city}` : ""}
          </p>
          {followStatus.is_self && (
            <p className="mt-2 text-xs text-muted-foreground">
              Click your photo to add or change it.
            </p>
          )}
          {followStatus.is_self && profile.username && (
            <p className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-sm">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
              <span className="truncate font-mono text-indigo-200">
                {publicProfileUrl(profile.username)}
              </span>
            </p>
          )}

          {followStatus.is_self && editingBio ? (
            <div className="mt-4 space-y-2">
              <Textarea
                value={bioDraft}
                onChange={(e) => onBioDraftChange?.(e.target.value)}
                rows={3}
                placeholder="Tell classmates a little about yourself…"
                maxLength={500}
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" className="btn-3d" disabled={savingBio} onClick={onSaveBio}>
                  {savingBio ? "Saving…" : "Save bio"}
                </Button>
                {bio && (
                  <Button type="button" size="sm" variant="outline" onClick={onCancelBio}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ) : bio ? (
            <div className="mt-3 flex items-start justify-between gap-3">
              <p className="max-w-xl text-sm text-muted-foreground">{bio}</p>
              {followStatus.is_self && (
                <Button type="button" size="sm" variant="ghost" onClick={onStartEditBio}>
                  Edit
                </Button>
              )}
            </div>
          ) : followStatus.is_self ? (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">Add a short bio so others can get to know you.</p>
              <Button type="button" size="sm" variant="outline" className="mt-2" onClick={onStartEditBio}>
                Add bio
              </Button>
            </div>
          ) : null}
        </div>
      </GlassPanel>

      <FollowStats
        userId={profile.id}
        followers={followers}
        following={following}
        profileName={profile.full_name}
      />

      <SkillsInterestsSection
        initialSkills={skills}
        initialInterests={interests}
        editable={followStatus.is_self}
        onSkillsChange={onSkillsChange}
        onInterestsChange={onInterestsChange}
      />

      {!followStatus.is_self && profile.career_goals && (
        <GlassPanel depth="sm" tilt className="p-6">
          <h2 className="font-semibold">Career goals</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{profile.career_goals}</p>
        </GlassPanel>
      )}
    </div>
  );
}
