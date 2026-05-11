import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookMarked, BookOpen, Gamepad2, Gift, Trophy, GraduationCap, Shield } from "lucide-react";

const items = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/vocab-sets", label: "Bộ từ vựng", icon: BookMarked },
  { to: "/vocabulary", label: "Từ vựng", icon: BookOpen },
  { to: "/games", label: "Game phản xạ", icon: Gamepad2 },
  { to: "/store", label: "Phần thưởng", icon: Gift },
  { to: "/leaderboard", label: "Xếp hạng", icon: Trophy },
  { to: "/admin", label: "Quản trị", icon: Shield },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
        <div className="size-9 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
          <GraduationCap className="size-5 text-white" />
        </div>
        <span className="font-bold text-lg text-slate-800">VocabLab</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                active ? "bg-green-100 text-green-600" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
