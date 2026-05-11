import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Shield, Users, CreditCard, BookOpen, BookMarked, Search, Trash2, Ban,
  CheckCircle2, Crown, Plus, Pencil, X, Eye, LogIn, Mail, Download, ShieldCheck,
  Activity, Monitor, Clock, AlertTriangle, Receipt, Tag, RotateCcw, TrendingUp, Webhook,
  RefreshCw, Copy, History, Upload, Sparkles, Undo2, Send, AlertCircle,
  Lock, KeyRound, Smartphone, Globe, Power,
} from "lucide-react";
import { toast } from "sonner";
import {
  mockUsers, mockSubscriptions, mockLoginHistory, mockActivityLog,
  mockPayments, mockCoupons, mockWebhooks, mockRevenue,
  mockAdminTwoFactor, mockAuditLogs, mockRateLimits, mockCaptcha,
  mockSessions, mockDevices, mockIpBlocklist,
  type AdminUser, type AdminSubscription, type AdminRole,
  type PaymentRecord, type Coupon, type WebhookLog,
  type AuditLog, type RateLimitRule, type AdminSession, type TrustedDevice, type IpBlockEntry,
} from "@/lib/admin-mock";
import type { Word, VocabSet } from "@/lib/mock-data";
import {
  useVocabSets, addVocabSet, updateVocabSet, deleteVocabSet,
  getSetHistory, restoreSetVersion, canUndoSets, undoSets,
  findDuplicateSet, getAllSetTags,
} from "@/lib/sets-store";
import {
  useWords, addWord, updateWord, deleteWord,
  getWordHistory, restoreWordVersion, canUndoWords, undoWords,
  findDuplicateWord, getAllTags, bulkAddWords,
} from "@/lib/words-store";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({
    meta: [
      { title: "Quản trị — VocabLab" },
      { name: "description", content: "Bảng điều khiển quản trị: người dùng, gói đăng ký, từ vựng và bộ từ." },
    ],
  }),
  component: AdminPage,
});

type Tab = "users" | "subs" | "words" | "sets" | "security";

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "users", label: "Người dùng", icon: Users },
  { id: "subs", label: "Gói đăng ký", icon: CreditCard },
  { id: "words", label: "Từ vựng", icon: BookOpen },
  { id: "sets", label: "Bộ từ vựng", icon: BookMarked },
  { id: "security", label: "Bảo mật", icon: ShieldCheck },
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
      {tab === "security" && <SecurityPanel />}
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

const roleColor: Record<AdminRole, string> = {
  Admin: "bg-rose-100 text-rose-700",
  Moderator: "bg-violet-100 text-violet-700",
  Editor: "bg-sky-100 text-sky-700",
  User: "bg-slate-100 text-slate-600",
};

const allRoles: AdminRole[] = ["Admin", "Moderator", "Editor", "User"];

function UsersPanel() {
  const [items, setItems] = useState<AdminUser[]>(mockUsers);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminRole | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<AdminUser | null>(null);
  const [notifyTarget, setNotifyTarget] = useState<AdminUser[] | null>(null);

  const filtered = useMemo(
    () => items.filter((u) => {
      const matchQ = u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchQ && matchRole;
    }),
    [items, q, roleFilter],
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
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    toast.success("Đã xoá người dùng.");
  };
  const setRole = (id: string, role: AdminRole) => {
    setItems((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success(`Đã gán quyền ${role}.`);
  };
  const impersonate = (u: AdminUser) => {
    toast.success(`Đang đăng nhập với tư cách ${u.name}…`, { description: "Chế độ giả lập — dùng để hỗ trợ / debug." });
  };
  const resetPassword = (u: AdminUser) => toast.success(`Đã gửi email đặt lại mật khẩu tới ${u.email}.`);

  const toggleSel = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => {
    if (filtered.every((u) => selected.has(u.id))) setSelected(new Set());
    else setSelected(new Set(filtered.map((u) => u.id)));
  };
  const selectedUsers = items.filter((u) => selected.has(u.id));
  const bulkSuspend = () => {
    setItems((prev) => prev.map((u) => selected.has(u.id) ? { ...u, status: "suspended" } : u));
    toast.success(`Đã khoá ${selected.size} người dùng.`); setSelected(new Set());
  };
  const bulkUpgrade = () => {
    setItems((prev) => prev.map((u) => selected.has(u.id) ? { ...u, plan: u.plan === "Free" ? "Pro" : "Pro+" } : u));
    toast.success(`Đã nâng gói cho ${selected.size} người dùng.`); setSelected(new Set());
  };
  const exportCsv = () => {
    const rows = [
      ["id","name","email","role","plan","status","streak","joinedAt","lastActiveAt","lessonsCompleted"],
      ...(selectedUsers.length ? selectedUsers : filtered).map((u) => [u.id,u.name,u.email,u.role,u.plan,u.status,u.streak,u.joinedAt,u.lastActiveAt,u.lessonsCompleted]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "users.csv"; a.click(); URL.revokeObjectURL(url);
    toast.success("Đã xuất CSV.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar value={q} onChange={setQ} placeholder="Tìm theo tên hoặc email..." />
        <div className="flex gap-1.5 flex-wrap">
          {(["all", ...allRoles] as const).map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${roleFilter === r ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {r === "all" ? "Tất cả" : r}
            </button>
          ))}
        </div>
        <button onClick={exportCsv} className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
          <Download className="size-4" /> Xuất CSV
        </button>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 flex-wrap bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
          <span className="text-sm font-semibold text-indigo-700">Đã chọn {selected.size}</span>
          <div className="ml-auto flex gap-2 flex-wrap">
            <button onClick={bulkUpgrade} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition"><Crown className="size-3.5" /> Nâng gói</button>
            <button onClick={bulkSuspend} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition"><Ban className="size-3.5" /> Khoá</button>
            <button onClick={() => setNotifyTarget(selectedUsers)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"><Mail className="size-3.5" /> Gửi thông báo</button>
            <button onClick={() => setSelected(new Set())} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"><X className="size-3.5" /> Bỏ chọn</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-5 py-3 w-10"><input type="checkbox" checked={filtered.length > 0 && filtered.every((u) => selected.has(u.id))} onChange={toggleAll} className="size-4 rounded border-slate-300 text-indigo-600" /></th>
              <Th>Người dùng</Th><Th>Quyền</Th><Th>Gói</Th><Th>Trạng thái</Th><Th>Hoạt động gần nhất</Th><Th className="text-right">Hành động</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/60">
                <td className="px-5"><input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSel(u.id)} className="size-4 rounded border-slate-300 text-indigo-600" /></td>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center font-bold text-sm">{u.name.charAt(0)}</div>
                    <div>
                      <div className="font-semibold text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  </div>
                </Td>
                <Td><span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-md ${roleColor[u.role]}`}><ShieldCheck className="size-3" />{u.role}</span></Td>
                <Td><span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${planColor[u.plan]}`}>{u.plan !== "Free" && <Crown className="size-3" />}{u.plan}</span></Td>
                <Td>{u.status === "active" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle2 className="size-3.5" /> Hoạt động</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><Ban className="size-3.5" /> Tạm khoá</span>
                )}</Td>
                <Td className="text-slate-500 text-xs">{u.lastActiveAt}</Td>
                <Td className="text-right">
                  <div className="inline-flex gap-1.5">
                    <ActionButton onClick={() => setDetail(u)} title="Xem chi tiết" tone="slate"><Eye className="size-3.5" /></ActionButton>
                    <ActionButton onClick={() => impersonate(u)} title="Đăng nhập với tư cách" tone="green"><LogIn className="size-3.5" /></ActionButton>
                    <ActionButton onClick={() => setNotifyTarget([u])} title="Gửi thông báo" tone="amber"><Mail className="size-3.5" /></ActionButton>
                    <ActionButton onClick={() => upgrade(u.id)} title="Nâng gói" tone="amber"><Crown className="size-3.5" /></ActionButton>
                    <ActionButton onClick={() => toggleStatus(u.id)} title={u.status === "active" ? "Khoá" : "Mở"} tone="slate">
                      {u.status === "active" ? <Ban className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                    </ActionButton>
                    <ActionButton onClick={() => remove(u.id)} title="Xoá" tone="red"><Trash2 className="size-3.5" /></ActionButton>
                  </div>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (<tr><td colSpan={7} className="p-8 text-center text-sm text-slate-500">Không có người dùng phù hợp.</td></tr>)}
          </tbody>
        </table>
      </div>

      {detail && (
        <UserDetailModal
          user={detail}
          onClose={() => setDetail(null)}
          onSetRole={(r) => setRole(detail.id, r)}
          onImpersonate={() => impersonate(detail)}
          onResetPassword={() => resetPassword(detail)}
          onNotify={() => setNotifyTarget([detail])}
        />
      )}
      {notifyTarget && (
        <NotifyModal targets={notifyTarget} onClose={() => setNotifyTarget(null)} onSent={() => setNotifyTarget(null)} />
      )}
    </div>
  );
}

function UserDetailModal({
  user, onClose, onSetRole, onImpersonate, onResetPassword, onNotify,
}: {
  user: AdminUser; onClose: () => void;
  onSetRole: (r: AdminRole) => void; onImpersonate: () => void; onResetPassword: () => void; onNotify: () => void;
}) {
  const logins = mockLoginHistory[user.id] ?? mockLoginHistory.default;
  const activity = mockActivityLog[user.id] ?? mockActivityLog.default;
  const activityIcon: Record<string, { icon: typeof Activity; tone: string }> = {
    email_change: { icon: Mail, tone: "bg-blue-100 text-blue-600" },
    plan_change: { icon: Crown, tone: "bg-amber-100 text-amber-600" },
    login_fail: { icon: AlertTriangle, tone: "bg-red-100 text-red-600" },
    spam_flag: { icon: AlertTriangle, tone: "bg-rose-100 text-rose-600" },
    password_reset: { icon: ShieldCheck, tone: "bg-violet-100 text-violet-600" },
    lesson_done: { icon: CheckCircle2, tone: "bg-green-100 text-green-600" },
  };

  return (
    <Modal title="Chi tiết người dùng" onClose={onClose} wide>
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="size-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center font-bold text-2xl">{user.name.charAt(0)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${roleColor[user.role]}`}>{user.role}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${planColor[user.plan]}`}>{user.plan}</span>
            </div>
            <div className="text-sm text-slate-500">{user.email}</div>
            <div className="text-xs text-slate-400 mt-1">Tham gia {user.joinedAt} · ID {user.id}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Bài đã học" value={user.lessonsCompleted} />
          <Stat label="Streak" value={`🔥 ${user.streak}`} />
          <Stat label="Hoạt động" value={user.lastActiveAt.split(" ")[0]} hint={user.lastActiveAt.split(" ")[1]} />
          <Stat label="Trạng thái" value={user.status === "active" ? "Hoạt động" : "Tạm khoá"} />
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={onImpersonate} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition"><LogIn className="size-3.5" /> Đăng nhập với tư cách</button>
          <button onClick={onResetPassword} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition"><ShieldCheck className="size-3.5" /> Reset mật khẩu</button>
          <button onClick={onNotify} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"><Mail className="size-3.5" /> Gửi thông báo</button>
        </div>

        <div>
          <div className="text-xs font-bold uppercase text-slate-500 mb-2">Phân quyền</div>
          <div className="flex gap-1.5 flex-wrap">
            {allRoles.map((r) => (
              <button key={r} onClick={() => onSetRole(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${user.role === r ? "bg-indigo-600 text-white" : `${roleColor[r]} hover:opacity-80`}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2"><Monitor className="size-4 text-slate-500" /><div className="text-xs font-bold uppercase text-slate-500">Lịch sử đăng nhập</div></div>
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500"><tr><th className="text-left px-3 py-2">Thời gian</th><th className="text-left px-3 py-2">IP</th><th className="text-left px-3 py-2">Thiết bị</th><th className="text-left px-3 py-2">Vị trí</th><th className="text-left px-3 py-2">Kết quả</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {logins.map((l, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2 text-slate-600">{l.at}</td>
                    <td className="px-3 py-2 font-mono text-slate-700">{l.ip}</td>
                    <td className="px-3 py-2 text-slate-600">{l.device}</td>
                    <td className="px-3 py-2 text-slate-500">{l.location}</td>
                    <td className="px-3 py-2">
                      {l.status === "success"
                        ? <span className="inline-flex items-center gap-1 text-green-600 font-semibold"><CheckCircle2 className="size-3" /> OK</span>
                        : <span className="inline-flex items-center gap-1 text-red-600 font-semibold"><AlertTriangle className="size-3" /> Lỗi</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2"><Activity className="size-4 text-slate-500" /><div className="text-xs font-bold uppercase text-slate-500">Nhật ký hoạt động</div></div>
          <ul className="space-y-2">
            {activity.map((a, i) => {
              const meta = activityIcon[a.type] ?? { icon: Clock, tone: "bg-slate-100 text-slate-600" };
              const Icon = meta.icon;
              return (
                <li key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
                  <div className={`size-7 rounded-lg flex items-center justify-center ${meta.tone}`}><Icon className="size-3.5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-700">{a.detail}</div>
                    <div className="text-[11px] text-slate-400">{a.at}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Modal>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-3">
      <div className="text-[11px] font-semibold uppercase text-slate-500">{label}</div>
      <div className="text-lg font-bold text-slate-800 mt-0.5">{value}</div>
      {hint && <div className="text-[11px] text-slate-400">{hint}</div>}
    </div>
  );
}

function NotifyModal({ targets, onClose, onSent }: { targets: AdminUser[]; onClose: () => void; onSent: () => void }) {
  const presets = [
    { id: "reset", label: "Reset mật khẩu", subject: "Đặt lại mật khẩu", body: "Chúng tôi đã gửi liên kết đặt lại mật khẩu cho bạn." },
    { id: "warn", label: "Cảnh báo", subject: "Cảnh báo từ VocabLab", body: "Tài khoản của bạn đã có hoạt động bất thường, vui lòng kiểm tra." },
    { id: "promo", label: "Khuyến mãi", subject: "Ưu đãi đặc biệt 🎉", body: "Nâng cấp Pro+ với ưu đãi -30% chỉ trong tuần này!" },
  ];
  const [presetId, setPresetId] = useState(presets[0].id);
  const preset = presets.find((p) => p.id === presetId)!;
  const [subject, setSubject] = useState(preset.subject);
  const [body, setBody] = useState(preset.body);

  useEffect(() => { setSubject(preset.subject); setBody(preset.body); }, [presetId]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = () => {
    if (!subject.trim() || !body.trim()) { toast.error("Vui lòng nhập tiêu đề và nội dung."); return; }
    toast.success(`Đã gửi tới ${targets.length} người dùng.`);
    onSent();
  };

  return (
    <Modal title={`Gửi thông báo (${targets.length} người)`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button key={p.id} onClick={() => setPresetId(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${presetId === p.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {p.label}
            </button>
          ))}
        </div>
        <Field label="Người nhận">
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {targets.map((t) => (
              <span key={t.id} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md">{t.email}</span>
            ))}
          </div>
        </Field>
        <Field label="Tiêu đề"><Input value={subject} onChange={setSubject} /></Field>
        <Field label="Nội dung">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </Field>
      </div>
      <ModalActions onClose={onClose} onSave={send} saveLabel="Gửi" />
    </Modal>
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
  const [section, setSection] = useState<"billing" | "metrics" | "coupons" | "webhooks">("billing");

  const sections: { id: typeof section; label: string; icon: typeof Receipt }[] = [
    { id: "billing", label: "Billing & Hoàn tiền", icon: Receipt },
    { id: "metrics", label: "Doanh thu (MRR/ARR)", icon: TrendingUp },
    { id: "coupons", label: "Mã giảm giá & Trial", icon: Tag },
    { id: "webhooks", label: "Webhook logs", icon: Webhook },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-5 shadow-md">
        <div className="text-xs uppercase tracking-wider opacity-80">Doanh thu định kỳ ước tính</div>
        <div className="text-3xl font-extrabold mt-1">{revenue.toLocaleString("vi-VN")} ₫</div>
        <div className="text-xs opacity-80 mt-1">Dựa trên {items.filter((s) => s.status === "active").length} gói đang hoạt động</div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 inline-flex gap-1 flex-wrap">
        {sections.map((s) => {
          const active = section === s.id;
          return (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${active ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}>
              <s.icon className="size-4" />{s.label}
            </button>
          );
        })}
      </div>

      {section === "billing" && <BillingSection items={items} userById={userById} cancel={cancel} reactivate={reactivate} />}
      {section === "metrics" && <RevenueSection />}
      {section === "coupons" && <CouponsSection />}
      {section === "webhooks" && <WebhooksSection />}
    </div>
  );
}

function BillingSection({
  items, userById, cancel, reactivate,
}: {
  items: AdminSubscription[];
  userById: Map<string, AdminUser>;
  cancel: (id: string) => void; reactivate: (id: string) => void;
}) {
  const [autoRenew, setAutoRenew] = useState<Record<string, boolean>>(
    () => Object.fromEntries(items.map((s) => [s.id, s.status === "active"])),
  );
  const [refundFor, setRefundFor] = useState<PaymentRecord | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>(mockPayments);

  const refund = (id: string, reason: string) => {
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status: "refunded" } : p)));
    toast.success(`Đã hoàn tiền${reason ? ` (${reason})` : ""}.`);
    setRefundFor(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 text-xs font-bold uppercase text-slate-500">Quản lý billing</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr><Th>Người dùng</Th><Th>Gói</Th><Th>Giá</Th><Th>Chu kỳ</Th><Th>Hết hạn</Th><Th>Auto-renew</Th><Th>Trạng thái</Th><Th className="text-right">Hành động</Th></tr>
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
                  <Td>
                    <button onClick={() => setAutoRenew((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${autoRenew[s.id] ? "bg-green-500" : "bg-slate-300"}`}>
                      <span className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${autoRenew[s.id] ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </Td>
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs font-bold uppercase text-slate-500">Lịch sử thanh toán</div>
          <button onClick={() => toast.success("Đã xuất hoá đơn.")} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"><Download className="size-3.5" /> Xuất hoá đơn</button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr><Th>Ngày</Th><Th>Người dùng</Th><Th>Số tiền</Th><Th>Phương thức</Th><Th>Hoá đơn</Th><Th>Trạng thái</Th><Th className="text-right">Hành động</Th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => {
              const sub = items.find((s) => s.id === p.subId);
              const u = sub ? userById.get(sub.userId) : null;
              return (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <Td className="text-slate-600 text-xs">{p.at}</Td>
                  <Td><div className="font-semibold text-slate-800 text-sm">{u?.name ?? "—"}</div><div className="text-xs text-slate-500">{u?.email}</div></Td>
                  <Td className="font-semibold">{p.amount.toLocaleString("vi-VN")} ₫</Td>
                  <Td><span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-slate-100 text-slate-700">{p.method}</span></Td>
                  <Td className="text-xs font-mono text-slate-500">{p.invoice}</Td>
                  <Td>
                    {p.status === "paid" && <span className="text-xs font-semibold text-green-600">✓ Đã thanh toán</span>}
                    {p.status === "refunded" && <span className="text-xs font-semibold text-amber-600">↺ Đã hoàn tiền</span>}
                    {p.status === "failed" && <span className="text-xs font-semibold text-red-600">✕ Thất bại</span>}
                  </Td>
                  <Td className="text-right">
                    {p.status === "paid"
                      ? <ActionButton onClick={() => setRefundFor(p)} title="Hoàn tiền" tone="amber"><RotateCcw className="size-3.5" /></ActionButton>
                      : <span className="text-xs text-slate-400">—</span>}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {refundFor && <RefundModal payment={refundFor} onClose={() => setRefundFor(null)} onConfirm={(reason) => refund(refundFor.id, reason)} />}
    </div>
  );
}

function RefundModal({ payment, onClose, onConfirm }: { payment: PaymentRecord; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("Yêu cầu của khách hàng");
  const [partial, setPartial] = useState(false);
  const [amount, setAmount] = useState(payment.amount);
  return (
    <Modal title="Hoàn tiền giao dịch" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-3 text-sm">
          <div className="text-slate-500 text-xs">Hoá đơn</div>
          <div className="font-mono font-semibold">{payment.invoice}</div>
          <div className="text-slate-500 text-xs mt-2">Số tiền gốc</div>
          <div className="font-bold text-slate-800">{payment.amount.toLocaleString("vi-VN")} ₫ · {payment.method}</div>
        </div>
        <Field label="Loại hoàn tiền">
          <div className="flex gap-1.5">
            <button onClick={() => { setPartial(false); setAmount(payment.amount); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${!partial ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>Toàn bộ</button>
            <button onClick={() => setPartial(true)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${partial ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>Một phần</button>
          </div>
        </Field>
        {partial && (
          <Field label="Số tiền hoàn (₫)">
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} max={payment.amount} min={1}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </Field>
        )}
        <Field label="Lý do">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </Field>
      </div>
      <ModalActions onClose={onClose} onSave={() => onConfirm(`${partial ? `${amount.toLocaleString("vi-VN")}₫ — ` : ""}${reason}`)} saveLabel="Xác nhận hoàn tiền" />
    </Modal>
  );
}

function RevenueSection() {
  const r = mockRevenue;
  const max = Math.max(...r.history.map((h) => h.mrr));
  const cards = [
    { label: "MRR", value: `${(r.mrr / 1000000).toFixed(1)}M ₫`, hint: "Doanh thu định kỳ tháng", tone: "from-indigo-500 to-purple-600" },
    { label: "ARR", value: `${(r.arr / 1000000).toFixed(0)}M ₫`, hint: "Doanh thu định kỳ năm", tone: "from-blue-500 to-cyan-600" },
    { label: "Churn rate", value: `${r.churnRate}%`, hint: "Tỷ lệ rời bỏ tháng này", tone: "from-rose-500 to-red-600" },
    { label: "Conversion", value: `${r.conversionRate}%`, hint: "Free → Pro", tone: "from-green-500 to-emerald-600" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-2xl p-4 text-white shadow-md bg-gradient-to-br ${c.tone}`}>
            <div className="text-xs uppercase tracking-wider opacity-80">{c.label}</div>
            <div className="text-2xl font-extrabold mt-1">{c.value}</div>
            <div className="text-[11px] opacity-80 mt-1">{c.hint}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Tăng trưởng MRR (6 tháng)</h3>
            <span className="text-xs text-green-600 font-semibold">↑ +52%</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {r.history.map((h) => (
              <div key={h.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-[10px] text-slate-500 font-semibold">{(h.mrr / 1000000).toFixed(1)}M</div>
                <div className="w-full bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t-lg" style={{ height: `${(h.mrr / max) * 100}%` }} />
                <div className="text-[10px] text-slate-500">{h.month}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Trial 7 ngày</h3>
          <div className="space-y-3">
            <Stat label="Đang trial" value={r.trialActive} />
            <Stat label="Đã chuyển đổi" value={`${r.trialConverted} (${Math.round((r.trialConverted/r.trialActive)*100)}%)`} />
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
              <div className="font-bold flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Anti-abuse đang bật</div>
              <div className="opacity-80 mt-1">Chặn theo email, IP, fingerprint thiết bị · giới hạn 1 trial/người.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CouponsSection() {
  const [items, setItems] = useState<Coupon[]>(mockCoupons);
  const [creating, setCreating] = useState(false);

  const togglePause = (id: string) => {
    setItems((prev) => prev.map((c) => c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c));
    toast.success("Đã cập nhật mã.");
  };
  const remove = (id: string) => { setItems((prev) => prev.filter((c) => c.id !== id)); toast.success("Đã xoá mã."); };
  const copy = (code: string) => { navigator.clipboard?.writeText(code); toast.success(`Đã copy ${code}`); };

  const statusColor: Record<Coupon["status"], string> = {
    active: "bg-green-100 text-green-700",
    expired: "bg-slate-100 text-slate-500",
    paused: "bg-amber-100 text-amber-700",
  };
  const typeLabel: Record<Coupon["type"], string> = { percent: "% giảm giá", fixed: "₫ giảm cố định", trial: "Ngày dùng thử" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition">
          <Plus className="size-4" /> Tạo mã giảm giá
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr><Th>Mã</Th><Th>Loại</Th><Th>Giá trị</Th><Th>Sử dụng</Th><Th>Hết hạn</Th><Th>Trạng thái</Th><Th className="text-right">Hành động</Th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((c) => {
              const pct = Math.min(100, (c.usage / c.limit) * 100);
              return (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <Td><div className="inline-flex items-center gap-2 font-mono font-bold text-slate-800">{c.code}<button onClick={() => copy(c.code)} className="text-slate-400 hover:text-indigo-600"><Copy className="size-3.5" /></button></div></Td>
                  <Td className="text-xs text-slate-600">{typeLabel[c.type]}</Td>
                  <Td className="font-semibold">{c.type === "percent" ? `${c.value}%` : c.type === "trial" ? `${c.value} ngày` : `${c.value.toLocaleString("vi-VN")}₫`}</Td>
                  <Td>
                    <div className="text-xs text-slate-600">{c.usage}/{c.limit}</div>
                    <div className="mt-1 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} /></div>
                  </Td>
                  <Td className="text-xs text-slate-500">{c.expires}</Td>
                  <Td><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${statusColor[c.status]}`}>{c.status}</span></Td>
                  <Td className="text-right">
                    <div className="inline-flex gap-1.5">
                      {c.status !== "expired" && (
                        <ActionButton onClick={() => togglePause(c.id)} title={c.status === "active" ? "Tạm dừng" : "Kích hoạt"} tone={c.status === "active" ? "amber" : "green"}>
                          {c.status === "active" ? <Ban className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                        </ActionButton>
                      )}
                      <ActionButton onClick={() => remove(c.id)} title="Xoá" tone="red"><Trash2 className="size-3.5" /></ActionButton>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {creating && (
        <CouponEditor
          onClose={() => setCreating(false)}
          onSave={(c) => { setItems((p) => [{ ...c, id: `c${Date.now()}`, usage: 0, status: "active" }, ...p]); setCreating(false); toast.success("Đã tạo mã giảm giá."); }}
        />
      )}
    </div>
  );
}

function CouponEditor({ onClose, onSave }: { onClose: () => void; onSave: (c: Omit<Coupon, "id" | "usage" | "status">) => void }) {
  const [code, setCode] = useState("");
  const [type, setType] = useState<Coupon["type"]>("percent");
  const [value, setValue] = useState(20);
  const [limit, setLimit] = useState(100);
  const [expires, setExpires] = useState("2026-12-31");
  const submit = () => {
    if (!code.trim()) { toast.error("Vui lòng nhập mã."); return; }
    onSave({ code: code.trim().toUpperCase(), type, value, limit, expires });
  };
  return (
    <Modal title="Tạo mã giảm giá mới" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Mã" className="md:col-span-2"><Input value={code} onChange={setCode} placeholder="WELCOME30" /></Field>
        <Field label="Loại">
          <div className="flex gap-1.5 flex-wrap">
            {(["percent","fixed","trial"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${type === t ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                {t === "percent" ? "% giảm" : t === "fixed" ? "₫ cố định" : "Trial ngày"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Giá trị">
          <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </Field>
        <Field label="Giới hạn lượt dùng">
          <input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </Field>
        <Field label="Hết hạn">
          <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </Field>
      </div>
      <ModalActions onClose={onClose} onSave={submit} saveLabel="Tạo mã" />
    </Modal>
  );
}

function WebhooksSection() {
  const [provider, setProvider] = useState<"all" | WebhookLog["provider"]>("all");
  const [items, setItems] = useState<WebhookLog[]>(mockWebhooks);
  const [detail, setDetail] = useState<WebhookLog | null>(null);
  const filtered = useMemo(() => items.filter((w) => provider === "all" || w.provider === provider), [items, provider]);

  const retry = (id: string) => {
    setItems((prev) => prev.map((w) => w.id === id ? { ...w, status: "success", responseMs: 180 } : w));
    toast.success("Đã gửi lại webhook.");
  };

  const providerColor: Record<WebhookLog["provider"], string> = {
    Stripe: "bg-violet-100 text-violet-700",
    PayPal: "bg-blue-100 text-blue-700",
    Momo: "bg-pink-100 text-pink-700",
    VNPay: "bg-cyan-100 text-cyan-700",
  };
  const statusColor: Record<WebhookLog["status"], string> = {
    success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    retry: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap">
        {(["all", "Stripe", "PayPal", "Momo", "VNPay"] as const).map((p) => (
          <button key={p} onClick={() => setProvider(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${provider === p ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {p === "all" ? "Tất cả" : p}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr><Th>Thời gian</Th><Th>Nhà cung cấp</Th><Th>Sự kiện</Th><Th>Phản hồi</Th><Th>Trạng thái</Th><Th>Payload ID</Th><Th className="text-right">Hành động</Th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50/60">
                <Td className="text-xs text-slate-600 font-mono">{w.at}</Td>
                <Td><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${providerColor[w.provider]}`}>{w.provider}</span></Td>
                <Td className="font-mono text-xs text-slate-700">{w.event}</Td>
                <Td className={`text-xs ${w.responseMs > 1000 ? "text-amber-600 font-bold" : "text-slate-500"}`}>{w.responseMs}ms</Td>
                <Td><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${statusColor[w.status]}`}>{w.status}</span></Td>
                <Td className="text-xs font-mono text-slate-400 truncate max-w-[160px]">{w.payloadId}</Td>
                <Td className="text-right">
                  <div className="inline-flex gap-1.5">
                    <ActionButton onClick={() => setDetail(w)} title="Xem payload" tone="slate"><Eye className="size-3.5" /></ActionButton>
                    {w.status !== "success" && <ActionButton onClick={() => retry(w.id)} title="Gửi lại" tone="green"><RefreshCw className="size-3.5" /></ActionButton>}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detail && (
        <Modal title={`${detail.provider} · ${detail.event}`} onClose={() => setDetail(null)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-slate-500">Thời gian</div><div className="font-mono">{detail.at}</div></div>
              <div><div className="text-xs text-slate-500">Phản hồi</div><div className="font-semibold">{detail.responseMs}ms</div></div>
              <div><div className="text-xs text-slate-500">Payload ID</div><div className="font-mono break-all">{detail.payloadId}</div></div>
              <div><div className="text-xs text-slate-500">Trạng thái</div><div className="font-semibold uppercase">{detail.status}</div></div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-slate-500 mb-1.5">Payload (mock)</div>
              <pre className="bg-slate-900 text-green-300 text-xs rounded-xl p-4 overflow-auto max-h-72">{JSON.stringify({
                id: detail.payloadId, type: detail.event, created: detail.at, livemode: true,
                data: { object: { id: detail.payloadId, status: detail.status, amount: 99000, currency: "vnd" } },
              }, null, 2)}</pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============ WORDS ============ */

const wordTypes: Word["type"][] = ["NOUN", "VERB", "ADJ", "ADV"];

function WordsPanel() {
  const items = useWords();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [diffFilter, setDiffFilter] = useState<"all" | 1 | 2 | 3 | 4 | 5>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Word | null>(null);
  const [creating, setCreating] = useState(false);
  const [historyOf, setHistoryOf] = useState<Word | null>(null);
  const [importing, setImporting] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const tags = getAllTags();

  const filtered = useMemo(() => items.filter((w) => {
    if (q && !(w.word.toLowerCase().includes(q.toLowerCase()) || w.meaning.toLowerCase().includes(q.toLowerCase()))) return false;
    if (statusFilter !== "all" && (w.status ?? "published") !== statusFilter) return false;
    if (diffFilter !== "all" && (w.difficulty ?? 0) !== diffFilter) return false;
    if (tagFilter !== "all" && !(w.tags ?? []).includes(tagFilter)) return false;
    return true;
  }), [items, q, statusFilter, diffFilter, tagFilter]);

  const remove = (id: string) => { deleteWord(id); toast.success("Đã xoá từ."); };
  const togglePublish = (w: Word) => {
    const next = (w.status ?? "published") === "published" ? "draft" : "published";
    updateWord(w.id, { status: next });
    toast.success(next === "published" ? "Đã xuất bản từ." : "Đã chuyển về Draft.");
  };
  const handleUndo = () => {
    if (undoWords()) toast.success("Đã hoàn tác."); else toast.error("Không có gì để hoàn tác.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <SearchBar value={q} onChange={setQ} placeholder="Tìm từ hoặc nghĩa..." />
        <FilterSelect value={statusFilter} onChange={(v) => setStatusFilter(v as any)}
          options={[["all","Tất cả trạng thái"],["published","Published"],["draft","Draft"]]} />
        <FilterSelect value={String(diffFilter)} onChange={(v) => setDiffFilter(v === "all" ? "all" : (Number(v) as 1|2|3|4|5))}
          options={[["all","Mọi độ khó"],["1","★ 1"],["2","★ 2"],["3","★ 3"],["4","★ 4"],["5","★ 5"]]} />
        <FilterSelect value={tagFilter} onChange={setTagFilter}
          options={[["all","Mọi tag"], ...tags.map((t) => [t, `#${t}`] as [string, string])]} />
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <button onClick={handleUndo} disabled={!canUndoWords()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition">
            <Undo2 className="size-3.5" /> Hoàn tác
          </button>
          <button onClick={() => setImporting(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition">
            <Upload className="size-3.5" /> Import CSV
          </button>
          <button onClick={() => setAiOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition">
            <Sparkles className="size-3.5" /> AI generate
          </button>
          <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition">
            <Plus className="size-4" /> Thêm từ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <Th>Từ</Th><Th>Nghĩa</Th><Th>Loại</Th><Th>Trạng thái</Th>
              <Th>Độ khó</Th><Th>Tags</Th><Th className="text-right">Hành động</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50/60">
                <Td>
                  <div className="font-bold text-slate-800">{w.word}</div>
                  <div className="text-[11px] text-slate-400">{w.phonetic}</div>
                </Td>
                <Td className="text-slate-600">{w.meaning}</Td>
                <Td><span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-100 text-blue-600">{w.type}</span></Td>
                <Td><StatusBadge status={w.status ?? "published"} /></Td>
                <Td><DifficultyDots level={w.difficulty ?? 0} /></Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {(w.tags ?? []).map((t) => (
                      <span key={t} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">#{t}</span>
                    ))}
                  </div>
                </Td>
                <Td className="text-right">
                  <div className="inline-flex gap-1.5">
                    <ActionButton onClick={() => togglePublish(w)} title={(w.status ?? "published") === "published" ? "Chuyển Draft" : "Publish"} tone={(w.status ?? "published") === "published" ? "amber" : "green"}>
                      <Send className="size-3.5" />
                    </ActionButton>
                    <ActionButton onClick={() => setHistoryOf(w)} title="Lịch sử" tone="slate"><History className="size-3.5" /></ActionButton>
                    <ActionButton onClick={() => setEditing(w)} title="Sửa" tone="slate"><Pencil className="size-3.5" /></ActionButton>
                    <ActionButton onClick={() => remove(w.id)} title="Xoá" tone="red"><Trash2 className="size-3.5" /></ActionButton>
                  </div>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (<tr><td colSpan={7} className="p-8 text-center text-sm text-slate-500">Không có từ phù hợp.</td></tr>)}
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

      {historyOf && (
        <VersionHistoryModal
          title={`Lịch sử: ${historyOf.word}`}
          versions={getWordHistory(historyOf.id).map((h) => ({
            at: h.at,
            summary: `${h.snapshot.word} — ${h.snapshot.meaning}`,
            badge: h.snapshot.status ?? "published",
          }))}
          onRestore={(i) => { restoreWordVersion(historyOf.id, i); toast.success("Đã khôi phục phiên bản."); setHistoryOf(null); }}
          onClose={() => setHistoryOf(null)}
        />
      )}

      {importing && <ImportCsvModal onClose={() => setImporting(false)} />}
      {aiOpen && <AiGenerateModal onClose={() => setAiOpen(false)} />}
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
  const [status, setStatus] = useState<"draft" | "published">(initial?.status ?? "draft");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>((initial?.difficulty ?? 3) as 1|2|3|4|5);
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(", "));

  const dup = findDuplicateWord(word, initial?.id);

  const submit = () => {
    if (!word.trim() || !meaning.trim()) { toast.error("Vui lòng nhập từ và nghĩa."); return; }
    if (dup) { toast.error(`Từ "${dup.word}" đã tồn tại.`); return; }
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    onSave({ word: word.trim(), phonetic: phonetic.trim(), meaning: meaning.trim(), type, example: example.trim(), learned, status, difficulty, tags });
  };

  return (
    <Modal title={initial ? "Chỉnh sửa từ" : "Thêm từ mới"} onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Từ">
          <Input value={word} onChange={setWord} placeholder="abandon" />
          {dup && (
            <div className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 inline-flex items-center gap-1.5">
              <AlertCircle className="size-3.5" /> Trùng với từ "{dup.word}" đã có.
            </div>
          )}
        </Field>
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
          <div className="flex gap-1.5">
            {(["draft","published"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${status === s ? (s === "published" ? "bg-green-600 text-white" : "bg-amber-500 text-white") : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{s}</button>
            ))}
          </div>
        </Field>
        <Field label="Độ khó">
          <div className="flex gap-1.5">
            {[1,2,3,4,5].map((n) => (
              <button key={n} type="button" onClick={() => setDifficulty(n as 1|2|3|4|5)}
                className={`size-8 rounded-lg text-xs font-bold transition ${difficulty === n ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{n}</button>
            ))}
          </div>
        </Field>
        <Field label="Đã học">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={learned} onChange={(e) => setLearned(e.target.checked)} className="size-4 rounded border-slate-300 text-indigo-600" />
            Đánh dấu đã học
          </label>
        </Field>
        <Field label="Tags (phân tách bằng dấu phẩy)" className="md:col-span-2">
          <Input value={tagsInput} onChange={setTagsInput} placeholder="common, academic, ielts" />
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

function ImportCsvModal({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("word,phonetic,meaning,type,example\nresilient,/rɪˈzɪliənt/,kiên cường,ADJ,She is a resilient leader.");

  const onFile = async (file: File) => {
    const t = await file.text();
    setText(t);
  };

  const submit = () => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) { toast.error("Không có dữ liệu."); return; }
    const header = lines[0].toLowerCase().includes("word") ? lines.shift()!.split(",").map((s) => s.trim().toLowerCase()) : ["word","phonetic","meaning","type","example"];
    const idx = (k: string) => header.indexOf(k);
    const items: Array<Omit<Word, "id" | "learned">> = [];
    for (const line of lines) {
      const cols = parseCsvLine(line);
      const w = cols[idx("word")] ?? "";
      const meaning = cols[idx("meaning")] ?? "";
      if (!w || !meaning) continue;
      const typeRaw = (cols[idx("type")] ?? "NOUN").toUpperCase();
      const type = (["NOUN","VERB","ADJ","ADV"].includes(typeRaw) ? typeRaw : "NOUN") as Word["type"];
      items.push({
        word: w,
        phonetic: cols[idx("phonetic")] ?? "",
        meaning,
        type,
        example: cols[idx("example")] ?? "",
        status: "draft",
      });
    }
    if (items.length === 0) { toast.error("Không phân tích được dòng nào."); return; }
    const { added, skipped } = bulkAddWords(items);
    toast.success(`Đã import ${added} từ${skipped ? `, bỏ qua ${skipped} từ trùng` : ""}.`);
    onClose();
  };

  return (
    <Modal title="Import từ CSV/Excel" onClose={onClose} wide>
      <div className="space-y-3">
        <p className="text-xs text-slate-500">Định dạng: <code className="bg-slate-100 px-1.5 py-0.5 rounded">word,phonetic,meaning,type,example</code>. Hỗ trợ paste từ Excel (CSV).</p>
        <input type="file" accept=".csv,text/csv,.txt" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          className="text-xs text-slate-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold hover:file:bg-slate-200" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10}
          className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        <div className="text-xs text-slate-500 inline-flex items-center gap-1.5"><AlertCircle className="size-3.5" /> Các từ trùng (theo "word") sẽ bị bỏ qua.</div>
      </div>
      <ModalActions onClose={onClose} onSave={submit} saveLabel="Import" />
    </Modal>
  );
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i+1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function AiGenerateModal({ onClose }: { onClose: () => void }) {
  const [topic, setTopic] = useState("Travel");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) { toast.error("Nhập chủ đề."); return; }
    setLoading(true);
    // Mock generation — produce sample words tagged with topic.
    await new Promise((r) => setTimeout(r, 700));
    const samples = SAMPLE_BANK.slice(0, Math.max(1, Math.min(20, count))).map((s, i) => ({
      ...s,
      status: "draft" as const,
      difficulty,
      tags: [topic.trim().toLowerCase(), "ai-generated"],
      example: `${s.example} (chủ đề: ${topic.trim()}) [#${i+1}]`,
    }));
    const { added, skipped } = bulkAddWords(samples);
    toast.success(`AI đã tạo ${added} từ${skipped ? `, ${skipped} từ trùng đã bỏ qua` : ""}.`);
    setLoading(false);
    onClose();
  };

  return (
    <Modal title="AI Generate Vocabulary" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Chủ đề"><Input value={topic} onChange={setTopic} placeholder="Travel, Business, Technology..." /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Số từ">
            <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </Field>
          <Field label="Độ khó">
            <div className="flex gap-1.5">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setDifficulty(n as 1|2|3|4|5)}
                  className={`size-8 rounded-lg text-xs font-bold transition ${difficulty === n ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{n}</button>
              ))}
            </div>
          </Field>
        </div>
        <div className="text-xs text-slate-500 bg-purple-50 border border-purple-100 rounded-lg p-3 inline-flex items-start gap-2">
          <Sparkles className="size-4 text-purple-600 shrink-0 mt-0.5" />
          <span>Từ được tạo ở trạng thái <b>Draft</b>. Bạn có thể duyệt và publish sau.</span>
        </div>
      </div>
      <ModalActions onClose={onClose} onSave={generate} saveLabel={loading ? "Đang tạo..." : "Tạo từ"} />
    </Modal>
  );
}

const SAMPLE_BANK: Array<Omit<Word, "id" | "learned" | "status" | "difficulty" | "tags">> = [
  { word: "itinerary", phonetic: "/aɪˈtɪnərəri/", meaning: "lịch trình", type: "NOUN", example: "Plan a flexible itinerary." },
  { word: "embark", phonetic: "/ɪmˈbɑːk/", meaning: "khởi hành, bắt đầu", type: "VERB", example: "We embarked on a new journey." },
  { word: "scenic", phonetic: "/ˈsiːnɪk/", meaning: "có cảnh đẹp", type: "ADJ", example: "A scenic mountain road." },
  { word: "negotiate", phonetic: "/nɪˈɡəʊʃieɪt/", meaning: "đàm phán", type: "VERB", example: "They negotiated a deal." },
  { word: "leverage", phonetic: "/ˈliːvərɪdʒ/", meaning: "tận dụng", type: "VERB", example: "Leverage your strengths." },
  { word: "innovative", phonetic: "/ˈɪnəveɪtɪv/", meaning: "đổi mới", type: "ADJ", example: "An innovative product." },
  { word: "deploy", phonetic: "/dɪˈplɔɪ/", meaning: "triển khai", type: "VERB", example: "Deploy the new feature." },
  { word: "robust", phonetic: "/rəʊˈbʌst/", meaning: "vững chắc", type: "ADJ", example: "A robust system." },
  { word: "framework", phonetic: "/ˈfreɪmwɜːk/", meaning: "khung, nền tảng", type: "NOUN", example: "Use a modern framework." },
  { word: "concise", phonetic: "/kənˈsaɪs/", meaning: "ngắn gọn", type: "ADJ", example: "Keep it concise." },
  { word: "diligent", phonetic: "/ˈdɪlɪdʒənt/", meaning: "siêng năng", type: "ADJ", example: "A diligent student." },
  { word: "endeavor", phonetic: "/ɪnˈdevə/", meaning: "nỗ lực", type: "NOUN", example: "A noble endeavor." },
  { word: "facilitate", phonetic: "/fəˈsɪlɪteɪt/", meaning: "tạo điều kiện", type: "VERB", example: "Facilitate the meeting." },
  { word: "intricate", phonetic: "/ˈɪntrɪkət/", meaning: "phức tạp", type: "ADJ", example: "An intricate design." },
  { word: "luminous", phonetic: "/ˈluːmɪnəs/", meaning: "rực sáng", type: "ADJ", example: "Luminous stars." },
  { word: "meticulous", phonetic: "/məˈtɪkjʊləs/", meaning: "tỉ mỉ", type: "ADJ", example: "Meticulous notes." },
  { word: "navigate", phonetic: "/ˈnævɪɡeɪt/", meaning: "điều hướng", type: "VERB", example: "Navigate the city." },
  { word: "optimize", phonetic: "/ˈɒptɪmaɪz/", meaning: "tối ưu", type: "VERB", example: "Optimize the query." },
  { word: "pivotal", phonetic: "/ˈpɪvətl/", meaning: "then chốt", type: "ADJ", example: "A pivotal moment." },
  { word: "quintessential", phonetic: "/ˌkwɪntɪˈsenʃl/", meaning: "tinh túy nhất", type: "ADJ", example: "The quintessential example." },
];

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
  const [historyOf, setHistoryOf] = useState<VocabSet | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [diffFilter, setDiffFilter] = useState<"all" | 1 | 2 | 3 | 4 | 5>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");

  const tags = getAllSetTags();
  const filtered = sets.filter((s) => {
    if (statusFilter !== "all" && (s.status ?? "published") !== statusFilter) return false;
    if (diffFilter !== "all" && (s.difficulty ?? 0) !== diffFilter) return false;
    if (tagFilter !== "all" && !(s.tags ?? []).includes(tagFilter)) return false;
    return true;
  });

  const handleDelete = (id: string, title: string) => { deleteVocabSet(id); toast.success(`Đã xoá "${title}"`); };
  const togglePublish = (s: VocabSet) => {
    const next = (s.status ?? "published") === "published" ? "draft" : "published";
    updateVocabSet(s.id, { status: next });
    toast.success(next === "published" ? "Đã xuất bản bộ từ." : "Đã chuyển về Draft.");
  };
  const handleUndo = () => { if (undoSets()) toast.success("Đã hoàn tác."); else toast.error("Không có gì để hoàn tác."); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <FilterSelect value={statusFilter} onChange={(v) => setStatusFilter(v as any)}
          options={[["all","Tất cả trạng thái"],["published","Published"],["draft","Draft"]]} />
        <FilterSelect value={String(diffFilter)} onChange={(v) => setDiffFilter(v === "all" ? "all" : (Number(v) as 1|2|3|4|5))}
          options={[["all","Mọi độ khó"],["1","★ 1"],["2","★ 2"],["3","★ 3"],["4","★ 4"],["5","★ 5"]]} />
        <FilterSelect value={tagFilter} onChange={setTagFilter}
          options={[["all","Mọi tag"], ...tags.map((t) => [t, `#${t}`] as [string, string])]} />
        <div className="ml-auto flex items-center gap-2">
          <button onClick={handleUndo} disabled={!canUndoSets()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition">
            <Undo2 className="size-3.5" /> Hoàn tác
          </button>
          <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition">
            <Plus className="size-4" /> Thêm bộ từ
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr><Th>Bộ từ</Th><Th>Trạng thái</Th><Th>Độ khó</Th><Th>Tags</Th><Th>Số từ</Th><Th className="text-right">Hành động</Th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-xl bg-gradient-to-r ${s.color}`} />
                    <div>
                      <div className="font-semibold text-slate-800">{s.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{s.description}</div>
                    </div>
                  </div>
                </Td>
                <Td><StatusBadge status={s.status ?? "published"} /></Td>
                <Td><DifficultyDots level={s.difficulty ?? 0} /></Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {(s.tags ?? []).map((t) => (
                      <span key={t} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">#{t}</span>
                    ))}
                  </div>
                </Td>
                <Td className="text-slate-600">{s.learned}/{s.total}</Td>
                <Td className="text-right">
                  <div className="inline-flex gap-1.5">
                    <ActionButton onClick={() => togglePublish(s)} title={(s.status ?? "published") === "published" ? "Chuyển Draft" : "Publish"} tone={(s.status ?? "published") === "published" ? "amber" : "green"}>
                      <Send className="size-3.5" />
                    </ActionButton>
                    <ActionButton onClick={() => setHistoryOf(s)} title="Lịch sử" tone="slate"><History className="size-3.5" /></ActionButton>
                    <ActionButton onClick={() => setEditing(s)} title="Sửa" tone="slate"><Pencil className="size-3.5" /></ActionButton>
                    <ActionButton onClick={() => handleDelete(s.id, s.title)} title="Xoá" tone="red"><Trash2 className="size-3.5" /></ActionButton>
                  </div>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (<tr><td colSpan={6} className="p-8 text-center text-sm text-slate-500">Chưa có bộ từ phù hợp.</td></tr>)}
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

      {historyOf && (
        <VersionHistoryModal
          title={`Lịch sử: ${historyOf.title}`}
          versions={getSetHistory(historyOf.id).map((h) => ({
            at: h.at,
            summary: `${h.snapshot.title} — ${h.snapshot.wordIds.length} từ`,
            badge: h.snapshot.status ?? "published",
          }))}
          onRestore={(i) => { restoreSetVersion(historyOf.id, i); toast.success("Đã khôi phục phiên bản."); setHistoryOf(null); }}
          onClose={() => setHistoryOf(null)}
        />
      )}
    </div>
  );
}

function SetEditor({
  initial, onSave, onClose,
}: {
  initial: VocabSet | null;
  onSave: (data: { title: string; description: string; color: string; wordIds: string[]; status: "draft" | "published"; difficulty: 1|2|3|4|5; tags: string[] }) => void;
  onClose: () => void;
}) {
  const allWords = useWords();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [color, setColor] = useState(initial?.color ?? gradientPresets[0]);
  const [wordIds, setWordIds] = useState<string[]>(initial?.wordIds ?? []);
  const [wordQ, setWordQ] = useState("");
  const [status, setStatus] = useState<"draft" | "published">(initial?.status ?? "draft");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>((initial?.difficulty ?? 3) as 1|2|3|4|5);
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(", "));

  const dup = findDuplicateSet(title, initial?.id);

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
    if (dup) { toast.error(`Bộ từ "${dup.title}" đã tồn tại.`); return; }
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    onSave({ title: title.trim(), description: description.trim(), color, wordIds, status, difficulty, tags });
  };

  return (
    <Modal title={initial ? "Chỉnh sửa bộ từ" : "Thêm bộ từ mới"} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tên bộ từ">
            <Input value={title} onChange={setTitle} placeholder="Business English" />
            {dup && (
              <div className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 inline-flex items-center gap-1.5">
                <AlertCircle className="size-3.5" /> Trùng với bộ "{dup.title}".
              </div>
            )}
          </Field>
          <Field label="Màu nền">
            <div className="flex gap-2 flex-wrap">
              {gradientPresets.map((g) => (
                <button key={g} type="button" onClick={() => setColor(g)}
                  className={`size-8 rounded-xl bg-gradient-to-r ${g} ring-2 transition ${color === g ? "ring-indigo-500 scale-110" : "ring-transparent"}`} />
              ))}
            </div>
          </Field>
          <Field label="Trạng thái">
            <div className="flex gap-1.5">
              {(["draft","published"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${status === s ? (s === "published" ? "bg-green-600 text-white" : "bg-amber-500 text-white") : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{s}</button>
              ))}
            </div>
          </Field>
          <Field label="Độ khó">
            <div className="flex gap-1.5">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setDifficulty(n as 1|2|3|4|5)}
                  className={`size-8 rounded-lg text-xs font-bold transition ${difficulty === n ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{n}</button>
              ))}
            </div>
          </Field>
          <Field label="Tags (phân tách bằng dấu phẩy)" className="md:col-span-2">
            <Input value={tagsInput} onChange={setTagsInput} placeholder="beginner, ielts, business" />
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

function FilterSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
      {options.map(([v, label]) => (<option key={v} value={v}>{label}</option>))}
    </select>
  );
}

function StatusBadge({ status }: { status: "draft" | "published" }) {
  if (status === "published")
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-green-100 text-green-700"><CheckCircle2 className="size-3" /> PUBLISHED</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-amber-100 text-amber-700"><Pencil className="size-3" /> DRAFT</span>;
}

function DifficultyDots({ level }: { level: number }) {
  if (!level) return <span className="text-xs text-slate-400">—</span>;
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((n) => (
        <span key={n} className={`size-2 rounded-full ${n <= level ? "bg-indigo-500" : "bg-slate-200"}`} />
      ))}
    </div>
  );
}

function VersionHistoryModal({ title, versions, onRestore, onClose }: {
  title: string;
  versions: { at: string; summary: string; badge: "draft" | "published" }[];
  onRestore: (index: number) => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      {versions.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-8">Chưa có phiên bản nào được lưu. Mỗi lần chỉnh sửa sẽ tạo một snapshot mới.</div>
      ) : (
        <ul className="divide-y divide-slate-100 -mx-2">
          {versions.map((v, i) => (
            <li key={i} className="flex items-center gap-3 px-2 py-3">
              <div className="size-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center"><Clock className="size-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">{v.summary}</div>
                <div className="text-[11px] text-slate-500">{new Date(v.at).toLocaleString("vi-VN")}</div>
              </div>
              <StatusBadge status={v.badge} />
              <button onClick={() => onRestore(i)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition">
                <RotateCcw className="size-3.5" /> Khôi phục
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60 -mx-6 -mb-5 mt-5">
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Đóng</button>
      </div>
    </Modal>
  );
}

// ============ Security ============

type SecSection = "twofa" | "audit" | "rate" | "captcha" | "session" | "device" | "ip";

const secSections: { id: SecSection; label: string; icon: typeof Shield }[] = [
  { id: "twofa", label: "2FA Admin", icon: Lock },
  { id: "audit", label: "Audit / Action logs", icon: Activity },
  { id: "rate", label: "Rate limiting", icon: TrendingUp },
  { id: "captcha", label: "CAPTCHA", icon: ShieldCheck },
  { id: "session", label: "Session", icon: Monitor },
  { id: "device", label: "Device", icon: Smartphone },
  { id: "ip", label: "IP blacklist", icon: Globe },
];

function SecurityPanel() {
  const [section, setSection] = useState<SecSection>("twofa");
  const stats = [
    { label: "Admin bật 2FA", value: `${mockAdminTwoFactor.filter((t) => t.enabled).length}/${mockAdminTwoFactor.length}`, accent: "bg-emerald-100 text-emerald-700", icon: Lock },
    { label: "Audit log (24h)", value: mockAuditLogs.length, accent: "bg-indigo-100 text-indigo-700", icon: Activity },
    { label: "IP bị chặn", value: mockIpBlocklist.length, accent: "bg-rose-100 text-rose-700", icon: Ban },
    { label: "Phiên đang mở", value: mockSessions.length, accent: "bg-amber-100 text-amber-700", icon: Monitor },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className={`inline-flex size-9 items-center justify-center rounded-xl ${s.accent}`}>
              <s.icon className="size-4" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 inline-flex gap-1 flex-wrap">
        {secSections.map((s) => {
          const active = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                active ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <s.icon className="size-4" />
              {s.label}
            </button>
          );
        })}
      </div>

      {section === "twofa" && <TwoFactorSection />}
      {section === "audit" && <AuditLogSection />}
      {section === "rate" && <RateLimitSection />}
      {section === "captcha" && <CaptchaSection />}
      {section === "session" && <SessionSection />}
      {section === "device" && <DeviceSection />}
      {section === "ip" && <IpBlocklistSection />}
    </div>
  );
}

function userName(id: string) {
  return mockUsers.find((u) => u.id === id)?.name ?? id;
}
function userEmail(id: string) {
  return mockUsers.find((u) => u.id === id)?.email ?? "—";
}

function TwoFactorSection() {
  const [rows, setRows] = useState(mockAdminTwoFactor);
  const adminLike = mockUsers.filter((u) => u.role === "Admin" || u.role === "Moderator");
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-start gap-3">
        <div className="size-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><Lock className="size-5" /></div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800">Xác thực hai yếu tố (2FA)</div>
          <div className="text-xs text-slate-500">Bắt buộc bật cho mọi tài khoản Admin & Moderator. Hỗ trợ TOTP (Google Authenticator), SMS, Email OTP.</div>
        </div>
        <button onClick={() => toast.success("Đã yêu cầu tất cả admin bật 2FA trong 24h")} className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700">Buộc bật toàn bộ</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr><Th>Admin</Th><Th>Phương thức</Th><Th>Đăng ký</Th><Th>Lần dùng cuối</Th><Th>Trạng thái</Th><Th className="text-right">Hành động</Th></tr>
          </thead>
          <tbody>
            {adminLike.map((u) => {
              const tf = rows.find((r) => r.userId === u.id);
              const enabled = tf?.enabled ?? false;
              return (
                <tr key={u.id} className="border-t border-slate-100">
                  <Td>
                    <div className="font-medium text-slate-800">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email} · <span className={`px-1.5 py-0.5 rounded ${roleColor[u.role]}`}>{u.role}</span></div>
                  </Td>
                  <Td>{tf?.method ?? "—"}</Td>
                  <Td className="text-slate-500">{tf?.enrolledAt ?? "—"}</Td>
                  <Td className="text-slate-500">{tf?.lastUsedAt ?? "—"}</Td>
                  <Td>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {enabled ? "Đang bật" : "Chưa bật"}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <div className="inline-flex gap-1">
                      <ActionButton tone="amber" title="Reset 2FA" onClick={() => toast.success(`Đã reset 2FA cho ${u.name}`)}><RotateCcw className="size-3.5" /></ActionButton>
                      <ActionButton
                        tone={enabled ? "red" : "green"}
                        title={enabled ? "Tắt 2FA" : "Bật 2FA"}
                        onClick={() => {
                          setRows((prev) => {
                            const exists = prev.find((r) => r.userId === u.id);
                            if (exists) return prev.map((r) => r.userId === u.id ? { ...r, enabled: !r.enabled } : r);
                            return [...prev, { userId: u.id, enabled: true, method: "TOTP", enrolledAt: new Date().toISOString().slice(0, 10), lastUsedAt: "—" }];
                          });
                          toast.success(`Đã ${enabled ? "tắt" : "bật"} 2FA cho ${u.name}`);
                        }}
                      >
                        <Power className="size-3.5" />
                      </ActionButton>
                    </div>
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

function AuditLogSection() {
  const [q, setQ] = useState("");
  const [sev, setSev] = useState<"all" | AuditLog["severity"]>("all");
  const [scope, setScope] = useState<"all" | "admin">("all");
  const filtered = useMemo(() => {
    return mockAuditLogs.filter((l) => {
      if (sev !== "all" && l.severity !== sev) return false;
      if (scope === "admin" && l.actorRole !== "Admin") return false;
      if (q && !`${l.actor} ${l.action} ${l.target} ${l.ip}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, sev, scope]);
  const sevColor: Record<AuditLog["severity"], string> = {
    info: "bg-slate-100 text-slate-700",
    warn: "bg-amber-100 text-amber-700",
    critical: "bg-rose-100 text-rose-700",
  };
  function exportLogs() {
    const headers = ["at", "actor", "role", "action", "target", "ip", "severity"];
    const rows = filtered.map((l) => [l.at, l.actor, l.actorRole, l.action, l.target, l.ip, l.severity]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "audit-logs.csv"; a.click(); URL.revokeObjectURL(url);
    toast.success("Đã xuất CSV audit logs");
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-2">
        <SearchBar value={q} onChange={setQ} placeholder="Tìm theo actor, action, IP..." />
        <FilterSelect value={sev} onChange={(v) => setSev(v as typeof sev)} options={[["all", "Mọi mức"], ["info", "Info"], ["warn", "Warn"], ["critical", "Critical"]]} />
        <FilterSelect value={scope} onChange={(v) => setScope(v as typeof scope)} options={[["all", "Tất cả actor"], ["admin", "Chỉ Admin"]]} />
        <button onClick={exportLogs} className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200">
          <Download className="size-3.5" /> Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr><Th>Thời gian</Th><Th>Actor</Th><Th>Action</Th><Th>Mục tiêu</Th><Th>IP</Th><Th>Mức</Th></tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <Td className="text-slate-500 whitespace-nowrap">{l.at}</Td>
                <Td>
                  <div className="font-medium text-slate-800">{l.actor}</div>
                  <div className="text-xs"><span className={`px-1.5 py-0.5 rounded ${roleColor[l.actorRole]}`}>{l.actorRole}</span></div>
                </Td>
                <Td><code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs">{l.action}</code></Td>
                <Td className="text-slate-700">{l.target}</Td>
                <Td className="text-slate-500 font-mono text-xs">{l.ip}</Td>
                <Td><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sevColor[l.severity]}`}>{l.severity}</span></Td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><Td className="text-slate-400 py-6 text-center" >Không có log phù hợp.</Td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RateLimitSection() {
  const [rules, setRules] = useState<RateLimitRule[]>(mockRateLimits);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-start gap-3">
        <div className="size-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center"><TrendingUp className="size-5" /></div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800">Rate limiting</div>
          <div className="text-xs text-slate-500">Giới hạn số request theo IP / user / global cho từng endpoint. Áp dụng ở edge.</div>
        </div>
        <button onClick={() => toast.success("Đã thêm rule mới (mock)")} className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1.5">
          <Plus className="size-3.5" /> Thêm rule
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr><Th>Endpoint</Th><Th>Giới hạn</Th><Th>Phạm vi</Th><Th>Hits 24h</Th><Th>Bị chặn 24h</Th><Th>Bật</Th></tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <Td><code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs">{r.endpoint}</code></Td>
                <Td className="text-slate-700">{r.limit} / {r.window}</Td>
                <Td><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{r.scope}</span></Td>
                <Td className="text-slate-700">{r.hits24h.toLocaleString()}</Td>
                <Td className={r.blocked24h > 0 ? "text-rose-600 font-semibold" : "text-slate-500"}>{r.blocked24h}</Td>
                <Td>
                  <button
                    onClick={() => {
                      setRules((p) => p.map((x) => x.id === r.id ? { ...x, enabled: !x.enabled } : x));
                      toast.success(`Đã ${r.enabled ? "tắt" : "bật"} rule`);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${r.enabled ? "bg-emerald-500" : "bg-slate-300"}`}
                  >
                    <span className={`inline-block size-4 transform rounded-full bg-white transition ${r.enabled ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CaptchaSection() {
  const [cfg, setCfg] = useState(mockCaptcha);
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center"><ShieldCheck className="size-5" /></div>
          <div className="flex-1">
            <div className="font-semibold text-slate-800">CAPTCHA bảo vệ form</div>
            <div className="text-xs text-slate-500">Chống bot đăng ký, brute-force và spam form công khai.</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <Field label="Provider">
            <select
              value={cfg.provider}
              onChange={(e) => setCfg({ ...cfg, provider: e.target.value as CaptchaConfig["provider"] })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option>Turnstile</option>
              <option>hCaptcha</option>
              <option>reCAPTCHA v3</option>
            </select>
          </Field>
          <Field label={`Ngưỡng tin cậy (${cfg.threshold})`}>
            <input type="range" min={0} max={1} step={0.05} value={cfg.threshold} onChange={(e) => setCfg({ ...cfg, threshold: Number(e.target.value) })} className="w-full" />
          </Field>
          <Field label="Kết quả 24h">
            <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50">
              <span className="font-bold text-slate-800">{cfg.challenges24h.toLocaleString()}</span>
              <span className="text-slate-500"> challenges · </span>
              <span className="text-emerald-600 font-semibold">{cfg.passRate}%</span>
              <span className="text-slate-500"> pass</span>
            </div>
          </Field>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="font-semibold text-slate-800 mb-3">Áp dụng cho</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {cfg.enabledOn.map((e) => (
            <label key={e.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50 cursor-pointer">
              <span className="text-sm font-medium text-slate-700">{e.label}</span>
              <input
                type="checkbox"
                checked={e.on}
                onChange={() => setCfg({ ...cfg, enabledOn: cfg.enabledOn.map((x) => x.id === e.id ? { ...x, on: !x.on } : x) })}
                className="size-4 accent-indigo-600"
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={() => toast.success("Đã lưu cấu hình CAPTCHA")} className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700">Lưu cấu hình</button>
        </div>
      </div>
    </div>
  );
}

function SessionSection() {
  const [sessions, setSessions] = useState<AdminSession[]>(mockSessions);
  function revoke(id: string) {
    setSessions((p) => p.filter((s) => s.id !== id));
    toast.success("Đã đăng xuất phiên");
  }
  function revokeAll(userId: string) {
    setSessions((p) => p.filter((s) => s.userId !== userId || s.current));
    toast.success(`Đã đăng xuất tất cả phiên khác của ${userName(userId)}`);
  }
  const grouped = useMemo(() => {
    const map = new Map<string, AdminSession[]>();
    sessions.forEach((s) => { const arr = map.get(s.userId) ?? []; arr.push(s); map.set(s.userId, arr); });
    return Array.from(map.entries());
  }, [sessions]);
  return (
    <div className="space-y-4">
      {grouped.map(([uid, list]) => (
        <div key={uid} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center"><Monitor className="size-5" /></div>
            <div className="flex-1">
              <div className="font-semibold text-slate-800">{userName(uid)}</div>
              <div className="text-xs text-slate-500">{userEmail(uid)} · {list.length} phiên</div>
            </div>
            <button onClick={() => revokeAll(uid)} className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100">Đăng xuất phiên khác</button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr><Th>Thiết bị</Th><Th>IP</Th><Th>Vị trí</Th><Th>Bắt đầu</Th><Th>Hoạt động cuối</Th><Th className="text-right">Hành động</Th></tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <Td>
                    <div className="font-medium text-slate-800">{s.device}</div>
                    {s.current && <span className="text-xs text-emerald-600 font-semibold">● phiên hiện tại</span>}
                  </Td>
                  <Td className="font-mono text-xs text-slate-500">{s.ip}</Td>
                  <Td className="text-slate-500">{s.location}</Td>
                  <Td className="text-slate-500 whitespace-nowrap">{s.startedAt}</Td>
                  <Td className="text-slate-500 whitespace-nowrap">{s.lastSeenAt}</Td>
                  <Td className="text-right">
                    <ActionButton tone="red" title="Đăng xuất" onClick={() => revoke(s.id)}><LogIn className="size-3.5 rotate-180" /></ActionButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function DeviceSection() {
  const [devices, setDevices] = useState<TrustedDevice[]>(mockDevices);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-start gap-3">
        <div className="size-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center"><Smartphone className="size-5" /></div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800">Thiết bị tin cậy</div>
          <div className="text-xs text-slate-500">Quản lý thiết bị đã được người dùng đánh dấu tin cậy (bỏ qua 2FA trong 30 ngày).</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr><Th>Người dùng</Th><Th>Thiết bị</Th><Th>OS</Th><Th>Fingerprint</Th><Th>Tin cậy từ</Th><Th>Dùng gần nhất</Th><Th className="text-right">Hành động</Th></tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id} className="border-t border-slate-100">
                <Td>
                  <div className="font-medium text-slate-800">{userName(d.userId)}</div>
                  <div className="text-xs text-slate-500">{userEmail(d.userId)}</div>
                </Td>
                <Td className="text-slate-800">{d.name}</Td>
                <Td className="text-slate-500">{d.os}</Td>
                <Td className="font-mono text-xs text-slate-500">{d.fingerprint}</Td>
                <Td className="text-slate-500">{d.trustedAt}</Td>
                <Td className="text-slate-500">{d.lastUsedAt}</Td>
                <Td className="text-right">
                  <div className="inline-flex gap-1">
                    <ActionButton
                      tone={d.trusted ? "amber" : "green"}
                      title={d.trusted ? "Bỏ tin cậy" : "Đánh dấu tin cậy"}
                      onClick={() => {
                        setDevices((p) => p.map((x) => x.id === d.id ? { ...x, trusted: !x.trusted } : x));
                        toast.success(`Đã ${d.trusted ? "bỏ" : "đánh dấu"} tin cậy`);
                      }}
                    >
                      <ShieldCheck className="size-3.5" />
                    </ActionButton>
                    <ActionButton tone="red" title="Gỡ thiết bị" onClick={() => { setDevices((p) => p.filter((x) => x.id !== d.id)); toast.success("Đã gỡ thiết bị"); }}>
                      <Trash2 className="size-3.5" />
                    </ActionButton>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IpBlocklistSection() {
  const [list, setList] = useState<IpBlockEntry[]>(mockIpBlocklist);
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");
  const [perm, setPerm] = useState(false);
  function add() {
    if (!ip.trim()) { toast.error("Nhập IP"); return; }
    setList((p) => [{
      id: `ip${Date.now()}`, ip: ip.trim(), reason: reason || "Chặn thủ công",
      addedBy: "an.nguyen@example.com", addedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      expiresAt: perm ? "permanent" : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16).replace("T", " "),
      hits: 0,
    }, ...p]);
    setIp(""); setReason(""); setPerm(false);
    toast.success("Đã thêm IP vào blacklist");
  }
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="size-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center"><Ban className="size-5" /></div>
          <div className="flex-1">
            <div className="font-semibold text-slate-800">IP Blacklist</div>
            <div className="text-xs text-slate-500">Chặn IP độc hại ở tầng edge — request từ IP này sẽ trả 403 ngay lập tức.</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-[1fr_2fr_auto_auto] gap-2">
          <Input value={ip} onChange={setIp} placeholder="IP / CIDR (vd: 45.117.80.91)" />
          <Input value={reason} onChange={setReason} placeholder="Lý do" />
          <label className="inline-flex items-center gap-2 px-3 rounded-xl border border-slate-200 text-sm">
            <input type="checkbox" checked={perm} onChange={(e) => setPerm(e.target.checked)} className="size-4 accent-indigo-600" />
            Vĩnh viễn
          </label>
          <button onClick={add} className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 inline-flex items-center gap-1.5">
            <Plus className="size-4" /> Chặn
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr><Th>IP</Th><Th>Lý do</Th><Th>Thêm bởi</Th><Th>Lúc</Th><Th>Hết hạn</Th><Th>Hits</Th><Th className="text-right">Hành động</Th></tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <Td className="font-mono text-sm text-slate-800">{e.ip}</Td>
                <Td className="text-slate-700">{e.reason}</Td>
                <Td className="text-slate-500">{e.addedBy}</Td>
                <Td className="text-slate-500 whitespace-nowrap">{e.addedAt}</Td>
                <Td>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${e.expiresAt === "permanent" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                    {e.expiresAt === "permanent" ? "Vĩnh viễn" : e.expiresAt}
                  </span>
                </Td>
                <Td className="text-slate-700 font-semibold">{e.hits}</Td>
                <Td className="text-right">
                  <ActionButton tone="green" title="Bỏ chặn" onClick={() => { setList((p) => p.filter((x) => x.id !== e.id)); toast.success("Đã bỏ chặn IP"); }}>
                    <CheckCircle2 className="size-3.5" />
                  </ActionButton>
                </Td>
              </tr>
            ))}
            {list.length === 0 && <tr><Td className="text-slate-400 py-6 text-center">Chưa có IP nào bị chặn.</Td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
