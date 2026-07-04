"use client";

import { cn } from "@/lib/utils";
import { SKILL_TREE_LAYOUT, type SkillTreeNode } from "@/lib/skill-tree";

type SkillTreeProps = {
  nodes: SkillTreeNode[];
};

export function SkillTree({ nodes }: SkillTreeProps) {
  return (
    <div className="relative mx-auto flex min-h-[280px] max-w-md items-center justify-center">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 280">
        <line x1="200" y1="40" x2="100" y2="120" stroke="url(#skillGrad)" strokeWidth="2" opacity="0.6" />
        <line x1="200" y1="40" x2="200" y2="120" stroke="url(#skillGrad)" strokeWidth="2" opacity="0.6" />
        <line x1="200" y1="40" x2="300" y2="120" stroke="url(#skillGrad)" strokeWidth="2" opacity="0.6" />
        <line x1="100" y1="120" x2="80" y2="220" stroke="url(#skillGrad)" strokeWidth="2" opacity="0.6" />
        <line x1="200" y1="120" x2="200" y2="220" stroke="url(#skillGrad)" strokeWidth="2" opacity="0.6" />
        <line x1="300" y1="120" x2="320" y2="220" stroke="url(#skillGrad)" strokeWidth="2" opacity="0.6" />
        <defs>
          <linearGradient id="skillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      {SKILL_TREE_LAYOUT.map(({ index, x, y }) => {
        const node = nodes[index];
        if (!node) return null;
        return (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.5)]",
                node.unlocked
                  ? "border-indigo-400/40 bg-indigo-500/20 text-indigo-200"
                  : "border-white/10 bg-white/5 text-muted-foreground opacity-60"
              )}
            >
              L{node.level}
            </div>
            <p className="mt-1 max-w-[72px] truncate text-center text-xs text-muted-foreground">
              {node.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
