"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiPost, apiUpload } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
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

interface PortfolioAddDialogProps {
  itemType: "project" | "certificate" | "achievement" | "competition" | "hackathon" | "olympiad";
  addLabel?: string;
}

export function PortfolioAddDialog({ itemType, addLabel = "Add item" }: PortfolioAddDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let imageUrl: string | undefined;
      const fileInput = document.getElementById(`portfolio-image-${itemType}`) as HTMLInputElement | null;
      const file = fileInput?.files?.[0];
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const upload = await apiUpload<{ url: string | null }>("/uploads/image", fd);
        imageUrl = upload.url ?? undefined;
      }

      await apiPost("/portfolio", {
        item_type: itemType,
        title,
        description,
        link_url: linkUrl || undefined,
        image_url: imageUrl,
        tags: [],
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      setLinkUrl("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-3d gap-2">
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/15 bg-slate-900/90 text-slate-100 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle>{addLabel}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div>
            <Label htmlFor={`portfolio-title-${itemType}`}>Title</Label>
            <Input
              id={`portfolio-title-${itemType}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`portfolio-desc-${itemType}`}>Description</Label>
            <Textarea
              id={`portfolio-desc-${itemType}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`portfolio-link-${itemType}`}>Link (optional)</Label>
            <Input
              id={`portfolio-link-${itemType}`}
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`portfolio-image-${itemType}`}>Image (optional)</Label>
            <Input id={`portfolio-image-${itemType}`} type="file" accept="image/*" className="mt-1" />
          </div>
          <Button type="submit" disabled={loading} className="btn-3d w-full">
            {loading ? "Saving…" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
