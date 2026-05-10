import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, X, RotateCcw, Volume2, Trophy } from "lucide-react";
import { words as allWords, type Word } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/games/flashcard")({
  head: () => ({
    meta: [
      { title: "Flashcard — VocabLab" },
      { name: "description", content: "Lật thẻ ghi nhớ từ vựng nhanh chóng." },
    ],
  }),
  component: FlashcardGame,
});

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function FlashcardGame() {
  const router = useRouter();
  const deck: Word[] = useMemo(() => allWords.slice(0, 8), []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // results: undefined | true (known) | false (unknown)
  const [results, setResults] = useState<(boolean | undefined)[]>(() => deck.map(() => undefined));

  const total = deck.length;
  const current = deck[index];
  const answered = results.filter((r) => r !== undefined).length;
  const correct = results.filter((r) => r === true).length;
  const progress = Math.round((answered / total) * 100);
  const finished = answered === total;

  const go = (next: number) => {
    setFlipped(false);
    setIndex(Math.max(0, Math.min(total - 1, next)));
  };

  const mark = (known: boolean) => {
    setResults((prev) => {
      const copy = [...prev];
      copy[index] = known;
      return copy;
    });
    if (index < total - 1) {
      setTimeout(() => go(index + 1), 250);
    } else {
      setFlipped(false);
    }
  };

  const reset = () => {
    setIndex(0);
    setFlipped(false);
    setResults(deck.map(() => undefined));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.history.back()}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Quay lại
        </button>
        <Link
          to="/games"
          className="text-sm text-purple-600 font-medium hover:underline"
        >
          Tất cả game
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Flashcard</h1>
        <p className="text-sm text-slate-500">Nhấn vào thẻ để lật. Đánh dấu bạn đã biết hay chưa.</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <div className="text-sm font-semibold text-slate-700 shrink-0">
          {Math.min(index + 1, total)}/{total}
        </div>
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm text-slate-500 shrink-0">
          <span className="text-green-600 font-semibold">{correct}</span> /{" "}
          <span className="text-rose-500 font-semibold">{answered - correct}</span>
        </div>
      </div>

      {/* Card */}
      <div className="[perspective:1200px]">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="relative w-full h-[340px] md:h-[380px] rounded-3xl text-left"
        >
          <div
            className={`absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d] ${
              flipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            {/* Front */}
            <div className="absolute inset-0 [backface-visibility:hidden] rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl shadow-purple-500/30 p-8 flex flex-col items-center justify-center">
              <span className="absolute top-4 left-5 text-xs uppercase tracking-wider opacity-80">
                {current.type}
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  speak(current.word);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    speak(current.word);
                  }
                }}
                className="absolute top-4 right-5 size-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 cursor-pointer"
                aria-label="Phát âm"
              >
                <Volume2 className="size-5" />
              </span>
              <div className="text-4xl md:text-5xl font-extrabold">{current.word}</div>
              <div className="mt-3 text-base opacity-90">{current.phonetic}</div>
              <div className="absolute bottom-4 text-xs opacity-80">Nhấn để xem nghĩa</div>
            </div>
            {/* Back */}
            <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] rounded-3xl bg-white border border-slate-200 shadow-xl p-8 flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase tracking-wider text-purple-600 font-semibold">
                {current.type}
              </span>
              <div className="mt-2 text-3xl md:text-4xl font-bold text-slate-800">
                {current.meaning}
              </div>
              <div className="mt-4 text-slate-500 italic max-w-md">
                "{current.example}"
              </div>
              <div className="absolute bottom-4 text-xs text-slate-400">Nhấn để lật lại</div>
            </div>
          </div>
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => mark(false)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-100 text-rose-600 font-semibold py-4 hover:bg-rose-200 transition"
        >
          <X className="size-5" /> Chưa thuộc
        </button>
        <button
          onClick={() => mark(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-100 text-green-600 font-semibold py-4 hover:bg-green-200 transition"
        >
          <Check className="size-5" /> Đã thuộc
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <RotateCcw className="size-4" /> Làm lại
        </button>
        <button
          onClick={() => go(index + 1)}
          disabled={index >= total - 1}
          className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 text-white px-5 py-3 text-sm font-semibold hover:bg-purple-700 disabled:opacity-40"
        >
          Next <ArrowRight className="size-4" />
        </button>
      </div>

      {finished && (
        <div className="rounded-3xl p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Trophy className="size-6" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg">Hoàn thành!</div>
            <div className="text-sm opacity-90">
              Bạn thuộc {correct}/{total} từ ({Math.round((correct / total) * 100)}%).
            </div>
          </div>
          <button
            onClick={reset}
            className="bg-white text-emerald-700 font-semibold px-4 py-2 rounded-2xl text-sm"
          >
            Chơi lại
          </button>
        </div>
      )}
    </div>
  );
}
