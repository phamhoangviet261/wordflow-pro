import { useSyncExternalStore } from "react";

export type Quest = {
  id: string;
  title: string;
  description: string;
  goal: number;
  progress: number;
  rewardXp: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
};

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: "sparkles" | "package" | "snowflake" | "palette" | "rotate";
  category: "boost" | "content" | "cosmetic" | "utility";
};

export type GamificationState = {
  xp: number;
  level: number;
  coins: number;
  streak: number;
  bestStreak: number;
  lastActiveDay: string;
  quests: Quest[];
  inventory: string[];
};

export const xpForLevel = (level: number) => 50 + level * 50;
export const xpProgressInLevel = (xp: number, level: number) => {
  let consumed = 0;
  for (let l = 1; l < level; l++) consumed += xpForLevel(l);
  return Math.max(0, xp - consumed);
};

const seedQuests = (): Quest[] => [
  { id: "q1", title: "Học 20 từ mới", description: "Hoàn thành các bài học từ vựng.", goal: 20, progress: 6, rewardXp: 50, rewardCoins: 30, completed: false, claimed: false },
  { id: "q2", title: "Ôn 10 từ", description: "Xem lại từ đã học.", goal: 10, progress: 4, rewardXp: 30, rewardCoins: 20, completed: false, claimed: false },
  { id: "q3", title: "5 đáp án đúng liên tiếp", description: "Trả lời chính xác trong các mini-game.", goal: 5, progress: 5, rewardXp: 40, rewardCoins: 25, completed: true, claimed: false },
  { id: "q4", title: "Chơi 1 mini-game", description: "Hoàn thành 1 phiên flashcard hoặc quiz.", goal: 1, progress: 0, rewardXp: 25, rewardCoins: 15, completed: false, claimed: false },
];

export const shopItems: ShopItem[] = [
  { id: "ai-explain", name: "Giải thích AI", description: "Mở khoá 5 lượt giải thích chi tiết bằng AI.", cost: 80, icon: "sparkles", category: "boost" },
  { id: "pack-business", name: "Bộ từ Business+", description: "Bộ từ vựng cao cấp cho người đi làm.", cost: 250, icon: "package", category: "content" },
  { id: "pack-ielts", name: "Bộ từ IELTS 7+", description: "500 từ học thuật chọn lọc.", cost: 320, icon: "package", category: "content" },
  { id: "streak-freeze", name: "Streak Freeze", description: "Bảo vệ streak 1 ngày khi bạn nghỉ học.", cost: 60, icon: "snowflake", category: "utility" },
  { id: "theme-sunset", name: "Theme Sunset", description: "Giao diện cam-tím rực rỡ.", cost: 150, icon: "palette", category: "cosmetic" },
  { id: "theme-ocean", name: "Theme Ocean", description: "Giao diện xanh biển dịu mắt.", cost: 150, icon: "palette", category: "cosmetic" },
  { id: "extra-retry", name: "Thêm 3 lượt thử", description: "Tăng lượt làm lại bài hôm nay.", cost: 40, icon: "rotate", category: "utility" },
];

let state: GamificationState = {
  xp: 320,
  level: 3,
  coins: 240,
  streak: 5,
  bestStreak: 12,
  lastActiveDay: new Date().toISOString().slice(0, 10),
  quests: seedQuests(),
  inventory: [],
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const sub = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export type FloatEvent =
  | { kind: "xp"; amount: number; id: number }
  | { kind: "coins"; amount: number; id: number };
const floatListeners = new Set<(e: FloatEvent) => void>();
let floatId = 0;
export const onFloat = (cb: (e: FloatEvent) => void) => { floatListeners.add(cb); return () => { floatListeners.delete(cb); }; };
const emitFloat = (e: { kind: "xp" | "coins"; amount: number }) => {
  const ev: FloatEvent = { kind: e.kind, amount: e.amount, id: ++floatId };
  floatListeners.forEach((l) => l(ev));
};

export type LevelUpEvent = { newLevel: number };
const levelUpListeners = new Set<(e: LevelUpEvent) => void>();
export const onLevelUp = (cb: (e: LevelUpEvent) => void) => { levelUpListeners.add(cb); return () => { levelUpListeners.delete(cb); }; };

function recomputeLevel() {
  let xpLeft = state.xp;
  let level = 1;
  while (xpLeft >= xpForLevel(level)) {
    xpLeft -= xpForLevel(level);
    level += 1;
  }
  if (level > state.level) {
    state = { ...state, level };
    levelUpListeners.forEach((l) => l({ newLevel: level }));
  } else {
    state = { ...state, level };
  }
}

export function awardXp(amount: number, opts?: { silent?: boolean }) {
  if (amount <= 0) return;
  state = { ...state, xp: state.xp + amount };
  recomputeLevel();
  if (!opts?.silent) emitFloat({ kind: "xp", amount });
  emit();
}

export function awardCoins(amount: number, opts?: { silent?: boolean }) {
  if (amount <= 0) return;
  state = { ...state, coins: state.coins + amount };
  if (!opts?.silent) emitFloat({ kind: "coins", amount });
  emit();
}

export function spendCoins(amount: number) {
  if (state.coins < amount) return false;
  state = { ...state, coins: state.coins - amount };
  emit();
  return true;
}

export function redeemItem(id: string): { ok: boolean; reason?: string } {
  const item = shopItems.find((i) => i.id === id);
  if (!item) return { ok: false, reason: "Không tìm thấy phần thưởng." };
  if (state.inventory.includes(id) && item.category !== "boost" && item.category !== "utility") {
    return { ok: false, reason: "Bạn đã sở hữu phần thưởng này." };
  }
  if (state.coins < item.cost) return { ok: false, reason: "Không đủ xu." };
  state = {
    ...state,
    coins: state.coins - item.cost,
    inventory: state.inventory.includes(id) ? state.inventory : [...state.inventory, id],
  };
  emit();
  return { ok: true };
}

export function questProgress(id: string, delta: number) {
  state = {
    ...state,
    quests: state.quests.map((q) => {
      if (q.id !== id) return q;
      const progress = Math.min(q.goal, q.progress + delta);
      return { ...q, progress, completed: progress >= q.goal };
    }),
  };
  emit();
}

export function claimQuest(id: string) {
  const q = state.quests.find((x) => x.id === id);
  if (!q || !q.completed || q.claimed) return false;
  state = { ...state, quests: state.quests.map((x) => (x.id === id ? { ...x, claimed: true } : x)) };
  awardXp(q.rewardXp);
  awardCoins(q.rewardCoins);
  emit();
  return true;
}

export function bumpStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastActiveDay === today) return;
  const next = state.streak + 1;
  state = {
    ...state,
    streak: next,
    bestStreak: Math.max(state.bestStreak, next),
    lastActiveDay: today,
  };
  emit();
}

export function getState() { return state; }
export function useGamification() {
  return useSyncExternalStore(sub, () => state, () => state);
}

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
export const nextMilestone = (streak: number) =>
  STREAK_MILESTONES.find((m) => m > streak) ?? streak;
