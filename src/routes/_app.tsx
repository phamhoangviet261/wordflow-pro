import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileNavbar } from "@/components/layout/MobileNavbar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Toaster } from "@/components/ui/sonner";
import { FloatingFeedback } from "@/components/gamification/FloatingFeedback";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-800">
      {/* Desktop Sidebar */}
      <AppSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Navbar */}
        <MobileNavbar 
          isOpen={isMobileMenuOpen} 
          onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        />
        
        {/* Mobile Slide-out Sidebar */}
        <MobileSidebar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />

        {/* Desktop Header */}
        <AppHeader />
        
        <main className="flex-1 px-4 md:px-8 pb-10">
          <Outlet />
        </main>
      </div>
      
      <Toaster richColors position="top-right" />
      <FloatingFeedback />
      <LevelUpModal />
    </div>
  );
}
