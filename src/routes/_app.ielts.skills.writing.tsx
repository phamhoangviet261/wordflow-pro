import { createFileRoute } from "@tanstack/react-router";
import { PenTool, FileText, BarChart3, Clock, Star, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_app/ielts/skills/writing")({
  head: () => ({
    meta: [
      { title: "IELTS Writing — VocabLab" },
      { name: "description", content: "Luyện viết IELTS Task 1 và Task 2 với bài mẫu và hướng dẫn." },
    ],
  }),
  component: WritingPage,
});

function WritingPage() {
  const tasks = [
    { title: "Task 1: Data Analysis", desc: "Mô tả biểu đồ đường, cột, tròn, bảng hoặc quy trình.", icon: BarChart3, type: "Academic" },
    { title: "Task 2: Essay Writing", desc: "Viết bài luận nghị luận về một vấn đề xã hội.", icon: FileText, type: "All" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
          <PenTool className="size-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Writing Expert</h1>
          <p className="text-slate-500 font-medium">Nâng band điểm viết với cấu trúc và từ vựng xịn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tasks.map((t, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                <span className="text-[10px] font-black text-purple-500 bg-purple-50 px-2 py-1 rounded-md uppercase tracking-tighter">
                  {t.type}
                </span>
             </div>
            <div className="size-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <t.icon className="size-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{t.title}</h3>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed mb-8">{t.desc}</p>
            <div className="flex gap-3">
               <button className="flex-1 bg-slate-900 text-white font-bold py-3.5 rounded-2xl hover:bg-purple-600 transition-colors">
                  Viết bài ngay
               </button>
               <button className="flex-1 border-2 border-slate-100 text-slate-700 font-bold py-3.5 rounded-2xl hover:bg-slate-50 transition-colors">
                  Xem bài mẫu
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-purple-600 to-fuchsia-700 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 size-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex-1 space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
            Smart Correction
          </div>
          <h2 className="text-3xl font-black">Chấm bài bằng AI chuẩn 2026</h2>
          <p className="opacity-90 max-w-lg">
            Gửi bài viết của bạn và nhận phản hồi chi tiết về 4 tiêu chí chấm điểm của IELTS chỉ sau 30 giây.
          </p>
        </div>
        <button className="bg-white text-purple-700 font-black px-8 py-4 rounded-2xl hover:scale-105 transition-transform relative z-10">
          THỬ MIỄN PHÍ <ArrowRight className="size-5 inline ml-1" />
        </button>
      </div>
    </div>
  );
}
