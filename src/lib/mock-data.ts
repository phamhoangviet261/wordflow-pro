import {
  Layers, Sparkles, Trophy, Users, Plus, Zap, Puzzle, Keyboard, Headphones, Shuffle,
  type LucideIcon,
} from "lucide-react";

export type StatCardData = { label: string; value: string; accent: "green" | "orange" | "blue" | "purple" };

export const homeStats: StatCardData[] = [
  { label: "Tổng từ vựng", value: "1,248", accent: "blue" },
  { label: "Đã học", value: "642", accent: "green" },
  { label: "Tiến độ", value: "51%", accent: "purple" },
  { label: "Cần ôn", value: "84", accent: "orange" },
];

export const streakDays = [
  { day: "T2", active: true }, { day: "T3", active: true }, { day: "T4", active: true },
  { day: "T5", active: true }, { day: "T6", active: true }, { day: "T7", active: false },
  { day: "CN", active: false },
];

export type QuickAccessItem = { title: string; icon: LucideIcon; color: string; bg: string };

export const quickAccess: QuickAccessItem[] = [
  { title: "Thêm từ", icon: Plus, color: "text-blue-600", bg: "bg-blue-100" },
  { title: "Luyện tập", icon: Sparkles, color: "text-purple-600", bg: "bg-purple-100" },
  { title: "Xếp hạng", icon: Trophy, color: "text-orange-600", bg: "bg-orange-100" },
  { title: "Cộng đồng", icon: Users, color: "text-green-600", bg: "bg-green-100" },
];

export const courseCategories = ["Tất cả", "THPT", "IELTS", "TOEIC", "TOEFL", "Giao tiếp"];

export type Course = { title: string; category: string; words: number; learned: number; difficulty: number; color: string };

export const courses: Course[] = [
  { title: "IELTS Foundation", category: "IELTS", words: 500, learned: 240, difficulty: 2, color: "bg-blue-500" },
  { title: "TOEIC 600+", category: "TOEIC", words: 800, learned: 510, difficulty: 3, color: "bg-orange-500" },
  { title: "Giao tiếp hằng ngày", category: "Giao tiếp", words: 320, learned: 180, difficulty: 1, color: "bg-green-500" },
  { title: "THPT Quốc gia", category: "THPT", words: 1200, learned: 380, difficulty: 4, color: "bg-purple-500" },
  { title: "TOEFL iBT", category: "TOEFL", words: 950, learned: 120, difficulty: 5, color: "bg-pink-500" },
  { title: "IELTS 7.0+", category: "IELTS", words: 1500, learned: 60, difficulty: 5, color: "bg-teal-500" },
];

export type VocabSet = {
  id: string;
  title: string;
  description: string;
  total: number;
  learned: number;
  color: string;
  wordIds: string[];
  status?: "draft" | "published";
  difficulty?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
};

export const vocabSets: VocabSet[] = [
  { id: "1", title: "Animals & Nature", description: "Từ vựng về động vật và thiên nhiên thường gặp.", total: 116, learned: 84, color: "from-green-400 to-emerald-500", wordIds: ["1","2","3","5"] },
  { id: "2", title: "Business English", description: "Từ vựng kinh doanh, họp hành, email công sở.", total: 220, learned: 132, color: "from-blue-400 to-indigo-500", wordIds: ["4","6","8"] },
  { id: "3", title: "Travel & Tourism", description: "Đi du lịch, sân bay, khách sạn, đặt phòng.", total: 145, learned: 90, color: "from-orange-400 to-pink-500", wordIds: ["5","7"] },
  { id: "4", title: "Food & Cooking", description: "Nấu ăn, nhà hàng, thực đơn quốc tế.", total: 98, learned: 40, color: "from-rose-400 to-red-500", wordIds: ["1","6"] },
  { id: "5", title: "Technology", description: "Công nghệ, lập trình, internet và AI.", total: 180, learned: 25, color: "from-purple-400 to-violet-500", wordIds: ["2","8"] },
  { id: "6", title: "Health & Fitness", description: "Sức khỏe, tập luyện, chế độ ăn uống.", total: 132, learned: 0, color: "from-teal-400 to-cyan-500", wordIds: ["3","7"] },
];

export type Word = {
  id: string; word: string; phonetic: string; meaning: string;
  type: "NOUN" | "VERB" | "ADJ" | "ADV"; example: string; learned: boolean;
  status?: "draft" | "published";
  difficulty?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
};

export const words: Word[] = [
  { id: "1", word: "abandon", phonetic: "/əˈbændən/", meaning: "từ bỏ, bỏ rơi", type: "VERB", example: "He abandoned his car in the snow.", learned: true },
  { id: "2", word: "ability", phonetic: "/əˈbɪləti/", meaning: "khả năng", type: "NOUN", example: "She has the ability to solve any problem.", learned: true },
  { id: "3", word: "abundant", phonetic: "/əˈbʌndənt/", meaning: "dồi dào, phong phú", type: "ADJ", example: "The region has abundant natural resources.", learned: false },
  { id: "4", word: "accomplish", phonetic: "/əˈkɒmplɪʃ/", meaning: "hoàn thành, đạt được", type: "VERB", example: "We accomplished our goal ahead of schedule.", learned: true },
  { id: "5", word: "adventure", phonetic: "/ədˈventʃər/", meaning: "cuộc phiêu lưu", type: "NOUN", example: "Their trip was a great adventure.", learned: false },
  { id: "6", word: "brilliant", phonetic: "/ˈbrɪljənt/", meaning: "xuất sắc, sáng chói", type: "ADJ", example: "What a brilliant idea!", learned: true },
  { id: "7", word: "carefully", phonetic: "/ˈkeəfəli/", meaning: "một cách cẩn thận", type: "ADV", example: "Please drive carefully.", learned: false },
  { id: "8", word: "demonstrate", phonetic: "/ˈdemənstreɪt/", meaning: "chứng minh, thể hiện", type: "VERB", example: "He demonstrated how to use the machine.", learned: false },
];

export type GameMode = { title: string; subtitle: string; icon: LucideIcon; gradient: string; hot?: boolean };

export const gameModes: GameMode[] = [
  { title: "Flashcard", subtitle: "Lật thẻ ghi nhớ nhanh", icon: Layers, gradient: "from-purple-500 to-purple-600" },
  { title: "Trắc nghiệm", subtitle: "4 đáp án chọn 1", icon: Zap, gradient: "from-orange-500 to-orange-600" },
  { title: "Nối từ", subtitle: "Match từ với nghĩa", icon: Puzzle, gradient: "from-blue-500 to-blue-600" },
  { title: "Gõ từ", subtitle: "Typing thần tốc", icon: Keyboard, gradient: "from-green-500 to-green-600" },
  { title: "Nghe viết", subtitle: "Listening dictation", icon: Headphones, gradient: "from-teal-500 to-teal-600" },
  { title: "Tổng hợp", subtitle: "Mix nhiều chế độ", icon: Shuffle, gradient: "from-pink-500 to-rose-600", hot: true },
];
