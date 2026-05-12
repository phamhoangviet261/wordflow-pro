import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Map, ChevronRight, CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/_app/ielts/road-map")({
  head: () => ({
    meta: [
      { title: "Lộ trình IELTS — VocabLab" },
      { name: "description", content: "Lộ trình học IELTS từ con số 0 đến 7.5+" },
    ],
  }),
  component: RoadMapPage,
});

function RoadMapPage() {
  const steps = [
    { title: "Giai đoạn 1: Foundation (0 - 3.5)", desc: "Xây dựng nền tảng ngữ pháp và từ vựng cơ bản.", status: "completed" },
    { title: "Giai đoạn 2: Pre-IELTS (3.5 - 4.5)", desc: "Làm quen với các dạng bài thi IELTS.", status: "current" },
    { title: "Giai đoạn 3: Intermediate (4.5 - 5.5)", desc: "Nâng cao kỹ năng làm bài và vốn từ vựng học thuật.", status: "upcoming" },
    { title: "Giai đoạn 4: Upper-Intermediate (5.5 - 6.5)", desc: "Luyện đề và tối ưu hóa thời gian làm bài.", status: "upcoming" },
    { title: "Giai đoạn 5: Advanced (6.5 - 7.5+)", desc: "Hoàn thiện các kỹ năng khó và đạt band điểm mục tiêu.", status: "upcoming" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
          <Map className="size-8 text-green-600" /> Lộ trình học IELTS
        </h1>
        <p className="text-slate-500 font-medium">Chi tiết các bước để chinh phục band điểm mục tiêu của bạn.</p>
      </div>

      <div className="relative space-y-4">
        {/* Connection Line */}
        <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-slate-200" />

        {steps.map((step, idx) => (
          <div key={idx} className="relative pl-12">
            <div className={`absolute left-0 top-1.5 size-[44px] rounded-2xl flex items-center justify-center shadow-sm z-10 transition-all duration-300 ${
              step.status === 'completed' ? 'bg-green-500 text-white shadow-green-200' : 
              step.status === 'current' ? 'bg-blue-600 text-white shadow-blue-200 ring-4 ring-blue-50' : 
              'bg-white border-2 border-slate-200 text-slate-400'
            }`}>
              {step.status === 'completed' ? <CheckCircle2 className="size-6" /> : 
               step.status === 'current' ? <GraduationCap className="size-6" /> : 
               <Circle className="size-6" />}
            </div>

            <div className={`p-6 rounded-3xl border transition-all duration-300 ${
              step.status === 'current' ? 'bg-white border-blue-200 shadow-xl shadow-blue-500/5' : 
              'bg-white border-slate-100 shadow-sm opacity-80 hover:opacity-100'
            }`}>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className={`text-lg font-bold ${step.status === 'current' ? 'text-blue-700' : 'text-slate-800'}`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
                <ChevronRight className={`size-5 shrink-0 ${step.status === 'current' ? 'text-blue-400' : 'text-slate-300'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 size-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative z-10">
          <h2 className="text-xl font-bold">Bạn đang ở đâu?</h2>
          <p className="text-slate-300 mt-2 max-w-md text-sm leading-relaxed">
            Thực hiện bài kiểm tra đầu vào miễn phí để xác định chính xác trình độ hiện tại và nhận lộ trình cá nhân hóa.
          </p>
          <button className="mt-6 bg-white text-slate-900 font-bold px-6 py-3 rounded-2xl hover:bg-slate-100 transition shadow-lg">
            Kiểm tra ngay
          </button>
        </div>
      </div>
    </div>
  );
}
