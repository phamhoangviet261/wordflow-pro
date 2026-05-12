import { createFileRoute } from "@tanstack/react-router";
import { Mic, Play, MessageSquare, Clock, Star, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_app/ielts/skills/speaking")({
  head: () => ({
    meta: [
      { title: "IELTS Speaking — VocabLab" },
      { name: "description", content: "Luyện nói IELTS theo chủ đề và nhận xét từ AI." },
    ],
  }),
  component: SpeakingPage,
});

function SpeakingPage() {
  const parts = [
    { title: "Part 1: Introduction", desc: "Hội thoại ngắn về bản thân, gia đình, công việc.", items: "20+ Topics" },
    { title: "Part 2: Long Turn", desc: "Nói về một chủ đề cụ thể trong 2 phút dựa trên gợi ý.", items: "15+ Cue Cards" },
    { title: "Part 3: Discussion", desc: "Thảo luận sâu hơn về các vấn đề xã hội liên quan Part 2.", items: "10+ Subjects" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
          <Mic className="size-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Speaking Practice</h1>
          <p className="text-slate-500 font-medium">Tự tin giao tiếp và chinh phục giám khảo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {parts.map((p, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">
                {p.items}
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800">{p.title}</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">{p.desc}</p>
            <button className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-2xl hover:bg-orange-600 transition-colors">
              <Mic className="size-4" /> Bắt đầu luyện nói
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 size-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex-1 space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
             AI Scoring System
          </div>
          <h2 className="text-3xl font-black">AI Feedback & Scoring</h2>
          <p className="opacity-90 max-w-lg">
            Ghi âm bài nói của bạn và nhận đánh giá band điểm tức thì từ công nghệ AI tiên tiến.
          </p>
        </div>
        <button className="bg-white text-orange-700 font-black px-8 py-4 rounded-2xl hover:scale-105 transition-transform relative z-10">
          THỬ NGAY <ArrowRight className="size-5 inline ml-1" />
        </button>
      </div>
    </div>
  );
}
