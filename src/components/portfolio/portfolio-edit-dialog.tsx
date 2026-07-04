"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiPut } from "@/lib/api/client";
import type { PortfolioItem } from "@/types/models";
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

type PortfolioEditDialogProps = {
  item: Pick<PortfolioItem, "id" | "title" | "description" | "link_url" | "tags">;
  onUpdated?: () => void;
};

export function PortfolioEditDialog({ item, onUpdated }: PortfolioEditDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [linkUrl, setLinkUrl] = useState(item.link_url ?? "");
  const [tags, setTags] = useState((item.tags ?? []).join(", "));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiPut(`/portfolio/${item.id}`, {
        title,
        description,
        link_url: linkUrl || null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setOpen(false);
      onUpdated?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1 border-white/15 bg-white/5">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/15 bg-slate-900/90 text-slate-100 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div>
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="edit-link">Link (optional)</Label>
            <Input id="edit-link" type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
            <Input id="edit-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="React, Python, Robotics" className="mt-1" />
          </div>
          <Button type="submit" disabled={loading} className="btn-3d w-full">
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
