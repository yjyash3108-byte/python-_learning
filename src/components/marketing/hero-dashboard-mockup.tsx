"use client";

import { motion } from "framer-motion";
import { Crown, MessageSquare, Orbit, Trophy, Users } from "lucide-react";

export function HeroDashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-lg perspective-[1200px] lg:max-w-none"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-cyan-500/20 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] shadow-[0_32px_80px_rgba(99,102,241,0.25)] backdrop-blur-xl">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-3 text-xs text-muted-foreground">scholarnet.app/feed</span>
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-0 sm:grid-cols-[160px_1fr]">
          {/* Sidebar */}
          <div className="hidden border-r border-white/10 bg-black/20 p-3 sm:block">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400" />
              <span className="text-xs font-semibold text-foreground">ScholarNet</span>
            </div>
            {[
              { icon: Users, label: "Feed", active: true },
              { icon: Orbit, label: "Clubs" },
              { icon: MessageSquare, label: "Messages" },
              { icon: Trophy, label: "Achievements" },
            ].map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] ${
                  active ? "bg-indigo-500/25 text-indigo-200" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </div>
            ))}
            <div className="mt-4 flex items-center gap-1.5 rounded-lg border border-amber-400/20 bg-amber-500/10 px-2 py-1.5 text-[10px] text-amber-200">
              <Crown className="h-3 w-3" />
              Pro
            </div>
          </div>

          {/* Main feed */}
          <div className="space-y-3 p-4">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-xl border border-white/10 bg-white/[0.05] p-3"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500" />
                <div>
                  <p className="text-xs font-medium text-foreground">Maya Chen</p>
                  <p className="text-[10px] text-muted-foreground">Won Regional Robotics · 2h ago</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Just qualified for nationals! 🏆
              </p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                Club invite
              </p>
              <p className="mt-1 text-xs text-foreground">Coding Club · 12.4k members</p>
            </motion.div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { n: "12", l: "Projects" },
                { n: "847", l: "Followers" },
                { n: "8", l: "Badges" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-center"
                >
                  <p className="text-sm font-bold text-indigo-200">{s.n}</p>
                  <p className="text-[9px] text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute -right-2 top-8 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs backdrop-blur-md sm:-right-6"
      >
        <span className="text-emerald-400">●</span> 2.4M students
      </motion.div>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
        className="absolute -left-2 bottom-12 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs backdrop-blur-md sm:-left-6"
      >
        🏆 Achievement unlocked
      </motion.div>
    </motion.div>
  );
}
