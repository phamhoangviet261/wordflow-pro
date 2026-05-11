import { useEffect, useState } from "react";
import { onLevelUp } from "@/lib/gamification-store";
import { Sparkles, X } from "lucide-react";

export function LevelUpModal() {
  const [level, setLevel] = useState<number | null>(null);
  useEffect(() => onLevelUp((e) => setLevel(e.newLevel)), []);
  if (level == null) return null;

  const colors = ["bg-pink-400", "bg-amber-400", "bg-purple-500", "bg-emerald-400", "bg-sky-400", "bg-rose-400"];
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-pop-in">
      <div className="absolute inset-x-0 top-10 flex justify-center pointer-events-none">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className={`absolute size-2 rounded-sm ${colors[i % colors.length]} animate-confetti`}
            style={{
              left: `${10 + (i * 3) % 80}%`,
              animationDelay: `${(i % 10) * 60}ms`,
            }}
          />
        ))}
      </div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-[min(420px,92vw)] p-8 text-center animate-pop-in">
        <button onClick={() => setLevel(null)} className="absolute top-3 right-3 size-8 rounded-full hover:bg-slate-100 inline-flex items-center justify-center text-slate-500">
          <X className="size-4" />
        </button>
        <div className="mx-auto size-20 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-500/40 animate-pop-in">
          <Sparkles className="size-10" />
        </div>
        <div className="mt-4 text-sm uppercase tracking-widest text-purple-600 font-bold">Level Up!</div>
        <div className="mt-1 text-3xl font-extrabold text-slate-800">Cấp {level}</div>
        <p className="mt-2 text-sm text-slate-500">Tiếp tục cố gắng để mở khoá nhiều phần thưởng hơn.</p>
        <button
          onClick={() => setLevel(null)}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-purple-500/30 hover:scale-[1.02] transition"
        >
          Tuyệt vời!
        </button>
      </div>
    </div>
  );
}
