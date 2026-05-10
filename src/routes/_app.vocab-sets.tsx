import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Map, ListChecks, Play, Pencil, Trash2, Check } from "lucide-react";
import { vocabSets } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/vocab-sets")({
  head: () => ({
    meta: [
      { title: "Bộ từ vựng — VocabLab" },
      { name: "description", content: "Quản lý các bộ từ vựng cá nhân của bạn." },
    ],
  }),
  component: VocabSetsPage,
});

function VocabSetsPage() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bộ từ vựng</h1>
          <p className="text-sm text-slate-500">Tạo và quản lý các bộ từ riêng của bạn.</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-2xl shadow-md shadow-green-500/30 transition">
            <Plus className="size-4" /> TẠO BỘ TỪ MỚI
          </button>
          <button className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-sm px-5 py-2.5 rounded-2xl shadow-md shadow-yellow-400/30 transition">
            <Map className="size-4" /> LỘ TRÌNH
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vocabSets.map((s) => {
          const pct = Math.round((s.learned / s.total) * 100);
          const checked = !!selected[s.id];
          return (
            <article key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-slate-800 text-lg">{s.title}</h3>
                <button
                  onClick={() => setSelected((p) => ({ ...p, [s.id]: !p[s.id] }))}
                  className={`size-6 rounded-lg border-2 flex items-center justify-center transition ${
                    checked ? "bg-green-500 border-green-500 text-white" : "border-slate-300 hover:border-green-400"
                  }`}
                  aria-label="Chọn bộ từ"
                >
                  {checked && <Check className="size-4" />}
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{s.description}</p>

              <div className="flex items-center gap-2 mt-4 text-sm text-slate-600">
                <ListChecks className="size-4 text-green-500" />
                <span className="font-semibold">{s.total} từ</span>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{s.learned}/{s.total} đã học</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm px-4 py-1.5 rounded-xl shadow-sm transition">
                  Xem
                </button>
                <div className="flex gap-1.5">
                  <button className="size-9 rounded-xl bg-slate-50 hover:bg-purple-100 hover:text-purple-600 text-slate-500 flex items-center justify-center transition" aria-label="Phát">
                    <Play className="size-4" />
                  </button>
                  <button className="size-9 rounded-xl bg-slate-50 hover:bg-blue-100 hover:text-blue-600 text-slate-500 flex items-center justify-center transition" aria-label="Sửa">
                    <Pencil className="size-4" />
                  </button>
                  <button className="size-9 rounded-xl bg-slate-50 hover:bg-red-100 hover:text-red-600 text-slate-500 flex items-center justify-center transition" aria-label="Xoá">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
