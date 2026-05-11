import { useEffect } from "react";
import { SidebarContent } from "./SidebarContent";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="md:hidden">
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[50] shadow-2xl transition-transform duration-300 ease-out transform",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent onItemClick={onClose} />
        
        {/* Optional: Add user info or footer if needed for mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[10px] text-center text-slate-400 font-medium tracking-widest uppercase">
            VocabLab v1.0
          </p>
        </div>
      </aside>
    </div>
  );
}
