"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImagePlus, Link2, Plus, X } from "lucide-react";
import { createPostData } from "@/actions/posts";
import { apiUpload } from "@/lib/api/client";
import { POST_CATEGORIES } from "@/lib/constants";
import { parseHashtags } from "@/lib/validation/grade";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const MAX_IMAGES = 4;

type CreatePostDialogProps = {
  onPosted?: () => void | Promise<void>;
};

export function CreatePostDialog({ onPosted }: CreatePostDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [content, setContent] = useState("");
  const [category, setCategory] = useState("achievement");
  const [linkUrl, setLinkUrl] = useState("");
  const [hashtagsRaw, setHashtagsRaw] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  function resetForm() {
    setContent("");
    setCategory("achievement");
    setLinkUrl("");
    setHashtagsRaw("");
    setImageFiles([]);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews([]);
    setError(null);
    setSuccess(null);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) resetForm();
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - imageFiles.length;
    const selected = files.slice(0, remaining);

    setImageFiles((prev) => [...prev, ...selected]);
    setPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const fd = new FormData();
        fd.append("file", file);
        const upload = await apiUpload<{ url: string | null }>("/uploads/image", fd);
        if (upload.url) imageUrls.push(upload.url);
      }

      const result = await createPostData({
        content,
        category,
        linkUrl: linkUrl.trim() || undefined,
        hashtags: parseHashtags(hashtagsRaw),
        imageUrls,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(result.success ?? "Post shared!");
      await onPosted?.();
      router.refresh();
      setTimeout(() => handleOpenChange(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="btn-3d gap-2">
          <Plus className="h-4 w-4" />
          Create post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/15 bg-slate-900/90 text-slate-100 backdrop-blur-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
          <DialogDescription>
            Share an achievement, project update, or milestone. Add photos, a link, and hashtags
            so classmates can discover your work.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              {success}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="post-category">Post type</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="post-category" className="w-full bg-transparent">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="z-[200] border-border bg-popover text-popover-foreground">
                {POST_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-content">What would you like to share?</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              maxLength={2000}
              placeholder="I built a solar system model for the science fair and won first place…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-images" className="flex items-center gap-2">
              <ImagePlus className="h-4 w-4" />
              Photos (optional, up to {MAX_IMAGES})
            </Label>
            <Input
              id="post-images"
              type="file"
              accept="image/*"
              multiple
              disabled={imageFiles.length >= MAX_IMAGES || loading}
              onChange={handleImageSelect}
              className="cursor-pointer"
            />
            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {previews.map((src, i) => (
                  <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-link" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Project link (optional)
            </Label>
            <Input
              id="post-link"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://github.com/you/project"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-hashtags">Hashtags (optional)</Label>
            <Input
              id="post-hashtags"
              value={hashtagsRaw}
              onChange={(e) => setHashtagsRaw(e.target.value)}
              placeholder="#sciencefair #robotics #class10"
            />
            <p className="text-xs text-muted-foreground">
              Separate with spaces or commas. Max 10 tags.
            </p>
          </div>

          <Button type="submit" className="btn-3d w-full" disabled={loading || !!success}>
            {loading ? "Uploading & posting…" : success ? "Posted!" : "Share post"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
