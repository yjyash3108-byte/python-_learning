"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Orbit, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/clubs", label: "Clubs", icon: Orbit },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around gap-1">
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/feed" && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                active
                  ? "text-indigo-300"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all",
                  active
                    ? "bg-indigo-500/25 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
                    : "bg-transparent"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", active && "text-indigo-300")} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
