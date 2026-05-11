import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shield, Users, CreditCard, BookOpen, BookMarked, Search, Trash2, Ban, CheckCircle2, Crown } from "lucide-react";
import { toast } from "sonner";
import { mockUsers, mockSubscriptions, type AdminUser, type AdminSubscription } from "@/lib/admin-mock";
import { words as seedWords, type Word } from "@/lib/mock-data";
import { useVocabSets, deleteVocabSet } from "@/lib/sets-store";

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
  const cards = [
    { label: "Người dùng", value: mockUsers.length, accent: "bg-blue-100 text-blue-600" },
    { label: "Đang trả phí", value: mockSubscriptions.filter((s) => s.status === "active").length, accent: "bg-green-100 text-green-600" },
    { label: "Từ vựng", value: seedWords.length, accent: "bg-purple-100 text-purple-600" },
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
    setItems((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u)),
    );
    toast.success("Đã cập nhật trạng thái người dùng.");
  };

  const upgrade = (id: string) => {
    setItems((prev) =>
      prev.map((u) => (u.id === id ? { ...u, plan: u.plan === "Free" ? "Pro" : u.plan === "Pro" ? "Pro+" : "Pro+" } : u)),
    );
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
              <Th>Người dùng</Th>
              <Th>Gói</Th>
              <Th>Trạng thái</Th>
              <Th>Streak</Th>
              <Th>Tham gia</Th>
              <Th className="text-right">Hành động</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center font-bold text-sm">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${planColor[u.plan]}`}>
                    {u.plan !== "Free" && <Crown className="size-3" />}
                    {u.plan}
                  </span>
                </Td>
                <Td>
                  {u.status === "active" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                      <CheckCircle2 className="size-3.5" /> Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                      <Ban className="size-3.5" /> Tạm khoá
                    </span>
                  )}
                </Td>
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
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-sm text-slate-500">Không có người dùng phù hợp.</td></tr>
            )}
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

  const cancel = (id: string) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, status: "canceled" } : s)));
    toast.success("Đã huỷ gói đăng ký.");
  };
  const reactivate = (id: string) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, status: "active" } : s)));
    toast.success("Đã kích hoạt lại gói.");
  };

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
            <tr>
              <Th>Người dùng</Th>
              <Th>Gói</Th>
              <Th>Giá</Th>
              <Th>Chu kỳ</Th>
              <Th>Gia hạn</Th>
              <Th>Trạng thái</Th>
              <Th className="text-right">Hành động</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((s) => {
              const u = userById.get(s.userId);
              return (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <Td>
                    <div className="font-semibold text-slate-800">{u?.name ?? "—"}</div>
                    <div className="text-xs text-slate-500">{u?.email}</div>
                  </Td>
                  <Td><span className={`text-xs font-bold px-2 py-1 rounded-md ${planColor[s.plan]}`}>{s.plan}</span></Td>
                  <Td className="font-semibold text-slate-800">{s.amount.toLocaleString("vi-VN")} ₫</Td>
                  <Td className="text-slate-600 text-xs">{s.cycle === "month" ? "Tháng" : "Năm"}</Td>
                  <Td className="text-slate-500 text-xs">{s.renewsAt}</Td>
                  <Td><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${subStatusColor[s.status]}`}>{s.status}</span></Td>
                  <Td className="text-right">
                    {s.status === "active" ? (
                      <ActionButton onClick={() => cancel(s.id)} title="Huỷ" tone="red"><Ban className="size-3.5" /></ActionButton>
                    ) : (
                      <ActionButton onClick={() => reactivate(s.id)} title="Kích hoạt" tone="green"><CheckCircle2 className="size-3.5" /></ActionButton>
                    )}
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

function WordsPanel() {
  const [items, setItems] = useState<Word[]>(seedWords);
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => items.filter((w) => w.word.toLowerCase().includes(q.toLowerCase()) || w.meaning.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );
  const remove = (id: string) => {
    setItems((prev) => prev.filter((w) => w.id !== id));
    toast.success("Đã xoá từ.");
  };

  return (
    <div className="space-y-4">
      <SearchBar value={q} onChange={setQ} placeholder="Tìm từ hoặc nghĩa..." />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <Th>Từ</Th>
              <Th>Phiên âm</Th>
              <Th>Nghĩa</Th>
              <Th>Loại</Th>
              <Th>Trạng thái</Th>
              <Th className="text-right">Hành động</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50/60">
                <Td className="font-bold text-slate-800">{w.word}</Td>
                <Td className="text-xs text-slate-500">{w.phonetic}</Td>
                <Td className="text-slate-600">{w.meaning}</Td>
                <Td><span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-100 text-blue-600">{w.type}</span></Td>
                <Td>
                  {w.learned ? (
                    <span className="text-xs font-semibold text-green-600">Đã học</span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">Chưa học</span>
                  )}
                </Td>
                <Td className="text-right">
                  <ActionButton onClick={() => remove(w.id)} title="Xoá" tone="red"><Trash2 className="size-3.5" /></ActionButton>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-sm text-slate-500">Không có từ phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SetsPanel() {
  const sets = useVocabSets();
  const handleDelete = (id: string, title: string) => {
    deleteVocabSet(id);
    toast.success(`Đã xoá "${title}"`);
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
          <tr>
            <Th>Bộ từ</Th>
            <Th>Mô tả</Th>
            <Th>Số từ</Th>
            <Th>Đã học</Th>
            <Th className="text-right">Hành động</Th>
          </tr>
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
                <ActionButton onClick={() => handleDelete(s.id, s.title)} title="Xoá" tone="red"><Trash2 className="size-3.5" /></ActionButton>
              </Td>
            </tr>
          ))}
          {sets.length === 0 && (
            <tr><td colSpan={5} className="p-8 text-center text-sm text-slate-500">Chưa có bộ từ nào.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative max-w-md">
      <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left font-semibold px-5 py-3 ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-3 align-middle ${className}`}>{children}</td>;
}

function ActionButton({
  children,
  onClick,
  title,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  tone: "red" | "slate" | "amber" | "green";
}) {
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