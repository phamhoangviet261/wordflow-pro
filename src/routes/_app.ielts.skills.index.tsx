import { createFileRoute } from "@tanstack/react-router";
import { ieltsSkills } from "@/features/ielts/constants";
import { 
  IELTSPageHeader, 
  IELTSSkillCard 
} from "@/features/ielts/components";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/ielts/skills/")({
  head: () => ({
    meta: [
      { title: "Kỹ năng IELTS — VocabLab" },
      {
        name: "description",
        content: "Luyện tập các kỹ năng Listening, Reading, Writing, Speaking cho IELTS.",
      },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 px-4">
      <IELTSPageHeader 
        title="Kỹ năng IELTS" 
        subtitle="Tập trung vào từng kỹ năng cụ thể để đạt được kết quả tốt nhất trong kỳ thi thực tế." 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(ieltsSkills).map((skill) => (
          <IELTSSkillCard 
            key={skill.id}
            name={skill.name}
            icon={skill.icon}
            color={skill.color}
            desc={skill.description}
          />
        ))}
      </div>

      {/* AI Section */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute -left-10 -top-10 size-40 bg-orange-100/30 rounded-full blur-3xl" />
        <div className="lg:flex-1 space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="size-3" /> Coming Soon
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Cố vấn IELTS AI cá nhân</h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xl font-medium">
            Hệ thống AI thông minh sẽ phân tích điểm yếu của bạn qua các bài tập và gợi ý những bài
            học cần thiết nhất để tối ưu điểm số dựa trên mục tiêu band điểm của bạn.
          </p>
        </div>
        <div className="shrink-0 relative z-10">
          <button className="bg-slate-900 text-white font-black px-10 py-4 rounded-2xl hover:bg-slate-800 transition shadow-xl shadow-slate-200">
            Đăng ký nhận thông báo
          </button>
        </div>
      </div>
    </div>
  );
}
