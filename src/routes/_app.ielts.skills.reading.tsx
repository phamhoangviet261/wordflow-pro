import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Search, Eye, Clock, Star, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_app/ielts/skills/reading")({
  head: () => ({
    meta: [
      { title: "IELTS Reading — VocabLab" },
      { name: "description", content: "Luyện đọc IELTS theo từng dạng bài và kỹ thuật làm bài." },
    ],
  }),
  component: ReadingPage,
});

function ReadingPage() {
  const techniques = [
    { title: "Skimming & Scanning", desc: "Kỹ năng tìm ý chính và thông tin chi tiết cực nhanh.", icon: Eye },
    { title: "True/False/Not Given", desc: "Xác định tính chính xác của thông tin trong văn bản.", icon: Search },
    { title: "Matching Headings", desc: "Nối tiêu đề phù hợp cho từng đoạn văn.", icon: BookOpen },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
          <BookOpen className="size-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Reading Mastery</h1>
          <p className="text-slate-500 font-medium">Làm chủ các bài đọc học thuật khó nhất.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {techniques.map((t, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <t.icon className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{t.title}</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">{t.desc}</p>
            <button className="mt-6 w-full flex items-center justify-center gap-2 border-2 border-slate-100 text-slate-800 font-bold py-3 rounded-2xl hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all">
              Luyện kỹ năng
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 size-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex-1 space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
            60 Minutes Simulation
          </div>
          <h2 className="text-3xl font-black">Academic Reading Test</h2>
          <p className="opacity-90 max-w-lg">
            Thử thách với 3 bài đọc dài và 40 câu hỏi chuẩn format IELTS.
          </p>
        </div>
        <button className="bg-white text-emerald-700 font-black px-8 py-4 rounded-2xl hover:scale-105 transition-transform relative z-10">
          BẮT ĐẦU ĐỌC <ArrowRight className="size-5 inline ml-1" />
        </button>
      </div>
    </div>
  );
}
