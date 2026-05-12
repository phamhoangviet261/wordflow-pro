import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { 
  ArrowLeft, 
  Volume2, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  Settings,
  HelpCircle,
  Clock,
  Layout,
  Headphones,
  FileText,
  Lock,
  Pause,
  Highlighter
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/ielts/skills/listening/practice")({
  head: () => ({
    meta: [
      { title: "IELTS Listening Practice Workspace" },
    ],
  }),
  component: IELTSListeningPracticePage,
});

const QUESTIONS = [
  { 
    id: 1, 
    label: "1. Phone number:", 
    prefix: "07982",
    suffix: "",
    correctAnswer: "441236",
    explanation: "Số điện thoại thường được đọc theo từng cụm. Hãy chú ý các con số lặp lại và nhịp nghỉ của người nói."
  },
  { 
    id: 2, 
    label: "2. Date of appointment:", 
    prefix: "",
    suffix: "April",
    correctAnswer: "15th",
    explanation: "Ngày tháng có thể được đọc là “the fifteenth of April” hoặc “April the fifteenth”."
  },
  { 
    id: 3, 
    label: "3. Surname:", 
    prefix: "",
    suffix: "",
    correctAnswer: "Henderson",
    explanation: "Họ và tên riêng thường được đánh vần từng chữ cái trong IELTS Listening Part 1."
  },
  { 
    id: 4, 
    label: "4. Email:", 
    prefix: "martin.",
    suffix: "@mail.com",
    correctAnswer: "green",
    explanation: "Với email, hãy chú ý các từ như dot (dấu chấm), dash (dấu gạch ngang), underscore (gạch dưới) và spelling trước dấu @."
  },
  { 
    id: 5, 
    label: "5. Postcode:", 
    prefix: "",
    suffix: "4QP",
    correctAnswer: "SW12",
    explanation: "Mã bưu điện thường kết hợp cả chữ cái và con số, hãy viết chính xác thứ tự nghe được."
  },
];

function IELTSListeningPracticePage() {
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscriptManualUnlocked, setIsTranscriptManualUnlocked] = useState(false);
  const navigate = useNavigate();

  const isTranscriptVisible = isSubmitted || isTranscriptManualUnlocked;

  const score = useMemo(() => {
    return userAnswers.reduce((acc, ans, idx) => {
      const normalizedUser = ans.trim().toLowerCase();
      const normalizedCorrect = QUESTIONS[idx].correctAnswer.toLowerCase();
      return acc + (normalizedUser === normalizedCorrect ? 1 : 0);
    }, 0);
  }, [userAnswers, isSubmitted]);

  const handleCheckAnswers = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setUserAnswers(Array(QUESTIONS.length).fill(""));
    setIsSubmitted(false);
    setIsTranscriptManualUnlocked(false);
  };

  const isAnyFilled = userAnswers.some(ans => ans.trim().length > 0);

  const toggleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parentElement = container.nodeType === 3 ? container.parentElement : (container as HTMLElement);

    // Check if we are already inside a highlight
    const highlightParent = parentElement?.closest('.practice-highlight');

    if (highlightParent) {
      // Unhighlight: Remove the span and keep text
      const parent = highlightParent.parentNode;
      while (highlightParent.firstChild) {
        parent?.insertBefore(highlightParent.firstChild, highlightParent);
      }
      parent?.removeChild(highlightParent);
    } else {
      // Highlight: Wrap selection in a span
      const span = document.createElement('span');
      span.className = 'practice-highlight bg-yellow-200 text-slate-900 rounded-sm px-0.5 transition-colors cursor-pointer ring-1 ring-yellow-300';
      
      try {
        // Basic wrap
        range.surroundContents(span);
      } catch (err) {
        // Fallback: If complex, wrap in a way that works for most text nodes
        try {
          const content = range.extractContents();
          span.appendChild(content);
          range.insertNode(span);
        } catch (innerErr) {
          console.error("Highlight failed", innerErr);
        }
      }
    }
    
    // Clear selection after highlighting to give visual feedback
    selection.removeAllRanges();
  };

  // Apply layout overrides for practice workspace
  useEffect(() => {
    // Hide default sidebar/header via body classes if possible
    document.body.classList.add("practice-mode");

    // Keyboard shortcut for highlighting (Ctrl + Shift + H)
    const handleKeyDown = (e: KeyboardEvent) => {
      // More robust check: Ctrl + Shift + H or Alt + H
      const isH = e.key.toLowerCase() === 'h' || e.code === 'KeyH';
      const isModifier = (e.ctrlKey && e.shiftKey) || e.altKey;

      if (isModifier && isH) {
        e.preventDefault();
        e.stopPropagation();
        toggleHighlight();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      document.body.classList.remove("practice-mode");
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex overflow-hidden">
      {/* 1. Practice Sidebar (Left) */}
      <div 
        className={cn(
          "bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col shrink-0",
          isSidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2 text-white font-black">
              <div className="size-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <Headphones className="size-5" />
              </div>
              <span className="tracking-tight">Practice Lab</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="size-8 rounded-lg hover:bg-white/10 text-slate-400 flex items-center justify-center transition-colors mx-auto"
          >
            <Menu className="size-5" />
          </button>
        </div>

        <div className="flex-1 px-2 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
          <SidebarItem 
            icon={<Layout className="size-5" />} 
            label="Tổng quan" 
            active 
            isOpen={isSidebarOpen} 
          />
          <SidebarItem 
            icon={<Clock className="size-5" />} 
            label="Lịch sử luyện tập" 
            isOpen={isSidebarOpen} 
          />
          <SidebarItem 
            icon={<Settings className="size-5" />} 
            label="Cài đặt Audio" 
            isOpen={isSidebarOpen} 
          />
          <SidebarItem 
            icon={<HelpCircle className="size-5" />} 
            label="Hướng dẫn" 
            isOpen={isSidebarOpen} 
          />
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => navigate({ to: "/ielts/skills/listening" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-sm"
          >
            <ArrowLeft className="size-5" />
            {isSidebarOpen && <span>Thoát luyện tập</span>}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        {/* 2. Top Bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <Link 
              to="/ielts/skills/listening"
              className="size-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft className="size-6" />
            </Link>
            <div>
              <h1 className="text-sm font-black text-slate-800 tracking-tight">Numbers, Dates & Spelling</h1>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IELTS Listening • Practice Mode</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleHighlight}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-100 text-yellow-700 font-bold text-xs border border-yellow-200 hover:bg-yellow-200 transition-colors shadow-sm"
            >
              <Highlighter className="size-4" />
              <span>TÔ MÀU (Alt+H)</span>
            </button>
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến độ</div>
                <div className="text-xs font-bold text-slate-800">{isSubmitted ? "100%" : "Đang làm bài"}</div>
              </div>
              <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: isSubmitted ? "100%" : "40%" }} />
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 font-bold text-xs border border-slate-100 hover:bg-slate-100 transition-colors">
              GỬI TRỢ GIÚP
            </button>
          </div>
        </header>

        {/* 3. Main Split Workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden pb-24">
          {/* Transcript Panel (LEFT) */}
          <div className="w-full md:w-[45%] flex flex-col border-r border-slate-100 bg-white overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <FileText className="size-4 text-blue-600" /> TRANSCRIPT
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsTranscriptManualUnlocked(!isTranscriptManualUnlocked)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-black transition-all border flex items-center gap-1.5 shadow-sm",
                    isTranscriptVisible 
                      ? "bg-green-600 text-white border-green-700 hover:bg-green-700" 
                      : "bg-slate-900 text-white border-slate-950 hover:bg-black"
                  )}
                >
                  {isTranscriptVisible ? <Check className="size-3" /> : <Lock className="size-3" />}
                  {isTranscriptVisible ? "ĐÃ MỞ" : "ĐANG KHÓA"}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 relative">
              {isTranscriptVisible ? (
                <div className="space-y-6 text-sm leading-relaxed text-slate-600 font-medium animate-in fade-in duration-500">
                  <p><span className="font-bold text-slate-800">Receptionist:</span> Can I have your phone number, please?</p>
                  <p><span className="font-bold text-slate-800">Student:</span> Yes, it’s 07982 441236.</p>
                  
                  <p><span className="font-bold text-slate-800">Receptionist:</span> And what date would you like to book the appointment?</p>
                  <p><span className="font-bold text-slate-800">Student:</span> The 15th of April, if possible.</p>

                  <p><span className="font-bold text-slate-800">Receptionist:</span> Could you spell your surname?</p>
                  <p><span className="font-bold text-slate-800">Student:</span> Sure. It’s Henderson. H-E-N-D-E-R-S-O-N.</p>

                  <p><span className="font-bold text-slate-800">Receptionist:</span> And your email address?</p>
                  <p><span className="font-bold text-slate-800">Student:</span> It’s martin.green@mail.com.</p>

                  <p><span className="font-bold text-slate-800">Receptionist:</span> Finally, what’s your postcode?</p>
                  <p><span className="font-bold text-slate-800">Student:</span> It’s SW12 4QP.</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <Lock className="size-8" />
                  </div>
                  <div className="space-y-2 max-w-[240px]">
                    <p className="text-sm font-black text-slate-800">Transcript đang khóa</p>
                    <p className="text-xs text-slate-500 font-medium">Transcript sẽ mở sau khi bạn nộp bài.</p>
                  </div>
                  {/* Blurred Placeholder */}
                  <div className="w-full space-y-4 pt-8 opacity-20 select-none pointer-events-none blur-[4px]">
                    <div className="h-3 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 bg-slate-200 rounded" />
                    <div className="h-3 w-2/3 bg-slate-200 rounded" />
                    <div className="h-3 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-1/3 bg-slate-200 rounded" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Questions Panel (RIGHT) */}
          <div className="flex-1 md:w-[55%] flex flex-col bg-slate-50/50 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-white/50 backdrop-blur shrink-0 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800">QUESTIONS</h2>
              {isSubmitted && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-500 uppercase">Score:</span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-black text-white shadow-sm",
                    score >= 4 ? "bg-green-500 shadow-green-100" : score >= 2 ? "bg-blue-500 shadow-blue-100" : "bg-orange-500 shadow-orange-100"
                  )}>
                    {score}/5
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="p-4 rounded-2xl bg-white border border-slate-100 text-xs font-bold text-slate-600 shadow-sm">
                Write <span className="text-blue-600 font-black">ONE WORD AND/OR A NUMBER</span> for each answer.
              </div>

              <div className="space-y-4">
                {QUESTIONS.map((q, i) => {
                  const normalizedUser = userAnswers[i].trim().toLowerCase();
                  const normalizedCorrect = q.correctAnswer.toLowerCase();
                  const isCorrect = normalizedUser === normalizedCorrect;

                  return (
                    <div key={q.id} className="space-y-3">
                      <div className={cn(
                        "p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-baseline gap-4",
                        !isSubmitted ? "bg-white border-slate-100 shadow-sm" :
                        isCorrect ? "bg-green-50/50 border-green-200" : "bg-red-50/50 border-red-200"
                      )}>
                        <span className="text-sm font-bold text-slate-700 min-w-[160px]">{q.label}</span>
                        <div className="flex-1 flex flex-wrap items-center gap-2">
                          {q.prefix && <span className="text-sm font-bold text-slate-500">{q.prefix}</span>}
                          <div className="relative inline-block min-w-[120px]">
                            <input 
                              type="text" 
                              value={userAnswers[i]}
                              onChange={(e) => {
                                if (isSubmitted) return;
                                const newAnswers = [...userAnswers];
                                newAnswers[i] = e.target.value;
                                setUserAnswers(newAnswers);
                              }}
                              placeholder="______"
                              disabled={isSubmitted}
                              className={cn(
                                "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-black focus:outline-none focus:ring-2 transition-all text-center",
                                !isSubmitted ? "focus:ring-blue-100 focus:border-blue-400" : 
                                isCorrect ? "border-green-200 bg-green-50/50 text-green-700" : "border-red-200 bg-red-50/50 text-red-700"
                              )}
                            />
                            {isSubmitted && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isCorrect ? <CheckCircle2 className="size-4 text-green-500" /> : <X className="size-4 text-red-500" />}
                              </div>
                            )}
                          </div>
                          {q.suffix && <span className="text-sm font-bold text-slate-500">{q.suffix}</span>}
                        </div>
                      </div>
                      
                      {isSubmitted && !isCorrect && (
                        <div className="flex items-start gap-3 px-2">
                          <div className="mt-1 size-1.5 rounded-full bg-red-400 shrink-0" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-red-500">Correct answer: <span className="uppercase">{q.correctAnswer}</span></p>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{q.explanation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4">
                {!isSubmitted ? (
                  <button 
                    onClick={handleCheckAnswers}
                    disabled={!isAnyFilled}
                    className={cn(
                      "w-full py-4 rounded-2xl font-black transition-all shadow-lg",
                      isAnyFilled 
                        ? "bg-blue-600 text-white shadow-blue-200 hover:scale-[1.01] active:scale-[0.99]" 
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    NỘP BÀI VÀ XEM ĐÁP ÁN
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button 
                      onClick={handleReset}
                      className="flex-1 py-4 rounded-2xl bg-slate-800 text-white font-black shadow-lg shadow-slate-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="size-5" /> LÀM LẠI
                    </button>
                    <button 
                      onClick={() => navigate({ to: "/ielts/skills/listening" })}
                      className="flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black hover:bg-slate-50 transition-all"
                    >
                      XONG
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Sticky Bottom Audio Player */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-24 flex items-center px-8">
          {/* Use translate based on sidebar to match layout */}
          <div 
            className={cn(
              "flex-1 flex items-center gap-8 transition-all duration-300",
              isSidebarOpen ? "md:ml-64" : "md:ml-16"
            )}
          >
            <div className="flex items-center gap-4 shrink-0">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="size-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="size-6 fill-current" /> : <Play className="size-6 fill-current" />}
              </button>
              <div className="hidden sm:block">
                <div className="text-xs font-black text-slate-800">IELTS Listening Test</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section 1: Questions 1-5</div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>00:45</span>
                <span>01:30</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden cursor-pointer group">
                <div className="h-full bg-blue-500 w-1/2 relative group-hover:bg-blue-600 transition-colors">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 size-4 bg-white border-2 border-blue-500 rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 text-slate-400">
              <Volume2 className="size-5 hover:text-blue-500 cursor-pointer transition-colors" />
              <div className="h-8 w-px bg-slate-100 mx-2" />
              <div className="text-xs font-black text-slate-800 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">1.0x</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, isOpen }: { icon: React.ReactNode; label: string; active?: boolean; isOpen: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer group",
      active ? "bg-blue-600/10 text-blue-400" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
    )}>
      <div className={cn("shrink-0 transition-transform", !active && "group-hover:scale-110")}>
        {icon}
      </div>
      {isOpen && <span className="text-sm font-bold tracking-tight truncate">{label}</span>}
    </div>
  );
}
