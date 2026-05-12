import { Link } from "@tanstack/react-router";
import {
  LucideIcon,
  ChevronRight,
  Star,
  Clock,
  CheckCircle2,
  Circle,
  Flame,
  BookOpen,
  Lock as LockIcon,
  Timer,
  BarChart3,
  Target,
  PlayCircle,
  ArrowLeft,
  Lightbulb,
  AlertCircle,
  Check,
  Volume2,
  ChevronRightCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IELTSPhase, IELTSLesson, IELTSPracticeType, IELTSModule } from "./constants";

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
      <div
        className={cn(
          "absolute left-0 top-1.5 size-[40px] rounded-2xl flex items-center justify-center shadow-sm z-10 transition-all",
          isCompleted
            ? "bg-green-500 text-white"
            : isCurrent
              ? "bg-blue-600 text-white ring-4 ring-blue-50"
              : "bg-white border-2 border-slate-200 text-slate-400",
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="size-5" />
        ) : isCurrent ? (
          <Flame className="size-5" />
        ) : (
          <Circle className="size-5" />
        )}
      </div>

      <div
        className={cn(
          "p-6 rounded-[2rem] border transition-all duration-300",
          isCurrent
            ? "bg-white border-blue-200 shadow-xl shadow-blue-500/5 ring-1 ring-blue-50"
            : "bg-white border-slate-100 shadow-sm opacity-90 hover:opacity-100",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
              {phase.target}
            </div>
            <h3
              className={cn("text-lg font-bold", isCurrent ? "text-slate-900" : "text-slate-700")}
            >
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
  desc,
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
      <div
        className={cn(
          "size-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
          colorMap[color],
        )}
      >
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
  vietnameseName,
  icon: Icon,
  description,
  rating,
  lessonsCount,
  progress,
  color,
  accentColor,
  bgLight,
}: {
  name: string;
  vietnameseName: string;
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
    <div
      className={cn(
        "rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-10 items-center bg-white",
      )}
    >
      <div
        className={cn(
          "size-24 rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner",
          bgLight,
          accentColor,
        )}
      >
        <Icon className="size-12" />
      </div>
      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-800 leading-none">{name}</h1>
            <div className={cn("text-sm font-bold uppercase tracking-widest", accentColor)}>
              {vietnameseName}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-sm font-bold border border-amber-100">
            <Star className="size-4 fill-amber-600" /> {rating}
          </div>
          <div className="flex items-center gap-1 bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-sm font-bold border border-slate-100">
            <BarChart3 className="size-4" /> 12 dạng luyện nghe
          </div>
          <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
            <Target className="size-4" /> Band 3.0 → 6.0+
          </div>
        </div>
        <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">{description}</p>

        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-end">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Tiến độ của bạn
            </span>
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
      <div className="flex flex-col gap-6 shrink-0 lg:min-w-[280px]">
        <div className="flex flex-col gap-3">
          <Link
            to="/ielts/skills/listening/numbers-dates-spelling"
            className={cn(
              "px-8 py-4 rounded-2xl text-white font-black shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform text-center block",
              {
                "bg-blue-600 shadow-blue-200": color === "blue",
                "bg-emerald-600 shadow-emerald-200": color === "emerald",
                "bg-purple-600 shadow-purple-200": color === "purple",
                "bg-orange-600 shadow-orange-200": color === "orange",
              },
            )}
          >
            BẮT ĐẦU VỚI FOUNDATION
          </Link>
          <button className="px-8 py-3 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition-colors text-sm">
            XEM TẤT CẢ DẠNG BÀI
          </button>
        </div>

        {/* Bài nên học tiếp block */}
        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 space-y-2">
          <div className="flex items-center gap-2 text-blue-600">
            <PlayCircle className="size-4" />
            <span className="text-xs font-black uppercase tracking-wider">Bài nên học tiếp</span>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">Numbers, Dates & Spelling</div>
            <div className="text-[10px] font-medium text-slate-500 leading-relaxed">
              Nền tảng cho IELTS Listening Part 1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Module Hero ---
export function IELTSModuleHero({
  title,
  description,
  skillName,
  level,
  difficulty,
  estimatedTime,
  progress,
  accentColor,
  bgLight,
}: {
  title: string;
  description: string;
  skillName: string;
  level: string;
  difficulty: number;
  estimatedTime: string;
  progress: number;
  accentColor: string;
  bgLight: string;
}) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-10 items-center overflow-hidden relative">
      <div className={cn("absolute -left-10 -top-10 size-40 rounded-full blur-3xl opacity-20", bgLight)} />
      
      <div className="flex-1 space-y-6 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", bgLight, accentColor)}>
              {skillName}
            </span>
            <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider">
              {level}
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">{title}</h1>
        </div>

        <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">{description}</p>

        <div className="flex flex-wrap gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4" /> Độ khó: {difficulty}/5
          </div>
          <div className="flex items-center gap-2">
            <Timer className="size-4" /> Thời gian: {estimatedTime}
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="size-4" /> Trạng thái: Available
          </div>
        </div>

        <div className="space-y-2 max-w-md">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến độ bài học</span>
            <span className="text-sm font-bold text-slate-700">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="shrink-0 flex flex-col gap-3 relative z-10 lg:min-w-[240px]">
        <button className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
          BẮT ĐẦU HỌC
        </button>
        <button className="w-full py-3 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition-colors text-sm">
          XEM BÀI LUYỆN TẬP
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
      <div
        className={cn(
          "size-10 rounded-xl flex items-center justify-center font-bold text-sm",
          lesson.isCompleted
            ? "bg-green-100 text-green-600"
            : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600",
        )}
      >
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

// --- Module Card ---
export function IELTSModuleCard({ module }: { module: IELTSModule }) {
  const isLocked = module.status === "Locked";
  const isComingSoon = module.status === "Coming soon";

  return (
    <div
      className={cn(
        "bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all group relative flex flex-col min-h-[220px]",
        (isLocked || isComingSoon) && "opacity-90",
      )}
    >
      <div className="absolute top-6 right-6">
        {isLocked ? (
          <LockIcon className="size-4 text-slate-300" />
        ) : isComingSoon ? (
          <Timer className="size-4 text-slate-300" />
        ) : (
          <div className="size-2 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>

      <div className="mb-4">
        <div
          className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block",
            module.level === "Beginner"
              ? "bg-green-100 text-green-600"
              : module.level === "Intermediate"
                ? "bg-blue-100 text-blue-600"
                : "bg-purple-100 text-purple-600",
          )}
        >
          {module.level}
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <h4
          className={cn(
            "text-lg font-bold text-slate-800 transition-colors",
            !isLocked && !isComingSoon && "group-hover:text-blue-600",
          )}
        >
          {module.title}
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">
          {module.description}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-1">
            <Timer className="size-3" /> {module.estimatedTime}
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="size-3" /> Độ khó: {module.difficulty}/5
          </div>
        </div>

        {isLocked || isComingSoon ? (
          <button
            disabled
            className={cn(
              "w-full py-3 rounded-xl font-bold text-xs transition-all bg-slate-50 text-slate-300 cursor-not-allowed",
            )}
          >
            {isComingSoon ? "SẮP RA MẮT" : "CHƯA MỞ KHÓA"}
          </button>
        ) : (
          <Link
            to={`/ielts/skills/${module.id.includes('listening') ? 'listening' : 'listening'}/${module.id.split('-').slice(1).join('-')}`}
            className={cn(
              "w-full py-3 rounded-xl font-bold text-xs transition-all block text-center bg-blue-600 text-white shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]",
            )}
          >
            BẮT ĐẦU HỌC
          </Link>
        )}
      </div>
    </div>
  );
}

// --- Core Skill Card ---
export function IELTSCoreSkillCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-4 items-start">
      <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        <Icon className="size-6" />
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
}

// --- Practice Mode Card ---
export function IELTSPracticeModeCard({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
      <div className="absolute -right-4 -bottom-4 text-slate-50 font-black text-6xl group-hover:scale-110 transition-transform">
        {index + 1}
      </div>
      <h4 className="font-bold text-slate-800 text-lg relative z-10">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed font-medium relative z-10">
        {description}
      </p>
    </div>
  );
}

// --- Recommended Start Card ---
export function IELTSRecommendedStartCard() {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-blue-100 shadow-xl shadow-blue-500/5 relative overflow-hidden">
      <div className="absolute right-0 top-0 p-8 opacity-[0.03]">
        <Star className="size-48 fill-blue-600" />
      </div>
      <div className="relative z-10 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider border border-blue-100">
            Khuyên dùng
          </div>
          <h3 className="text-2xl font-black text-slate-800">Nên bắt đầu từ đâu?</h3>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed max-w-3xl font-medium">
          Nếu người học mất gốc hoặc band dưới 4.0, hãy bắt đầu với{" "}
          <span className="font-bold text-blue-600">Numbers, Dates & Spelling</span> trước. Sau đó học
          Form Completion, Note Completion, Sentence Completion rồi mới chuyển sang Multiple Choice.
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            "Numbers, Dates & Spelling",
            "Form Completion",
            "Note Completion",
            "Sentence Completion",
            "Multiple Choice",
          ].map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold border border-slate-100"
            >
              <span className="opacity-50">{i + 1}.</span> {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Objectives Card ---
export function IELTSObjectivesCard({ objectives }: { objectives: string[] }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
      <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
        <Target className="size-5 text-blue-600" /> Bạn sẽ học được gì?
      </h3>
      <ul className="space-y-4">
        {objectives.map((obj, i) => (
          <li key={i} className="flex gap-4 items-start group">
            <div className="size-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
              <Check className="size-3" strokeWidth={3} />
            </div>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">{obj}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Mini Lesson Card ---
export function IELTSMiniLessonCard({ title, content, examples }: { title: string; content: string; examples: string[] }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <BookOpen className="size-5" />
        </div>
        <h4 className="text-lg font-bold text-slate-800">{title}</h4>
      </div>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">{content}</p>
      <div className="pt-2 space-y-2">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ví dụ tiêu biểu</div>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex, i) => (
            <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold border border-slate-100">
              {ex}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Mistake Card ---
export function IELTSMistakeCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex gap-4 items-start hover:border-amber-200 transition-colors">
      <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
        <AlertCircle className="size-5" />
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
}

// --- Review Method Step ---
export function IELTSReviewStep({ number, content }: { number: number; content: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="size-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-lg shadow-blue-200">
        {number}
      </div>
      <p className="text-sm text-slate-600 font-medium leading-relaxed pt-1.5">{content}</p>
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
          <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-sm font-medium">
            Học ít nhưng đều đặn là chìa khóa để chinh phục IELTS. Chỉ cần 15-30 phút mỗi ngày để
            duy trì phong độ.
          </p>
        </div>
        <div className="flex items-center gap-4 pt-2">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="size-8 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[10px] font-bold"
              >
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
