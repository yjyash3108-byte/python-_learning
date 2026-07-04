"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Search } from "lucide-react";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import { Input } from "@/components/ui/input";
import { APP_NAME } from "@/lib/constants";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type DashboardTopBarProps = {
  userName: string;
  unreadCount?: number;
};

export function DashboardTopBar({ userName, unreadCount = 0 }: DashboardTopBarProps) {
  const router = useRouter();
  const firstName = userName.split(" ")[0] ?? userName;

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const q = String(fd.get("q") ?? "").trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <div className="dashboard-top-bar mb-8 space-y-5 animate-fade-up">
      {/* Mobile compact header */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <Link href="/feed" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap className="h-4 w-4" />
          </span>
          <span className="text-base">{APP_NAME}</span>
        </Link>
        <NotificationsBell unreadCount={unreadCount} />
      </div>

      {/* Hero strip */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-cyan-600/10 p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-10 left-1/3 h-24 w-24 rounded-full bg-cyan-400/15 blur-2xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-indigo-200/80">{getGreeting()},</p>
            <h2 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
              <span className="bg-gradient-to-r from-white via-indigo-100 to-cyan-200 bg-clip-text text-transparent">
                {firstName}
              </span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              What would you like to explore today?
            </p>
          </div>
          <div className="hidden sm:block">
            <NotificationsBell unreadCount={unreadCount} />
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-300/70" />
          <Input
            name="q"
            placeholder="Search students, schools, clubs, opportunities…"
            className="h-11 rounded-xl border-white/15 bg-black/25 pl-11 pr-28 text-sm shadow-inner backdrop-blur-sm placeholder:text-muted-foreground/70 focus-visible:border-indigo-400/50 focus-visible:ring-indigo-400/30"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md transition hover:from-indigo-400 hover:to-violet-400"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
