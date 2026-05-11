import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Shield, Users, CreditCard, BookOpen, BookMarked, Search, Trash2, Ban,
  CheckCircle2, Crown, Plus, Pencil, X,
} from "lucide-react";
import { toast } from "sonner";
import { mockUsers, mockSubscriptions, type AdminUser, type AdminSubscription } from "@/lib/admin-mock";
import type { Word, VocabSet } from "@/lib/mock-data";
import { useVocabSets, addVocabSet, updateVocabSet, deleteVocabSet } from "@/lib/sets-store";
import { useWords, addWord, updateWord, deleteWord } from "@/lib/words-store";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({
    meta: [
      { title: "Quản trị — VocabLab" },
      { name: "description", content: "Bảng điều khiển quản trị: người dùng, gói đăng ký, từ vựng và bộ từ." },
    ],
  }),
  component: AdminPage,
});

type Tab = "users" | "subs" | "words" | "sets";

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "users", label: "Người dùng", icon: Users },
  { id: "subs", label: "Gói đăng ký", icon: CreditCard },
  { id: "words", label: "Từ vựng", icon: BookOpen },
  { id: "sets", label: "Bộ từ vựng", icon: BookMarked },
];

function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md">
          <Shield className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản trị viên</h1>
          <p className="text-sm text-slate-500">Quản lý người dùng, gói đăng ký, từ vựng và bộ từ.</p>
        </div>
      </div>

      <Overview />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 inline-flex gap-1 flex-wrap">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                active ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "users" && <UsersPanel />}
      {tab === "subs" && <SubsPanel />}
      {tab === "words" && <WordsPanel />}
      {tab === "sets" && <SetsPanel />}
    </div>
  );
}

function Overview() {
  const sets = useVocabSets();
  const words = useWords();
  const cards = [
    { label: "Người dùng", value: mockUsers.length, accent: "bg-blue-100 text-blue-600" },
    { label: "Đang trả phí", value: mockSubscriptions.filter((s) => s.status === "active").length, accent: "bg-green-100 text-green-600" },
    { label: "Từ vựng", value: words.length, accent: "bg-purple-100 text-purple-600" },
    { label: "Bộ từ", value: sets.length, accent: "bg-orange-100 text-orange-600" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className={`inline-flex size-8 items-center justify-center rounded-xl text-xs font-bold ${c.accent}`}>•</div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{c.value}</div>
          <div className="text-xs text-slate-500">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

const planColor: Record<AdminUser["plan"], string> = {
  Free: "bg-slate-100 text-slate-600",
  Pro: "bg-blue-100 text-blue-700",
  "Pro+": "bg-amber-100 text-amber-700",
};

function UsersPanel() {
  const [items, setItems] = useState<AdminUser[]>(mockUsers);
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => items.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );

  const toggleStatus = (id: string) => {
    setItems((prev) => prev.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u)));
    toast.success("Đã cập nhật trạng thái người dùng.");
  };
  const upgrade = (id: string) => {
    setItems((prev) => prev.map((u) => (u.id === id ? { ...u, plan: u.plan === "Free" ? "Pro" : "Pro+" } : u)));
    toast.success("Đã nâng gói cho người dùng.");
  };
  const remove = (id: string) => {
    setItems((prev) => prev.filter((u) => u.id !== id));
    toast.success("Đã xoá người dùng.");
  };

  return (
    <div className="space-y-4">
      <SearchBar value={q} onChange={setQ} placeholder="Tìm theo tên hoặc email..." />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <Th>Người dùng</Th><Th>Gói</Th><Th>Trạng thái</Th><Th>Streak</Th><Th>Tham gia</Th><Th className="text-right">Hành động</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center font-bold text-sm">{u.name.charAt(0)}</div>
                    <div>
                      <div className="font-semibold text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  </div>
                </Td>
                <Td><span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${planColor[u.plan]}`}>{u.plan !== "Free" && <Crown className="size-3" />}{u.plan}</span></Td>
                <Td>{u.status === "active" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle2 className="size-3.5" /> Hoạt động</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><Ban className="size-3.5" /> Tạm khoá</span>
                )}</Td>
                <Td className="text-slate-600">🔥 {u.streak}</Td>
                <Td className="text-slate-500 text-xs">{u.joinedAt}</Td>
                <Td className="text-right">
                  <div className="inline-flex gap-1.5">
                    <ActionButton onClick={() => upgrade(u.id)} title="Nâng gói" tone="amber"><Crown className="size-3.5" /></ActionButton>
                    <ActionButton onClick={() => toggleStatus(u.id)} title={u.status === "active" ? "Khoá" : "Mở"} tone="slate">
                      {u.status === "active" ? <Ban className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                    </ActionButton>
                    <ActionButton onClick={() => remove(u.id)} title="Xoá" tone="red"><Trash2 className="size-3.5" /></ActionButton>
                  </div>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (<tr><td colSpan={6} className="p-8 text-center text-sm text-slate-500">Không có người dùng phù hợp.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const subStatusColor: Record<AdminSubscription["status"], string> = {
  active: "bg-green-100 text-green-700",
  canceled: "bg-slate-100 text-slate-600",
  past_due: "bg-red-100 text-red-700",
};

function SubsPanel() {
  const [items, setItems] = useState<AdminSubscription[]>(mockSubscriptions);
  const userById = useMemo(() => new Map(mockUsers.map((u) => [u.id, u])), []);
  const cancel = (id: string) => { setItems((prev) => prev.map((s) => (s.id === id ? { ...s, status: "canceled" } : s))); toast.success("Đã huỷ gói đăng ký."); };
  const reactivate = (id: string) => { setItems((prev) => prev.map((s) => (s.id === id ? { ...s, status: "active" } : s))); toast.success("Đã kích hoạt lại gói."); };
  const revenue = items.filter((s) => s.status === "active").reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-5 shadow-md">
        <div className="text-xs uppercase tracking-wider opacity-80">Doanh thu định kỳ ước tính</div>
        <div className="text-3xl font-extrabold mt-1">{revenue.toLocaleString("vi-VN")} ₫</div>
        <div className="text-xs opacity-80 mt-1">Dựa trên {items.filter((s) => s.status === "active").length} gói đang hoạt động</div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr><Th>Người dùng</Th><Th>Gói</Th><Th>Giá</Th><Th>Chu kỳ</Th><Th>Gia hạn</Th><Th>Trạng thái</Th><Th className="text-right">Hành động</Th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((s) => {
              const u = userById.get(s.userId);
              return (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <Td><div className="font-semibold text-slate-800">{u?.name ?? "—"}</div><div className="text-xs text-slate-500">{u?.email}</div></Td>
                  <Td><span className={`text-xs font-bold px-2 py-1 rounded-md ${planColor[s.plan]}`}>{s.plan}</span></Td>
                  <Td className="font-semibold text-slate-800">{s.amount.toLocaleString("vi-VN")} ₫</Td>
                  <Td className="text-slate-600 text-xs">{s.cycle === "month" ? "Tháng" : "Năm"}</Td>
                  <Td className="text-slate-500 text-xs">{s.renewsAt}</Td>
                  <Td><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${subStatusColor[s.status]}`}>{s.status}</span></Td>
                  <Td className="text-right">
                    {s.status === "active"
                      ? <ActionButton onClick={() => cancel(s.id)} title="Huỷ" tone="red"><Ban className="size-3.5" /></ActionButton>
                      : <ActionButton onClick={() => reactivate(s.id)} title="Kích hoạt" tone="green"><CheckCircle2 className="size-3.5" /></ActionButton>}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ WORDS ============ */

const wordTypes: Word["type"][] = ["NOUN", "VERB", "ADJ", "ADV"];

function WordsPanel() {
  const items = useWords();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Word | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(
    () => items.filter((w) => w.word.toLowerCase().includes(q.toLowerCase()) || w.meaning.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );
  const remove = (id: string) => { deleteWord(id); toast.success("Đã xoá từ."); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar value={q} onChange={setQ} placeholder="Tìm từ hoặc nghĩa..." />
        <button onClick={() => setCreating(true)} className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition">
          <Plus className="size-4" /> Thêm từ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr><Th>Từ</Th><Th>Phiên âm</Th><Th>Nghĩa</Th><Th>Loại</Th><Th>Trạng thái</Th><Th className="text-right">Hành động</Th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50/60">
                <Td className="font-bold text-slate-800">{w.word}</Td>
                <Td className="text-xs text-slate-500">{w.phonetic}</Td>
                <Td className="text-slate-600">{w.meaning}</Td>
                <Td><span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-100 text-blue-600">{w.type}</span></Td>
                <Td>{w.learned ? <span className="text-xs font-semibold text-green-600">Đã học</span> : <span className="text-xs font-semibold text-slate-400">Chưa học</span>}</Td>
                <Td className="text-right">
                  <div className="inline-flex gap-1.5">
                    <ActionButton onClick={() => setEditing(w)} title="Sửa" tone="slate"><Pencil className="size-3.5" /></ActionButton>
                    <ActionButton onClick={() => remove(w.id)} title="Xoá" tone="red"><Trash2 className="size-3.5" /></ActionButton>
                  </div>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (<tr><td colSpan={6} className="p-8 text-center text-sm text-slate-500">Không có từ phù hợp.</td></tr>)}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <WordEditor
          initial={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSave={(data) => {
            if (editing) { updateWord(editing.id, data); toast.success("Đã cập nhật từ."); }
            else { addWord(data); toast.success("Đã thêm từ mới."); }
            setCreating(false); setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function WordEditor({ initial, onSave, onClose }: { initial: Word | null; onSave: (w: Omit<Word, "id">) => void; onClose: () => void }) {
  const [word, setWord] = useState(initial?.word ?? "");
  const [phonetic, setPhonetic] = useState(initial?.phonetic ?? "");
  const [meaning, setMeaning] = useState(initial?.meaning ?? "");
  const [type, setType] = useState<Word["type"]>(initial?.type ?? "NOUN");
  const [example, setExample] = useState(initial?.example ?? "");
  const [learned, setLearned] = useState(initial?.learned ?? false);

  const submit = () => {
    if (!word.trim() || !meaning.trim()) { toast.error("Vui lòng nhập từ và nghĩa."); return; }
    onSave({ word: word.trim(), phonetic: phonetic.trim(), meaning: meaning.trim(), type, example: example.trim(), learned });
  };

  return (
    <Modal title={initial ? "Chỉnh sửa từ" : "Thêm từ mới"} onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Từ"><Input value={word} onChange={setWord} placeholder="abandon" /></Field>
        <Field label="Phiên âm"><Input value={phonetic} onChange={setPhonetic} placeholder="/əˈbændən/" /></Field>
        <Field label="Nghĩa" className="md:col-span-2"><Input value={meaning} onChange={setMeaning} placeholder="từ bỏ, bỏ rơi" /></Field>
        <Field label="Loại từ">
          <div className="flex gap-1.5 flex-wrap">
            {wordTypes.map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${type === t ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{t}</button>
            ))}
          </div>
        </Field>
        <Field label="Trạng thái">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={learned} onChange={(e) => setLearned(e.target.checked)} className="size-4 rounded border-slate-300 text-indigo-600" />
            Đã học
          </label>
        </Field>
        <Field label="Ví dụ" className="md:col-span-2">
          <textarea value={example} onChange={(e) => setExample(e.target.value)} rows={2} placeholder="He abandoned his car in the snow."
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </Field>
      </div>
      <ModalActions onClose={onClose} onSave={submit} saveLabel={initial ? "Lưu thay đổi" : "Thêm từ"} />
    </Modal>
  );
}

/* ============ SETS ============ */

const gradientPresets = [
  "from-green-400 to-emerald-500",
  "from-blue-400 to-indigo-500",
  "from-orange-400 to-pink-500",
  "from-rose-400 to-red-500",
  "from-purple-400 to-violet-500",
  "from-teal-400 to-cyan-500",
  "from-amber-400 to-orange-500",
  "from-fuchsia-400 to-pink-500",
];

function SetsPanel() {
  const sets = useVocabSets();
  const [editing, setEditing] = useState<VocabSet | null>(null);
  const [creating, setCreating] = useState(false);

  const handleDelete = (id: string, title: string) => { deleteVocabSet(id); toast.success(`Đã xoá "${title}"`); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition">
          <Plus className="size-4" /> Thêm bộ từ
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr><Th>Bộ từ</Th><Th>Mô tả</Th><Th>Số từ</Th><Th>Đã học</Th><Th className="text-right">Hành động</Th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sets.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-xl bg-gradient-to-r ${s.color}`} />
                    <span className="font-semibold text-slate-800">{s.title}</span>
                  </div>
                </Td>
                <Td className="text-slate-500 text-xs max-w-md truncate">{s.description}</Td>
                <Td className="font-semibold">{s.total}</Td>
                <Td className="text-slate-600">{s.learned}/{s.total}</Td>
                <Td className="text-right">
                  <div className="inline-flex gap-1.5">
                    <ActionButton onClick={() => setEditing(s)} title="Sửa" tone="slate"><Pencil className="size-3.5" /></ActionButton>
                    <ActionButton onClick={() => handleDelete(s.id, s.title)} title="Xoá" tone="red"><Trash2 className="size-3.5" /></ActionButton>
                  </div>
                </Td>
              </tr>
            ))}
            {sets.length === 0 && (<tr><td colSpan={5} className="p-8 text-center text-sm text-slate-500">Chưa có bộ từ nào.</td></tr>)}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <SetEditor
          initial={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSave={(data) => {
            if (editing) { updateVocabSet(editing.id, data); toast.success("Đã cập nhật bộ từ."); }
            else { addVocabSet(data); toast.success("Đã thêm bộ từ mới."); }
            setCreating(false); setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function SetEditor({
  initial, onSave, onClose,
}: {
  initial: VocabSet | null;
  onSave: (data: { title: string; description: string; color: string; wordIds: string[] }) => void;
  onClose: () => void;
}) {
  const allWords = useWords();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [color, setColor] = useState(initial?.color ?? gradientPresets[0]);
  const [wordIds, setWordIds] = useState<string[]>(initial?.wordIds ?? []);
  const [wordQ, setWordQ] = useState("");

  useEffect(() => {
    // Drop selected ids that no longer exist
    setWordIds((prev) => prev.filter((id) => allWords.some((w) => w.id === id)));
  }, [allWords]);

  const filtered = useMemo(
    () => allWords.filter((w) => w.word.toLowerCase().includes(wordQ.toLowerCase()) || w.meaning.toLowerCase().includes(wordQ.toLowerCase())),
    [allWords, wordQ],
  );

  const toggle = (id: string) => setWordIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const submit = () => {
    if (!title.trim()) { toast.error("Vui lòng nhập tên bộ từ."); return; }
    onSave({ title: title.trim(), description: description.trim(), color, wordIds });
  };

  return (
    <Modal title={initial ? "Chỉnh sửa bộ từ" : "Thêm bộ từ mới"} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tên bộ từ"><Input value={title} onChange={setTitle} placeholder="Business English" /></Field>
          <Field label="Màu nền">
            <div className="flex gap-2 flex-wrap">
              {gradientPresets.map((g) => (
                <button key={g} type="button" onClick={() => setColor(g)}
                  className={`size-8 rounded-xl bg-gradient-to-r ${g} ring-2 transition ${color === g ? "ring-indigo-500 scale-110" : "ring-transparent"}`} />
              ))}
            </div>
          </Field>
          <Field label="Mô tả" className="md:col-span-2">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Mô tả ngắn gọn về bộ từ..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </Field>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Chọn từ ({wordIds.length}/{allWords.length})</label>
            <SearchBar value={wordQ} onChange={setWordQ} placeholder="Tìm từ..." />
          </div>
          <div className="border border-slate-200 rounded-2xl max-h-72 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((w) => {
              const checked = wordIds.includes(w.id);
              return (
                <label key={w.id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition ${checked ? "bg-indigo-50/60" : "hover:bg-slate-50"}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggle(w.id)} className="size-4 rounded border-slate-300 text-indigo-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">{w.word} <span className="text-xs font-normal text-slate-500">{w.phonetic}</span></div>
                    <div className="text-xs text-slate-500 truncate">{w.meaning}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-600">{w.type}</span>
                </label>
              );
            })}
            {filtered.length === 0 && <div className="p-6 text-center text-sm text-slate-500">Không tìm thấy từ phù hợp.</div>}
          </div>
        </div>
      </div>
      <ModalActions onClose={onClose} onSave={submit} saveLabel={initial ? "Lưu thay đổi" : "Tạo bộ từ"} />
    </Modal>
  );
}

/* ============ Shared UI ============ */

function Modal({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-3xl shadow-2xl w-full ${wide ? "max-w-3xl" : "max-w-xl"} max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ onClose, onSave, saveLabel }: { onClose: () => void; onSave: () => void; saveLabel: string }) {
  return (
    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60 -mx-6 -mb-5 mt-5">
      <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Huỷ</button>
      <button onClick={onSave} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition">{saveLabel}</button>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative max-w-xs">
      <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left font-semibold px-5 py-3 ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-3 align-middle ${className}`}>{children}</td>;
}
function ActionButton({ children, onClick, title, tone }: { children: React.ReactNode; onClick: () => void; title: string; tone: "red" | "slate" | "amber" | "green" }) {
  const tones: Record<string, string> = {
    red: "bg-red-50 text-red-600 hover:bg-red-100",
    slate: "bg-slate-50 text-slate-600 hover:bg-slate-100",
    amber: "bg-amber-50 text-amber-600 hover:bg-amber-100",
    green: "bg-green-50 text-green-600 hover:bg-green-100",
  };
  return (
    <button onClick={onClick} title={title} aria-label={title} className={`inline-flex size-8 items-center justify-center rounded-lg transition ${tones[tone]}`}>
      {children}
    </button>
  );
}
