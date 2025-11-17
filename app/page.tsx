import { AppSidebar } from "@/components/app-sidebar";
import { DashboardContent } from "@/components/dashboard-content";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <DashboardContent />
        </main>
      </div>
      <Toaster richColors position="bottom-right" closeButton />
    </SidebarProvider>
  );
}
