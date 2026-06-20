import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  depth?: "sm" | "md" | "lg";
  tilt?: boolean;
}

const depthStyles = {
  sm: "shadow-[0_12px_40px_rgba(99,102,241,0.15),inset_0_1px_0_rgba(255,255,255,0.12)]",
  md: "shadow-[0_20px_60px_rgba(99,102,241,0.22),inset_0_1px_0_rgba(255,255,255,0.15)]",
  lg: "shadow-[0_28px_80px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.18)]",
};

export function GlassPanel({
  className,
  depth = "md",
  tilt = false,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl",
        "transform-gpu transition-transform duration-500 ease-out",
        depthStyles[depth],
        tilt && "card-3d hover-3d-lift",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
