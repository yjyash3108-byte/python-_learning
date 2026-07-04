"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import type { SceneVariant } from "@/components/3d/scenes/background-scene";

const SceneCanvas = dynamic(
  () => import("@/components/3d/scene-canvas").then((m) => m.SceneCanvas),
  { ssr: false }
);

function resolveVariant(pathname: string): SceneVariant | null {
  if (pathname === "/") return null;
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) return "auth";
  if (
    pathname.startsWith("/onboarding") ||
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

export function App3DProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const variant = useMemo(() => resolveVariant(pathname), [pathname]);

  return (
    <>
      {variant && <SceneCanvas variant={variant} />}
      <div className="scene-ui relative min-h-screen">{children}</div>
    </>
  );
}
