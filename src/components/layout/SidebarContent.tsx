import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  BookMarked,
  BookOpen,
  Gamepad2,
  Gift,
  Trophy,
  Shield,
  GraduationCap,
  Headphones,
  Mic,
  PenTool,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const navItems = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/vocab/sets", label: "Bộ từ vựng", icon: BookMarked },
  { to: "/vocab/list", label: "Từ vựng", icon: BookOpen },
  { to: "/ielts/road-map", label: "Lộ trình IELTS", icon: GraduationCap },
  {
    to: "/ielts/skills",
    label: "Kỹ năng IELTS",
    icon: GraduationCap,
    subItems: [
      { to: "/ielts/skills/listening", label: "Nghe - Listening", icon: Headphones },
      { to: "/ielts/skills/speaking", label: "Nói - Speaking", icon: Mic },
      { to: "/ielts/skills/reading", label: "Đọc - Reading", icon: BookOpen },
      { to: "/ielts/skills/writing", label: "Viết - Writing", icon: PenTool },
    ],
  },
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
  const [expandedItems, setExpandedItems] = useState<string[]>(["/ielts/skills"]);

  const toggleExpand = (to: string) => {
    setExpandedItems((prev) => (prev.includes(to) ? prev.filter((i) => i !== to) : [...prev, to]));
  };

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
          const hasSubItems = "subItems" in item;
          const isExpanded = expandedItems.includes(item.to);
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);

          return (
            <div key={item.to} className="space-y-1">
              {hasSubItems ? (
                <div className="space-y-1">
                  <button
                    onClick={() => toggleExpand(item.to)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-green-100 text-green-600 shadow-sm shadow-green-200/50"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "size-5 transition-transform duration-200",
                          active && "scale-110",
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform duration-200",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </button>

                  {isExpanded && (
                    <div className="pl-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {item.subItems.map((sub) => {
                        const subActive = pathname === sub.to;
                        return (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            onClick={onItemClick}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200",
                              subActive
                                ? "bg-slate-100 text-green-600 font-bold"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                            )}
                          >
                            <sub.icon className="size-4" />
                            <span>{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.to}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-green-100 text-green-600 shadow-sm shadow-green-200/50"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-5 transition-transform duration-200",
                      active && "scale-110",
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
