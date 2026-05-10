import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Sparkles, Plus, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { words as initialWords } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/vocabulary")({
  head: () => ({
    meta: [
      { title: "Từ vựng — VocabLab" },
      { name: "description", content: "Danh sách từ vựng và tiến độ học tập của bạn." },
    ],
  }),
  component: VocabularyPage,
});

const typeColors: Record<string, string> = {
  NOUN: "bg-blue-100 text-blue-600",
  VERB: "bg-purple-100 text-purple-600",
  ADJ: "bg-orange-100 text-orange-600",
  ADV: "bg-teal-100 text-teal-600",
};

function VocabularyPage() {
  const [items, setItems] = useState(initialWords);
  const [q, setQ] = useState("");

  const learned = items.filter((w) => w.learned).length;
  const total = items.length;
  const pct = Math.round((learned / total) * 100);

  const stats = [
    { label: "Tổng từ", value: total, accent: "bg-blue-100 text-blue-600" },
    { label: "Đã học", value: learned, accent: "bg-green-100 text-green-600" },
    { label: "Chưa học", value: total - learned, accent: "bg-orange-100 text-orange-600" },
    { label: "Tỉ lệ", value: `${pct}%`, accent: "bg-purple-100 text-purple-600" },
  ];

  const filtered = useMemo(
    () => items.filter((w) => w.word.toLowerCase().includes(q.toLowerCase()) || w.meaning.toLowerCase().includes(q.toLowerCase())),
    [items, q]
  );

  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Từ vựng</h1>
        <p className="text-sm text-slate-500">Tất cả từ bạn đang học.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className={`inline-flex size-8 items-center justify-center rounded-xl text-xs font-bold ${s.accent}`}>•</div>
            <div className="mt-2 text-2xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm từ vựng..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
          />
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-4 py-2.5 rounded-2xl shadow-md shadow-green-500/30 transition">
            <Sparkles className="size-4" /> Thêm từ với AI
          </button>
          <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-600/30 transition">
            <Plus className="size-4" /> Thêm nhiều từ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {filtered.map((w) => (
          <div key={w.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition">
            <button
              onClick={() => speak(w.word)}
              className="size-10 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center shrink-0"
              aria-label={`Nghe phát âm ${w.word}`}
            >
              <Volume2 className="size-4" />
            </button>
            <div className="w-40 shrink-0">
              <div className="font-bold text-slate-800">{w.word}</div>
              <div className="text-xs text-slate-400">{w.phonetic}</div>
            </div>
            <div className="w-44 shrink-0 hidden md:block text-sm text-slate-600">{w.meaning}</div>
            <div className="w-16 shrink-0 hidden md:block">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${typeColors[w.type]}`}>{w.type}</span>
            </div>
            <div className="flex-1 hidden lg:block text-sm text-slate-500 italic truncate">"{w.example}"</div>
            <Switch
              checked={w.learned}
              onCheckedChange={(v) => setItems((prev) => prev.map((p) => (p.id === w.id ? { ...p, learned: v } : p)))}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">Không tìm thấy từ nào.</div>
        )}
      </div>
    </div>
  );
}
