import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Volume2,
  Volume1,
  VolumeX,
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
  PenLine,
  Lock,
  Pause,
  Highlighter,
  ChevronDown,
  XCircle,
} from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/ielts/skills/listening/practice")({
  head: () => ({
    meta: [{ title: "IELTS Listening Practice Workspace" }],
  }),
  component: IELTSListeningPracticePage,
});

const QUESTIONS = [
  {
    id: 1,
    label: "John works at Old Time Toys. Yes/No?",
    prefix: "",
    suffix: "",
    correctAnswer: "No",
    timestamp: 15,
    explanation: "Marina nói cô ấy gọi từ Old Time Toys, còn John là người nhận cuộc gọi.",
  },
  {
    id: 2,
    label: "Marina wants product information, ",
    prefix: "",
    suffix: "and prices.",
    correctAnswer: "a brochure",
    timestamp: 45,
    explanation: "Marina yêu cầu gửi 'new brochure and information about your prices'.",
  },
  {
    id: 3,
    label: "Marina's number is ",
    prefix: "",
    suffix: "",
    correctAnswer: "0208 6557621",
    timestamp: 35,
    explanation: "Số điện thoại được đọc là 0-2-0-8, 6-5-5-7-6-2-1.",
  },
  {
    id: 4,
    label: "Marina's email address is ",
    prefix: "",
    suffix: "",
    correctAnswer: "marina.silva@oldtime-toys.com",
    timestamp: 55,
    explanation:
      "Email được đánh vần: M-A-R-I-N-A (marina) dot Silva (silva) at O-L-D-T-I-M-E hyphen toys (oldtime-toys) dot com.",
  },
];

const HIGHLIGHT_COLORS = [
  {
    id: "yellow",
    label: "Vàng",
    bg: "bg-yellow-200",
    ring: "ring-yellow-300",
    btn: "bg-yellow-400",
    hover: "hover:bg-yellow-500",
    text: "text-yellow-700",
    border: "border-yellow-200",
    lightBg: "bg-yellow-100",
    hoverBg: "hover:bg-yellow-200",
    pickerBg: "bg-yellow-50",
  },
  {
    id: "green",
    label: "Xanh lá",
    bg: "bg-green-200",
    ring: "ring-green-300",
    btn: "bg-green-400",
    hover: "hover:bg-green-500",
    text: "text-green-700",
    border: "border-green-200",
    lightBg: "bg-green-100",
    hoverBg: "hover:bg-green-200",
    pickerBg: "bg-green-50",
  },
  {
    id: "blue",
    label: "Xanh dương",
    bg: "bg-blue-200",
    ring: "ring-blue-300",
    btn: "bg-blue-400",
    hover: "hover:bg-blue-500",
    text: "text-blue-700",
    border: "border-blue-200",
    lightBg: "bg-blue-100",
    hoverBg: "hover:bg-blue-200",
    pickerBg: "bg-blue-50",
  },
  {
    id: "pink",
    label: "Hồng",
    bg: "bg-pink-200",
    ring: "ring-pink-300",
    btn: "bg-pink-400",
    hover: "hover:bg-pink-500",
    text: "text-pink-700",
    border: "border-pink-200",
    lightBg: "bg-pink-100",
    hoverBg: "hover:bg-pink-200",
    pickerBg: "bg-pink-50",
  },
  {
    id: "purple",
    label: "Tím",
    bg: "bg-purple-200",
    ring: "ring-purple-300",
    btn: "bg-purple-400",
    hover: "hover:bg-purple-500",
    text: "text-purple-700",
    border: "border-purple-200",
    lightBg: "bg-purple-100",
    hoverBg: "hover:bg-purple-200",
    pickerBg: "bg-purple-50",
  },
  {
    id: "orange",
    label: "Cam",
    bg: "bg-orange-200",
    ring: "ring-orange-300",
    btn: "bg-orange-400",
    hover: "hover:bg-orange-500",
    text: "text-orange-700",
    border: "border-orange-200",
    lightBg: "bg-orange-100",
    hoverBg: "hover:bg-orange-200",
    pickerBg: "bg-orange-50",
  },
  {
    id: "cyan",
    label: "Xanh lơ",
    bg: "bg-cyan-200",
    ring: "ring-cyan-300",
    btn: "bg-cyan-400",
    hover: "hover:bg-cyan-500",
    text: "text-cyan-700",
    border: "border-cyan-200",
    lightBg: "bg-cyan-100",
    hoverBg: "hover:bg-cyan-200",
    pickerBg: "bg-cyan-50",
  },
];

function IELTSListeningPracticePage() {
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscriptManualUnlocked, setIsTranscriptManualUnlocked] = useState(false);
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0]);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isHighlighterMode, setIsHighlighterMode] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [scratchpadText, setScratchpadText] = useState("");
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 90; // 01:30

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();

  // Sync isPlaying with audio element
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => console.log("Audio play failed:", err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : Math.min(1, volume);
    }
  }, [volume, isMuted]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
      if (e.code === "ArrowLeft") {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
        }
      }
      if (e.code === "ArrowRight") {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
        }
      }
      if (e.code === "ArrowUp") {
        e.preventDefault();
        setVolume((prev) => Math.min(1, prev + 0.1));
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        setVolume((prev) => Math.max(0, prev - 0.1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, duration]);

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
    setExpandedQuestions([]);
  };

  const toggleQuestionExpansion = (id: number) => {
    if (!isSubmitted) return;
    setExpandedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id],
    );
  };

  const isAnyFilled = userAnswers.some((ans) => ans.trim().length > 0);

  const toggleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parentElement =
      container.nodeType === 3 ? container.parentElement : (container as HTMLElement);

    // Check if we are already inside a highlight
    const highlightParent = parentElement?.closest(".practice-highlight");

    if (highlightParent) {
      // Unhighlight: Remove the span and keep text
      const parent = highlightParent.parentNode;
      while (highlightParent.firstChild) {
        parent?.insertBefore(highlightParent.firstChild, highlightParent);
      }
      parent?.removeChild(highlightParent);
    } else {
      // Highlight: Wrap selection in a span
      const span = document.createElement("span");
      span.className = `practice-highlight ${selectedColor.bg} text-slate-900 rounded-sm px-0.5 transition-colors cursor-pointer ring-1 ${selectedColor.ring}`;

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

  const scrollToQuestion = (id: number) => {
    const el = document.getElementById(`question-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const getEncouragement = () => {
    if (score === 5) return "Tuyệt vời! Bạn đã nắm rất chắc dạng này.";
    if (score >= 3) return "Ổn rồi! Hãy xem transcript để hiểu lỗi sai.";
    return "Không sao, dạng này cần luyện nghe nhiều lần.";
  };

  // Apply layout overrides for practice workspace
  useEffect(() => {
    // Hide default sidebar/header via body classes if possible
    document.body.classList.add("practice-mode");

    // Keyboard shortcut for highlighting (Ctrl + Shift + H)
    const handleKeyDown = (e: KeyboardEvent) => {
      // More robust check: Ctrl + Shift + H or Alt + H
      const isH = e.key.toLowerCase() === "h" || e.code === "KeyH";
      const isModifier = (e.ctrlKey && e.shiftKey) || e.altKey;

      if (isModifier && isH) {
        e.preventDefault();
        e.stopPropagation();
        toggleHighlight();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.body.classList.remove("practice-mode");
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex overflow-hidden">
      {/* 1. Practice Sidebar (Left) */}
      <div
        className={cn(
          "bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col shrink-0",
          isSidebarOpen ? "w-64" : "w-16",
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
            onClick={() => setIsHelpModalOpen(true)}
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
              <h1 className="text-sm font-black text-slate-800 tracking-tight">
                A voicemail message
              </h1>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                British Council • A1 Listening
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {!isSubmitted ? (
              <button
                onClick={handleCheckAnswers}
                disabled={!isAnyFilled}
                className={cn(
                  "px-4 py-2 rounded-xl font-black text-[10px] tracking-widest transition-all shadow-lg",
                  isAnyFilled
                    ? "bg-blue-600 text-white shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed",
                )}
              >
                NỘP BÀI & CHẤM ĐIỂM
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-black transition-all shadow-sm"
                >
                  LÀM LẠI
                </button>
                {!isTranscriptManualUnlocked && (
                  <button
                    onClick={() => setIsTranscriptManualUnlocked(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm"
                  >
                    XEM TRANSCRIPT
                  </button>
                )}
              </div>
            )}

            <div className="relative hidden lg:flex items-center">
              <button
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-l-xl font-bold text-xs border border-r-0 transition-all shadow-sm",
                  selectedColor.lightBg,
                  selectedColor.text,
                  selectedColor.border,
                  selectedColor.hoverBg,
                )}
              >
                <Highlighter className="size-4" />
                <span className="hidden sm:inline">ĐỔI MÀU</span>
              </button>

              <button
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                className={cn(
                  "size-[34px] flex items-center justify-center rounded-r-xl border transition-all hover:bg-slate-50",
                  selectedColor.border,
                  selectedColor.pickerBg,
                )}
              >
                <ChevronDown
                  className={cn(
                    "size-4 text-slate-400 transition-transform",
                    isColorPickerOpen && "rotate-180",
                  )}
                />
              </button>

              {isColorPickerOpen && (
                <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-2xl border border-slate-100 shadow-xl z-[110] min-w-[140px] animate-in fade-in zoom-in-95 duration-200">
                  <div className="grid grid-cols-3 gap-2">
                    {HIGHLIGHT_COLORS.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => {
                          setSelectedColor(color);
                          setIsColorPickerOpen(false);
                        }}
                        className={cn(
                          "size-8 rounded-full border-2 transition-all flex items-center justify-center",
                          color.btn,
                          selectedColor.id === color.id
                            ? "border-slate-800 scale-110"
                            : "border-transparent",
                        )}
                        title={color.label}
                      >
                        {selectedColor.id === color.id && <Check className="size-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Tiến độ
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {isSubmitted ? "100%" : "Đang làm bài"}
                </div>
              </div>
              <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: isSubmitted ? "100%" : "40%" }}
                />
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 font-bold text-xs border border-slate-100 hover:bg-slate-100 transition-colors">
              GỬI TRỢ GIÚP
            </button>
          </div>
        </header>

        {/* 3. Main Split Workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden pb-28">
          {/* Transcript Panel (LEFT) */}
          <div className="w-full md:w-[45%] flex flex-col border-r border-slate-100 bg-white overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <FileText className="size-4 text-blue-600" /> TRANSCRIPT
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsHighlighterMode(!isHighlighterMode)}
                  className={cn(
                    "hidden lg:flex px-3 py-1.5 rounded-full text-[10px] font-black transition-all border items-center gap-1.5 shadow-sm",
                    isHighlighterMode
                      ? "bg-yellow-400 text-yellow-900 border-yellow-500 shadow-yellow-100"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <Highlighter className="size-3" />
                  TÔ MÀU
                </button>
                <button
                  onClick={() => setIsTranscriptManualUnlocked(!isTranscriptManualUnlocked)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-black transition-all border flex items-center gap-1.5 shadow-sm",
                    isTranscriptVisible
                      ? "bg-green-600 text-white border-green-700 hover:bg-green-700"
                      : "bg-slate-900 text-white border-slate-950 hover:bg-black",
                  )}
                >
                  {isTranscriptVisible ? <Check className="size-3" /> : <Lock className="size-3" />}
                  {isTranscriptVisible ? "ĐÃ MỞ" : "ĐANG KHÓA"}
                </button>
              </div>
            </div>

            <div
              className={cn(
                "flex-1 overflow-y-auto p-8 pb-32 relative",
                isHighlighterMode && "cursor-text",
              )}
              onMouseUp={() => {
                if (isHighlighterMode) {
                  toggleHighlight();
                }
              }}
            >
              {isTranscriptVisible ? (
                <div className="space-y-6 text-sm leading-relaxed text-slate-600 font-medium animate-in fade-in duration-500">
                  <p>
                    <span className="font-bold text-slate-800">Receptionist:</span> Can I have your
                    phone number, please?
                  </p>
                  <p>
                    <span className="font-bold text-slate-800">Student:</span> Yes, it’s 0452365478
                  </p>
                  <p>
                    <span className="font-bold text-slate-800">Receptionist:</span> Thank you.
                  </p>
                  <p>
                    <span className="font-bold text-slate-800">John:</span> Hi, this is John. Thanks
                    for calling. I'm not here at the moment, so please leave a message and I'll call
                    you back.
                  </p>
                  <p>
                    <span className="font-bold text-slate-800">Marina:</span> Hi, John, this is
                    Marina Silva calling from Old Time Toys . Your colleague Alex gave me your phone
                    number. She said you can help me.
                  </p>
                  <p>
                    I need some information on your new products. Could you please call me when you
                    are back in the office? My phone number is 0-2-0-8, 6-5-5-7-6-2-1 .
                  </p>
                  <p>
                    Also, can you please email me your new brochure and information about your
                    prices? My email address is Marina.Silva@oldtime-toys.com .
                  </p>
                  <p>Thanks a lot. I look forward to hearing from you.</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <Lock className="size-8" />
                  </div>
                  <div className="space-y-2 max-w-[240px]">
                    <p className="text-sm font-black text-slate-800">Transcript đang khóa</p>
                    <p className="text-xs text-slate-500 font-medium">
                      Transcript sẽ mở sau khi bạn nộp bài.
                    </p>
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
            </div>

            <div className="flex-1 overflow-y-auto p-8 pb-32 space-y-8">
              {isSubmitted && (
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 space-y-4 animate-in slide-in-from-top duration-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-800">Kết quả luyện tập</h3>
                      <p className="text-sm text-slate-500 font-medium">{getEncouragement()}</p>
                    </div>
                    <div
                      className={cn(
                        "size-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg",
                        score === 5
                          ? "bg-green-500 shadow-green-200"
                          : score >= 3
                            ? "bg-blue-500 shadow-blue-200"
                            : "bg-orange-500 shadow-orange-200",
                      )}
                    >
                      {score}/5
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition-all"
                    >
                      LÀM LẠI
                    </button>
                    <button
                      onClick={() => setIsTranscriptManualUnlocked(true)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all"
                    >
                      XEM TRANSCRIPT
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white border border-slate-100 text-xs font-bold text-slate-600 shadow-sm">
                Write <span className="text-blue-600 font-black">ONE WORD AND/OR A NUMBER</span> for
                each answer.
              </div>

              <div className="space-y-4">
                {QUESTIONS.map((q, i) => {
                  const normalizedUser = userAnswers[i].trim().toLowerCase();
                  const normalizedCorrect = q.correctAnswer.toLowerCase();
                  const isCorrect = normalizedUser === normalizedCorrect;
                  const isExpanded = expandedQuestions.includes(q.id);

                  return (
                    <div key={q.id} id={`question-${q.id}`} className="space-y-3 scroll-mt-8">
                      <div
                        onClick={() => toggleQuestionExpansion(q.id)}
                        className={cn(
                          "p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                          !isSubmitted
                            ? "bg-white border-slate-100 shadow-sm"
                            : isCorrect
                              ? "bg-green-50/50 border-green-200 cursor-pointer hover:bg-green-50"
                              : "bg-red-50/50 border-red-200 cursor-pointer hover:bg-red-50",
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                          <span className="text-sm font-bold text-slate-700 min-w-[160px]">
                            {q.id}. {q.label.replace(/^\d+\.\s*/, "")}
                          </span>
                          <div className="flex items-center gap-2">
                            {q.prefix && (
                              <span className="text-sm font-bold text-slate-500">{q.prefix}</span>
                            )}
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
                                  !isSubmitted
                                    ? "focus:ring-blue-100 focus:border-blue-400"
                                    : isCorrect
                                      ? "border-green-200 bg-green-50 text-green-700"
                                      : "border-red-200 bg-red-50 text-red-700",
                                )}
                              />
                            </div>
                            {q.suffix && (
                              <span className="text-sm font-bold text-slate-500">{q.suffix}</span>
                            )}
                          </div>
                        </div>

                        {isSubmitted && (
                          <div className="flex flex-col items-end shrink-0 sm:min-w-[120px]">
                            {isCorrect ? (
                              <div className="flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-1.5 text-green-600 font-black text-[10px] bg-green-100/50 px-3 py-1 rounded-full border border-green-200">
                                  <CheckCircle2 className="size-3.5" />
                                  <span>ĐÚNG</span>
                                </div>
                                {isExpanded && (
                                  <div className="text-[10px] font-black text-green-700 bg-green-100 px-2.5 py-1 rounded-lg border border-green-200 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                                    <span className="text-green-500">Đ/A:</span>
                                    <span>{q.correctAnswer.toUpperCase()}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-1.5 text-red-600 font-black text-[10px] bg-red-100/50 px-3 py-1 rounded-full border border-red-200">
                                  <XCircle className="size-3.5" />
                                  <span>SAI</span>
                                </div>
                                {isExpanded && (
                                  <div className="text-[10px] font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                                    <span className="text-slate-400">Đ/A:</span>
                                    <span className="text-blue-600">
                                      {q.correctAnswer.toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {isSubmitted && isExpanded && (
                        <div className="flex items-start gap-3 px-2 py-2 bg-white/50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2 duration-300">
                          <div
                            className={cn(
                              "mt-1.5 size-1.5 rounded-full shrink-0",
                              isCorrect ? "bg-green-400" : "bg-red-400",
                            )}
                          />
                          <div className="space-y-1.5">
                            <p
                              className={cn(
                                "text-xs font-bold",
                                isCorrect ? "text-green-600" : "text-red-500",
                              )}
                            >
                              {isCorrect ? "Đáp án chính xác: " : "Đáp án đúng là: "}
                              <span className="uppercase">{q.correctAnswer}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                              <span className="font-bold text-slate-700 mr-1">Giải thích:</span>
                              {q.explanation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex flex-col items-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Kết thúc bài nghe
                </div>
                <div className="w-12 h-1 bg-slate-100 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Sticky Bottom Bar split into 2 sections */}
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] h-28 flex">
          {/* Section 1: Sticky Bottom Audio Player (Under Transcript) */}
          <div className="w-full md:w-[45%] border-r border-slate-100 flex items-center px-6 gap-6 bg-white">
            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="size-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 shrink-0"
              >
                {isPlaying ? <Pause className="size-6" /> : <Play className="size-6 ml-1" />}
              </button>

              {/* Waveform Visualizer */}
              <div className="hidden xl:flex items-center gap-0.5 h-6 px-2">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-0.5 bg-blue-400/40 rounded-full transition-all duration-500",
                      isPlaying ? "animate-bounce" : "h-1 bg-slate-200",
                    )}
                    style={{
                      height: isPlaying ? `${20 + Math.random() * 80}%` : "4px",
                      animationDuration: `${0.5 + Math.random() * 0.5}s`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="text-blue-600">{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="relative group flex items-center h-4">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCurrentTime(val);
                    if (audioRef.current) {
                      audioRef.current.currentTime = val;
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="absolute inset-x-0 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-75"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div
                  className="absolute size-3.5 bg-white border-2 border-blue-500 rounded-full shadow-md z-10 pointer-events-none transition-all duration-75 group-hover:scale-125"
                  style={{ left: `calc(${(currentTime / duration) * 100}% - 7px)` }}
                />
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4 shrink-0">
              <div className="h-8 w-px bg-slate-100" />

              <div className="flex items-center gap-3 bg-slate-50/50 px-3 py-2 rounded-2xl border border-slate-100 group transition-all hover:bg-slate-50 hover:border-slate-200">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="size-4" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="size-4" />
                  ) : (
                    <Volume2 className="size-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVol = parseFloat(e.target.value);
                    setVolume(newVol);
                    if (newVol > 0) setIsMuted(false);
                  }}
                  className="w-20 h-1 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />
              </div>

              <button
                onClick={() => {
                  const rates = [1, 1.25, 1.5, 2];
                  const currentIndex = rates.indexOf(playbackRate);
                  const nextIndex = (currentIndex + 1) % rates.length;
                  setPlaybackRate(rates[nextIndex]);
                }}
                className="text-[10px] font-black text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all min-w-[48px]"
              >
                {playbackRate.toFixed(1)}x
              </button>
            </div>
          </div>

          {/* Section 2: Current Questions Status (Under Questions List) */}
          <div className="flex-1 md:w-[55%] flex items-center px-8 bg-slate-50/50">
            <div className="flex-1 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layout className="size-4 text-blue-600" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Question Navigator
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {userAnswers.filter((a) => a.trim().length > 0).length}/{QUESTIONS.length}{" "}
                    Answered
                  </span>
                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                  <div className="hidden sm:flex items-center gap-1">
                    <div className="size-1.5 rounded-full bg-blue-600" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Current
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {QUESTIONS.map((q, i) => {
                  const isAnswered = userAnswers[i].trim().length > 0;
                  const isCorrect =
                    isSubmitted &&
                    userAnswers[i].trim().toLowerCase() === q.correctAnswer.toLowerCase();

                  return (
                    <button
                      key={q.id}
                      onClick={() => scrollToQuestion(q.id)}
                      className={cn(
                        "flex-1 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all border-2 mr-2",
                        !isSubmitted
                          ? isAnswered
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105"
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                          : isCorrect
                            ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-100"
                            : "bg-red-500 border-red-500 text-white shadow-lg shadow-red-100",
                      )}
                    >
                      {q.id}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scratchpad Floating Button */}
      <button
        onClick={() => setIsScratchpadOpen(!isScratchpadOpen)}
        className={cn(
          "fixed bottom-32 right-8 z-[150] size-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 group",
          isScratchpadOpen
            ? "bg-slate-800 text-white rotate-90"
            : "bg-white text-blue-600 border border-blue-100 hover:border-blue-200",
        )}
      >
        {isScratchpadOpen ? <X className="size-6" /> : <PenLine className="size-6" />}
        {!isScratchpadOpen && (
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            GIẤY NHÁP
          </span>
        )}
      </button>

      {/* Scratchpad Panel */}
      <div
        className={cn(
          "fixed top-24 bottom-32 right-8 w-80 z-[140] transition-all duration-500 ease-out",
          isScratchpadOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-12 opacity-0 pointer-events-none",
        )}
      >
        <div className="h-full bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white flex flex-col overflow-hidden ring-1 ring-slate-200/50">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <PenLine className="size-4 text-blue-600" />
              </div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Giấy nháp
              </span>
            </div>
            <button
              onClick={() => setScratchpadText("")}
              className="text-[9px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              Xóa hết
            </button>
          </div>
          <textarea
            value={scratchpadText}
            onChange={(e) => setScratchpadText(e.target.value)}
            placeholder="Ghi chú nhanh ở đây (tên riêng, số điện thoại, keyword...)"
            className="flex-1 p-6 text-sm font-medium text-slate-600 placeholder:text-slate-300 resize-none focus:outline-none bg-transparent leading-relaxed"
          />
          <div className="p-4 bg-blue-50/50 border-t border-blue-100/50">
            <p className="text-[9px] font-bold text-blue-400 text-center uppercase tracking-[0.2em]">
              Tự động lưu nội dung
            </p>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsHelpModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-800">Bạn cần trợ giúp gì?</h3>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="size-8 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {[
                "Không nghe được số",
                "Không hiểu spelling",
                "Không biết vì sao sai",
                "Audio quá nhanh",
                "Lỗi giao diện / lỗi audio",
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setIsHelpModalOpen(false)}
                  className="w-full text-left p-4 rounded-2xl hover:bg-blue-50 text-slate-600 font-bold text-sm transition-colors flex items-center justify-between group"
                >
                  <span>{opt}</span>
                  <ChevronRight className="size-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
            <div className="p-6 bg-slate-50 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Chúng tôi sẽ phản hồi sớm nhất có thể
              </p>
            </div>
          </div>
        </div>
      )}
      <audio
        ref={audioRef}
        src="https://learnenglish.britishcouncil.org/sites/podcasts/files/LE_listening_A1_A_voicemail_message.mp3"
        onTimeUpdate={(e) => {
          const audio = e.target as HTMLAudioElement;
          setCurrentTime(Math.floor(audio.currentTime));
        }}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  isOpen,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isOpen: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer group",
        active
          ? "bg-blue-600/10 text-blue-400"
          : "text-slate-500 hover:bg-white/5 hover:text-slate-300",
      )}
    >
      <div className={cn("shrink-0 transition-transform", !active && "group-hover:scale-110")}>
        {icon}
      </div>
      {isOpen && <span className="text-sm font-bold tracking-tight truncate">{label}</span>}
    </div>
  );
}
