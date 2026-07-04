"use client";

import Link from "next/link";
import { Sparkles, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

type OpportunitiesSkillsBannerProps = {
  userSkills: string[];
  isAdmin?: boolean;
};

export function OpportunitiesSkillsBanner({ userSkills, isAdmin }: OpportunitiesSkillsBannerProps) {
  const hasSkills = userSkills.length > 0;

  return (
    <GlassPanel depth="sm" className="space-y-3 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-medium">How matching works</p>
          <p className="text-sm text-muted-foreground">
            ScholarNet reads <strong className="font-medium text-foreground">skills & interests on your Profile</strong>{" "}
            and compares them to each opportunity. Add tags like Python, Robotics, or Science to see higher match scores.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="font-medium text-foreground">Apply & open site</strong> records your application
            on ScholarNet and opens the organizer&apos;s website in a new tab. Use{" "}
            <strong className="font-medium text-foreground">View website</strong> or{" "}
            <strong className="font-medium text-foreground">Open application</strong> anytime after applying.
          </p>
        </div>
      </div>

      {hasSkills ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your profile skills used for matching
          </p>
          <div className="flex flex-wrap gap-2">
            {userSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="border-white/10 bg-white/10">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-amber-200/90">
          You haven&apos;t added skills yet — matches will show 0% until you do.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" asChild className="btn-3d gap-1.5">
          <Link href="/profile">
            <UserCircle className="h-4 w-4" />
            {hasSkills ? "Update profile skills" : "Add skills on Profile"}
          </Link>
        </Button>
        {isAdmin && (
          <Button size="sm" variant="outline" asChild className="border-white/15 bg-white/5">
            <Link href="/admin">Post opportunities (Admin)</Link>
          </Button>
        )}
      </div>
    </GlassPanel>
  );
}
