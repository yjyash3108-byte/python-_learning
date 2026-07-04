"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Megaphone, Pencil, Pin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiDelete, apiPatch, apiPost } from "@/lib/api/client";
import { FREE_MAX_ANNOUNCEMENTS } from "@/lib/clubs/constants";
import type { ClubAnnouncement } from "@/types/club-activity";

type ClubAnnouncementsSectionProps = {
  clubId: string;
  initialAnnouncements: ClubAnnouncement[];
  isAdmin: boolean;
  isVerified: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ClubAnnouncementsSection({
  clubId,
  initialAnnouncements,
  isAdmin,
  isVerified,
}: ClubAnnouncementsSectionProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const atLimit = !isVerified && announcements.length >= FREE_MAX_ANNOUNCEMENTS;

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const created = await apiPost<ClubAnnouncement>(`/clubs/${clubId}/announcements`, {
        title: String(formData.get("title")),
        content: String(formData.get("content")),
        is_pinned: formData.get("is_pinned") === "on",
      });
      setAnnouncements((prev) =>
        [created, ...prev].sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
      );
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post announcement");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(event.currentTarget);
    try {
      const updated = await apiPatch<ClubAnnouncement>(`/clubs/${clubId}/announcements/${id}`, {
        title: String(fd.get("title")),
        content: String(fd.get("content")),
        is_pinned: fd.get("is_pinned") === "on",
      });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? updated : a)).sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
      );
      setEditingId(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    setDeletingId(id);
    try {
      await apiDelete(`/clubs/${clubId}/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Announcements</h2>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="btn-3d gap-1" disabled={atLimit}>
                <Plus className="h-4 w-4" />
                Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>New announcement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ann-title">Title</Label>
                  <Input id="ann-title" name="title" required minLength={2} maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ann-content">Message</Label>
                  <Textarea id="ann-content" name="content" rows={4} required maxLength={5000} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="is_pinned" className="rounded" />
                  Pin to top
                </label>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="btn-3d w-full" disabled={loading}>
                  {loading ? "Posting…" : "Post announcement"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {atLimit && isAdmin && (
        <GlassPanel depth="sm" className="p-4 text-sm text-muted-foreground">
          Free plan limit: {FREE_MAX_ANNOUNCEMENTS} announcements.{" "}
          <Link href="/upgrade" className="font-medium text-indigo-400 hover:underline">
            Upgrade to Pro
          </Link>{" "}
          for unlimited announcements.
        </GlassPanel>
      )}

      {announcements.length === 0 ? (
        <GlassPanel depth="sm" className="p-8 text-center text-sm text-muted-foreground">
          <Megaphone className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
          No announcements yet.{isAdmin ? " Post an update for members!" : ""}
        </GlassPanel>
      ) : (
        <div className="space-y-3">
          {announcements.map((item) => (
            <GlassPanel key={item.id} depth="sm" className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    {item.is_pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.author_name} · {formatDate(item.created_at)}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {item.content}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setEditingId(item.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
              {editingId === item.id && isAdmin && (
                <form onSubmit={(e) => handleUpdate(item.id, e)} className="mt-4 space-y-3 border-t border-white/10 pt-4">
                  <Input name="title" defaultValue={item.title} required />
                  <Textarea name="content" rows={3} defaultValue={item.content} required />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="is_pinned" defaultChecked={item.is_pinned} />
                    Pin to top
                  </label>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={loading}>Save</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </form>
              )}
            </GlassPanel>
          ))}
        </div>
      )}

      {error && !open && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
