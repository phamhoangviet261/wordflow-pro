import { createFileRoute, Link } from "@tanstack/react-router";
import { ieltsSkills, coreListeningSkills, practiceModes } from "@/features/ielts/constants";
import { 
  IELTSSkillHero, 
  IELTSRecommendedStartCard,
  IELTSModuleCard,
  IELTSCoreSkillCard,
  IELTSPracticeModeCard
} from "@/features/ielts/components";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_app/ielts/skills/listening/")({
  head: () => ({
    meta: [
      { title: "Listening IELTS — VocabLab" },
      { name: "description", content: "Luyện nghe IELTS theo từng dạng bài, từ nền tảng đến các dạng khó." },
    ],
  }),
  component: ListeningPage,
});

function ListeningPage() {
  const skill = ieltsSkills.listening;

  const beginnerModules = skill.modules?.filter(m => m.level === "Beginner") || [];
  const intermediateModules = skill.modules?.filter(m => m.level === "Intermediate") || [];
  const advancedModules = skill.modules?.filter(m => m.level === "Advanced") || [];

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 px-4">
      {/* Navigation */}
      <Link 
        to="/ielts/skills" 
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Quay lại danh sách kỹ năng
      </Link>

      {/* 1. Listening Hero Section */}
      <IELTSSkillHero 
        name={skill.name}
        vietnameseName={skill.vietnameseName}
        icon={skill.icon}
        description="Xây nền nghe IELTS từ những kỹ năng nhỏ nhất: nghe số, ngày tháng, tên riêng, keyword, paraphrase và distractors trước khi luyện full test."
        rating={skill.rating}
        lessonsCount={skill.lessonsCount}
        progress={skill.progress}
        color={skill.color}
        accentColor={skill.accentColor}
        bgLight={skill.bgLight}
      />

      {/* 5. Recommended Starting Point */}
      <IELTSRecommendedStartCard />

      {/* 2. Learning Path Section */}
      <div className="space-y-16">
        {/* Beginner */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-green-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Beginner</h2>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider border border-green-100">
              3/5 đã mở khóa
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beginnerModules.map(module => (
              <IELTSModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>

        {/* Intermediate */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-blue-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Intermediate</h2>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider border border-blue-100">
              0/4 đã mở khóa
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {intermediateModules.map(module => (
              <IELTSModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>

        {/* Advanced */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-purple-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Advanced</h2>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-wider border border-purple-100">
              0/3 sắp ra mắt
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedModules.map(module => (
              <IELTSModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
        {/* 3. Core Listening Skills Section */}
        <section className="space-y-8">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kỹ năng nghe cốt lõi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coreListeningSkills.map((item, idx) => (
              <IELTSCoreSkillCard key={idx} {...item} />
            ))}
          </div>
        </section>

        {/* 4. Practice Modes Section */}
        <section className="space-y-8">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Chế độ luyện tập</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {practiceModes.map((mode, idx) => (
              <IELTSPracticeModeCard key={idx} {...mode} index={idx} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
