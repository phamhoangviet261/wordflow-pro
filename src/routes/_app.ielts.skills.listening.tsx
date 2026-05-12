import { createFileRoute } from "@tanstack/react-router";
import { Headphones, Play, BookOpen, Clock, Star, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_app/ielts/skills/listening")({
  head: () => ({
    meta: [
      { title: "IELTS Listening — VocabLab" },
      { name: "description", content: "Luyện nghe IELTS theo từng Part và dạng bài." },
    ],
  }),
  component: ListeningPage,
});

function ListeningPage() {
  const parts = [
    { title: "Part 1: Social Context", desc: "Hội thoại giữa 2 người về chủ đề đời thường.", items: 15 },
    { title: "Part 2: Monologue", desc: "Một bài nói về chủ đề xã hội, hướng dẫn, du lịch.", items: 12 },
    { title: "Part 3: Educational", desc: "Thảo luận giữa nhóm người về học thuật.", items: 10 },
    { title: "Part 4: Academic Lecture", desc: "Bài giảng về một chủ đề chuyên môn.", items: 8 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
          <Headphones className="size-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Listening Practice</h1>
          <p className="text-slate-500 font-medium">Chinh phục kỹ năng nghe với lộ trình chi tiết.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parts.map((p, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                {p.items} Modules
              </div>
              <Star className="size-4 text-amber-400 fill-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{p.title}</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">{p.desc}</p>
            <button className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-2xl hover:bg-blue-600 transition-colors">
              <Play className="size-4 fill-current" /> Bắt đầu luyện tập
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 size-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex-1 space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
            <Clock className="size-3" /> Full Test Simulation
          </div>
          <h2 className="text-3xl font-black">Làm bài thi thử 40 phút</h2>
          <p className="opacity-90 max-w-lg">
            Trải nghiệm áp lực phòng thi với bài Listening chuẩn format IELTS 2026.
          </p>
        </div>
        <button className="bg-white text-blue-700 font-black px-8 py-4 rounded-2xl hover:scale-105 transition-transform relative z-10">
          VÀO THI THỬ <ArrowRight className="size-5 inline ml-1" />
        </button>
      </div>
    </div>
  );
}
