export type AdminRole = "Admin" | "Moderator" | "Editor" | "User";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Pro" | "Pro+";
  status: "active" | "suspended";
  joinedAt: string;
  streak: number;
  role: AdminRole;
  lastActiveAt: string;
  lessonsCompleted: number;
};

export const mockUsers: AdminUser[] = [
  { id: "u1", name: "Nguyễn Văn An", email: "an.nguyen@example.com", plan: "Pro", status: "active", joinedAt: "2024-09-12", streak: 28, role: "Admin", lastActiveAt: "2026-05-11 09:42", lessonsCompleted: 184 },
  { id: "u2", name: "Trần Thị Bích", email: "bich.tran@example.com", plan: "Free", status: "active", joinedAt: "2025-01-04", streak: 5, role: "User", lastActiveAt: "2026-05-10 21:08", lessonsCompleted: 22 },
  { id: "u3", name: "Lê Minh Cường", email: "cuong.le@example.com", plan: "Pro+", status: "active", joinedAt: "2024-06-21", streak: 102, role: "Moderator", lastActiveAt: "2026-05-11 08:15", lessonsCompleted: 412 },
  { id: "u4", name: "Phạm Hồng Đào", email: "dao.pham@example.com", plan: "Free", status: "suspended", joinedAt: "2025-03-15", streak: 0, role: "User", lastActiveAt: "2026-04-29 14:22", lessonsCompleted: 3 },
  { id: "u5", name: "Đỗ Quốc Huy", email: "huy.do@example.com", plan: "Pro", status: "active", joinedAt: "2024-11-30", streak: 14, role: "Editor", lastActiveAt: "2026-05-11 07:01", lessonsCompleted: 96 },
  { id: "u6", name: "Vũ Thanh Hà", email: "ha.vu@example.com", plan: "Pro+", status: "active", joinedAt: "2024-04-08", streak: 65, role: "User", lastActiveAt: "2026-05-09 19:50", lessonsCompleted: 268 },
  { id: "u7", name: "Bùi Quang Khải", email: "khai.bui@example.com", plan: "Free", status: "active", joinedAt: "2025-04-22", streak: 2, role: "User", lastActiveAt: "2026-05-08 11:30", lessonsCompleted: 7 },
];

export type LoginRecord = {
  at: string;
  ip: string;
  device: string;
  location: string;
  status: "success" | "failed";
};

export type ActivityRecord = {
  at: string;
  type: "email_change" | "plan_change" | "login_fail" | "spam_flag" | "password_reset" | "lesson_done";
  detail: string;
};

export const mockLoginHistory: Record<string, LoginRecord[]> = {
  default: [
    { at: "2026-05-11 09:42", ip: "113.161.42.18", device: "Chrome 134 · macOS", location: "Hà Nội, VN", status: "success" },
    { at: "2026-05-10 21:08", ip: "113.161.42.18", device: "Safari · iOS 19", location: "Hà Nội, VN", status: "success" },
    { at: "2026-05-09 07:55", ip: "171.244.10.2", device: "Chrome · Android 15", location: "Hồ Chí Minh, VN", status: "success" },
    { at: "2026-05-08 23:12", ip: "45.117.80.91", device: "Firefox · Windows 11", location: "Singapore", status: "failed" },
  ],
};

export const mockActivityLog: Record<string, ActivityRecord[]> = {
  default: [
    { at: "2026-05-11 09:42", type: "lesson_done", detail: "Hoàn thành bài Flashcard #128" },
    { at: "2026-05-08 23:12", type: "login_fail", detail: "Sai mật khẩu 3 lần liên tiếp" },
    { at: "2026-05-05 10:00", type: "plan_change", detail: "Nâng từ Free lên Pro" },
    { at: "2026-04-30 18:24", type: "email_change", detail: "old@example.com → new@example.com" },
    { at: "2026-04-22 12:00", type: "password_reset", detail: "Yêu cầu đặt lại mật khẩu" },
    { at: "2026-04-15 09:10", type: "spam_flag", detail: "Bị 1 user báo cáo spam — đã review" },
  ],
};

export type AdminSubscription = {
  id: string;
  userId: string;
  plan: "Pro" | "Pro+";
  amount: number;
  cycle: "month" | "year";
  startedAt: string;
  renewsAt: string;
  status: "active" | "canceled" | "past_due";
};

export const mockSubscriptions: AdminSubscription[] = [
  { id: "s1", userId: "u1", plan: "Pro", amount: 99000, cycle: "month", startedAt: "2024-09-12", renewsAt: "2026-06-12", status: "active" },
  { id: "s2", userId: "u3", plan: "Pro+", amount: 1990000, cycle: "year", startedAt: "2024-06-21", renewsAt: "2026-06-21", status: "active" },
  { id: "s3", userId: "u5", plan: "Pro", amount: 99000, cycle: "month", startedAt: "2024-11-30", renewsAt: "2026-05-30", status: "past_due" },
  { id: "s4", userId: "u6", plan: "Pro+", amount: 199000, cycle: "month", startedAt: "2024-04-08", renewsAt: "2026-06-08", status: "active" },
  { id: "s5", userId: "u4", plan: "Pro", amount: 99000, cycle: "month", startedAt: "2025-02-01", renewsAt: "2026-04-01", status: "canceled" },
];