import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, ChevronRight } from "lucide-react";
import banner from "@/assets/home-banner.jpg";
import { homeStats, streakDays, quickAccess, courseCategories, courses } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Trang chủ — VocabLab" },
      { name: "description", content: "Học từ vựng tiếng Anh hiệu quả với VocabLab." },
    ],
  }),
  component: HomePage,
});

const accentMap = {
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600",
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
} as const;

function HomePage() {
  const [activeCat, setActiveCat] = useState("Tất cả");
  const filtered = activeCat === "Tất cả" ? courses : courses.filter((c) => c.category === activeCat);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <h1 className="sr-only">Trang chủ VocabLab</h1>

      {/* Top section */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-2 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 border border-green-100 relative">
          <img src={banner} alt="Học từ vựng cùng VocabLab" width={1280} height={640} className="w-full h-full object-cover" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {homeStats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className={`inline-flex size-9 items-center justify-center rounded-xl text-xs font-bold ${accentMap[s.accent]}`}>
                {s.label[0]}
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl p-5 bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium opacity-90">Streak</span>
            <Flame className="size-5" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold">5</span>
            <span className="text-sm opacity-90">ngày</span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {streakDays.map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-1">
                <div className={`size-7 rounded-xl flex items-center justify-center ${d.active ? "bg-white/25" : "bg-white/10"}`}>
                  <Flame className={`size-3.5 ${d.active ? "text-yellow-200" : "text-white/40"}`} />
                </div>
                <span className="text-[10px] opacity-90">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick access */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Truy cập nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickAccess.map((q) => (
            <button key={q.title} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition text-left">
              <div className={`size-11 rounded-2xl flex items-center justify-center ${q.bg}`}>
                <q.icon className={`size-5 ${q.color}`} />
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-sm">{q.title}</div>
                <div className="text-xs text-slate-500">Mở ngay</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Learning path */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-800">Lộ trình học</h2>
          <button className="text-sm text-green-600 font-semibold inline-flex items-center gap-1">
            Xem tất cả <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {courseCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeCat === cat ? "bg-green-500 text-white shadow shadow-green-500/30" : "bg-white text-slate-600 border border-slate-200 hover:border-green-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const pct = Math.round((c.learned / c.words) * 100);
            return (
              <div key={c.title} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
                <div className={`h-2 w-12 rounded-full ${c.color} mb-3`} />
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-800">{c.title}</h3>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{c.category}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{c.words} từ · {c.learned} đã học</p>
                <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${c.color}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500">Độ khó {c.difficulty}/5</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`size-1.5 rounded-full ${i < c.difficulty ? "bg-orange-400" : "bg-slate-200"}`} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
