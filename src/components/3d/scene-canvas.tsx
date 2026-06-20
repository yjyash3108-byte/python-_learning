"use client";

import { Canvas } from "@react-three/fiber";
import { cn } from "@/lib/utils";
import type { SceneVariant } from "@/components/3d/scenes/background-scene";
import { BackgroundScene } from "@/components/3d/scenes/background-scene";

interface SceneCanvasProps {
  variant?: SceneVariant;
  className?: string;
}

export function SceneCanvas({ variant = "hero", className }: SceneCanvasProps) {
  return (
    <div className={cn("pointer-events-none fixed inset-0 -z-10", className)}>
      <Canvas
        camera={{ position: [0, 0.5, 9], fov: 52 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <BackgroundScene variant={variant} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/30 via-[#0f172a]/55 to-[#020617]/90" />
    </div>
  );
}
