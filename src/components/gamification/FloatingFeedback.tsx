import { useEffect, useState } from "react";
import { onFloat, type FloatEvent } from "@/lib/gamification-store";
import { Coins, Sparkles } from "lucide-react";

export function FloatingFeedback() {
  const [items, setItems] = useState<FloatEvent[]>([]);
  useEffect(() => {
    return onFloat((e) => {
      setItems((prev) => [...prev, e]);
      setTimeout(() => setItems((prev) => prev.filter((p) => p.id !== e.id)), 1100);
    });
  }, []);
  return (
    <div className="pointer-events-none fixed top-20 right-8 z-[60] flex flex-col items-end gap-1">
      {items.map((it) => (
        <div
          key={it.id}
          className={`animate-float-up inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold shadow-lg ${
            it.kind === "xp" ? "bg-purple-600 text-white" : "bg-amber-400 text-amber-950"
          }`}
        >
          {it.kind === "xp" ? <Sparkles className="size-4" /> : <Coins className="size-4" />}
          +{it.amount} {it.kind === "xp" ? "XP" : ""}
        </div>
      ))}
    </div>
  );
}
