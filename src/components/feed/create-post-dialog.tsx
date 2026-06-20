"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { createPost, type PostActionState } from "@/actions/posts";
import { POST_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: PostActionState = {};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CreatePostDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createPost, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-3d gap-2">
          <Plus className="h-4 w-4" />
          Share achievement
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/15 bg-slate-900/90 text-slate-100 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle>Share an achievement</DialogTitle>
          <DialogDescription>
            Tell classmates about something you learned, built, or accomplished.
            Do not include phone numbers, emails, or social handles.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              required
              defaultValue="academics"
              className={cn(selectClassName)}
            >
              {POST_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">What did you achieve?</Label>
            <Textarea
              id="content"
              name="content"
              required
              rows={5}
              maxLength={2000}
              placeholder="I built a solar system model for the science fair…"
            />
          </div>

          <Button type="submit" className="btn-3d w-full" disabled={pending}>
            {pending ? "Checking & posting…" : "Post"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
