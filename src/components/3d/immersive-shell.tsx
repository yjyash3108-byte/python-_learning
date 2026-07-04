"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { SceneCanvas } from "@/components/3d/scene-canvas";
import type { SceneVariant } from "@/components/3d/scenes/background-scene";

function resolveVariant(pathname: string): SceneVariant | null {
  if (pathname === "/") return null;
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) return "auth";
  if (
    pathname.startsWith("/feed") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/connections") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/clubs") ||
    pathname.startsWith("/opportunities") ||
    pathname.startsWith("/achievements") ||
    pathname.startsWith("/settings")
  ) {
    return "dashboard";
  }
  return null;
}

export function ImmersiveShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const variant = useMemo(() => resolveVariant(pathname), [pathname]);

  return (
    <>
      {variant && <SceneCanvas variant={variant} />}
      <div className="scene-ui relative min-h-screen">{children}</div>
    </>
  );
}
