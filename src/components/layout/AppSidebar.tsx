import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Home, BookMarked, BookOpen, Gamepad2, Gift, Trophy, GraduationCap, Shield, LogOut, Settings, User as UserIcon, Mail, Flame, Sparkles, Coins, ChevronUp } from "lucide-react";
import { useGamification } from "@/lib/gamification-store";
import { toast } from "sonner";

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
  const g = useGamification();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const user = {
    name: "Nguyễn Minh Anh",
    email: "minhanh@vocablab.io",
    plan: "Pro",
    initials: "MA",
  };

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

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

      <div ref={userMenuRef} className="relative p-3 border-t border-slate-100">
        {userMenuOpen && (
          <div className="absolute left-3 bottom-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-white/20 backdrop-blur text-white font-bold text-lg flex items-center justify-center">
                  {user.initials}
                </div>
                <div className="min-w-0">
                  <div className="font-bold truncate">{user.name}</div>
                  <div className="text-xs opacity-90 inline-flex items-center gap-1 truncate">
                    <Mail className="size-3" /> {user.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-full">
                <Sparkles className="size-3" /> Gói {user.plan}
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
              <Stat icon={<Sparkles className="size-3.5 text-purple-500" />} label="Cấp" value={g.level} />
              <Stat icon={<Flame className="size-3.5 text-orange-500" />} label="Streak" value={g.streak} />
              <Stat icon={<Coins className="size-3.5 text-amber-500" />} label="Xu" value={g.coins} />
            </div>

            <div className="p-2">
              <Row icon={UserIcon} label="Hồ sơ cá nhân" onClick={() => toast.info("Mở hồ sơ cá nhân")} />
              <Row icon={Settings} label="Cài đặt" onClick={() => toast.info("Mở cài đặt")} />
              <div className="my-1 border-t border-slate-100" />
              <Row
                icon={LogOut}
                label="Đăng xuất"
                tone="danger"
                onClick={() => toast.success("Đã đăng xuất (mô phỏng)")}
              />
            </div>
          </div>
        )}

            <button
              type="button"
              aria-expanded={userMenuOpen}
              onClick={() => setUserMenuOpen((open) => !open)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-slate-50 transition group"
            >
              <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow shrink-0">
                {user.initials}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">{user.name}</div>
                <div className="text-xs text-slate-500 truncate">Cấp {g.level} · {user.plan}</div>
              </div>
              <ChevronUp className={`size-4 text-slate-400 group-hover:text-slate-600 shrink-0 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>
      </div>
    </aside>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-3">
      <div className="inline-flex items-center gap-1 text-xs text-slate-500">{icon} {label}</div>
      <div className="text-base font-extrabold text-slate-800 tabular-nums">{value}</div>
    </div>
  );
}

function Row({
  icon: Icon, label, onClick, tone,
}: { icon: typeof LogOut; label: string; onClick: () => void; tone?: "danger" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
        tone === "danger"
          ? "text-rose-600 hover:bg-rose-50"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </button>
  );
}
