import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Sparkles, Plus, Volume2, Trash2, ArrowUp, ArrowDown, ArrowUpDown,
  ChevronLeft, ChevronRight, AlertOctagon,
} from "lucide-react";
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
  const [typeFilter, setTypeFilter] = useState<"ALL" | Word["type"]>("ALL");
  const [statusFilter, setStatusFilter] = useState<"all" | "learned" | "not">("all");
  const [sortKey, setSortKey] = useState<"word" | "type" | "meaning" | "learned">("word");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmState, setConfirmState] = useState<null | {
    title: string; description?: string; onConfirm: () => void;
  }>(null);
  const askConfirm = (opts: { title: string; description?: string; onConfirm: () => void }) =>
    setConfirmState(opts);
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
  const pct = total ? Math.round((learned / total) * 100) : 0;

  const stats = [
    { label: "Tổng từ", value: total, accent: "bg-blue-100 text-blue-600" },
    { label: "Đã học", value: learned, accent: "bg-green-100 text-green-600" },
    { label: "Chưa học", value: total - learned, accent: "bg-orange-100 text-orange-600" },
    { label: "Tỉ lệ", value: `${pct}%`, accent: "bg-purple-100 text-purple-600" },
  ];

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items.filter((w) => {
      if (ql && !w.word.toLowerCase().includes(ql) && !w.meaning.toLowerCase().includes(ql)) return false;
      if (typeFilter !== "ALL" && w.type !== typeFilter) return false;
      if (statusFilter === "learned" && !w.learned) return false;
      if (statusFilter === "not" && w.learned) return false;
      return true;
    });
  }, [items, q, typeFilter, statusFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: string | number = "", bv: string | number = "";
      if (sortKey === "learned") { av = a.learned ? 1 : 0; bv = b.learned ? 1 : 0; }
      else { av = (a[sortKey] as string).toLowerCase(); bv = (b[sortKey] as string).toLowerCase(); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const onSort = (k: typeof sortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
    setPage(1);
  };

  const handleDelete = (w: Word) => {
    askConfirm({
      title: `Xoá từ "${w.word}"?`,
      description: "Hành động này không thể hoàn tác.",
      onConfirm: () => {
        setItems((prev) => prev.filter((p) => p.id !== w.id));
        toast.success(`Đã xoá "${w.word}"`);
      },
    });
  };

  const toggleLearned = (w: Word, v: boolean) => {
    if (w.learned && !v) {
      askConfirm({
        title: `Đánh dấu "${w.word}" là chưa học?`,
        description: "Tiến độ của từ này sẽ được đặt lại.",
        onConfirm: () => setItems((prev) => prev.map((p) => (p.id === w.id ? { ...p, learned: v } : p))),
      });
    } else {
      setItems((prev) => prev.map((p) => (p.id === w.id ? { ...p, learned: v } : p)));
    }
  };

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
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Tìm từ vựng..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as typeof typeFilter); setPage(1); }}>
            <SelectTrigger className="w-[140px] rounded-2xl bg-white"><SelectValue placeholder="Loại từ" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="NOUN">NOUN</SelectItem>
              <SelectItem value="VERB">VERB</SelectItem>
              <SelectItem value="ADJ">ADJ</SelectItem>
              <SelectItem value="ADV">ADV</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as typeof statusFilter); setPage(1); }}>
            <SelectTrigger className="w-[150px] rounded-2xl bg-white"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="learned">Đã học</SelectItem>
              <SelectItem value="not">Chưa học</SelectItem>
            </SelectContent>
          </Select>
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 w-12"></th>
                <SortHeader k="word" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>Từ</SortHeader>
                <SortHeader k="meaning" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="hidden md:table-cell">Nghĩa</SortHeader>
                <SortHeader k="type" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="hidden md:table-cell">Loại</SortHeader>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Ví dụ</th>
                <SortHeader k="learned" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="center">Đã học</SortHeader>
                <th className="px-4 py-3 text-right font-semibold w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paged.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/70 transition group">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => speak(w.word)}
                      className="size-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"
                      aria-label={`Nghe phát âm ${w.word}`}
                    >
                      <Volume2 className="size-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">{w.word}</div>
                    <div className="text-xs text-slate-400">{w.phonetic}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{w.meaning}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${typeColors[w.type]}`}>{w.type}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 italic hidden lg:table-cell max-w-xs truncate">"{w.example}"</td>
                  <td className="px-4 py-3 text-center">
                    <Switch
                      checked={w.learned}
                      onCheckedChange={(v) => toggleLearned(w, v)}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(w)}
                      className="size-9 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 inline-flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                      aria-label={`Xoá ${w.word}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-sm text-slate-500">Không tìm thấy từ nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/40 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Hiển thị</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-8 w-[70px] rounded-lg bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
            <span>/ {sorted.length} từ</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="size-8 rounded-lg hover:bg-white border border-slate-200 inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-3 text-slate-600">Trang {safePage} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="size-8 rounded-lg hover:bg-white border border-slate-200 inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {confirmState && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setConfirmState(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-6 flex gap-4">
              <div className="size-11 shrink-0 rounded-2xl flex items-center justify-center bg-red-100 text-red-600">
                <AlertOctagon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-800">{confirmState.title}</h3>
                {confirmState.description && (
                  <p className="text-sm text-slate-500 mt-1">{confirmState.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
              <button
                onClick={() => setConfirmState(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Huỷ
              </button>
              <button
                onClick={() => { confirmState.onConfirm(); setConfirmState(null); }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type SortKey = "word" | "type" | "meaning" | "learned";

function SortHeader({
  children, k, sortKey, sortDir, onSort, className = "", align = "left",
}: {
  children: React.ReactNode;
  k: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (k: SortKey) => void;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  const active = sortKey === k;
  const alignCls = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  return (
    <th className={`px-4 py-3 font-semibold ${alignCls} ${className}`}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1 transition ${active ? "text-emerald-700" : "text-slate-500 hover:text-slate-700"}`}
      >
        <span>{children}</span>
        {active ? (sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ArrowUpDown className="size-3 opacity-40" />}
      </button>
    </th>
  );
}
