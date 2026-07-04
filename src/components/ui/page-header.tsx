import { cn } from "@/lib/utils";

const eyebrowColors = {
  indigo: "text-indigo-300/80",
  emerald: "text-emerald-400/90",
  cyan: "text-cyan-400/90",
  amber: "text-amber-400/90",
  rose: "text-rose-400/90",
} as const;

const lineGradients = {
  indigo: "from-indigo-400/80",
  emerald: "from-emerald-400/80",
  cyan: "from-cyan-400/80",
  amber: "from-amber-400/80",
  rose: "from-rose-400/80",
} as const;

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  accent?: keyof typeof eyebrowColors;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  accent = "indigo",
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "h-px w-10 bg-gradient-to-r to-transparent",
              lineGradients[accent]
            )}
          />
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.35em]",
              eyebrowColors[accent]
            )}
          >
            {eyebrow}
          </p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-3d-glow sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
