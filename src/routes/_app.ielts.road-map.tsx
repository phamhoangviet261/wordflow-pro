import { createFileRoute } from "@tanstack/react-router";
import { ieltsPhases, ieltsSkills } from "@/features/ielts/constants";
import { 
  IELTSPageHeader, 
  IELTSRoadmapPhaseCard, 
  IELTSSkillCard, 
  IELTSStudyHabitCard 
} from "@/features/ielts/components";
import { Target, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_app/ielts/road-map")({
  head: () => ({
    meta: [
      { title: "Lộ trình IELTS — VocabLab" },
      { name: "description", content: "Lộ trình học IELTS từ con số 0 đến 6.0+ rõ ràng theo từng giai đoạn." },
    ],
  }),
  component: RoadMapPage,
});

function RoadMapPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8 px-4">
      <IELTSPageHeader 
        title="Lộ trình IELTS" 
        subtitle="Tự học IELTS từ nền tảng đến band 6.0+ theo từng giai đoạn rõ ràng." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Roadmap Section */}
          <div className="space-y-6 relative">
            {/* Connection Line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100" />
            
            {ieltsPhases.map((phase, idx) => (
              <IELTSRoadmapPhaseCard key={idx} phase={phase} />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* Goal Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 text-slate-50 opacity-10 group-hover:scale-110 transition-transform">
              <Target className="size-24" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="size-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Mục tiêu hiện tại</h3>
                <div className="text-4xl font-black text-blue-600 mt-1 italic tracking-tight">Band 3.0 → 6.0+</div>
              </div>
              <p className="text-sm text-slate-500 font-medium">Bạn đã hoàn thành 25% lộ trình.</p>
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[25%]" />
              </div>
            </div>
          </div>

          <IELTSStudyHabitCard />
        </div>
      </div>

      {/* Recommended Skills */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 px-2">Luyện tập kỹ năng</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>
    </div>
  );
}
