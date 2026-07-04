"use client";

import { useMemo, useState } from "react";
import { Loader2, Search, Trophy } from "lucide-react";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { AchievementFormDialog } from "@/components/achievements/achievement-form-dialog";
import { CertificateCard } from "@/components/achievements/certificate-card";
import { CertificateFormDialog } from "@/components/achievements/certificate-form-dialog";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_LEVELS,
  CERTIFICATE_SORT_OPTIONS,
  SORT_OPTIONS,
} from "@/lib/achievements/constants";
import { apiDelete } from "@/lib/api/client";
import type {
  Achievement,
  AchievementSort,
  Certificate,
  CertificateSort,
} from "@/types/achievements";

type Tab = "achievements" | "certificates";

type AchievementsBoardProps = {
  initialAchievements: Achievement[];
  initialCertificates: Certificate[];
};

export function AchievementsBoard({
  initialAchievements,
  initialCertificates,
}: AchievementsBoardProps) {
  const [tab, setTab] = useState<Tab>("achievements");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState<AchievementSort | CertificateSort>("newest");
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [achievementDialogOpen, setAchievementDialogOpen] = useState(false);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);

  const filteredAchievements = useMemo(() => {
    let items = [...initialAchievements];
    if (category) items = items.filter((item) => item.category === category);
    if (level) items = items.filter((item) => item.level === level);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.organization.toLowerCase().includes(q)
      );
    }
    if (sort === "oldest") {
      items.sort(
        (a, b) => new Date(a.date_achieved).getTime() - new Date(b.date_achieved).getTime()
      );
    } else if (sort === "category") {
      items.sort((a, b) => a.category.localeCompare(b.category));
    } else {
      items.sort(
        (a, b) => new Date(b.date_achieved).getTime() - new Date(a.date_achieved).getTime()
      );
    }
    return items;
  }, [initialAchievements, category, level, search, sort]);

  const filteredCertificates = useMemo(() => {
    let items = [...initialCertificates];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.issuer.toLowerCase().includes(q) ||
          (item.certificate_number ?? "").toLowerCase().includes(q)
      );
    }
    if (sort === "oldest") {
      items.sort(
        (a, b) => new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime()
      );
    } else if (sort === "title") {
      items.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      items.sort(
        (a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
      );
    }
    return items;
  }, [initialCertificates, search, sort]);

  const selectClassName =
    "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={tab === "achievements" ? "default" : "outline"}
            className={tab === "achievements" ? "btn-3d" : "border-white/15 bg-white/5"}
            onClick={() => {
              setTab("achievements");
              setSort("newest");
            }}
          >
            Achievements ({initialAchievements.length})
          </Button>
          <Button
            type="button"
            variant={tab === "certificates" ? "default" : "outline"}
            className={tab === "certificates" ? "btn-3d" : "border-white/15 bg-white/5"}
            onClick={() => {
              setTab("certificates");
              setSort("newest");
            }}
          >
            Certificates ({initialCertificates.length})
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <AchievementFormDialog />
          <CertificateFormDialog />
        </div>
      </div>

      <GlassPanel depth="sm" className="space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative md:col-span-2 xl:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search…"
              className="pl-9"
            />
          </div>
          {tab === "achievements" && (
            <>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={selectClassName}
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {ACHIEVEMENT_CATEGORIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className={selectClassName}
                aria-label="Filter by level"
              >
                <option value="">All levels</option>
                {ACHIEVEMENT_LEVELS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          )}
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as AchievementSort | CertificateSort)}
            className={selectClassName}
            aria-label="Sort items"
          >
            {(tab === "achievements" ? SORT_OPTIONS : CERTIFICATE_SORT_OPTIONS).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </GlassPanel>

      {tab === "achievements" ? (
        filteredAchievements.length === 0 ? (
          <GlassPanel depth="sm" className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <Trophy className="h-8 w-8 text-yellow-400" />
            No achievements yet. Add your first win to start building your portfolio.
          </GlassPanel>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                onEdit={(item) => {
                  setEditingAchievement(item);
                  setAchievementDialogOpen(true);
                }}
                onDelete={(id) => apiDelete(`/achievements/${id}`)}
              />
            ))}
          </div>
        )
      ) : filteredCertificates.length === 0 ? (
        <GlassPanel depth="sm" className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 text-indigo-300" />
          No certificates yet. Upload PDFs or images of your credentials.
        </GlassPanel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCertificates.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              onEdit={(item) => {
                setEditingCertificate(item);
                setCertificateDialogOpen(true);
              }}
              onDelete={(id) => apiDelete(`/certificates/${id}`)}
            />
          ))}
        </div>
      )}

      <AchievementFormDialog
        achievement={editingAchievement ?? undefined}
        open={achievementDialogOpen}
        onOpenChange={(next) => {
          setAchievementDialogOpen(next);
          if (!next) setEditingAchievement(null);
        }}
        trigger={null}
      />
      <CertificateFormDialog
        certificate={editingCertificate ?? undefined}
        open={certificateDialogOpen}
        onOpenChange={(next) => {
          setCertificateDialogOpen(next);
          if (!next) setEditingCertificate(null);
        }}
        trigger={null}
      />
    </div>
  );
}
