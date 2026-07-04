"use client";

import { useState } from "react";
import { apiDelete, apiPost } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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

type ReportBlockActionsProps = {
  targetType: "user" | "post" | "message" | "club";
  targetId: string;
  targetLabel?: string;
  showBlock?: boolean;
};

export function ReportBlockActions({
  targetType,
  targetId,
  targetLabel = "this content",
  showBlock = targetType === "user",
}: ReportBlockActionsProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Inappropriate content");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitReport() {
    setLoading(true);
    setError(null);
    try {
      await apiPost("/reports", {
        target_type: targetType,
        target_id: targetId,
        reason,
        details,
      });
      setMessage("Report submitted. Thank you for helping keep ScholarNet safe.");
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit report");
    } finally {
      setLoading(false);
    }
  }

  async function blockUser() {
    if (targetType !== "user") return;
    if (!confirm("Block this user? They won't be able to interact with you.")) return;
    setLoading(true);
    try {
      await apiPost(`/blocks/${targetId}`);
      setMessage("User blocked.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to block");
    } finally {
      setLoading(false);
    }
  }

  async function unblockUser() {
    setLoading(true);
    try {
      await apiDelete(`/blocks/${targetId}`);
      setMessage("User unblocked.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to unblock");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="ghost" className="text-muted-foreground">
            {targetType === "user" ? "Report user" : "Report"}
          </Button>
        </DialogTrigger>
        <DialogContent className="border-white/15 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle>
              {targetType === "user" ? "Report user" : `Report ${targetLabel}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="mt-1 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inappropriate content">Inappropriate content</SelectItem>
                  <SelectItem value="Harassment or bullying">Harassment or bullying</SelectItem>
                  <SelectItem value="Spam">Spam</SelectItem>
                  <SelectItem value="Fake profile">Fake profile</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-details">Details (optional)</Label>
              <Textarea id="report-details" value={details} onChange={(e) => setDetails(e.target.value)} rows={3} className="mt-1" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="button" className="btn-3d w-full" disabled={loading} onClick={submitReport}>
              Submit report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {showBlock && (
        <Button type="button" size="sm" variant="ghost" className="text-destructive" disabled={loading} onClick={blockUser}>
          Block user
        </Button>
      )}
      {message && <p className="w-full text-xs text-emerald-400">{message}</p>}
    </div>
  );
}
