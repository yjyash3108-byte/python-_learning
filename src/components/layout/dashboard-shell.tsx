import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopBar } from "@/components/layout/dashboard-top-bar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { GlassPanel } from "@/components/ui/glass-panel";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  grade: number;
  schoolName: string;
  isAdmin?: boolean;
  unreadCount?: number;
}

export function DashboardShell({
  children,
  userName,
  grade,
  schoolName,
  isAdmin = false,
  unreadCount = 0,
}: DashboardShellProps) {
  return (
    <div className="flex h-[100dvh] gap-0 overflow-hidden p-0 md:gap-4 md:p-4 lg:p-5">
      <div className="hidden shrink-0 lg:block">
        <DashboardSidebar
          userName={userName}
          grade={grade}
          schoolName={schoolName}
          isAdmin={isAdmin}
        />
      </div>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <GlassPanel
          depth="lg"
          className="glass-shine flex h-full flex-col overflow-hidden rounded-none border-0 panel-3d-depth md:rounded-2xl md:border"
        >
          <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-10 pb-24 lg:pb-10">
            <div className="page-content mx-auto max-w-3xl xl:max-w-4xl">
              <DashboardTopBar userName={userName} unreadCount={unreadCount} />
              {children}
            </div>
          </div>
        </GlassPanel>
      </main>

      <MobileBottomNav />
    </div>
  );
}
