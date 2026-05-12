import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Map,
  ListChecks,
  Play,
  Pencil,
  Trash2,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/vocab/sets")({
  head: () => ({
    meta: [
      { title: "Bộ từ vựng — VocabLab" },
      { name: "description", content: "Quản lý các bộ từ vựng cá nhân của bạn." },
    ],
  }),
  component: VocabSetsPage,
});

function VocabSetsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // 1. Fetch vocab sets
  const { data: vocabSetsResponse, isLoading: loadingSets } = useQuery({
    queryKey: ["vocab-sets"],
    queryFn: async () => {
      const res = await fetch("/api/vocab-sets");
      return res.json();
    },
  });
  const vocabSets = vocabSetsResponse?.data || [];

  // 2. Fetch all user words for the picker
  const { data: wordsResponse } = useQuery({
    queryKey: ["words", { pageSize: 1000 }], // Fetch a large batch for the picker
    queryFn: async () => {
      const res = await fetch("/api/words?pageSize=1000");
      return res.json();
    },
  });
  const allWords = wordsResponse?.data?.items || [];

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const colorChoices = [
    { label: "Xanh lá", value: "from-green-400 to-emerald-500" },
    { label: "Xanh dương", value: "from-blue-400 to-indigo-500" },
    { label: "Tím", value: "from-purple-400 to-violet-500" },
    { label: "Cam", value: "from-orange-400 to-pink-500" },
    { label: "Đỏ", value: "from-rose-400 to-red-500" },
    { label: "Teal", value: "from-teal-400 to-cyan-500" },
  ];
  const empty = {
    title: "",
    description: "",
    color: colorChoices[0].value,
    wordIds: [] as string[],
  };
  const [form, setForm] = useState(empty);

  const toggleWord = (id: string) => {
    setForm((f) => ({
      ...f,
      wordIds: f.wordIds.includes(id) ? f.wordIds.filter((w) => w !== id) : [...f.wordIds, id],
    }));
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/vocab-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: (res) => {
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["vocab-sets"] });
        toast.success(`Đã tạo bộ từ mới thành công!`);
        setForm(empty);
        setOpen(false);
      } else {
        toast.error(res.error.message);
      }
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Nhập tên bộ từ.");
    if (form.wordIds.length === 0) return toast.error("Chọn ít nhất một từ.");

    createMutation.mutate({
      title: form.title.trim(),
      description: form.description.trim() || "Bộ từ vựng cá nhân.",
      color: form.color,
      wordIds: form.wordIds,
    });
  };

  const handleDelete = (id: string, title: string) => {
    // TODO: Implement DELETE /api/vocab-sets/:id
    toast.error("Tính năng xoá đang được phát triển.");
  };

  const personalSets = vocabSets.filter((s: any) => !s.isSystem);
  const systemSets = vocabSets.filter((s: any) => s.isSystem);

  // 3. Virtual Default Set (All User Words)
  const defaultSet = {
    id: "all",
    title: "Tất cả từ vựng",
    description: "Toàn bộ kho từ vựng cá nhân của bạn.",
    color: "from-slate-700 to-slate-900",
    total: wordsResponse?.data?.globalTotal || 0,
    learned: wordsResponse?.data?.learnedCount || 0,
    isVirtual: true,
  };

  const SetCard = ({ s }: { s: any }) => {
    const pct = s.total > 0 ? Math.round((s.learned / s.total) * 100) : 0;
    const checked = !!selected[s.id];
    return (
      <article className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col h-full">
        <div className={`h-2 -mt-5 -mx-5 mb-4 rounded-t-2xl bg-gradient-to-r ${s.color}`} />
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-800 text-lg">{s.title}</h3>
          {!s.isVirtual && (
            <button
              onClick={() => setSelected((p) => ({ ...p, [s.id]: !p[s.id] }))}
              className={`size-6 rounded-lg border-2 flex items-center justify-center transition ${
                checked
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-slate-300 hover:border-green-400"
              }`}
              aria-label="Chọn bộ từ"
            >
              {checked && <Check className="size-4" />}
            </button>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{s.description}</p>

        <div className="flex items-center gap-2 mt-4 text-sm text-slate-600">
          <ListChecks className="size-4 text-green-500" />
          <span className="font-semibold">{s.total} từ</span>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>
              {s.learned}/{s.total} đã học
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${s.color}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <Link
            to={s.id === "all" ? "/vocab/list" : "/vocab/$setId"}
            params={s.id === "all" ? {} : { setId: s.id }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm px-4 py-1.5 rounded-xl shadow-sm transition"
          >
            Xem
          </Link>
          {!s.isVirtual && (
            <div className="flex gap-1.5">
              <button
                className="size-9 rounded-xl bg-slate-50 hover:bg-purple-100 hover:text-purple-600 text-slate-500 flex items-center justify-center transition"
                aria-label="Phát"
              >
                <Play className="size-4" />
              </button>
              <button
                className="size-9 rounded-xl bg-slate-50 hover:bg-blue-100 hover:text-blue-600 text-slate-500 flex items-center justify-center transition"
                aria-label="Sửa"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => handleDelete(s.id, s.title)}
                className="size-9 rounded-xl bg-slate-50 hover:bg-red-100 hover:text-red-600 text-slate-500 flex items-center justify-center transition"
                aria-label="Xoá"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto relative pb-20">
      {loadingSets && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
          <Loader2 className="size-8 animate-spin text-green-500" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bộ từ vựng</h1>
          <p className="text-sm text-slate-500">Tạo và quản lý các bộ từ riêng của bạn.</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-2xl shadow-md shadow-green-500/30 transition">
                <Plus className="size-4" /> TẠO BỘ TỪ MỚI
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo bộ từ vựng mới</DialogTitle>
                <DialogDescription>Đặt tên, chọn màu chủ đạo và thêm từ vào bộ.</DialogDescription>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600">Tên bộ từ *</label>
                  <input
                    autoFocus
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    maxLength={80}
                    className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Mô tả</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    maxLength={300}
                    className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Màu chủ đạo</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {colorChoices.map((c) => {
                      const active = form.color === c.value;
                      return (
                        <button
                          type="button"
                          key={c.value}
                          onClick={() => setForm({ ...form, color: c.value })}
                          className={`h-8 w-14 rounded-xl bg-gradient-to-r ${c.value} ring-2 ring-offset-2 transition ${active ? "ring-slate-800" : "ring-transparent"}`}
                          aria-label={c.label}
                        />
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-600">
                      Chọn từ ({form.wordIds.length})
                    </label>
                  </div>
                  <div className="mt-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                    {allWords.map((w: any) => {
                      const checked = form.wordIds.includes(w.id);
                      return (
                        <label
                          key={w.id}
                          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleWord(w.id)}
                            className="size-4 accent-green-500"
                          />
                          <span className="font-semibold text-sm text-slate-800">{w.word}</span>
                          <span className="text-xs text-slate-500">{w.meaning}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <DialogFooter>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-2xl text-sm font-bold bg-green-500 hover:bg-green-600 text-white inline-flex items-center gap-2"
                  >
                    <Plus className="size-4" /> Tạo bộ từ
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <button className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-sm px-5 py-2.5 rounded-2xl shadow-md shadow-yellow-400/30 transition">
            <Map className="size-4" /> LỘ TRÌNH
          </button>
        </div>
      </div>

      {/* Row 1: Virtual Default Set */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ListChecks className="size-5 text-blue-500" /> Tổng quan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SetCard s={defaultSet} />
        </div>
      </section>

      {/* Row 2: User Created Sets */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="size-5 text-yellow-500" /> Bộ từ của bạn
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalSets.map((s: any) => (
            <SetCard key={s.id} s={s} />
          ))}
          {personalSets.length === 0 && !loadingSets && (
            <div className="col-span-full text-center text-sm text-slate-400 py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              Bạn chưa tạo bộ từ riêng nào.
            </div>
          )}
        </div>
      </section>

      {/* Row 3: System Sets */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Map className="size-5 text-green-500" /> Thư viện hệ thống
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemSets.map((s: any) => (
            <SetCard key={s.id} s={s} />
          ))}
          {systemSets.length === 0 && !loadingSets && (
            <div className="col-span-full text-center text-sm text-slate-400 py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              Đang cập nhật thêm các bộ từ hệ thống...
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
