"use client";

import { useState } from "react";
import { updateProfileAction } from "@/actions/profile";
import type { UserProfile } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassPanel } from "@/components/ui/glass-panel";
import { apiUpload } from "@/lib/api/client";
import { useRouter } from "next/navigation";

interface ProfileEditorProps {
  profile: UserProfile;
}

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const router = useRouter();
  const [bio, setBio] = useState(profile.bio);
  const [city, setCity] = useState(profile.city ?? "");
  const [skills, setSkills] = useState((profile.skills ?? []).join(", "));
  const [interests, setInterests] = useState((profile.interests ?? []).join(", "));
  const [careerGoals, setCareerGoals] = useState(profile.career_goals ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const result = await updateProfileAction({
        bio,
        city: city || undefined,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        interests: interests.split(",").map((s) => s.trim()).filter(Boolean),
        career_goals: careerGoals.trim() || undefined,
      });
      if (result.error) setError(result.error);
      else {
        setMessage(result.success ?? "Profile updated");
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await apiUpload("/users/me/avatar", fd);
      router.refresh();
      setMessage("Photo updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassPanel depth="sm" static className="space-y-4 p-6">
      <h2 className="font-semibold">Edit profile</h2>
      {message && <p className="text-sm text-primary">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div>
        <Label htmlFor="avatar">Profile picture</Label>
        <Input id="avatar" type="file" accept="image/*" className="mt-1" onChange={handleAvatar} />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1" rows={3} />
      </div>
      <div>
        <Label htmlFor="city">City</Label>
        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="skills">Skills (comma-separated)</Label>
        <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="interests">Interests (comma-separated)</Label>
        <Input id="interests" value={interests} onChange={(e) => setInterests(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="careerGoals">Career goals</Label>
        <Textarea
          id="careerGoals"
          value={careerGoals}
          onChange={(e) => setCareerGoals(e.target.value)}
          rows={3}
          className="mt-1"
          maxLength={500}
        />
      </div>
      <Button type="button" disabled={loading} onClick={handleSave} className="btn-3d">
        Save changes
      </Button>
    </GlassPanel>
  );
}
