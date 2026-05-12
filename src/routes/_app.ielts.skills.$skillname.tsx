import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ieltsSkills } from "@/features/ielts/constants";
import { 
  IELTSSkillHero, 
  IELTSPracticeTypeCard, 
  IELTSLessonCard, 
  IELTSStudyHabitCard 
} from "@/features/ielts/components";
import { ArrowLeft, Lightbulb, Info } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/ielts/skills/$skillname")({
  head: ({ params }) => {
    const skill = ieltsSkills[params.skillname.toLowerCase()];
    return {
      meta: [
        { title: `${skill?.name || "Kỹ năng"} IELTS — VocabLab` },
        { name: "description", content: skill?.description || "Luyện tập kỹ năng IELTS." },
      ],
    };
  },
  component: SkillDetailPage,
});

function SkillDetailPage() {
  const { skillname } = Route.useParams();
  const navigate = useNavigate();
  const skill = ieltsSkills[skillname.toLowerCase()];

  useEffect(() => {
    if (!skill) {
      navigate({ to: "/ielts/skills", replace: true });
    }
  }, [skill, navigate]);

  if (!skill) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-8 px-4">
      {/* Navigation */}
      <Link 
        to="/ielts/skills" 
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Quay lại danh sách kỹ năng
      </Link>

      {/* Hero Section */}
      <IELTSSkillHero 
        name={skill.name}
        icon={skill.icon}
        description={skill.description}
        rating={skill.rating}
        lessonsCount={skill.lessonsCount}
        progress={skill.progress}
        color={skill.color}
        accentColor={skill.accentColor}
        bgLight={skill.bgLight}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Practice Types */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Dạng bài tập trọng tâm</h2>
              <button className={cn("text-sm font-bold", skill.accentColor)}>Xem tất cả</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skill.practiceTypes.map((type, idx) => (
                <IELTSPracticeTypeCard key={idx} type={type} />
              ))}
            </div>
          </section>

          {/* Lessons Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Lộ trình bài học</h2>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {skill.lessons.filter(l => l.isCompleted).length}/{skill.lessons.length} Hoàn thành
              </span>
            </div>
            <div className="space-y-3">
              {skill.lessons.map((lesson, idx) => (
                <IELTSLessonCard key={lesson.id} lesson={lesson} index={idx} />
              ))}
            </div>
            <button className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:border-slate-300 hover:text-slate-600 transition-all text-sm">
              Xem thêm bài học khác
            </button>
          </section>
        </div>

        <div className="space-y-8">
          {/* Tips Section */}
          <section className="bg-amber-50/50 border border-amber-100 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-3 text-amber-600">
              <Lightbulb className="size-6 fill-amber-600/10" />
              <h2 className="text-xl font-bold">Mẹo đạt điểm cao</h2>
            </div>
            <ul className="space-y-4">
              {skill.tips.map((tip, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="size-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="size-3" />
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{tip}</p>
                </li>
              ))}
            </ul>
          </section>

          <IELTSStudyHabitCard />
        </div>
      </div>
    </div>
  );
}
