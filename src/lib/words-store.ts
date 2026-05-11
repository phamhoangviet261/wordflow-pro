import { useSyncExternalStore } from "react";
import { words as seed, type Word } from "./mock-data";

let words: Word[] = seed.map((w, i) => ({
  status: i % 4 === 0 ? "draft" : "published",
  difficulty: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
  tags: i % 2 === 0 ? ["common"] : ["academic"],
  ...w,
}));
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

// Per-word version history (snapshots of previous values, newest first).
const history: Map<string, { at: string; snapshot: Word }[]> = new Map();
const HIST_LIMIT = 20;
const snap = (w: Word) => {
  const arr = history.get(w.id) ?? [];
  arr.unshift({ at: new Date().toISOString(), snapshot: { ...w } });
  if (arr.length > HIST_LIMIT) arr.length = HIST_LIMIT;
  history.set(w.id, arr);
};

// Undo stack: snapshot of full list before each mutation.
const undoStack: Word[][] = [];
const UNDO_LIMIT = 30;
const pushUndo = () => {
  undoStack.push(words.map((w) => ({ ...w })));
  if (undoStack.length > UNDO_LIMIT) undoStack.shift();
};

export function getWordHistory(id: string) {
  return history.get(id) ?? [];
}
export function restoreWordVersion(id: string, index: number) {
  const arr = history.get(id);
  if (!arr || !arr[index]) return;
  pushUndo();
  const snapshot = arr[index].snapshot;
  words = words.map((w) => (w.id === id ? { ...snapshot } : w));
  emit();
}
export function canUndoWords() { return undoStack.length > 0; }
export function undoWords() {
  const prev = undoStack.pop();
  if (!prev) return false;
  words = prev;
  emit();
  return true;
}

export function findDuplicateWord(value: string, excludeId?: string): Word | undefined {
  const v = value.trim().toLowerCase();
  if (!v) return undefined;
  return words.find((w) => w.word.trim().toLowerCase() === v && w.id !== excludeId);
}
export function getAllTags(): string[] {
  const set = new Set<string>();
  words.forEach((w) => (w.tags ?? []).forEach((t) => set.add(t)));
  return Array.from(set).sort();
}
export function bulkAddWords(items: Array<Omit<Word, "id" | "learned"> & { learned?: boolean }>): { added: number; skipped: number } {
  pushUndo();
  let added = 0, skipped = 0;
  const next: Word[] = [];
  for (const it of items) {
    if (findDuplicateWord(it.word)) { skipped++; continue; }
    const id = (typeof crypto !== "undefined" && "randomUUID" in crypto) ? crypto.randomUUID() : String(Date.now() + Math.random());
    next.push({ id, learned: false, status: "draft", ...it });
    added++;
  }
  words = [...next, ...words];
  emit();
  return { added, skipped };
}

export function useWords(): Word[] {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => words,
    () => words,
  );
}

export function getAllWords(): Word[] { return words; }

export function addWord(input: Omit<Word, "id" | "learned"> & { learned?: boolean }): Word {
  pushUndo();
  const id = (typeof crypto !== "undefined" && "randomUUID" in crypto) ? crypto.randomUUID() : String(Date.now());
  const w: Word = { id, learned: false, status: "draft", ...input };
  words = [w, ...words];
  emit();
  return w;
}

export function updateWord(id: string, patch: Partial<Omit<Word, "id">>) {
  pushUndo();
  const cur = words.find((w) => w.id === id);
  if (cur) snap(cur);
  words = words.map((w) => (w.id === id ? { ...w, ...patch } : w));
  emit();
}

export function deleteWord(id: string) {
  pushUndo();
  words = words.filter((w) => w.id !== id);
  emit();
}
