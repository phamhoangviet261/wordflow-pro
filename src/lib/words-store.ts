import { useSyncExternalStore } from "react";
import { words as seed, type Word } from "./mock-data";

let words: Word[] = [...seed];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useWords(): Word[] {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => words,
    () => words,
  );
}

export function getAllWords(): Word[] { return words; }

export function addWord(input: Omit<Word, "id" | "learned"> & { learned?: boolean }): Word {
  const id = (typeof crypto !== "undefined" && "randomUUID" in crypto) ? crypto.randomUUID() : String(Date.now());
  const w: Word = { id, learned: false, ...input };
  words = [w, ...words];
  emit();
  return w;
}

export function updateWord(id: string, patch: Partial<Omit<Word, "id">>) {
  words = words.map((w) => (w.id === id ? { ...w, ...patch } : w));
  emit();
}

export function deleteWord(id: string) {
  words = words.filter((w) => w.id !== id);
  emit();
}
