"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  ExternalLink,
  Eye,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import { AchievementCategoryIcon, achievementCategoryStyles } from "@/components/achievements/category-icon";
import { DocumentPreviewDialog } from "@/components/achievements/document-preview-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { categoryLabel, levelLabel } from "@/lib/achievements/constants";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/types/achievements";

type AchievementCardProps = {
  achievement: Achievement;
  onEdit: (achievement: Achievement) => void;
  onDelete: (id: string) => Promise<void>;
};

export function AchievementCard({ achievement, onEdit, onDelete }: AchievementCardProps) {
  const router = useRouter();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm("Delete this achievement?")) return;
    setDeleting(true);
    try {
      await onDelete(achievement.id);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  async function handleShare() {
    const text = `${achievement.title} — ${categoryLabel(achievement.category)} (${levelLabel(achievement.level)}) on ScholarNet`;
    try {
      if (navigator.share) {
        await navigator.share({ title: achievement.title, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        setShareMessage("Link copied!");
        window.setTimeout(() => setShareMessage(null), 2000);
      }
    } catch {
      setShareMessage("Could not share");
    }
  }

  const certificateUrl = achievement.certificate_file_url;

  return (
    <>
      <GlassPanel
        depth="md"
        tilt
        className="group flex h-full flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1"
      >
        <div className={cn("relative p-6", achievement.image_url ? "pb-0" : "")}>
          {achievement.image_url ? (
            <div className="mb-4 overflow-hidden rounded-xl ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={achievement.image_url}
                alt=""
                className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <div
              className={cn(
                "mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br",
                achievementCategoryStyles(achievement.category)
              )}
            >
              <AchievementCategoryIcon category={achievement.category} />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="border-white/10 bg-white/10">
                {categoryLabel(achievement.category)}
              </Badge>
              <Badge variant="outline" className="border-white/10">
                {levelLabel(achievement.level)}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-foreground">{achievement.title}</h3>
            {achievement.organization && (
              <p className="text-sm text-muted-foreground">{achievement.organization}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(achievement.date_achieved).toLocaleDateString()}
              {achievement.rank ? ` · ${achievement.rank}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-6 pb-6">
          {achievement.description && (
            <p className="line-clamp-3 text-sm text-muted-foreground">{achievement.description}</p>
          )}

          {achievement.skills_gained.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {achievement.skills_gained.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-[10px]">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            {certificateUrl && (
              <>
                <Button type="button" size="sm" variant="outline" onClick={() => setPreviewOpen(true)}>
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                <Button type="button" size="sm" variant="outline" asChild>
                  <a href={certificateUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </Button>
              </>
            )}
            {achievement.verification_link && (
              <Button type="button" size="sm" variant="outline" asChild>
                <a href={achievement.verification_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Verify
                </a>
              </Button>
            )}
            <Button type="button" size="sm" variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => onEdit(achievement)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {shareMessage && <p className="mt-2 text-xs text-emerald-400">{shareMessage}</p>}
        </div>
      </GlassPanel>

      {certificateUrl && (
        <DocumentPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          title={achievement.title}
          fileUrl={certificateUrl}
        />
      )}
    </>
  );
}
