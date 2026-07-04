import { cn } from "@/lib/utils";

/** Matches `Input` styling — transparent on glass panels; options styled in globals.css */
export const nativeSelectClassName = cn(
  "native-select flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base text-foreground shadow-sm transition-colors md:text-sm",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50"
);
