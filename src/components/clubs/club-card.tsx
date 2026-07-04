"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { JoinClubButton } from "@/components/clubs/join-club-button";
import type { Club } from "@/types/club";

type ClubCardProps = {
  club: Club;
};

export function ClubCard({ club }: ClubCardProps) {
  return (
    <GlassPanel depth="sm" tilt className="group flex flex-col p-5 text-center transition-all duration-300 hover:border-emerald-400/25 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)]">
      <Link href={`/clubs/${club.id}`} className="flex flex-col items-center">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl ring-2 ring-white/10 transition duration-300 group-hover:scale-110 group-hover:ring-white/25"
          style={{
            background: `linear-gradient(135deg, ${club.color}44, ${club.color}18)`,
            boxShadow: `0 12px 32px ${club.color}33`,
          }}
        >
          {club.emoji}
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <h3 className="font-semibold group-hover:text-emerald-400">{club.name}</h3>
          {club.is_verified && (
            <BadgeCheck className="h-4 w-4 shrink-0 text-cyan-400" aria-label="Verified club" />
          )}
        </div>
        <p className="mt-1 text-xs capitalize text-muted-foreground">{club.category}</p>
        <p className="text-xs text-muted-foreground">
          {club.member_count.toLocaleString()} member{club.member_count === 1 ? "" : "s"}
        </p>
      </Link>
      <div className="mt-4">
        <JoinClubButton
          clubId={club.id}
          initialIsMember={club.is_member}
          myRole={club.my_role}
          fullWidth
        />
      </div>
    </GlassPanel>
  );
}
