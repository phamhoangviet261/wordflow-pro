import { Headphones, BookOpen, PenTool, Mic, LucideIcon, Zap, Target, Search, FileText } from "lucide-react";

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

export interface IELTSModule {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  estimatedTime: string;
  difficulty: number; // 1 to 5
  status: "Available" | "Locked" | "Coming soon";
}

export interface IELTSSkillConfig {
  id: string;
  name: string;
  vietnameseName: string;
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
  modules?: IELTSModule[];
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

export const listeningModules: IELTSModule[] = [
  // Beginner
  {
    id: "listening-numbers-dates-spelling",
    title: "Numbers, Dates & Spelling",
    level: "Beginner",
    description: "Luyện nghe số điện thoại, giá tiền, ngày tháng, tên riêng, địa chỉ, email, postcode và spelling. Đây là nền tảng quan trọng nhất cho IELTS Listening Part 1.",
    estimatedTime: "15-20 minutes",
    difficulty: 1,
    status: "Available"
  },
  {
    id: "listening-form-completion",
    title: "Form Completion",
    level: "Beginner",
    description: "Điền thông tin ngắn vào form, thường gặp trong các tình huống đăng ký khóa học, đặt phòng, tư vấn dịch vụ hoặc hỏi thông tin cá nhân.",
    estimatedTime: "15-20 minutes",
    difficulty: 1,
    status: "Available"
  },
  {
    id: "listening-note-completion",
    title: "Note Completion",
    level: "Beginner",
    description: "Điền từ còn thiếu vào ghi chú. Người học cần biết dự đoán loại từ, bắt keyword và nghe paraphrase.",
    estimatedTime: "15-20 minutes",
    difficulty: 2,
    status: "Available"
  },
  {
    id: "m4",
    title: "Table Completion",
    level: "Beginner",
    description: "Điền thông tin vào bảng. Luyện cách theo hàng, cột, so sánh thông tin và không bị lạc thứ tự trong audio.",
    estimatedTime: "15-20 minutes",
    difficulty: 2,
    status: "Locked"
  },
  {
    id: "m5",
    title: "Sentence Completion",
    level: "Beginner",
    description: "Điền từ vào câu hoàn chỉnh. Dạng này giúp người học luyện nghe ngữ cảnh, xác định loại từ cần điền và tránh viết thừa từ.",
    estimatedTime: "15-20 minutes",
    difficulty: 2,
    status: "Locked"
  },
  // Intermediate
  {
    id: "m6",
    title: "Multiple Choice",
    level: "Intermediate",
    description: "Chọn đáp án đúng A/B/C hoặc chọn nhiều đáp án. Tập trung luyện cách tránh distractors, nhận diện paraphrase và phân biệt thông tin được nhắc tới với đáp án đúng.",
    estimatedTime: "20-30 minutes",
    difficulty: 3,
    status: "Locked"
  },
  {
    id: "m7",
    title: "Matching",
    level: "Intermediate",
    description: "Nối người, địa điểm, ý kiến hoặc thông tin với danh sách lựa chọn. Người học cần theo dõi nhiều options và nhận ra cách diễn đạt tương đương trong audio.",
    estimatedTime: "20-30 minutes",
    difficulty: 3,
    status: "Locked"
  },
  {
    id: "m8",
    title: "Map / Plan Labelling",
    level: "Intermediate",
    description: "Dán nhãn bản đồ hoặc sơ đồ mặt bằng. Luyện từ vựng chỉ hướng, vị trí, lối đi, khu vực và cách theo dõi hướng di chuyển trong audio.",
    estimatedTime: "20-30 minutes",
    difficulty: 4,
    status: "Locked"
  },
  {
    id: "m9",
    title: "Diagram Labelling",
    level: "Intermediate",
    description: "Dán nhãn sơ đồ, máy móc hoặc quy trình. Người học cần nhận diện bộ phận, vị trí trong hình và các từ chỉ trình tự.",
    estimatedTime: "20-30 minutes",
    difficulty: 4,
    status: "Coming soon"
  },
  // Advanced
  {
    id: "m10",
    title: "Classification",
    level: "Advanced",
    description: "Phân loại thông tin vào các nhóm cho sẵn. Dạng này yêu cầu nghe tiêu chí phân loại, theo dõi nhiều item liên tục và nhận diện phủ định hoặc thay đổi ý.",
    estimatedTime: "30 minutes",
    difficulty: 4,
    status: "Coming soon"
  },
  {
    id: "m11",
    title: "Pick from a List",
    level: "Advanced",
    description: "Chọn TWO hoặc THREE đáp án đúng từ danh sách dài. Người học cần phân biệt thông tin chỉ được nhắc tới với thông tin thật sự là đáp án.",
    estimatedTime: "30 minutes",
    difficulty: 4,
    status: "Coming soon"
  },
  {
    id: "m12",
    title: "Short-answer Questions",
    level: "Advanced",
    description: "Trả lời ngắn bằng từ hoặc số nghe được. Cần viết đúng giới hạn từ, không tự diễn giải và nghe chính xác danh từ hoặc cụm thông tin chính.",
    estimatedTime: "30 minutes",
    difficulty: 3,
    status: "Coming soon"
  }
];

export const coreListeningSkills = [
  {
    title: "Keyword Prediction",
    description: "Dự đoán keyword và loại thông tin cần nghe trước khi audio bắt đầu.",
    icon: Target
  },
  {
    title: "Distractor Detection",
    description: "Nhận diện bẫy đổi ý, phủ định, correction và thông tin gây nhiễu.",
    icon: Zap
  },
  {
    title: "Paraphrase Recognition",
    description: "Luyện nhận ra cách đề bài và audio diễn đạt cùng một ý bằng từ khác nhau.",
    icon: Search
  },
  {
    title: "Transcript Review",
    description: "Sau khi làm bài, đọc transcript để hiểu vì sao sai và lưu lỗi vào mistake notebook.",
    icon: FileText
  }
];

export const practiceModes = [
  { title: "Learn", description: "Học chiến thuật làm từng dạng bài." },
  { title: "Practice", description: "Làm bài luyện ngắn 5-10 câu theo từng dạng." },
  { title: "Review", description: "Chữa lỗi bằng transcript, highlight keyword và distractors." },
  { title: "Full Test", description: "Luyện full Listening 4 parts, 40 câu như đề thật." }
];

export const ieltsSkills: Record<string, IELTSSkillConfig> = {
  listening: {
    id: "listening",
    name: "Listening",
    vietnameseName: "Nghe",
    description: "Cải thiện khả năng nghe hiểu thông qua các bài nghe đa dạng từ hội thoại hàng ngày đến bài giảng học thuật.",
    icon: Headphones,
    color: "blue",
    accentColor: "text-blue-600",
    bgLight: "bg-blue-50",
    rating: 4.8,
    lessonsCount: 12,
    progress: 0,
    practiceTypes: [
      { title: "Multiple Choice", description: "Chọn đáp án đúng từ các lựa chọn cho sẵn." },
      {
        title: "Form Completion",
        description: "Điền thông tin vào biểu mẫu, ghi chú hoặc bảng biểu.",
      },
      {
        title: "Map/Plan Labeling",
        description: "Xác định vị trí các địa điểm trên bản đồ hoặc sơ đồ.",
      },
    ],
    lessons: [
      { id: "l1", title: "Giới thiệu format Listening", duration: "10:00", isCompleted: false },
      { id: "l2", title: "Chiến thuật điền tên và số", duration: "15:20", isCompleted: false },
      {
        id: "l3",
        title: "Luyện nghe Part 1: Đăng ký dịch vụ",
        duration: "12:45",
        isCompleted: false,
      },
    ],
    tips: [
      "Luôn đọc kỹ yêu cầu số lượng từ được điền.",
      "Chú ý đến các từ nối và dấu hiệu chuyển ý trong bài nghe.",
      "Luyện tập kỹ năng nghe và viết cùng lúc (dictation).",
    ],
    modules: listeningModules
  },
  reading: {
    id: "reading",
    name: "Reading",
    vietnameseName: "Đọc",
    description:
      "Phát triển kỹ năng đọc nhanh, tìm ý chính và trả lời chính xác các dạng câu hỏi học thuật.",
    icon: BookOpen,
    color: "emerald",
    accentColor: "text-emerald-600",
    bgLight: "bg-emerald-50",
    rating: 4.7,
    lessonsCount: 30,
    progress: 20,
    practiceTypes: [
      { title: "Matching Headings", description: "Nối tiêu đề phù hợp cho từng đoạn văn." },
      {
        title: "True/False/Not Given",
        description: "Xác định tính chính xác của thông tin dựa trên bài đọc.",
      },
      {
        title: "Sentence Completion",
        description: "Hoàn thành câu bằng cách lấy từ trong văn bản.",
      },
    ],
    lessons: [
      { id: "r1", title: "Skimming vs Scanning", duration: "08:30", isCompleted: true },
      {
        id: "r2",
        title: "Cách xử lý bài Matching Headings",
        duration: "14:10",
        isCompleted: false,
      },
      {
        id: "r3",
        title: "Từ vựng học thuật theo chủ đề Environment",
        duration: "11:55",
        isCompleted: false,
      },
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
    vietnameseName: "Viết",
    description:
      "Học cách xây dựng cấu trúc bài viết Task 1 và Task 2 một cách logic và sử dụng từ vựng nâng cao.",
    icon: PenTool,
    color: "purple",
    accentColor: "text-purple-600",
    bgLight: "bg-purple-50",
    rating: 4.9,
    lessonsCount: 18,
    progress: 10,
    practiceTypes: [
      {
        title: "Task 1: Data Description",
        description: "Mô tả biểu đồ đường, cột, tròn hoặc bảng biểu.",
      },
      {
        title: "Task 2: Essay Writing",
        description: "Viết bài luận nghị luận về các chủ đề xã hội.",
      },
      { title: "Cohesion & Coherence", description: "Sử dụng từ nối để bài viết mạch lạc hơn." },
    ],
    lessons: [
      { id: "w1", title: "Cấu trúc bài Task 1 chuẩn", duration: "12:00", isCompleted: true },
      {
        id: "w2",
        title: "Cách phân tích biểu đồ Line Graph",
        duration: "18:45",
        isCompleted: false,
      },
      {
        id: "w3",
        title: "Brainstorming ý tưởng cho Task 2",
        duration: "15:30",
        isCompleted: false,
      },
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
    vietnameseName: "Nói",
    description:
      "Luyện phản xạ nói tự nhiên, cải thiện phát âm và mở rộng vốn từ cho 3 phần thi nói.",
    icon: Mic,
    color: "orange",
    accentColor: "text-orange-600",
    bgLight: "bg-orange-50",
    rating: 4.9,
    lessonsCount: 20,
    progress: 45,
    practiceTypes: [
      {
        title: "Part 1: Basic QA",
        description: "Trả lời các câu hỏi về bản thân và các chủ đề quen thuộc.",
      },
      {
        title: "Part 2: Long Turn",
        description: "Nói liên tục trong 2 phút về một chủ đề cho sẵn.",
      },
      {
        title: "Part 3: Discussion",
        description: "Thảo luận sâu về các vấn đề mang tính trừu tượng.",
      },
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
