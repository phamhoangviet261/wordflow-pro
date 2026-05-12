import { createFileRoute } from "@tanstack/react-router";
import { Headphones, BookOpen, PenTool, Mic, ArrowRight, Star } from "lucide-react";

export const Route = createFileRoute("/_app/ielts/skills")({
  head: () => ({
    meta: [
      { title: "Kỹ năng IELTS — VocabLab" },
      { name: "description", content: "Luyện tập các kỹ năng Listening, Reading, Writing, Speaking cho IELTS." },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  const skills = [
    { 
      title: "Listening", 
      icon: Headphones, 
      color: "text-blue-600", 
      bg: "bg-blue-100", 
      gradient: "from-blue-500 to-blue-600",
      desc: "Luyện nghe các dạng bài IELTS với audio chất lượng cao và transcript chi tiết.",
      modules: 12
    },
    { 
      title: "Reading", 
      icon: BookOpen, 
      color: "text-emerald-600", 
      bg: "bg-emerald-100", 
      gradient: "from-emerald-500 to-emerald-600",
      desc: "Kỹ thuật Skimming & Scanning, các dạng bài Matching Heading, True/False/Not Given.",
      modules: 15
    },
    { 
      title: "Writing", 
      icon: PenTool, 
      color: "text-purple-600", 
      bg: "bg-purple-100", 
      gradient: "from-purple-500 to-purple-600",
      desc: "Luyện viết Task 1 và Task 2 với kho bài mẫu band 8.0+ và hướng dẫn cấu trúc.",
      modules: 8
    },
    { 
      title: "Speaking", 
      icon: Mic, 
      color: "text-orange-600", 
      bg: "bg-orange-100", 
      gradient: "from-orange-500 to-orange-600",
      desc: "Luyện nói theo chủ đề Forecast mới nhất, ghi âm và nhận xét từ AI.",
      modules: 10
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
          Luyện tập kỹ năng IELTS
        </h1>
        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
          Tập trung vào từng kỹ năng cụ thể để đạt được kết quả tốt nhất trong kỳ thi thực tế.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((skill) => (
          <div key={skill.title} className="group relative bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className={`absolute top-0 right-0 size-32 rounded-bl-[4rem] bg-gradient-to-br ${skill.gradient} opacity-[0.03] group-hover:opacity-10 transition-opacity`} />
            
            <div className="flex items-start gap-6 relative">
              <div className={`size-16 rounded-2xl flex items-center justify-center ${skill.bg} ${skill.color} shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <skill.icon className="size-8" />
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800">{skill.title}</h2>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="size-4 fill-amber-500" />
                    <span className="text-sm font-black">4.9</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                  {skill.desc}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {skill.modules} Học phần
                  </span>
                  <button className={`inline-flex items-center gap-2 font-bold text-sm ${skill.color} group-hover:gap-3 transition-all`}>
                    Bắt đầu học <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col lg:flex-row items-center gap-8">
        <div className="lg:flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-wider">
            Coming Soon
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Cố vấn IELTS AI cá nhân</h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
            Hệ thống AI thông minh sẽ phân tích điểm yếu của bạn qua các bài tập và gợi ý những bài học cần thiết nhất để tối ưu điểm số.
          </p>
        </div>
        <div className="shrink-0">
          <button className="bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-slate-800 transition shadow-xl shadow-slate-200">
            Đăng ký nhận thông báo
          </button>
        </div>
      </div>
    </div>
  );
}
