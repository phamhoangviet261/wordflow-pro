import { Coins, Flame, Sparkles, Trophy, X } from "lucide-react";
import { useGamification, xpForLevel, xpProgressInLevel } from "@/lib/gamification-store";

export type SessionResult = {
  xpEarned: number;
  coinsEarned: number;
  correct: number;
  total: number;
  message?: string;
};

export function SessionCompleteModal({
  result,
  onClose,
  onAgain,
}: {
  result: SessionResult | null;
  onClose: () => void;
  onAgain?: () => void;
}) {
  const s = useGamification();
  if (!result) return null;
  const accuracy = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
  const need = xpForLevel(s.level);
  const inLevel = xpProgressInLevel(s.xp, s.level);
  const pct = Math.min(100, Math.round((inLevel / need) * 100));
  const motivation =
    accuracy >= 90 ? "Xuất sắc! Phong độ đỉnh cao." :
    accuracy >= 70 ? "Tốt lắm, tiếp tục phát huy nhé!" :
    accuracy >= 50 ? "Khá ổn, ôn thêm vài lần nữa nhé." :
    "Đừng nản, mỗi lần luyện là một bước tiến.";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-[min(460px,94vw)] overflow-hidden animate-pop-in">
        <div className="relative bg-gradient-to-br from-emerald-500 to-green-600 text-white p-6 text-center">
          <button onClick={onClose} className="absolute top-3 right-3 size-8 rounded-full hover:bg-white/20 inline-flex items-center justify-center">
            <X className="size-4" />
          </button>
          <div className="mx-auto size-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Trophy className="size-7" />
          </div>
          <div className="mt-3 text-xl font-extrabold">Hoàn thành phiên học!</div>
          <div className="text-sm opacity-90">{result.message ?? motivation}</div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat icon={<Sparkles className="size-4 text-purple-600" />} label="XP" value={`+${result.xpEarned}`} tone="bg-purple-50 text-purple-700" />
            <Stat icon={<Coins className="size-4 text-amber-600" />} label="Xu" value={`+${result.coinsEarned}`} tone="bg-amber-50 text-amber-700" />
            <Stat icon={<Flame className="size-4 text-orange-500" />} label="Streak" value={`${s.streak}`} tone="bg-orange-50 text-orange-700" />
          </div>

          <div className="rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Cấp {s.level}</span>
              <span className="tabular-nums">{inLevel}/{need} XP</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-[width] duration-700" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Độ chính xác</span>
              <span className="font-semibold text-slate-700">{accuracy}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-[width] duration-700" style={{ width: `${accuracy}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {onAgain && (
              <button onClick={onAgain} className="rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                Chơi lại
              </button>
            )}
            <button onClick={onClose} className={`${onAgain ? "" : "col-span-2"} rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 text-sm font-bold shadow-lg shadow-emerald-500/30 hover:scale-[1.01] transition`}>
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-2xl ${tone} p-3 text-center`}>
      <div className="inline-flex items-center justify-center mb-1">{icon}</div>
      <div className="text-lg font-extrabold tabular-nums">{value}</div>
      <div className="text-[11px] uppercase tracking-wide opacity-70">{label}</div>
    </div>
  );
}
