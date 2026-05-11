import { useSyncExternalStore } from "react";
import { vocabSets as seed, type VocabSet } from "./mock-data";

let sets: VocabSet[] = [...seed];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

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

export function addVocabSet(input: { title: string; description: string; color: string; wordIds: string[] }) {
  const id = (typeof crypto !== "undefined" && "randomUUID" in crypto) ? crypto.randomUUID() : String(Date.now());
  const s: VocabSet = {
    id,
    title: input.title,
    description: input.description,
    color: input.color,
    wordIds: input.wordIds,
    total: input.wordIds.length,
    learned: 0,
  };
  sets = [s, ...sets];
  emit();
  return s;
}

export function deleteVocabSet(id: string) {
  sets = sets.filter((s) => s.id !== id);
  emit();
}

export function updateVocabSet(id: string, patch: Partial<Omit<VocabSet, "id">>) {
  sets = sets.map((s) => {
    if (s.id !== id) return s;
    const next = { ...s, ...patch } as VocabSet;
    if (patch.wordIds) next.total = patch.wordIds.length;
    return next;
  });
  emit();
}