"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/actions/profile";
import { SkillTree } from "@/components/dashboard/skill-tree";
import { StudentProfileView } from "@/components/profile/student-profile-view";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { ProfileAnalyticsPanel, VerifyEmailBanner } from "@/components/profile/profile-analytics-panel";
import { PublicPortfolioCard } from "@/components/profile/public-portfolio-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { buildSkillTree } from "@/lib/skill-tree";
import type { UserProfile } from "@/types/models";

type FollowStatus = {
  followers: number;
  following: number;
  is_following: boolean;
  is_self: boolean;
};

type OwnProfileContentProps = {
  profile: UserProfile;
  followStatus: FollowStatus;
  achievementSkills: string[];
  stats: { projects_count: number; posts_count: number; achievements_count: number };
  isPro?: boolean;
};

export function OwnProfileContent({
  profile,
  followStatus,
  achievementSkills,
  stats,
  isPro = false,
}: OwnProfileContentProps) {
  const router = useRouter();
  const [skills, setSkills] = useState(profile.skills ?? []);
  const [interests, setInterests] = useState(profile.interests ?? []);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [careerGoals, setCareerGoals] = useState(profile.career_goals ?? "");
  const [bioDraft, setBioDraft] = useState(profile.bio ?? "");
  const [goalsDraft, setGoalsDraft] = useState(profile.career_goals ?? "");
  const [editingBio, setEditingBio] = useState(!profile.bio);
  const [editingGoals, setEditingGoals] = useState(!profile.career_goals);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSkills(profile.skills ?? []);
    setInterests(profile.interests ?? []);
    setBio(profile.bio ?? "");
    setCareerGoals(profile.career_goals ?? "");
    setBioDraft(profile.bio ?? "");
    setGoalsDraft(profile.career_goals ?? "");
  }, [profile.skills, profile.interests, profile.bio, profile.career_goals]);

  const skillTreeNodes = useMemo(
    () => buildSkillTree([...skills, ...interests], achievementSkills),
    [skills, interests, achievementSkills]
  );

  async function saveField(
    field: "bio" | "career_goals",
    value: string
  ) {
    setSaving(field);
    setError(null);
    try {
      const payload =
        field === "bio"
          ? { bio: value, skills, interests }
          : { career_goals: value, skills, interests };
      const result = await updateProfileAction(payload);
      if (result.error) throw new Error(result.error);
      if (field === "bio") {
        setBio(value);
        setEditingBio(false);
      } else {
        setCareerGoals(value);
        setEditingGoals(false);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(null);
    }
  }

  function scrollToEditor() {
    document.getElementById("profile-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-6">
      <PublicPortfolioCard username={profile.username} />
      <VerifyEmailBanner verified={profile.email_verified} />
      <ProfileAnalyticsPanel isPro={isPro} />
      <StudentProfileView
        profile={{ ...profile, bio, skills, interests, career_goals: careerGoals }}
        followStatus={followStatus}
        showEditLink
        onEditProfile={scrollToEditor}
        editableSkills={skills}
        editableInterests={interests}
        onSkillsChange={setSkills}
        onInterestsChange={setInterests}
        editableBio={bio}
        editingBio={editingBio}
        bioDraft={bioDraft}
        onBioDraftChange={setBioDraft}
        onStartEditBio={() => setEditingBio(true)}
        onSaveBio={() => saveField("bio", bioDraft.trim())}
        onCancelBio={() => {
          setBioDraft(bio);
          setEditingBio(!!bio);
        }}
        savingBio={saving === "bio"}
      />

      <GlassPanel depth="sm" tilt className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Career goals</h2>
          {!editingGoals && careerGoals && (
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditingGoals(true)}>
              Edit
            </Button>
          )}
        </div>
        {error && saving === "career_goals" && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
        {editingGoals ? (
          <div className="mt-3 space-y-3">
            <Textarea
              value={goalsDraft}
              onChange={(e) => setGoalsDraft(e.target.value)}
              rows={4}
              placeholder="What do you want to explore — careers, college paths, dream roles?"
              maxLength={500}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="btn-3d"
                disabled={saving === "career_goals"}
                onClick={() => saveField("career_goals", goalsDraft.trim())}
              >
                {saving === "career_goals" ? "Saving…" : "Save"}
              </Button>
              {careerGoals && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setGoalsDraft(careerGoals);
                    setEditingGoals(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : careerGoals ? (
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{careerGoals}</p>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-muted-foreground">
              Share your goals so ScholarNet can surface better opportunities.
            </p>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditingGoals(true)}>
              Add career goals
            </Button>
          </div>
        )}
      </GlassPanel>

      <div id="profile-editor">
        <ProfileEditor profile={{ ...profile, bio, skills, interests, career_goals: careerGoals }} />
      </div>

      <GlassPanel depth="md" tilt className="p-6">
        <h2 className="mb-4 font-semibold">Skill Tree</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Grows as you add skills, interests, and achievements.
        </p>
        <SkillTree nodes={skillTreeNodes} />
      </GlassPanel>

      <div className="grid grid-cols-2 gap-4 text-center lg:grid-cols-3">
        {[
          { label: "Projects", value: stats.projects_count },
          { label: "Posts", value: stats.posts_count },
          { label: "Achievements", value: stats.achievements_count },
        ].map((stat) => (
          <GlassPanel key={stat.label} depth="sm" className="p-4">
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
