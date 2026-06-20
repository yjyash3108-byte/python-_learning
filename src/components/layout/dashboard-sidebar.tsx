"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Home,
  LogOut,
  MessageSquare,
  User,
  Users,
} from "lucide-react";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { signOut } from "@/actions/auth";

const ICONS = {
  Home,
  User,
  Users,
  MessageSquare,
} as const;

interface DashboardSidebarProps {
  userName: string;
  grade: number;
  schoolName: string;
}

export function DashboardSidebar({
  userName,
  grade,
  schoolName,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <GlassPanel
      depth="md"
      className="flex h-full w-64 shrink-0 flex-col panel-3d-depth lg:w-72"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/30 text-indigo-200 shadow-[0_8px_24px_rgba(99,102,241,0.35)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-semibold text-white text-3d-glow">{APP_NAME}</span>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS];
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                  "transform-gpu hover:translate-x-1 hover:translate-z-2",
                  active
                    ? "bg-indigo-500/35 text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)]"
                    : "text-slate-300 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-white/10 p-4">
          <GlassPanel depth="sm" className="p-3 text-sm">
            <p className="truncate font-medium text-white">{userName}</p>
            <p className="text-slate-300">Class {grade}</p>
            <p className="truncate text-xs text-slate-400">{schoolName}</p>
          </GlassPanel>
          <form action={signOut}>
            <Button
              type="submit"
              variant="outline"
              className="w-full gap-2 border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </GlassPanel>
  );
}
