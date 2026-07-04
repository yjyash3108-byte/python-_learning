"use client";

import { useState } from "react";
import { updateProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserProfile } from "@/types/models";

type ParentControlsPanelProps = {
  profile: UserProfile;
};

function readPref(profile: UserProfile, key: string, fallback = ""): string {
  const links = profile.social_links ?? {};
  const value = links[key];
  return typeof value === "string" ? value : fallback;
}

export function ParentControlsPanel({ profile }: ParentControlsPanelProps) {
  const [parentEmail, setParentEmail] = useState(readPref(profile, "parent_email"));
  const [profileVisibility, setProfileVisibility] = useState(
    readPref(profile, "profile_visibility", "public")
  );
  const [weeklyDigest, setWeeklyDigest] = useState(readPref(profile, "weekly_digest") === "true");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const social_links = {
      ...(profile.social_links ?? {}),
      parent_email: parentEmail.trim(),
      profile_visibility: profileVisibility,
      weekly_digest: weeklyDigest ? "true" : "false",
    };

    const result = await updateProfileAction({ social_links });
    if (result.error) setError(result.error);
    else setMessage(result.success ?? "Preferences saved");
    setLoading(false);
  }

  return (
    <GlassPanel depth="sm" className="space-y-4 p-6">
      <div>
        <h2 className="font-semibold">Privacy &amp; parent controls</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage who can see your profile and optional parent email for activity summaries.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {message && <p className="text-sm text-emerald-400">{message}</p>}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label htmlFor="parent-email">Parent / guardian email (optional)</Label>
          <Input
            id="parent-email"
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            placeholder="parent@example.com"
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Used for weekly activity digests when email is configured on the server.
          </p>
        </div>

        <div>
          <Label htmlFor="profile-visibility">Profile visibility</Label>
          <Select value={profileVisibility} onValueChange={setProfileVisibility}>
            <SelectTrigger id="profile-visibility" className="mt-1 w-full bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public — any ScholarNet student</SelectItem>
              <SelectItem value="school">School only — same school students</SelectItem>
              <SelectItem value="connections">Connections — people you follow</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={weeklyDigest}
            onChange={(e) => setWeeklyDigest(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Send weekly activity digest to parent email
        </label>

        <Button type="submit" className="btn-3d" disabled={loading}>
          {loading ? "Saving…" : "Save preferences"}
        </Button>
      </form>
    </GlassPanel>
  );
}
