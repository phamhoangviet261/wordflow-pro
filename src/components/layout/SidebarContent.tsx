import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookMarked, BookOpen, Gamepad2, Gift, Trophy, Shield, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/vocab-sets", label: "Bộ từ vựng", icon: BookMarked },
  { to: "/vocabulary", label: "Từ vựng", icon: BookOpen },
  { to: "/games", label: "Game phản xạ", icon: Gamepad2 },
  { to: "/store", label: "Phần thưởng", icon: Gift },
  { to: "/leaderboard", label: "Xếp hạng", icon: Trophy },
  { to: "/admin", label: "Quản trị", icon: Shield },
] as const;

interface SidebarContentProps {
  onItemClick?: () => void;
  className?: string;
}

export function SidebarContent({ onItemClick, className }: SidebarContentProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
        <div className="size-9 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
          <GraduationCap className="size-5 text-white" />
        </div>
        <span className="font-bold text-lg text-slate-800">VocabLab</span>
      </div>
      
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200",
                active 
                  ? "bg-green-100 text-green-600 shadow-sm shadow-green-200/50" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("size-5 transition-transform duration-200", active && "scale-110")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
