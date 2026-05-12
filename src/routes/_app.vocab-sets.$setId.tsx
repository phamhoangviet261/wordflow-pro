import { createFileRoute, Link, useRouter, notFound } from "@tanstack/react-router";
import { ArrowLeft, ListChecks, Play, Volume2, Sparkles, Trash2, SearchX, Home, RotateCcw, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/vocab-sets/$setId")({
  head: () => ({
    meta: [
      { title: "Chi tiết bộ từ — VocabLab" },
      { name: "description", content: "Xem chi tiết và luyện tập bộ từ vựng." },
    ],
  }),
  component: SetDetailPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <SetNotFound
        title="Có lỗi khi tải bộ từ"
        description={error.message || "Đã xảy ra sự cố không mong muốn."}
        onRetry={() => { router.invalidate(); reset(); }}
      />
    );
  },
  notFoundComponent: () => {
    const { setId } = Route.useParams();
    return (
      <SetNotFound
        description={`Bộ từ vựng với mã "${setId}" không tồn tại hoặc đã bị xoá.`}
      />
    );
  },
});

const typeColors: Record<string, string> = {
  NOUN: "bg-blue-100 text-blue-600",
  VERB: "bg-purple-100 text-purple-600",
  ADJ: "bg-orange-100 text-orange-600",
  ADV: "bg-teal-100 text-teal-600",
};

function SetNotFound({
  title = "Không tìm thấy bộ từ vựng",
  description = "Đường dẫn này có thể đã bị thay đổi, hoặc bộ từ đã bị xoá.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center">
      <div className="mx-auto size-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-6">
        <SearchX className="size-10 text-blue-600" />
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">{title}</h1>
      <p className="mt-3 text-slate-500">{description}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/vocab-sets"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-2xl shadow-md transition"
        >
          <ArrowLeft className="size-4" /> Về danh sách bộ từ
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-2xl border border-slate-200 transition"
        >
          <Home className="size-4" /> Trang chủ
        </Link>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-2xl border border-slate-200 transition"
          >
            <RotateCcw className="size-4" /> Thử lại
          </button>
        )}
      </div>
    </div>
  );
}

function SetDetailPage() {
  const { setId } = Route.useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["vocab-set", setId],
    queryFn: async () => {
      const res = await fetch(`/api/vocab-sets/${setId}`);
      return res.json();
    },
  });

  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      window.speechSynthesis.speak(u);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="size-10 animate-spin text-green-500" />
        <p className="text-slate-500 font-medium">Đang tải bộ từ...</p>
      </div>
    );
  }

  if (isError || (response && !response.ok)) {
    const msg = response?.error?.message || (error as Error)?.message || "Không thể tải bộ từ.";
    return (
      <SetNotFound
        title="Có lỗi khi tải bộ từ"
        description={msg}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["vocab-set", setId] })}
      />
    );
  }

  const set = response.data;
  const setWords = set.words || [];
  const learned = set.learned || 0;
  const pct = set.total > 0 ? Math.round((learned / set.total) * 100) : 0;

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
              onClick={() => {
                // TODO: Implement DELETE /api/vocab-sets/:setId
                toast.error("Tính năng xoá đang được phát triển.");
              }}
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