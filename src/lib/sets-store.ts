import { useSyncExternalStore } from "react";
import { vocabSets as seed, type VocabSet } from "./mock-data";

let sets: VocabSet[] = seed.map((s, i) => ({
  status: i % 3 === 0 ? "draft" : "published",
  difficulty: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
  tags: i % 2 === 0 ? ["beginner"] : ["intermediate"],
  ...s,
}));
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const history: Map<string, { at: string; snapshot: VocabSet }[]> = new Map();
const HIST_LIMIT = 20;
const snap = (s: VocabSet) => {
  const arr = history.get(s.id) ?? [];
  arr.unshift({ at: new Date().toISOString(), snapshot: { ...s } });
  if (arr.length > HIST_LIMIT) arr.length = HIST_LIMIT;
  history.set(s.id, arr);
};
const undoStack: VocabSet[][] = [];
const UNDO_LIMIT = 30;
const pushUndo = () => {
  undoStack.push(sets.map((s) => ({ ...s })));
  if (undoStack.length > UNDO_LIMIT) undoStack.shift();
};

export function getSetHistory(id: string) { return history.get(id) ?? []; }
export function restoreSetVersion(id: string, index: number) {
  const arr = history.get(id);
  if (!arr || !arr[index]) return;
  pushUndo();
  const snapshot = arr[index].snapshot;
  sets = sets.map((s) => (s.id === id ? { ...snapshot } : s));
  emit();
}
export function canUndoSets() { return undoStack.length > 0; }
export function undoSets() {
  const prev = undoStack.pop();
  if (!prev) return false;
  sets = prev;
  emit();
  return true;
}
export function findDuplicateSet(title: string, excludeId?: string): VocabSet | undefined {
  const t = title.trim().toLowerCase();
  if (!t) return undefined;
  return sets.find((s) => s.title.trim().toLowerCase() === t && s.id !== excludeId);
}
export function getAllSetTags(): string[] {
  const set = new Set<string>();
  sets.forEach((s) => (s.tags ?? []).forEach((t) => set.add(t)));
  return Array.from(set).sort();
}

export function useVocabSets(): VocabSet[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => sets,
    () => sets,
  );
}

export function getVocabSet(id: string): VocabSet | undefined {
  return sets.find((s) => s.id === id);
}

export function addVocabSet(input: { title: string; description: string; color: string; wordIds: string[]; status?: "draft" | "published"; difficulty?: 1|2|3|4|5; tags?: string[] }) {
  pushUndo();
  const id = (typeof crypto !== "undefined" && "randomUUID" in crypto) ? crypto.randomUUID() : String(Date.now());
  const s: VocabSet = {
    id,
    title: input.title,
    description: input.description,
    color: input.color,
    wordIds: input.wordIds,
    total: input.wordIds.length,
    learned: 0,
    status: input.status ?? "draft",
    difficulty: input.difficulty,
    tags: input.tags,
  };
  sets = [s, ...sets];
  emit();
  return s;
}

export function deleteVocabSet(id: string) {
  pushUndo();
  sets = sets.filter((s) => s.id !== id);
  emit();
}

export function updateVocabSet(id: string, patch: Partial<Omit<VocabSet, "id">>) {
  pushUndo();
  const cur = sets.find((s) => s.id === id);
  if (cur) snap(cur);
  sets = sets.map((s) => {
    if (s.id !== id) return s;
    const next = { ...s, ...patch } as VocabSet;
    if (patch.wordIds) next.total = patch.wordIds.length;
    return next;
  });
  emit();
}