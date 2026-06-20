"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { SceneCanvas } from "@/components/3d/scene-canvas";
import type { SceneVariant } from "@/components/3d/scenes/background-scene";

const SceneVariantContext = createContext<SceneVariant>("hero");

export function useSceneVariant() {
  return useContext(SceneVariantContext);
}

function resolveVariant(pathname: string): SceneVariant {
  if (pathname === "/") return "hero";
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return "auth";
  }
  return "dashboard";
}

export function ImmersiveShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const variant = useMemo(() => resolveVariant(pathname), [pathname]);

  return (
    <SceneVariantContext.Provider value={variant}>
      <SceneCanvas variant={variant} />
      <div className="scene-ui relative min-h-screen">{children}</div>
    </SceneVariantContext.Provider>
  );
}
