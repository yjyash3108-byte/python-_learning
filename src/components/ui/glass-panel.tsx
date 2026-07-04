import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  depth?: "sm" | "md" | "lg";
  tilt?: boolean;
  /** Disable hover lift/glow (for static containers) */
  static?: boolean;
}

const depthStyles = {
  sm: "shadow-[0_8px_32px_rgba(99,102,241,0.12),inset_0_1px_0_rgba(255,255,255,0.1)]",
  md: "shadow-[0_16px_48px_rgba(99,102,241,0.18),inset_0_1px_0_rgba(255,255,255,0.12)]",
  lg: "shadow-[0_24px_64px_rgba(99,102,241,0.24),inset_0_1px_0_rgba(255,255,255,0.14)]",
};

export function GlassPanel({
  className,
  depth = "md",
  tilt = false,
  static: isStatic = false,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl",
        !isStatic && "transform-gpu transition-all duration-300 ease-out hover:border-white/[0.14] hover:bg-white/[0.06]",
        depthStyles[depth],
        tilt && !isStatic && "card-3d hover-3d-lift",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
