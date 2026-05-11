import { useEffect, useRef, useState } from "react";
import { Coins, Flame, Sparkles } from "lucide-react";
import { useGamification, xpForLevel, xpProgressInLevel } from "@/lib/gamification-store";

function useCountUp(value: number, duration = 600) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

export function HeaderStats() {
  const s = useGamification();
  const need = xpForLevel(s.level);
  const inLevel = xpProgressInLevel(s.xp, s.level);
  const pct = Math.min(100, Math.round((inLevel / need) * 100));
  const coins = useCountUp(s.coins);
  const xp = useCountUp(s.xp);

  return (
    <div className="flex items-center gap-3">
      {/* Streak */}
      <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm font-bold border border-orange-100">
        <Flame className="size-4 text-orange-500" />
        <span>{s.streak}</span>
      </div>

      {/* Coins */}
      <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-bold border border-amber-100">
        <Coins className="size-4 text-amber-500" />
        <span className="tabular-nums">{coins}</span>
      </div>

      {/* Level + XP bar */}
      <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 pl-2 pr-3 py-1.5 rounded-full shadow-sm min-w-[200px]">
        <div className="size-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-[11px] font-extrabold shadow">
          {s.level}
        </div>
        <div className="flex-1">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
            <div className="absolute inset-0 animate-shimmer opacity-60" />
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500 leading-none flex items-center justify-between">
            <span className="inline-flex items-center gap-0.5"><Sparkles className="size-2.5 text-purple-500" /> <span className="tabular-nums">{xp}</span> XP</span>
            <span className="tabular-nums">{inLevel}/{need}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
