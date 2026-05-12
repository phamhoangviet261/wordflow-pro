import { Link } from "@tanstack/react-router";
import { LucideIcon, ChevronRight, Star, Clock, CheckCircle2, Circle, Flame, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { IELTSPhase, IELTSLesson, IELTSPracticeType } from "./constants";

// --- Header ---
export function IELTSPageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-2 mb-8">
      <h1 className="text-3xl font-black text-slate-800 tracking-tight">{title}</h1>
      <p className="text-slate-500 font-medium">{subtitle}</p>
    </div>
  );
}

// --- Roadmap Phase Card ---
export function IELTSRoadmapPhaseCard({ phase }: { phase: IELTSPhase }) {
  const isCompleted = phase.status === "completed";
  const isCurrent = phase.status === "current";

  return (
    <div className="relative pl-12">
      <div className={cn(
        "absolute left-0 top-1.5 size-[40px] rounded-2xl flex items-center justify-center shadow-sm z-10 transition-all",
        isCompleted ? "bg-green-500 text-white" : 
        isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-50" : 
        "bg-white border-2 border-slate-200 text-slate-400"
      )}>
        {isCompleted ? <CheckCircle2 className="size-5" /> : 
         isCurrent ? <Flame className="size-5" /> : 
         <Circle className="size-5" />}
      </div>
      
      <div className={cn(
        "p-6 rounded-[2rem] border transition-all duration-300",
        isCurrent ? "bg-white border-blue-200 shadow-xl shadow-blue-500/5 ring-1 ring-blue-50" : 
        "bg-white border-slate-100 shadow-sm opacity-90 hover:opacity-100"
      )}>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{phase.target}</div>
            <h3 className={cn("text-lg font-bold", isCurrent ? "text-slate-900" : "text-slate-700")}>
              {phase.title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">{phase.description}</p>
          </div>
          <ChevronRight className="size-5 text-slate-300 shrink-0" />
        </div>
      </div>
    </div>
  );
}

// --- Skill Card ---
export function IELTSSkillCard({ 
  name, 
  icon: Icon, 
  color, 
  desc 
}: { 
  name: string; 
  icon: LucideIcon; 
  color: string; 
  desc: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <Link 
      to={`/ielts/skills/${name.toLowerCase()}`}
      className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
    >
      <div className={cn("size-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", colorMap[color])}>
        <Icon className="size-6" />
      </div>
      <h4 className="text-lg font-bold text-slate-800 mb-2">{name}</h4>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{desc}</p>
    </Link>
  );
}

// --- Skill Hero ---
export function IELTSSkillHero({ 
  name, 
  icon: Icon, 
  description, 
  rating, 
  lessonsCount, 
  progress,
  color,
  accentColor,
  bgLight
}: { 
  name: string; 
  icon: LucideIcon; 
  description: string; 
  rating: number; 
  lessonsCount: number; 
  progress: number;
  color: string;
  accentColor: string;
  bgLight: string;
}) {
  return (
    <div className={cn("rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center bg-white")}>
      <div className={cn("size-24 rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner", bgLight, accentColor)}>
        <Icon className="size-12" />
      </div>
      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-black text-slate-800">{name}</h1>
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-sm font-bold border border-amber-100">
            <Star className="size-4 fill-amber-600" /> {rating}
          </div>
          <div className="flex items-center gap-1 bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-sm font-bold border border-slate-100">
            <BookOpen className="size-4" /> {lessonsCount} bài học
          </div>
        </div>
        <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">{description}</p>
        
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-end">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Tiến độ của bạn</span>
            <span className="text-sm font-bold text-slate-700">{progress}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-1000", {
                "bg-blue-500": color === "blue",
                "bg-emerald-500": color === "emerald",
                "bg-purple-500": color === "purple",
                "bg-orange-500": color === "orange",
              })} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>
      <div className="shrink-0">
        <button className={cn("px-8 py-4 rounded-2xl text-white font-black shadow-lg hover:scale-105 transition-transform", {
          "bg-blue-600 shadow-blue-200": color === "blue",
          "bg-emerald-600 shadow-emerald-200": color === "emerald",
          "bg-purple-600 shadow-purple-200": color === "purple",
          "bg-orange-600 shadow-orange-200": color === "orange",
        })}>
          TIẾP TỤC HỌC
        </button>
      </div>
    </div>
  );
}

// --- Practice Type Card ---
export function IELTSPracticeTypeCard({ type }: { type: IELTSPracticeType }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <h4 className="text-lg font-bold text-slate-800 mb-2">{type.title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{type.description}</p>
    </div>
  );
}

// --- Lesson Card ---
export function IELTSLessonCard({ lesson, index }: { lesson: IELTSLesson; index: number }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
      <div className={cn(
        "size-10 rounded-xl flex items-center justify-center font-bold text-sm",
        lesson.isCompleted ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
      )}>
        {lesson.isCompleted ? <CheckCircle2 className="size-5" /> : index + 1}
      </div>
      <div className="flex-1">
        <h5 className="font-bold text-slate-800">{lesson.title}</h5>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Clock className="size-3" /> {lesson.duration}
          </div>
        </div>
      </div>
      <button className="size-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
        <PlayIcon className="size-3 fill-current" />
      </button>
    </div>
  );
}

// --- Study Habit Card ---
export function IELTSStudyHabitCard() {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
      <div className="absolute -right-20 -top-20 size-64 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="relative z-10 space-y-4">
        <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center">
          <Flame className="size-6 text-orange-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Thói quen học tập hàng ngày</h3>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-sm">
            Học ít nhưng đều đặn là chìa khóa để chinh phục IELTS. Chỉ cần 15-30 phút mỗi ngày để duy trì phong độ.
          </p>
        </div>
        <div className="flex items-center gap-4 pt-2">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="size-8 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                +{i}
              </div>
            ))}
          </div>
          <span className="text-xs font-bold text-slate-400">1,240 người đang học</span>
        </div>
      </div>
    </div>
  );
}

// Internal icons helper
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
