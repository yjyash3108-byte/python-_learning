"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink, Globe, Sparkles } from "lucide-react";
import Link from "next/link";
import { updateProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publicProfileUrl } from "@/lib/slug";

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

type PublicPortfolioCardProps = {
  username?: string | null;
};

export function PublicPortfolioCard({ username: initialUsername }: PublicPortfolioCardProps) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalized = username.trim().toLowerCase();
  const publicUrl = normalized && USERNAME_PATTERN.test(normalized) ? publicProfileUrl(normalized) : null;
  const hasSavedUsername = Boolean(initialUsername && USERNAME_PATTERN.test(initialUsername));

  async function saveUsername() {
    if (!normalized) {
      setError("Enter a username first.");
      return;
    }
    if (!USERNAME_PATTERN.test(normalized)) {
      setError("Use 3–30 characters: lowercase letters, numbers, underscores only.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const result = await updateProfileAction({ username: normalized });
      if (result.error) throw new Error(result.error);
      setMessage("Public portfolio link saved!");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save username");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setMessage("Link copied!");
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <GlassPanel
      depth="md"
      static
      className="relative overflow-hidden border-indigo-400/25 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-cyan-600/5 p-5 sm:p-6"
    >
      <div
        className="pointer-events-none absolute -right-6 top-0 h-28 w-28 rounded-full bg-violet-400/20 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/30 ring-1 ring-indigo-400/30">
            <Globe className="h-5 w-5 text-indigo-200" />
          </div>
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Public portfolio
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight">Your shareable link</h2>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
              Pick a @username so anyone can view your achievements, skills, and goals.
            </p>
          </div>
        </div>
        {hasSavedUsername && publicUrl && (
          <Button type="button" size="sm" variant="outline" className="gap-1.5 border-white/15 bg-white/5" asChild>
            <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
              Preview
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>

      <div className="relative mt-5 space-y-3">
        <div>
          <Label htmlFor="portfolio-username" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Username
          </Label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-medium text-indigo-300">@</span>
              <Input
                id="portfolio-username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="yashraj"
                className="border-indigo-400/25 bg-black/30 pl-8 font-medium"
                maxLength={30}
              />
            </div>
            <Button type="button" className="btn-3d h-10 shrink-0 px-6" disabled={saving} onClick={saveUsername}>
              {saving ? "Saving…" : hasSavedUsername ? "Update" : "Save"}
            </Button>
          </div>
        </div>

        {publicUrl && (
          <div className="flex flex-col gap-2 rounded-xl border border-indigo-400/20 bg-black/30 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="break-all font-mono text-sm text-indigo-200">{publicUrl}</p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="gap-1.5 shrink-0"
              onClick={copyLink}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        )}

        {message && <p className="text-sm text-emerald-400">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </GlassPanel>
  );
}
