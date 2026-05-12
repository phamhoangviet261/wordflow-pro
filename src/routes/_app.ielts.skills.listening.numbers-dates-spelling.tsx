import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { 
  IELTSModuleHero, 
  IELTSObjectivesCard, 
  IELTSMiniLessonCard, 
  IELTSMistakeCard, 
  IELTSReviewStep 
} from "@/features/ielts/components";
import { 
  ArrowLeft, 
  Volume2, 
  CheckCircle2, 
  Lightbulb, 
  ChevronRight,
  BookOpen,
  MessageSquare,
  Lock as LockIcon,
  Play,
  RotateCcw,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/ielts/skills/listening/numbers-dates-spelling")({
  head: () => ({
    meta: [
      { title: "Numbers, Dates & Spelling — IELTS Listening" },
      { name: "description", content: "Luyện nghe số điện thoại, ngày tháng, tên riêng và spelling cho IELTS Listening Part 1." },
    ],
  }),
  component: NumbersDatesSpellingPage,
});

const QUESTIONS = [
  { 
    id: 1, 
    label: "1. Phone number:", 
    placeholder: "07982 ______", 
    correctAnswer: "441236",
    explanation: "Số điện thoại thường được đọc theo từng cụm. Hãy chú ý các con số lặp lại và nhịp nghỉ của người nói."
  },
  { 
    id: 2, 
    label: "2. Date of appointment:", 
    placeholder: "______ April", 
    correctAnswer: "15th",
    explanation: "Ngày tháng có thể được đọc là “the fifteenth of April” hoặc “April the fifteenth”."
  },
  { 
    id: 3, 
    label: "3. Surname:", 
    placeholder: "______", 
    correctAnswer: "Henderson",
    explanation: "Họ và tên riêng thường được đánh vần từng chữ cái trong IELTS Listening Part 1."
  },
  { 
    id: 4, 
    label: "4. Email:", 
    placeholder: "martin.______@mail.com", 
    correctAnswer: "green",
    explanation: "Với email, hãy chú ý các từ như dot (dấu chấm), dash (dấu gạch ngang), underscore (gạch dưới) và spelling trước dấu @."
  },
  { 
    id: 5, 
    label: "5. Postcode:", 
    placeholder: "______ 4QP", 
    correctAnswer: "SW12",
    explanation: "Mã bưu điện thường kết hợp cả chữ cái và con số, hãy viết chính xác thứ tự nghe được."
  },
];

function NumbersDatesSpellingPage() {
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(5).fill(""));
  const [showResults, setShowResults] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const objectives = [
    "Nghe và ghi đúng số điện thoại, giá tiền, giờ giấc.",
    "Nhận diện ngày tháng, năm và cách đọc ngày trong tiếng Anh.",
    "Nghe spelling tên riêng, địa chỉ, email và postcode.",
    "Tránh lỗi thường gặp như nhầm số, thiếu chữ cái hoặc sai thứ tự ký tự.",
    "Biết cách kiểm tra đáp án theo giới hạn từ trong đề IELTS."
  ];

  const miniLessons = [
    {
      title: "Numbers",
      content: "Trong IELTS Listening Part 1, số thường xuất hiện ở phone number, price, room number, booking number hoặc time. Người học cần chú ý các cặp dễ nhầm như 13/30, 14/40, 15/50, 16/60.",
      examples: ["thirteen vs thirty", "fifteen vs fifty", "double two = 22", "oh / zero = 0"]
    },
    {
      title: "Dates",
      content: "Ngày tháng có thể được đọc theo nhiều cách khác nhau. Người học cần nghe kỹ thứ tự ngày và tháng, đặc biệt với các tháng có âm gần giống nhau.",
      examples: ["March vs May", "June vs July", "15th of April", "April the 15th"]
    },
    {
      title: "Spelling",
      content: "Tên riêng, họ, địa chỉ và email thường được đánh vần từng chữ. Người học cần luyện các chữ cái dễ nhầm âm.",
      examples: ["B vs P", "M vs N", "G vs J", "A vs H", "E vs I"]
    },
    {
      title: "Contact Details",
      content: "Các thông tin liên hệ như email, postcode và địa chỉ thường có ký tự đặc biệt hoặc chuỗi chữ-số. Người học cần nghe chính xác từng phần.",
      examples: ["at = @", "dot = .", "dash = -", "postcode: SW1A 1AA"]
    }
  ];

  const commonMistakes = [
    {
      title: "Nhầm teen và ty numbers",
      description: "Người học thường nhầm thirteen với thirty, fourteen với forty, fifteen với fifty."
    },
    {
      title: "Thiếu chữ cái khi nghe spelling",
      description: "Khi audio đánh vần nhanh, người học dễ bỏ sót chữ cái hoặc đảo thứ tự chữ."
    },
    {
      title: "Viết sai định dạng ngày tháng",
      description: "Cần thống nhất cách viết ngày tháng và kiểm tra yêu cầu của đề."
    },
    {
      title: "Không chú ý correction",
      description: "Speaker có thể sửa lại thông tin, ví dụ “Actually, it’s not 15th, it’s 16th.”"
    }
  ];

  const score = useMemo(() => {
    return userAnswers.reduce((acc, ans, idx) => {
      const normalizedUser = ans.trim().toLowerCase();
      const normalizedCorrect = QUESTIONS[idx].correctAnswer.toLowerCase();
      return acc + (normalizedUser === normalizedCorrect ? 1 : 0);
    }, 0);
  }, [userAnswers, showResults]);

  const handleCheckAnswers = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setUserAnswers(Array(5).fill(""));
    setShowResults(false);
  };

  const isAnyFilled = userAnswers.some(ans => ans.trim().length > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 px-4">
      {/* 1. Back navigation */}
      <Link 
        to="/ielts/skills/listening" 
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Quay lại Listening
      </Link>

      {/* 2. Module Hero */}
      <IELTSModuleHero 
        title="Numbers, Dates & Spelling"
        description="Đây là bài nền tảng giúp bạn nghe chính xác các thông tin ngắn thường xuất hiện trong IELTS Listening Part 1 như tên người, số điện thoại, ngày tháng, địa chỉ, email và postcode."
        skillName="Listening"
        level="Beginner"
        difficulty={1}
        estimatedTime="15-20 minutes"
        progress={showResults ? Math.round((score / 5) * 100) : 0}
        accentColor="text-blue-600"
        bgLight="bg-blue-50"
        startTo="/ielts/skills/listening/practice"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* 4. Mini Lesson */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-blue-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Bài học nhanh</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {miniLessons.map((lesson, idx) => (
                <IELTSMiniLessonCard key={idx} {...lesson} />
              ))}
            </div>
          </section>

          {/* 5. Practice Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-blue-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Luyện tập</h2>
            </div>
            
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-8">
              {/* Mock Audio Player UI */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                <div className="size-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-200 cursor-pointer hover:scale-105 transition-transform">
                  <Play className="size-8 fill-current" />
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-slate-800">Audio luyện tập</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">Mock audio</span>
                        <span>01:30</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-1/3" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic">
                    Audio thật sẽ được thêm sau. Hiện tại đây là phần mô phỏng giao diện luyện nghe.
                  </p>
                </div>
              </div>

              {/* Result Summary */}
              {showResults && (
                <div className={cn(
                  "p-6 rounded-3xl border animate-in fade-in slide-in-from-top-4 duration-500",
                  score === 5 ? "bg-green-50 border-green-100 text-green-700" : 
                  score >= 3 ? "bg-blue-50 border-blue-100 text-blue-700" : 
                  "bg-orange-50 border-orange-100 text-orange-700"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "size-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm",
                      score === 5 ? "bg-green-500 text-white" : 
                      score >= 3 ? "bg-blue-500 text-white" : 
                      "bg-orange-500 text-white"
                    )}>
                      {score}/5
                    </div>
                    <div>
                      <div className="text-lg font-black tracking-tight">
                        {score === 5 ? "Tuyệt vời!" : score >= 3 ? "Khá lắm!" : "Cố gắng lên!"}
                      </div>
                      <p className="text-sm font-medium opacity-80">
                        {score === 5 ? "Bạn đã nắm rất chắc dạng này." : 
                         score >= 3 ? "Hãy review transcript để hiểu lỗi sai." : 
                         "Dạng này cần luyện nghe nhiều lần để quen nhịp."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">
                  Điền vào chỗ trống (Giới hạn: ONE WORD AND/OR A NUMBER)
                </div>
                <div className="space-y-4">
                  {QUESTIONS.map((q, i) => {
                    const isCorrect = userAnswers[i].trim().toLowerCase() === q.correctAnswer.toLowerCase();
                    return (
                      <div key={q.id} className="space-y-2">
                        <div className={cn(
                          "flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition-all",
                          !showResults ? "border-slate-50 bg-white hover:border-blue-100" : 
                          isCorrect ? "border-green-100 bg-green-50/30" : "border-red-100 bg-red-50/30"
                        )}>
                          <span className="text-sm font-bold text-slate-700 min-w-[160px]">{q.label}</span>
                          <div className="relative flex-1">
                            <input 
                              type="text" 
                              value={userAnswers[i]}
                              onChange={(e) => {
                                const newAnswers = [...userAnswers];
                                newAnswers[i] = e.target.value;
                                setUserAnswers(newAnswers);
                              }}
                              placeholder={q.placeholder}
                              readOnly={showResults}
                              className={cn(
                                "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 transition-all",
                                !showResults ? "focus:ring-blue-100 focus:border-blue-400" : 
                                isCorrect ? "focus:ring-green-100 border-green-200" : "focus:ring-red-100 border-red-200"
                              )}
                            />
                            {showResults && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isCorrect ? (
                                  <CheckCircle2 className="size-5 text-green-500" />
                                ) : (
                                  <X className="size-5 text-red-500" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {showResults && !isCorrect && (
                          <div className="px-4 text-[11px] font-bold text-red-500 flex items-center gap-2">
                            <span>Đáp án đúng:</span> 
                            <span className="bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase tracking-tight">{q.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {!showResults ? (
                <button 
                  onClick={handleCheckAnswers}
                  disabled={!isAnyFilled}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black transition-all shadow-lg",
                    isAnyFilled 
                      ? "bg-blue-600 text-white shadow-blue-200 hover:scale-[1.01] active:scale-[0.99]" 
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  KIỂM TRA ĐÁP ÁN
                </button>
              ) : (
                <button 
                  onClick={handleReset}
                  className="w-full py-4 rounded-2xl bg-slate-800 text-white font-black shadow-lg shadow-slate-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="size-5" /> LÀM LẠI
                </button>
              )}
            </div>

            {/* Review Section */}
            {showResults && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-blue-500 rounded-full" />
                  <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <MessageSquare className="size-5 text-blue-600" /> Review đáp án
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {QUESTIONS.map((q, idx) => (
                    <div key={q.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Câu {idx + 1}</span>
                        {userAnswers[idx].trim().toLowerCase() === q.correctAnswer.toLowerCase() ? (
                          <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-green-100">Chính xác</span>
                        ) : (
                          <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-red-100">Chưa đúng</span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">{q.label.replace(':', '')}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{q.explanation}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Transcript Mock */}
            <section className="space-y-4">
              <button 
                onClick={() => setShowTranscript(!showTranscript)}
                className="flex items-center justify-between w-full p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BookOpen className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Transcript mẫu</h3>
                </div>
                {showTranscript ? <ChevronUp className="size-5 text-slate-400" /> : <ChevronDown className="size-5 text-slate-400" />}
              </button>
              
              {showTranscript && (
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-6 text-sm leading-relaxed text-slate-600 font-medium">
                    <div className="space-y-2">
                      <p><span className="font-bold text-slate-800">Receptionist:</span> Can I have your phone number, please?</p>
                      <p><span className="font-bold text-slate-800">Student:</span> Yes, it’s <span className="bg-blue-100 text-blue-700 px-1 rounded font-black">07982 441236</span>.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p><span className="font-bold text-slate-800">Receptionist:</span> And what date would you like to book the appointment?</p>
                      <p><span className="font-bold text-slate-800">Student:</span> The <span className="bg-blue-100 text-blue-700 px-1 rounded font-black">15th</span> of April, if possible.</p>
                    </div>

                    <div className="space-y-2">
                      <p><span className="font-bold text-slate-800">Receptionist:</span> Could you spell your surname?</p>
                      <p><span className="font-bold text-slate-800">Student:</span> Sure. It’s <span className="bg-blue-100 text-blue-700 px-1 rounded font-black">Henderson</span>. H-E-N-D-E-R-S-O-N.</p>
                    </div>

                    <div className="space-y-2">
                      <p><span className="font-bold text-slate-800">Receptionist:</span> And your email address?</p>
                      <p><span className="font-bold text-slate-800">Student:</span> It’s martin.<span className="bg-blue-100 text-blue-700 px-1 rounded font-black">green</span>@mail.com.</p>
                    </div>

                    <div className="space-y-2">
                      <p><span className="font-bold text-slate-800">Receptionist:</span> Finally, what’s your postcode?</p>
                      <p><span className="font-bold text-slate-800">Student:</span> It’s <span className="bg-blue-100 text-blue-700 px-1 rounded font-black">SW12</span> 4QP.</p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </section>

          {/* 6. Common Mistakes */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-amber-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Lỗi thường gặp</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonMistakes.map((mistake, idx) => (
                <IELTSMistakeCard key={idx} {...mistake} />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-12">
          {/* 3. Learning Objectives */}
          <IELTSObjectivesCard objectives={objectives} />

          {/* 7. Transcript Review Method */}
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-3xl" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Lightbulb className="size-6 text-amber-300" />
                </div>
                <h3 className="text-xl font-bold">Cách review sau khi luyện</h3>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed font-medium">
                Sau khi làm bài, đừng chỉ xem đáp án đúng/sai. Hãy mở transcript, tìm đúng câu chứa đáp án, gạch chân keyword, sau đó ghi lại lỗi sai vào mistake notebook.
              </p>
              <div className="space-y-4 pt-2">
                {[
                  "Nghe lần 1 và làm bài như thi thật.",
                  "Nghe lần 2 để kiểm tra những câu chưa chắc.",
                  "Mở transcript và tìm câu chứa đáp án.",
                  "Ghi lại lỗi sai: nhầm âm, nhầm số, sai spelling hoặc mất tập trung."
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="size-6 rounded-full bg-white/20 text-white flex items-center justify-center font-black text-[10px] shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-xs text-blue-50 font-medium leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 8. Next Modules */}
          <section className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Học tiếp theo</h3>
            <div className="space-y-4">
              <Link 
                to="/ielts/skills/listening"
                className="block p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Form Completion</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      Áp dụng kỹ năng nghe số, ngày tháng và spelling vào dạng điền form trong IELTS Part 1.
                    </p>
                  </div>
                  <ChevronRight className="size-5 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
              <Link 
                to="/ielts/skills/listening"
                className="block p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group opacity-60"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800">Note Completion</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      Luyện ghi chú thông tin ngắn và nhận diện keyword trong câu hỏi.
                    </p>
                  </div>
                  <LockIcon className="size-4 text-slate-300" />
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
