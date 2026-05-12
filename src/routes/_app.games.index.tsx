import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Repeat, ArrowRight, ListChecks, Sparkles, Loader2 } from "lucide-react";
import { gameModes } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/games/")({
  head: () => ({
    meta: [
      { title: "Game phản xạ — VocabLab" },
      { name: "description", content: "Học từ qua các trò chơi phản xạ vui nhộn." },
    ],
  }),
  component: GamesPage,
});

function GamesPage() {
  const [selectedSetId, setSelectedSetId] = useState("all");

  const { data: setsResponse, isLoading: loadingSets } = useQuery({
    queryKey: ["vocab-sets"],
    queryFn: async () => {
      const res = await fetch("/api/vocab-sets");
      return res.json();
    },
  });

  const vocabSets = setsResponse?.data || [];
  
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Game phản xạ <Sparkles className="size-5 text-yellow-500 fill-yellow-500" />
          </h1>
          <p className="text-sm text-slate-500 font-medium">Chọn chế độ chơi yêu thích để luyện từ.</p>
        </div>

        <div className="w-full md:w-80 space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1">
            <ListChecks className="size-3.5 text-purple-500" /> Chọn bộ từ luyện tập
          </label>
          
          <Select value={selectedSetId} onValueChange={setSelectedSetId}>
            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-purple-300 hover:ring-4 hover:ring-purple-500/5 focus:ring-purple-500/10">
              <SelectValue placeholder="Chọn bộ từ vựng" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 shadow-xl overflow-hidden p-1">
              <SelectItem value="all" className="rounded-xl py-2.5 focus:bg-purple-50">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    ALL
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-slate-700">Tất cả từ vựng</span>
                    <span className="text-[10px] text-slate-400 font-medium">Toàn bộ kho từ của bạn</span>
                  </div>
                </div>
              </SelectItem>
              
              {vocabSets.map((s: any) => (
                <SelectItem key={s.id} value={s.id} className="rounded-xl py-2.5 focus:bg-purple-50">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "size-8 rounded-lg flex items-center justify-center text-white",
                      s.isSystem ? "bg-amber-500" : "bg-emerald-500"
                    )}>
                      {s.isSystem ? <Sparkles className="size-4 fill-white" /> : <ListChecks className="size-4" />}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-slate-700 line-clamp-1">{s.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {s.isSystem ? "Thư viện hệ thống" : "Bộ từ cá nhân"} • {s.total} từ
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {loadingSets && (
            <div className="flex items-center gap-2 px-1 animate-pulse">
              <Loader2 className="size-3 text-purple-500 animate-spin" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đang tải dữ liệu...</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {gameModes.map((g) => {
          const isFlashcard = g.title === "Flashcard";
          const className = `relative group overflow-hidden rounded-2xl p-6 text-left text-white bg-gradient-to-br ${g.gradient} shadow-lg hover:shadow-2xl hover:-translate-y-1 transition min-h-[180px] flex flex-col justify-between`;
          const inner = (
            <>
              {g.hot && (
                <span className="absolute top-3 right-3 bg-white/95 text-rose-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                  HOT
                </span>
              )}
              <div className="size-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <g.icon className="size-7" />
              </div>
              <div>
                <div className="text-xl font-bold">{g.title}</div>
                <div className="text-sm opacity-90">{g.subtitle}</div>
              </div>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition" />
            </>
          );
          return isFlashcard ? (
            <Link
              key={g.title}
              to="/games/flashcard"
              search={{ setId: selectedSetId }}
              className={className}
            >
              {inner}
            </Link>
          ) : (
            <button key={g.title} className={className}>
              {inner}
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white shadow-xl shadow-purple-500/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4 overflow-hidden relative">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-start gap-4 relative">
          <div className="size-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <Repeat className="size-7" />
          </div>
          <div>
            <div className="text-xl font-bold">Ôn tập ngắt quãng (SRS)</div>
            <div className="text-sm opacity-90 max-w-xl">
              Hệ thống lặp lại thông minh giúp bạn ghi nhớ từ vựng lâu hơn và hiệu quả gấp 3 lần.
            </div>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold text-sm px-5 py-3 rounded-2xl shadow hover:scale-[1.03] transition relative">
          Bắt đầu ôn tập <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
