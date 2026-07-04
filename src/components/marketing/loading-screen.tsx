"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LoadingScreen() {
  const [phase, setPhase] = useState<"loading" | "exit">("loading");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const startExit = () => setPhase("exit");
    const remove = () => setVisible(false);

    if (document.readyState === "complete") {
      const t1 = window.setTimeout(startExit, 1200);
      const t2 = window.setTimeout(remove, 1800);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }

    const onLoad = () => {
      window.setTimeout(startExit, 900);
      window.setTimeout(remove, 1500);
    };
    window.addEventListener("load", onLoad, { once: true });
    const fallback = window.setTimeout(() => {
      startExit();
      window.setTimeout(remove, 600);
    }, 2200);

    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(fallback);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden",
        "bg-[oklch(0.08_0.025_265)]",
        phase === "exit" && "animate-entrance-exit pointer-events-none"
      )}
      aria-label="Loading ScholarNet"
      role="status"
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/30 blur-[100px] animate-orb-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-cyan-500/20 blur-[80px] animate-orb-pulse [animation-delay:0.5s]" />
        <div className="absolute left-1/4 top-1/2 h-40 w-40 rounded-full bg-violet-500/15 blur-[70px] animate-orb-pulse [animation-delay:1s]" />
      </div>

      {/* Grid floor hint */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(129,140,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          transform: "perspective(500px) rotateX(60deg)",
          transformOrigin: "bottom center",
        }}
      />

      <div className="relative flex flex-col items-center gap-8 px-6">
        {/* Logo ring */}
        <div className="relative">
          <div className="absolute inset-0 animate-logo-ring rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 opacity-60 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_0_60px_rgba(99,102,241,0.6)] animate-logo-pop">
            <GraduationCap className="h-10 w-10 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Brand */}
        <div className="text-center animate-fade-up [animation-delay:0.15s]">
          <h1 className="text-3xl font-bold tracking-tight text-white text-3d-glow sm:text-4xl">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-sm text-indigo-200/70 sm:text-base">
            Your professional journey starts here
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 overflow-hidden rounded-full bg-white/10 sm:w-56">
          <div className="h-1 rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 animate-entrance-progress" />
        </div>
      </div>
    </div>
  );
}
