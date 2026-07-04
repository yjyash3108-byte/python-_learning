"use client";

import { cn } from "@/lib/utils";

type AuthEntranceProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthEntrance({ children, className }: AuthEntranceProps) {
  return (
    <div className={cn("animate-auth-enter space-y-6", className)}>{children}</div>
  );
}

type AuthHeroEntranceProps = {
  children: React.ReactNode;
};

export function AuthHeroEntrance({ children }: AuthHeroEntranceProps) {
  return (
    <div className="animate-auth-hero-enter flex h-full flex-col">{children}</div>
  );
}
