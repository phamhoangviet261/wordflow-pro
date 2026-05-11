import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Coins, Sparkles, Package, Snowflake, Palette, RotateCcw,
  Flame, CheckCircle2, Gift, Trophy, AlertTriangle, X,
} from "lucide-react";
import {
  useGamification, shopItems, redeemItem, claimQuest,
  STREAK_MILESTONES, nextMilestone, type ShopItem,
} from "@/lib/gamification-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/store")({
  head: () => ({
    meta: [
      { title: "Phần thưởng — VocabLab" },
      { name: "description", content: "Cửa hàng đổi xu, nhiệm vụ hằng ngày và streak." },
    ],
  }),
  component: RewardsPage,
});

const iconMap = {
  sparkles: Sparkles, package: Package, snowflake: Snowflake, palette: Palette, rotate: RotateCcw,
};

const categoryLabels: Record<string, string> = {
  all: "Tất cả",
  boost: "Trợ năng",
  content: "Nội dung",
  cosmetic: "Giao diện",
  utility: "Tiện ích",
};

function RewardsPage() {
  const s = useGamification();
  const [cat, setCat] = useState<string>("all");
  const [confirm, setConfirm] = useState<ShopItem | null>(null);

  const filtered = cat === "all" ? shopItems : shopItems.filter((i) => i.category === cat);
  const milestone = nextMilestone(s.streak);
  const milestonePct = Math.min(100, Math.round((s.streak / milestone) * 100));

  const handleRedeem = (item: ShopItem) => {
    const r = redeemItem(item.id);
    if (r.ok) toast.success(`Đã đổi: ${item.name}`);
    else toast.error(r.reason ?? "Đổi không thành công.");
    setConfirm(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Phần thưởng</h1>
          <p className="text-sm text-slate-500">Đổi xu lấy phần thưởng, hoàn thành nhiệm vụ và giữ streak mỗi ngày.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 font-bold px-4 py-2 rounded-2xl">
            <Coins className="size-5 text-amber-500" />
            <span className="tabular-nums">{s.coins}</span>
            <span className="text-xs font-medium opacity-70">xu</span>
          </div>
        </div>
      </div>

      {/* Streak card */}
      <section className="rounded-3xl p-6 bg-gradient-to-br from-orange-500 via-orange-500 to-rose-500 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid md:grid-cols-3 gap-6 items-center">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Flame className="size-8" />
            </div>
            <div>
              <div className="text-sm opacity-90">Streak hiện tại</div>
              <div className="text-4xl font-extrabold tabular-nums">{s.streak} <span className="text-base font-medium opacity-90">ngày</span></div>
              <div className="text-xs opacity-80 mt-0.5">Kỷ lục: {s.bestStreak} ngày</div>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between text-xs opacity-90">
              <span>Mốc tiếp theo</span>
              <span className="tabular-nums">{s.streak}/{milestone} ngày</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-white/20 overflow-hidden relative">
              <div className="h-full bg-white transition-[width] duration-700" style={{ width: `${milestonePct}%` }} />
              <div className="absolute inset-0 animate-shimmer opacity-40" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {STREAK_MILESTONES.map((m) => (
                <span
                  key={m}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
                    s.streak >= m ? "bg-white text-orange-600" : "bg-white/15 text-white/90"
                  }`}
                >
                  <Trophy className="size-3" /> {m} ngày
                </span>
              ))}
            </div>
            <p className="text-sm opacity-90 mt-3">"Mỗi ngày một chút, vài tháng nữa bạn sẽ thấy khác biệt rõ rệt."</p>
          </div>
        </div>
      </section>

      {/* Daily quests */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-800 inline-flex items-center gap-2">
            <Gift className="size-5 text-purple-500" /> Nhiệm vụ hằng ngày
          </h2>
          <span className="text-xs text-slate-500">Làm mới sau mỗi 24 giờ</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {s.quests.map((q) => {
            const pct = Math.min(100, Math.round((q.progress / q.goal) * 100));
            return (
              <div
                key={q.id}
                className={`rounded-2xl border p-4 bg-white transition hover:shadow-md ${
                  q.claimed ? "opacity-70" : "border-slate-100"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      {q.title}
                      {q.completed && <CheckCircle2 className="size-4 text-emerald-500" />}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{q.description}</div>
                  </div>
                  <div className="text-right text-xs text-slate-500 shrink-0">
                    <div className="inline-flex items-center gap-1 text-purple-600 font-bold"><Sparkles className="size-3" />+{q.rewardXp}</div>
                    <div className="inline-flex items-center gap-1 text-amber-600 font-bold"><Coins className="size-3" />+{q.rewardCoins}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-[width] duration-700 ${q.completed ? "bg-emerald-500" : "bg-gradient-to-r from-purple-500 to-indigo-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 tabular-nums w-12 text-right">{q.progress}/{q.goal}</span>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => {
                      if (claimQuest(q.id)) toast.success(`Nhận thưởng: ${q.title}`);
                    }}
                    disabled={!q.completed || q.claimed}
                    className="text-xs font-bold rounded-full px-4 py-1.5 bg-emerald-500 text-white shadow shadow-emerald-500/20 hover:scale-[1.03] transition disabled:opacity-40 disabled:hover:scale-100 disabled:bg-slate-300"
                  >
                    {q.claimed ? "Đã nhận" : q.completed ? "Nhận thưởng" : "Chưa xong"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reward shop */}
      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-lg font-bold text-slate-800 inline-flex items-center gap-2">
            <Coins className="size-5 text-amber-500" /> Cửa hàng phần thưởng
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.keys(categoryLabels).map((k) => (
              <button
                key={k}
                onClick={() => setCat(k)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  cat === k ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {categoryLabels[k]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((it) => {
            const Icon = iconMap[it.icon];
            const owned = s.inventory.includes(it.id) && (it.category === "cosmetic" || it.category === "content");
            const cant = s.coins < it.cost;
            return (
              <div
                key={it.id}
                className="group rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition relative overflow-hidden"
              >
                <div className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-amber-100 to-transparent opacity-0 group-hover:opacity-100 transition" />
                <div className="relative">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 flex items-center justify-center">
                    <Icon className="size-6" />
                  </div>
                  <div className="mt-3 font-bold text-slate-800">{it.name}</div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed min-h-[36px]">{it.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 font-extrabold text-amber-700">
                      <Coins className="size-4" /> {it.cost}
                    </span>
                    <button
                      onClick={() => setConfirm(it)}
                      disabled={owned}
                      className={`text-xs font-bold rounded-full px-4 py-2 transition ${
                        owned
                          ? "bg-emerald-100 text-emerald-700 cursor-default"
                          : cant
                          ? "bg-slate-100 text-slate-400"
                          : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow shadow-amber-500/30 hover:scale-[1.05]"
                      }`}
                    >
                      {owned ? "Đã sở hữu" : cant ? "Thiếu xu" : "Đổi ngay"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Confirm */}
      {confirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-[min(420px,92vw)] p-6 animate-pop-in">
            <div className="flex items-start gap-3">
              <div className="size-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800">Xác nhận đổi thưởng</div>
                <p className="text-sm text-slate-500 mt-1">
                  Đổi <span className="font-semibold text-slate-700">{confirm.name}</span> với giá{" "}
                  <span className="font-bold text-amber-600">{confirm.cost} xu</span>?
                </p>
              </div>
              <button onClick={() => setConfirm(null)} className="size-8 rounded-full hover:bg-slate-100 inline-flex items-center justify-center text-slate-500">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setConfirm(null)} className="rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Huỷ
              </button>
              <button
                onClick={() => handleRedeem(confirm)}
                className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 text-sm font-bold shadow shadow-amber-500/30 hover:scale-[1.02] transition"
              >
                Đổi ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
