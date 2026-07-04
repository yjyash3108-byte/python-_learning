"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CLUB_CATEGORIES, CLUB_COLORS, CLUB_EMOJIS } from "@/lib/clubs/constants";
import { apiPost } from "@/lib/api/client";
import type { Club, ClubLimits } from "@/types/club";

type CreateClubDialogProps = {
  limits: ClubLimits | null;
};

export function CreateClubDialog({ limits }: CreateClubDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emoji, setEmoji] = useState<string>(CLUB_EMOJIS[0]);
  const [color, setColor] = useState<string>(CLUB_COLORS[0]);

  const canCreate = limits?.can_create_club ?? true;
  const upgradeRequired = limits?.upgrade_required ?? false;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreate) return;

    setLoading(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const club = await apiPost<Club>("/clubs", {
        name: String(formData.get("name")),
        description: String(formData.get("description") || ""),
        category: String(formData.get("category")),
        emoji,
        color,
        school_name: String(formData.get("school_name") || "") || null,
      });

      form.reset();
      setOpen(false);
      router.push(`/clubs/${club.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create club");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-3d gap-2" disabled={!canCreate}>
          <Plus className="h-4 w-4" />
          Create Club
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a club</DialogTitle>
        </DialogHeader>

        {!canCreate && upgradeRequired ? (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Free plan allows {limits?.max_clubs_created ?? 1} club. Upgrade to ScholarNet Pro for
              unlimited clubs.
            </p>
            <Link
              href="/upgrade"
              className="inline-flex rounded-md bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white btn-3d"
            >
              Upgrade to Pro
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="club-name">Club name</Label>
              <Input id="club-name" name="name" required minLength={2} maxLength={120} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="club-description">Description</Label>
              <Textarea
                id="club-description"
                name="description"
                rows={3}
                maxLength={2000}
                placeholder="What is this club about?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="club-category">Category</Label>
              <FormSelect
                id="club-category"
                name="category"
                required
                options={CLUB_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="club-school">School (optional)</Label>
              <Input id="club-school" name="school_name" maxLength={120} />
            </div>

            <div className="space-y-2">
              <Label>Emoji</Label>
              <div className="flex flex-wrap gap-2">
                {CLUB_EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition ${
                      emoji === e ? "border-emerald-400 bg-emerald-400/10" : "border-border"
                    }`}
                    onClick={() => setEmoji(e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Accent color</Label>
              <div className="flex flex-wrap gap-2">
                {CLUB_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      color === c ? "border-white scale-110" : "border-transparent"
                    }`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
                {error.toLowerCase().includes("pro") && (
                  <>
                    {" "}
                    <Link href="/upgrade" className="font-medium text-indigo-400 hover:underline">
                      Upgrade to Pro
                    </Link>
                  </>
                )}
              </p>
            )}

            <Button type="submit" className="btn-3d w-full" disabled={loading}>
              {loading ? "Creating…" : "Create Club"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
