"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/actions/profile";
import { GlassPanel } from "@/components/ui/glass-panel";
import { TagEditor } from "@/components/profile/tag-editor";

type SkillsInterestsSectionProps = {
  initialSkills: string[];
  initialInterests: string[];
  editable?: boolean;
  onSkillsChange?: (skills: string[]) => void;
  onInterestsChange?: (interests: string[]) => void;
};

export function SkillsInterestsSection({
  initialSkills,
  initialInterests,
  editable = false,
  onSkillsChange,
  onInterestsChange,
}: SkillsInterestsSectionProps) {
  const router = useRouter();
  const [skills, setSkills] = useState(initialSkills);
  const [interests, setInterests] = useState(initialInterests);

  useEffect(() => {
    setSkills(initialSkills);
  }, [initialSkills]);

  useEffect(() => {
    setInterests(initialInterests);
  }, [initialInterests]);

  async function saveSkills(next: string[]) {
    const result = await updateProfileAction({ skills: next, interests });
    if (result.error) throw new Error(result.error);
    setSkills(next);
    onSkillsChange?.(next);
    router.refresh();
  }

  async function saveInterests(next: string[]) {
    const result = await updateProfileAction({ skills, interests: next });
    if (result.error) throw new Error(result.error);
    setInterests(next);
    onInterestsChange?.(next);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassPanel depth="sm" tilt className="p-6">
        <h2 className="font-semibold">Skills</h2>
        <div className="mt-3">
          {editable ? (
            <TagEditor
              items={skills}
              onSave={saveSkills}
              placeholder="e.g. Python, Debate, Football"
              emptyHint="Add skills to showcase what you're good at."
              badgeVariant="secondary"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {skills.length === 0 && (
                <p className="text-sm text-muted-foreground">No skills listed yet.</p>
              )}
            </div>
          )}
        </div>
      </GlassPanel>

      <GlassPanel depth="sm" tilt className="p-6">
        <h2 className="font-semibold">Interests</h2>
        <div className="mt-3">
          {editable ? (
            <TagEditor
              items={interests}
              onSave={saveInterests}
              placeholder="e.g. Robotics, Music, Startups"
              emptyHint="Add interests so we can suggest clubs and people."
              badgeVariant="outline"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs font-medium"
                >
                  {interest}
                </span>
              ))}
              {!interests.length && (
                <p className="text-sm text-muted-foreground">No interests listed yet.</p>
              )}
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
