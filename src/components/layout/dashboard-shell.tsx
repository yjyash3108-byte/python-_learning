import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { GlassPanel } from "@/components/ui/glass-panel";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  grade: number;
  schoolName: string;
}

export function DashboardShell({
  children,
  userName,
  grade,
  schoolName,
}: DashboardShellProps) {
  return (
    <div className="flex h-screen gap-4 overflow-hidden p-4">
      <DashboardSidebar
        userName={userName}
        grade={grade}
        schoolName={schoolName}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        <GlassPanel
          depth="lg"
          className="flex h-full flex-col overflow-hidden panel-3d-depth"
        >
          <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
            <div className="mx-auto max-w-3xl">{children}</div>
          </div>
        </GlassPanel>
      </main>
    </div>
  );
}
