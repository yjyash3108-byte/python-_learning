"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FolderKanban,
  GraduationCap,
  Home,
  LogOut,
  MessageSquare,
  Orbit,
  Search,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import { APP_NAME, DASHBOARD_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { signOut } from "@/actions/auth";

const ICONS = {
  Home,
  User,
  Users,
  FolderKanban,
  Orbit,
  MessageSquare,
  Building2,
  Settings,
  Shield,
  Search,
} as const;

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

interface DashboardSidebarProps {
  userName: string;
  grade: number;
  schoolName: string;
  isAdmin?: boolean;
}

export function DashboardSidebar({
  userName,
  grade,
  schoolName,
  isAdmin = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <GlassPanel
      depth="md"
      className="glass-shine flex h-full w-64 shrink-0 flex-col panel-3d-depth lg:w-72"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <Link
            href="/feed"
            className="group flex items-center gap-2.5 font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-white shadow-[0_8px_24px_rgba(99,102,241,0.45)] transition group-hover:scale-105">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg text-3d-glow">{APP_NAME}</span>
          </Link>
          <ThemeToggle />
        </div>

        <nav className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto p-3">
          {DASHBOARD_NAV.map((item) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS];
            const active =
              pathname === item.href ||
              (item.href !== "/feed" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "nav-item-active"
                    : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    active && "text-indigo-300"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname === "/admin"
                  ? "nav-item-active bg-gradient-to-r from-red-500/25 via-orange-500/10 to-transparent shadow-[inset_3px_0_0_#f87171,0_8px_24px_rgba(239,68,68,0.15)]"
                  : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              )}
            >
              <Shield className="h-4 w-4 shrink-0 text-red-300 transition-transform group-hover:scale-110" />
              <span className="truncate">Admin</span>
            </Link>
          )}
        </nav>

        <div className="mt-auto space-y-3 border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="avatar-ring shrink-0 rounded-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-indigo-200">
                {initials(userName)}
              </div>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-semibold text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">Class {grade}</p>
              <p className="truncate text-xs text-muted-foreground/80">{schoolName}</p>
            </div>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="outline"
              className="w-full gap-2 border-white/15 bg-white/[0.04] transition hover:border-white/25 hover:bg-white/[0.08]"
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
