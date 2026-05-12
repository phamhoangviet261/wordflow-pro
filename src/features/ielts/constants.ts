import { Headphones, BookOpen, PenTool, Mic, LucideIcon } from "lucide-react";

export interface IELTSPhase {
  title: string;
  target: string;
  description: string;
  status: "completed" | "current" | "upcoming";
}

export interface IELTSPracticeType {
  title: string;
  description: string;
}

export interface IELTSLesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
}

export interface IELTSSkillConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  accentColor: string;
  bgLight: string;
  rating: number;
  lessonsCount: number;
  progress: number;
  practiceTypes: IELTSPracticeType[];
  lessons: IELTSLesson[];
  tips: string[];
}

export const ieltsPhases: IELTSPhase[] = [
  {
    title: "Xây nền tảng",
    target: "Band 3.0 → 4.0",
    description: "Tập trung vào ngữ pháp cơ bản, phát âm và từ vựng thông dụng hàng ngày.",
    status: "completed",
  },
  {
    title: "Luyện từng kỹ năng",
    target: "Band 4.0 → 5.0",
    description: "Làm quen với các dạng bài tập Listening, Reading, Writing và Speaking.",
    status: "current",
  },
  {
    title: "Làm quen format IELTS",
    target: "Band 5.0 → 6.0",
    description: "Chiến thuật làm bài cho từng phần thi và quản lý thời gian hiệu quả.",
    status: "upcoming",
  },
  {
    title: "Luyện đề & tối ưu điểm",
    target: "Band 6.0+",
    description: "Thực hành với các bộ đề thi thật và cải thiện những lỗi sai thường gặp.",
    status: "upcoming",
  },
];

export const ieltsSkills: Record<string, IELTSSkillConfig> = {
  listening: {
    id: "listening",
    name: "Listening",
    description: "Cải thiện khả năng nghe hiểu thông qua các bài nghe đa dạng từ hội thoại hàng ngày đến bài giảng học thuật.",
    icon: Headphones,
    color: "blue",
    accentColor: "text-blue-600",
    bgLight: "bg-blue-50",
    rating: 4.8,
    lessonsCount: 24,
    progress: 35,
    practiceTypes: [
      { title: "Multiple Choice", description: "Chọn đáp án đúng từ các lựa chọn cho sẵn." },
      { title: "Form Completion", description: "Điền thông tin vào biểu mẫu, ghi chú hoặc bảng biểu." },
      { title: "Map/Plan Labeling", description: "Xác định vị trí các địa điểm trên bản đồ hoặc sơ đồ." },
    ],
    lessons: [
      { id: "l1", title: "Giới thiệu format Listening", duration: "10:00", isCompleted: true },
      { id: "l2", title: "Chiến thuật điền tên và số", duration: "15:20", isCompleted: true },
      { id: "l3", title: "Luyện nghe Part 1: Đăng ký dịch vụ", duration: "12:45", isCompleted: false },
    ],
    tips: [
      "Luôn đọc kỹ yêu cầu số lượng từ được điền.",
      "Chú ý đến các từ nối và dấu hiệu chuyển ý trong bài nghe.",
      "Luyện tập kỹ năng nghe và viết cùng lúc (dictation).",
    ],
  },
  reading: {
    id: "reading",
    name: "Reading",
    description: "Phát triển kỹ năng đọc nhanh, tìm ý chính và trả lời chính xác các dạng câu hỏi học thuật.",
    icon: BookOpen,
    color: "emerald",
    accentColor: "text-emerald-600",
    bgLight: "bg-emerald-50",
    rating: 4.7,
    lessonsCount: 30,
    progress: 20,
    practiceTypes: [
      { title: "Matching Headings", description: "Nối tiêu đề phù hợp cho từng đoạn văn." },
      { title: "True/False/Not Given", description: "Xác định tính chính xác của thông tin dựa trên bài đọc." },
      { title: "Sentence Completion", description: "Hoàn thành câu bằng cách lấy từ trong văn bản." },
    ],
    lessons: [
      { id: "r1", title: "Skimming vs Scanning", duration: "08:30", isCompleted: true },
      { id: "r2", title: "Cách xử lý bài Matching Headings", duration: "14:10", isCompleted: false },
      { id: "r3", title: "Từ vựng học thuật theo chủ đề Environment", duration: "11:55", isCompleted: false },
    ],
    tips: [
      "Không cần hiểu 100% từ mới để trả lời câu hỏi.",
      "Quản lý thời gian: 20 phút cho mỗi Passage.",
      "Chú ý các từ đồng nghĩa (synonyms) trong câu hỏi và bài đọc.",
    ],
  },
  writing: {
    id: "writing",
    name: "Writing",
    description: "Học cách xây dựng cấu trúc bài viết Task 1 và Task 2 một cách logic và sử dụng từ vựng nâng cao.",
    icon: PenTool,
    color: "purple",
    accentColor: "text-purple-600",
    bgLight: "bg-purple-50",
    rating: 4.9,
    lessonsCount: 18,
    progress: 10,
    practiceTypes: [
      { title: "Task 1: Data Description", desc: "Mô tả biểu đồ đường, cột, tròn hoặc bảng biểu." },
      { title: "Task 2: Essay Writing", desc: "Viết bài luận nghị luận về các chủ đề xã hội." },
      { title: "Cohesion & Coherence", desc: "Sử dụng từ nối để bài viết mạch lạc hơn." },
    ],
    lessons: [
      { id: "w1", title: "Cấu trúc bài Task 1 chuẩn", duration: "12:00", isCompleted: true },
      { id: "w2", title: "Cách phân tích biểu đồ Line Graph", duration: "18:45", isCompleted: false },
      { id: "w3", title: "Brainstorming ý tưởng cho Task 2", duration: "15:30", isCompleted: false },
    ],
    tips: [
      "Luôn dành 5 phút để lập dàn ý trước khi viết.",
      "Tránh lặp từ bằng cách sử dụng từ đồng nghĩa phù hợp.",
      "Kiểm tra lại lỗi ngữ pháp và dấu câu sau khi viết xong.",
    ],
  },
  speaking: {
    id: "speaking",
    name: "Speaking",
    description: "Luyện phản xạ nói tự nhiên, cải thiện phát âm và mở rộng vốn từ cho 3 phần thi nói.",
    icon: Mic,
    color: "orange",
    accentColor: "text-orange-600",
    bgLight: "bg-orange-50",
    rating: 4.9,
    lessonsCount: 20,
    progress: 45,
    practiceTypes: [
      { title: "Part 1: Basic QA", description: "Trả lời các câu hỏi về bản thân và các chủ đề quen thuộc." },
      { title: "Part 2: Long Turn", description: "Nói liên tục trong 2 phút về một chủ đề cho sẵn." },
      { title: "Part 3: Discussion", description: "Thảo luận sâu về các vấn đề mang tính trừu tượng." },
    ],
    lessons: [
      { id: "s1", title: "Vượt qua nỗi sợ khi nói", duration: "09:20", isCompleted: true },
      { id: "s2", title: "Kỹ thuật mở rộng câu trả lời", duration: "13:50", isCompleted: true },
      { id: "s3", title: "Các mẫu câu Part 2 thông dụng", duration: "16:15", isCompleted: false },
    ],
    tips: [
      "Hãy nói tự nhiên, không nên học thuộc lòng câu trả lời.",
      "Sử dụng các từ đệm (fillers) một cách hợp lý để có thêm thời gian suy nghĩ.",
      "Chú ý đến độ trôi chảy (fluency) hơn là ngữ pháp quá phức tạp.",
    ],
  },
};
