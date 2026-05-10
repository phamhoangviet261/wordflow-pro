import { createFileRoute, Link } from "@tanstack/react-router";
import { Repeat, ArrowRight } from "lucide-react";
import { gameModes } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/games")({
  head: () => ({
    meta: [
      { title: "Game phản xạ — VocabLab" },
      { name: "description", content: "Học từ qua các trò chơi phản xạ vui nhộn." },
    ],
  }),
  component: GamesPage,
});

function GamesPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Game phản xạ</h1>
        <p className="text-sm text-slate-500">Chọn chế độ chơi yêu thích để luyện từ.</p>
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
            <Link key={g.title} to="/games/flashcard" className={className}>
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
