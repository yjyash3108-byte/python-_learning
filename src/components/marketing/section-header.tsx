import { cn } from "@/lib/utils";

const accentStyles = {
  indigo: { eyebrow: "text-indigo-400", line: "from-indigo-400/80" },
  cyan: { eyebrow: "text-cyan-400", line: "from-cyan-400/80" },
  emerald: { eyebrow: "text-emerald-400", line: "from-emerald-400/80" },
  purple: { eyebrow: "text-purple-400", line: "from-purple-400/80" },
  fuchsia: { eyebrow: "text-fuchsia-400", line: "from-fuchsia-400/80" },
  amber: { eyebrow: "text-amber-400", line: "from-amber-400/80" },
  violet: { eyebrow: "text-violet-400", line: "from-violet-400/80" },
} as const;

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  accent?: keyof typeof accentStyles;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  accent = "indigo",
  align = "center",
  className,
}: SectionHeaderProps) {
  const styles = accentStyles[accent];

  return (
    <div
      className={cn(
        "mb-16 max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <div
        className={cn(
          "mb-3 flex items-center gap-3",
          align === "center" && "justify-center"
        )}
      >
        <span
          className={cn("h-px w-10 bg-gradient-to-r to-transparent", styles.line)}
        />
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.35em]",
            styles.eyebrow
          )}
        >
          {eyebrow}
        </p>
        {align === "center" && (
          <span
            className={cn("h-px w-10 bg-gradient-to-l to-transparent", styles.line)}
          />
        )}
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-foreground text-3d-glow sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
