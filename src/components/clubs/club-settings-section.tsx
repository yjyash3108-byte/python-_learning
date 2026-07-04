"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiPatch } from "@/lib/api/client";
import type { ClubDetail } from "@/types/club";

type ClubSettingsSectionProps = {
  club: ClubDetail;
};

export function ClubSettingsSection({ club }: ClubSettingsSectionProps) {
  const router = useRouter();
  const [name, setName] = useState(club.name);
  const [description, setDescription] = useState(club.description);
  const [emoji, setEmoji] = useState(club.emoji);
  const [category, setCategory] = useState(club.category);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await apiPatch(`/clubs/${club.id}`, {
        name: name.trim(),
        description: description.trim(),
        emoji: emoji.trim() || "🌐",
        category: category.trim() || "other",
      });
      setMessage("Club updated!");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-indigo-400" />
        <h2 className="text-lg font-semibold">Club settings</h2>
      </div>
      <GlassPanel depth="sm" static className="p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="club-name">Name</Label>
              <Input id="club-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="club-emoji">Emoji</Label>
              <Input id="club-emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} className="mt-1" maxLength={10} />
            </div>
          </div>
          <div>
            <Label htmlFor="club-category">Category</Label>
            <Input id="club-category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="club-desc">Description</Label>
            <Textarea
              id="club-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1"
              maxLength={2000}
            />
          </div>
          {message && <p className="text-sm text-emerald-400">{message}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="btn-3d" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </GlassPanel>
    </section>
  );
}
