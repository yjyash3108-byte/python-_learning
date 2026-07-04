"use client";

import {
  Award,
  BookOpen,
  Code2,
  Crown,
  Dumbbell,
  FlaskConical,
  HandHeart,
  Landmark,
  Mic2,
  Music2,
  Palette,
  Rocket,
  Trophy,
} from "lucide-react";
import type { AchievementCategory } from "@/types/achievements";

const ICONS: Record<AchievementCategory, typeof Trophy> = {
  academic: BookOpen,
  coding: Code2,
  hackathon: Rocket,
  olympiad: FlaskConical,
  sports: Dumbbell,
  debate: Mic2,
  music: Music2,
  art: Palette,
  entrepreneurship: Landmark,
  leadership: Crown,
  volunteering: HandHeart,
  other: Award,
};

const COLORS: Record<AchievementCategory, string> = {
  academic: "from-blue-500/30 to-indigo-500/20 text-blue-200",
  coding: "from-cyan-500/30 to-teal-500/20 text-cyan-200",
  hackathon: "from-violet-500/30 to-purple-500/20 text-violet-200",
  olympiad: "from-amber-500/30 to-orange-500/20 text-amber-200",
  sports: "from-emerald-500/30 to-green-500/20 text-emerald-200",
  debate: "from-rose-500/30 to-pink-500/20 text-rose-200",
  music: "from-fuchsia-500/30 to-purple-500/20 text-fuchsia-200",
  art: "from-pink-500/30 to-rose-500/20 text-pink-200",
  entrepreneurship: "from-yellow-500/30 to-amber-500/20 text-yellow-200",
  leadership: "from-indigo-500/30 to-blue-500/20 text-indigo-200",
  volunteering: "from-teal-500/30 to-cyan-500/20 text-teal-200",
  other: "from-slate-500/30 to-slate-400/20 text-slate-200",
};

export function AchievementCategoryIcon({
  category,
  className = "h-8 w-8",
}: {
  category: AchievementCategory;
  className?: string;
}) {
  const Icon = ICONS[category] ?? Trophy;
  return <Icon className={className} aria-hidden="true" />;
}

export function achievementCategoryStyles(category: AchievementCategory): string {
  return COLORS[category] ?? COLORS.other;
}
