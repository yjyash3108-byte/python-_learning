"use client";

import {
  getPasswordRequirements,
  getPasswordStrengthLabel,
  getPasswordStrengthScore,
} from "@/lib/validation/password";
import { cn } from "@/lib/utils";

type PasswordStrengthIndicatorProps = {
  password: string;
  className?: string;
};

const barColors = ["bg-red-500", "bg-amber-500", "bg-emerald-500"];

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const score = getPasswordStrengthScore(password);
  const label = getPasswordStrengthLabel(score);
  const requirements = getPasswordRequirements(password);

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)} aria-live="polite">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Password strength</span>
          <span
            className={cn(
              "font-medium",
              score === 1 && "text-red-400",
              score === 2 && "text-amber-400",
              score === 3 && "text-emerald-400"
            )}
          >
            {label}
          </span>
        </div>
        <div className="flex gap-1" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={3}>
          {[1, 2, 3].map((level) => (
            <div
              key={level}
              className={cn(
                "h-1.5 flex-1 rounded-full bg-slate-700/80 transition-colors",
                score >= level && barColors[score - 1]
              )}
            />
          ))}
        </div>
      </div>
      <ul className="space-y-1 text-xs">
        {requirements.map((req) => (
          <li
            key={req.id}
            className={cn(
              "flex items-center gap-2",
              req.met ? "text-emerald-400" : "text-slate-500"
            )}
          >
            <span aria-hidden="true">{req.met ? "✓" : "○"}</span>
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
