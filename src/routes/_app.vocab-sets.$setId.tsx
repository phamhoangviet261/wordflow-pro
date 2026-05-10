import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ListChecks, Play, Volume2, Sparkles, Trash2 } from "lucide-react";
import { words as allWords } from "@/lib/mock-data";
import { useVocabSets, deleteVocabSet } from "@/lib/sets-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/vocab-sets/$setId")({
  head: () => ({
    meta: [
      { title: "Chi tiết bộ từ — VocabLab" },
      { name: "description", content: "Xem chi tiết và luyện tập bộ từ vựng." },
    ],
  }),
  component: SetDetailPage,
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto py-12 text-center">
      <h2 className="text-xl font-bold">Không tìm thấy bộ từ</h2>
      <Link to="/vocab-sets" className="text-blue-600 hover:underline">Quay lại</Link>
    </div>
  ),
});

const typeColors: Record<string, string> = {
  NOUN: "bg-blue-100 text-blue-600",
  VERB: "bg-purple-100 text-purple-600",
  ADJ: "bg-orange-100 text-orange-600",
  ADV: "bg-teal-100 text-teal-600",
};

function SetDetailPage() {
  const { setId } = Route.useParams();
  const router = useRouter();
  const sets = useVocabSets();
  const set = sets.find((s) => s.id === setId);

  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      window.speechSynthesis.speak(u);
    }
  };

  if (!set) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-800">Bộ từ không tồn tại</h2>
        <Link to="/vocab-sets" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
          <ArrowLeft className="size-4" /> Về danh sách
        </Link>
      </div>
    );
  }

  const setWords = set.wordIds.map((id) => allWords.find((w) => w.id === id)).filter(Boolean) as typeof allWords;
  const learned = setWords.filter((w) => w.learned).length;
  const pct = setWords.length > 0 ? Math.round((learned / setWords.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/vocab-sets" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Tất cả bộ từ
      </Link>

      <div className={`rounded-2xl p-6 text-white shadow-lg bg-gradient-to-r ${set.color}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">{set.title}</h1>
            <p className="opacity-90 mt-1 max-w-xl">{set.description}</p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="inline-flex items-center gap-1.5"><ListChecks className="size-4" /> {setWords.length} từ</span>
              <span>•</span>
              <span>{learned} đã học</span>
              <span>•</span>
              <span>{pct}%</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/games/flashcard" className="inline-flex items-center gap-2 bg-white text-slate-800 font-bold text-sm px-4 py-2.5 rounded-2xl shadow-md hover:bg-slate-100 transition">
              <Play className="size-4" /> Luyện tập
            </Link>
            <button
              onClick={() => { deleteVocabSet(set.id); toast.success(`Đã xoá "${set.title}"`); router.navigate({ to: "/vocab-sets" }); }}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-sm px-4 py-2.5 rounded-2xl backdrop-blur transition"
            >
              <Trash2 className="size-4" /> Xoá
            </button>
          </div>
        </div>
        <div className="mt-5 h-2 rounded-full bg-white/25 overflow-hidden">
          <div className="h-full bg-white" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 inline-flex items-center gap-2">
            <Sparkles className="size-4 text-green-500" /> Danh sách từ
          </h2>
          <span className="text-xs text-slate-500">{setWords.length} từ</span>
        </div>
        {setWords.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">Bộ này chưa có từ nào.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {setWords.map((w) => (
              <li key={w.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/60 transition">
                <button
                  onClick={() => speak(w.word)}
                  className="size-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center shrink-0"
                  aria-label={`Nghe ${w.word}`}
                >
                  <Volume2 className="size-4" />
                </button>
                <div className="w-40 shrink-0">
                  <div className="font-bold text-slate-800">{w.word}</div>
                  <div className="text-xs text-slate-400">{w.phonetic}</div>
                </div>
                <div className="flex-1 text-sm text-slate-600">{w.meaning}</div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${typeColors[w.type]}`}>{w.type}</span>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${w.learned ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"}`}>
                  {w.learned ? "Đã học" : "Chưa học"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}