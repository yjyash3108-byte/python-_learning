"use client";

import dynamic from "next/dynamic";

const ImmersiveShell = dynamic(
  () =>
    import("@/components/3d/immersive-shell").then((m) => m.ImmersiveShell),
  { ssr: false }
);

export function App3DProvider({ children }: { children: React.ReactNode }) {
  return <ImmersiveShell>{children}</ImmersiveShell>;
}
