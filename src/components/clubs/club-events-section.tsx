"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Pencil, Plus, Users } from "lucide-react";
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
import { FREE_MAX_EVENTS } from "@/lib/clubs/constants";
import type { ClubEvent } from "@/types/club-activity";

type ClubEventsSectionProps = {
  clubId: string;
  initialEvents: ClubEvent[];
  isAdmin: boolean;
  isVerified: boolean;
  isMember: boolean;
};

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ClubEventsSection({
  clubId,
  initialEvents,
  isAdmin,
  isVerified,
  isMember,
}: ClubEventsSectionProps) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const atLimit = !isVerified && events.length >= FREE_MAX_EVENTS;

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const startsAt = String(formData.get("starts_at"));
    const endsAt = String(formData.get("ends_at") || "");

    try {
      const created = await apiPost<ClubEvent>(`/clubs/${clubId}/events`, {
        title: String(formData.get("title")),
        description: String(formData.get("description") || ""),
        location: String(formData.get("location") || "") || null,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      });
      setEvents((prev) => [...prev, created].sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      ));
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  }

  async function toggleRsvp(eventItem: ClubEvent) {
    setActionId(eventItem.id);
    try {
      const updated = eventItem.is_rsvped
        ? await apiDelete<ClubEvent>(`/clubs/${clubId}/events/${eventItem.id}/rsvp`)
        : await apiPost<ClubEvent>(`/clubs/${clubId}/events/${eventItem.id}/rsvp`);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "RSVP failed");
    } finally {
      setActionId(null);
    }
  }

  async function handleUpdateEvent(eventId: string, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(event.currentTarget);
    const startsAt = String(fd.get("starts_at"));
    const endsAt = String(fd.get("ends_at") || "");
    try {
      const updated = await apiPatch<ClubEvent>(`/clubs/${clubId}/events/${eventId}`, {
        title: String(fd.get("title")),
        description: String(fd.get("description") || ""),
        location: String(fd.get("location") || "") || null,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      });
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? updated : e)).sort(
          (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
        )
      );
      setEditingId(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  function toLocalDatetime(iso: string) {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function handleDelete(eventId: string) {
    if (!confirm("Delete this event?")) return;
    setActionId(eventId);
    try {
      await apiDelete(`/clubs/${clubId}/events/${eventId}`);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Events</h2>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="btn-3d gap-1" disabled={atLimit}>
                <Plus className="h-4 w-4" />
                New event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event-title">Title</Label>
                  <Input id="event-title" name="title" required minLength={2} maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea id="event-description" name="description" rows={3} maxLength={2000} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-location">Location</Label>
                  <Input id="event-location" name="location" maxLength={300} placeholder="Room 204 / Zoom link" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-starts">Starts</Label>
                  <Input id="event-starts" name="starts_at" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-ends">Ends (optional)</Label>
                  <Input id="event-ends" name="ends_at" type="datetime-local" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="btn-3d w-full" disabled={loading}>
                  {loading ? "Creating…" : "Create event"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {atLimit && isAdmin && (
        <GlassPanel depth="sm" className="p-4 text-sm text-muted-foreground">
          Free plan limit: {FREE_MAX_EVENTS} events.{" "}
          <Link href="/upgrade" className="font-medium text-indigo-400 hover:underline">
            Upgrade to Pro
          </Link>{" "}
          for unlimited events.
        </GlassPanel>
      )}

      {events.length === 0 ? (
        <GlassPanel depth="sm" className="p-8 text-center text-sm text-muted-foreground">
          <Calendar className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
          No events yet.{isAdmin ? " Create the first one!" : ""}
        </GlassPanel>
      ) : (
        <div className="space-y-3">
          {events.map((eventItem) => (
            <GlassPanel key={eventItem.id} depth="sm" className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold">{eventItem.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatEventDate(eventItem.starts_at)}
                  </p>
                  {eventItem.location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {eventItem.location}
                    </p>
                  )}
                  {eventItem.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{eventItem.description}</p>
                  )}
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {eventItem.rsvp_count} going
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {isMember && (
                    <Button
                      size="sm"
                      variant={eventItem.is_rsvped ? "outline" : "default"}
                      className={!eventItem.is_rsvped ? "btn-3d" : undefined}
                      disabled={actionId === eventItem.id}
                      onClick={() => toggleRsvp(eventItem)}
                    >
                      {eventItem.is_rsvped ? "Cancel RSVP" : "RSVP"}
                    </Button>
                  )}
                  {isAdmin && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(eventItem.id)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionId === eventItem.id}
                        onClick={() => handleDelete(eventItem.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {editingId === eventItem.id && isAdmin && (
                <form onSubmit={(e) => handleUpdateEvent(eventItem.id, e)} className="mt-4 space-y-3 border-t border-white/10 pt-4">
                  <Input name="title" defaultValue={eventItem.title} required />
                  <Textarea name="description" rows={2} defaultValue={eventItem.description} />
                  <Input name="location" defaultValue={eventItem.location ?? ""} />
                  <Input name="starts_at" type="datetime-local" defaultValue={toLocalDatetime(eventItem.starts_at)} required />
                  <Input name="ends_at" type="datetime-local" defaultValue={eventItem.ends_at ? toLocalDatetime(eventItem.ends_at) : ""} />
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
          {error.toLowerCase().includes("pro") && (
            <>
              {" "}
              <Link href="/upgrade" className="text-indigo-400 hover:underline">
                Upgrade
              </Link>
            </>
          )}
        </p>
      )}
    </section>
  );
}
