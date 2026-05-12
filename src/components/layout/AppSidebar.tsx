import { useEffect, useRef, useState } from "react";
import {
  Mail,
  Flame,
  Sparkles,
  Coins,
  ChevronUp,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { useGamification } from "@/lib/gamification-store";
import { toast } from "sonner";
import { SidebarContent } from "./SidebarContent";
import { useAuth } from "@/hooks/useAuth";

export function AppSidebar() {
  const g = useGamification();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user: sessionUser } = useAuth();

  const user = {
    name: sessionUser?.name ?? "Người dùng",
    email: sessionUser?.email ?? "",
    plan: "Pro",
    initials: sessionUser?.name
      ? sessionUser.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
      : "U",
    image: sessionUser?.image ?? null,
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      toast.error("Không thể đăng xuất. Vui lòng thử lại.");
    }
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
      <SidebarContent />

      <div ref={userMenuRef} className="relative p-3 border-t border-slate-100">
        {userMenuOpen && (
          <div className="absolute left-3 bottom-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-white/20 backdrop-blur text-white font-bold text-lg flex items-center justify-center overflow-hidden">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="size-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    user.initials
                  )}
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
              <Stat
                icon={<Sparkles className="size-3.5 text-purple-500" />}
                label="Cấp"
                value={g.level}
              />
              <Stat
                icon={<Flame className="size-3.5 text-orange-500" />}
                label="Streak"
                value={g.streak}
              />
              <Stat
                icon={<Coins className="size-3.5 text-amber-500" />}
                label="Xu"
                value={g.coins}
              />
            </div>

            <div className="p-2">
              <Row
                icon={UserIcon}
                label="Hồ sơ cá nhân"
                onClick={() => toast.info("Mở hồ sơ cá nhân")}
              />
              <Row icon={Settings} label="Cài đặt" onClick={() => toast.info("Mở cài đặt")} />
              <div className="my-1 border-t border-slate-100" />
              <Row
                icon={LogOut}
                label="Đăng xuất"
                tone="danger"
                onClick={handleLogout}
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
          <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow shrink-0 overflow-hidden">
            {user.image ? (
              <img src={user.image} alt={user.name} className="size-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              user.initials
            )}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">{user.name}</div>
            <div className="text-xs text-slate-500 truncate">
              Cấp {g.level} · {user.plan}
            </div>
          </div>
          <ChevronUp
            className={`size-4 text-slate-400 group-hover:text-slate-600 shrink-0 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    </aside>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-3">
      <div className="inline-flex items-center gap-1 text-xs text-slate-500">
        {icon} {label}
      </div>
      <div className="text-base font-extrabold text-slate-800 tabular-nums">{value}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  icon: typeof LogOut;
  label: string;
  onClick: () => void;
  tone?: "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
        tone === "danger" ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </button>
  );
}
