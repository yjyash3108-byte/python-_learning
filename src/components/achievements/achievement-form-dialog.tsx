"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { TagInput } from "@/components/achievements/tag-input";
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
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_LEVELS } from "@/lib/achievements/constants";
import { parseTags, uploadDocument, uploadImage, validateDocumentFile } from "@/lib/achievements/upload";
import { apiPost, apiPut } from "@/lib/api/client";
import type { Achievement } from "@/types/achievements";

type AchievementFormDialogProps = {
  achievement?: Achievement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode | null;
};

export function AchievementFormDialog({
  achievement,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: AchievementFormDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const certificateFile = (form.querySelector("#achievement-certificate") as HTMLInputElement)
        ?.files?.[0];
      const imageFile = (form.querySelector("#achievement-image") as HTMLInputElement)?.files?.[0];

      const certificateError = validateDocumentFile(certificateFile);
      if (certificateError) throw new Error(certificateError);

      let certificate_file_url = achievement?.certificate_file_url ?? undefined;
      let image_url = achievement?.image_url ?? undefined;

      if (certificateFile) certificate_file_url = await uploadDocument(certificateFile);
      if (imageFile) image_url = await uploadImage(imageFile);

      const payload = {
        title: String(formData.get("title")),
        category: String(formData.get("category")),
        description: String(formData.get("description") || ""),
        organization: String(formData.get("organization") || ""),
        level: String(formData.get("level")),
        rank: String(formData.get("rank") || "") || null,
        date_achieved: String(formData.get("date_achieved")),
        verification_link: String(formData.get("verification_link") || "") || null,
        skills_gained: parseTags(String(formData.get("skills_gained") || "")),
        certificate_file_url: certificate_file_url ?? null,
        image_url: image_url ?? null,
      };

      if (achievement) {
        await apiPut(`/achievements/${achievement.id}`, payload);
        setSuccess("Achievement updated!");
      } else {
        await apiPost("/achievements", payload);
        setSuccess("Achievement added!");
      }

      form.reset();
      router.refresh();
      window.setTimeout(() => setOpen(false), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save achievement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger === null ? null : trigger !== undefined ? (
        trigger
      ) : !achievement ? (
        <DialogTrigger asChild>
          <Button className="btn-3d gap-2">
            <Plus className="h-4 w-4" />
            Add Achievement
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/15 bg-slate-900/95 text-slate-100 backdrop-blur-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{achievement ? "Edit Achievement" : "Add Achievement"}</DialogTitle>
        </DialogHeader>
        <form key={achievement?.id ?? "new"} onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">
              {success}
            </p>
          )}

          <div>
            <Label htmlFor="achievement-title">Achievement title *</Label>
            <Input
              id="achievement-title"
              name="title"
              defaultValue={achievement?.title}
              required
              className="mt-1"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="achievement-category">Category *</Label>
              <FormSelect
                id="achievement-category"
                name="category"
                required
                defaultValue={achievement?.category ?? ""}
                options={[...ACHIEVEMENT_CATEGORIES]}
              />
            </div>
            <div>
              <Label htmlFor="achievement-level">Level *</Label>
              <FormSelect
                id="achievement-level"
                name="level"
                required
                defaultValue={achievement?.level ?? ""}
                options={[...ACHIEVEMENT_LEVELS]}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="achievement-description">Description</Label>
            <Textarea
              id="achievement-description"
              name="description"
              rows={3}
              defaultValue={achievement?.description}
              className="mt-1"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="achievement-organization">Organization / Issuer</Label>
              <Input
                id="achievement-organization"
                name="organization"
                defaultValue={achievement?.organization}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="achievement-date">Date achieved *</Label>
              <Input
                id="achievement-date"
                name="date_achieved"
                type="date"
                required
                defaultValue={achievement?.date_achieved?.slice(0, 10)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="achievement-rank">Position / Rank</Label>
              <Input
                id="achievement-rank"
                name="rank"
                defaultValue={achievement?.rank ?? ""}
                placeholder="e.g. 1st place"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="achievement-verification">Verification link</Label>
              <Input
                id="achievement-verification"
                name="verification_link"
                type="url"
                defaultValue={achievement?.verification_link ?? ""}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="achievement-certificate">Certificate upload (PDF/JPG/PNG, max 10 MB)</Label>
            <Input
              id="achievement-certificate"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="achievement-image">Achievement image (optional)</Label>
            <Input id="achievement-image" type="file" accept="image/*" className="mt-1" />
          </div>

          <div>
            <Label>Skills gained</Label>
            <TagInput
              name="skills_gained"
              defaultTags={achievement?.skills_gained ?? []}
              placeholder="e.g. Python, Teamwork"
            />
          </div>

          <Button type="submit" disabled={loading} className="btn-3d w-full">
            {loading ? "Saving…" : achievement ? "Update achievement" : "Save achievement"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
