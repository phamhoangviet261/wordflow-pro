import { GraduationCap, Menu, X } from "lucide-react";
import { HeaderStats } from "@/components/gamification/HeaderStats";
import { cn } from "@/lib/utils";

interface MobileNavbarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileNavbar({ isOpen, onToggle }: MobileNavbarProps) {
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/80 border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <X className="size-6 animate-in spin-in-90 duration-200" />
          ) : (
            <Menu className="size-6 animate-in fade-in duration-200" />
          )}
        </button>
        
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm">
            <GraduationCap className="size-4 text-white" />
          </div>
          <span className="font-bold text-base text-slate-800 tracking-tight">VocabLab</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <HeaderStats />
      </div>
    </header>
  );
}
