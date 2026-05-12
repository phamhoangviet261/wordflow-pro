import { createFileRoute, Link } from "@tanstack/react-router";
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
  Lock as LockIcon
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

function NumbersDatesSpellingPage() {
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
        progress={0}
        accentColor="text-blue-600"
        bgLight="bg-blue-50"
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

          {/* 5. Practice Preview */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-blue-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Luyện tập mẫu</h2>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-8">
              {/* Audio Placeholder */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-3 group hover:border-blue-300 transition-colors">
                <div className="size-16 rounded-full bg-white flex items-center justify-center text-slate-300 shadow-sm group-hover:text-blue-400 group-hover:scale-110 transition-all">
                  <Volume2 className="size-8" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-500">Audio Placeholder</div>
                  <div className="text-[10px] font-medium text-slate-400">Audio luyện tập sẽ sớm được cập nhật</div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">
                  Điền vào chỗ trống (Giới hạn: ONE WORD AND/OR A NUMBER)
                </div>
                <div className="space-y-4">
                  {[
                    { label: "1. Phone number:", placeholder: "07982 ______" },
                    { label: "2. Date of appointment:", placeholder: "______ April" },
                    { label: "3. Surname:", placeholder: "______" },
                    { label: "4. Email:", placeholder: "martin.______@mail.com" },
                    { label: "5. Postcode:", placeholder: "______ 4QP" },
                  ].map((q, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-white hover:border-blue-100 transition-colors">
                      <span className="text-sm font-bold text-slate-700 min-w-[160px]">{q.label}</span>
                      <input 
                        type="text" 
                        placeholder={q.placeholder}
                        disabled
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none cursor-not-allowed"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button disabled className="w-full py-4 rounded-2xl bg-slate-100 text-slate-400 font-black cursor-not-allowed transition-all">
                KIỂM TRA ĐÁP ÁN
              </button>
            </div>
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
