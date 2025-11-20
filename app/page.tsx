import { AppSidebar } from "@/components/app-sidebar";
import { DashboardContent } from "@/components/dashboard-content";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AriaAnnouncer } from "@/components/aria-announcer";

export default function Home() {
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <AppSidebar />
        <main id="main-content" className="flex-1 overflow-hidden">
          <DashboardContent />
        </main>
      </div>
      <AriaAnnouncer />
      <Toaster richColors position="bottom-right" closeButton />
    </SidebarProvider>
  );
}
