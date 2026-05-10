import { Flame, Star } from "lucide-react";

export function AppHeader() {
  return (
    <header className="flex items-center justify-end gap-3 px-6 md:px-8 py-4 bg-slate-50 sticky top-0 z-10 backdrop-blur">
      <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-semibold">
        <Flame className="size-4 text-orange-500" />
        <span>5</span>
      </div>
      <button className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md shadow-orange-500/30 hover:shadow-lg hover:scale-[1.02] transition">
        <Star className="size-4 fill-white" />
        NÂNG CẤP PRO
      </button>
    </header>
  );
}
