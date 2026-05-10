import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Sparkles, Plus, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { words as initialWords } from "@/lib/mock-data";
import type { Word } from "@/lib/mock-data";

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
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const emptyForm = { word: "", phonetic: "", meaning: "", type: "NOUN" as Word["type"], example: "" };
  const [form, setForm] = useState(emptyForm);

  const addWord = (w: Omit<Word, "id" | "learned"> & { learned?: boolean }) => {
    setItems((prev) => [
      { id: crypto.randomUUID(), learned: false, ...w },
      ...prev,
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.word.trim() || !form.meaning.trim()) {
      toast.error("Vui lòng nhập từ và nghĩa.");
      return;
    }
    if (items.some((i) => i.word.toLowerCase() === form.word.trim().toLowerCase())) {
      toast.error("Từ này đã tồn tại.");
      return;
    }
    addWord({
      word: form.word.trim(),
      phonetic: form.phonetic.trim() || `/${form.word.trim()}/`,
      meaning: form.meaning.trim(),
      type: form.type,
      example: form.example.trim(),
    });
    toast.success(`Đã thêm "${form.word.trim()}"`);
    setForm(emptyForm);
    setOpen(false);
  };

  const handleBulk = () => {
    const lines = aiText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      toast.error("Nhập ít nhất một dòng.");
      return;
    }
    let added = 0;
    const existing = new Set(items.map((i) => i.word.toLowerCase()));
    lines.forEach((line) => {
      const [word, meaning, type, example] = line.split("|").map((s) => s?.trim());
      if (!word || !meaning) return;
      if (existing.has(word.toLowerCase())) return;
      existing.add(word.toLowerCase());
      addWord({
        word,
        phonetic: `/${word}/`,
        meaning,
        type: (["NOUN", "VERB", "ADJ", "ADV"].includes(type) ? type : "NOUN") as Word["type"],
        example: example || "",
      });
      added++;
    });
    if (added === 0) toast.error("Không có từ hợp lệ nào được thêm.");
    else toast.success(`Đã thêm ${added} từ.`);
    setAiText("");
    setAiOpen(false);
  };

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
          <Dialog open={aiOpen} onOpenChange={setAiOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-4 py-2.5 rounded-2xl shadow-md shadow-green-500/30 transition">
                <Sparkles className="size-4" /> Thêm nhiều từ
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Thêm nhiều từ</DialogTitle>
                <DialogDescription>
                  Mỗi dòng một từ theo định dạng: <code>word | nghĩa | TYPE | ví dụ</code>
                </DialogDescription>
              </DialogHeader>
              <textarea
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                rows={8}
                placeholder={"happy | hạnh phúc | ADJ | I am happy.\nrun | chạy | VERB | I run every morning."}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
              />
              <DialogFooter>
                <button onClick={() => setAiOpen(false)} className="px-4 py-2 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-100">Huỷ</button>
                <button onClick={handleBulk} className="px-4 py-2 rounded-2xl text-sm font-semibold bg-green-500 hover:bg-green-600 text-white">Thêm tất cả</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-600/30 transition">
                <Plus className="size-4" /> Thêm từ mới
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Thêm từ mới</DialogTitle>
                <DialogDescription>Bổ sung một từ vào kho từ vựng cá nhân của bạn.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Từ *</label>
                    <input
                      autoFocus
                      value={form.word}
                      onChange={(e) => setForm({ ...form, word: e.target.value })}
                      maxLength={60}
                      className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Phiên âm</label>
                    <input
                      value={form.phonetic}
                      onChange={(e) => setForm({ ...form, phonetic: e.target.value })}
                      maxLength={60}
                      placeholder="/həˈloʊ/"
                      className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-600">Nghĩa *</label>
                    <input
                      value={form.meaning}
                      onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                      maxLength={200}
                      className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Loại từ</label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Word["type"] })}>
                      <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NOUN">NOUN</SelectItem>
                        <SelectItem value="VERB">VERB</SelectItem>
                        <SelectItem value="ADJ">ADJ</SelectItem>
                        <SelectItem value="ADV">ADV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Ví dụ</label>
                  <textarea
                    value={form.example}
                    onChange={(e) => setForm({ ...form, example: e.target.value })}
                    rows={2}
                    maxLength={500}
                    className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <DialogFooter>
                  <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-100">Huỷ</button>
                  <button type="submit" className="px-4 py-2 rounded-2xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-2">
                    <Plus className="size-4" /> Thêm từ
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
