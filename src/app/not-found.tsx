import Link from "next/link";
import { GraduationCap, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.15),transparent_60%)]" />
      <GlassPanel depth="lg" static className="relative max-w-lg p-10 text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-indigo-400" />
        <p className="mt-6 text-6xl font-bold tracking-tight text-indigo-200">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This page may have been moved, deleted, or never existed. Check the URL or head back to
          ScholarNet.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="btn-3d gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 border-white/15 bg-white/5">
            <Link href="/search">
              <Search className="h-4 w-4" />
              Search
            </Link>
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
}
