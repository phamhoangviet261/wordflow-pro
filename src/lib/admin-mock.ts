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

export type PaymentRecord = {
  id: string;
  subId: string;
  at: string;
  amount: number;
  method: "Stripe" | "PayPal" | "Momo" | "VNPay";
  status: "paid" | "refunded" | "failed";
  invoice: string;
};

export const mockPayments: PaymentRecord[] = [
  { id: "p1", subId: "s1", at: "2026-05-12", amount: 99000, method: "Stripe", status: "paid", invoice: "INV-2026-0512-001" },
  { id: "p2", subId: "s1", at: "2026-04-12", amount: 99000, method: "Stripe", status: "paid", invoice: "INV-2026-0412-009" },
  { id: "p3", subId: "s2", at: "2025-06-21", amount: 1990000, method: "VNPay", status: "paid", invoice: "INV-2025-0621-118" },
  { id: "p4", subId: "s3", at: "2026-05-30", amount: 99000, method: "Momo", status: "failed", invoice: "INV-2026-0530-042" },
  { id: "p5", subId: "s4", at: "2026-05-08", amount: 199000, method: "Stripe", status: "paid", invoice: "INV-2026-0508-077" },
  { id: "p6", subId: "s5", at: "2026-03-01", amount: 99000, method: "PayPal", status: "refunded", invoice: "INV-2026-0301-013" },
  { id: "p7", subId: "s4", at: "2026-04-08", amount: 199000, method: "Stripe", status: "paid", invoice: "INV-2026-0408-061" },
];

export type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed" | "trial";
  value: number;
  usage: number;
  limit: number;
  expires: string;
  status: "active" | "expired" | "paused";
};

export const mockCoupons: Coupon[] = [
  { id: "c1", code: "WELCOME30", type: "percent", value: 30, usage: 142, limit: 500, expires: "2026-12-31", status: "active" },
  { id: "c2", code: "TRIAL7", type: "trial", value: 7, usage: 318, limit: 1000, expires: "2026-12-31", status: "active" },
  { id: "c3", code: "SUMMER50K", type: "fixed", value: 50000, usage: 88, limit: 200, expires: "2026-08-31", status: "active" },
  { id: "c4", code: "BLACKFRIDAY", type: "percent", value: 50, usage: 412, limit: 412, expires: "2025-11-30", status: "expired" },
  { id: "c5", code: "VIP10", type: "percent", value: 10, usage: 6, limit: 50, expires: "2026-12-31", status: "paused" },
];

export type WebhookLog = {
  id: string;
  at: string;
  provider: "Stripe" | "PayPal" | "Momo" | "VNPay";
  event: string;
  status: "success" | "failed" | "retry";
  responseMs: number;
  payloadId: string;
};

export const mockWebhooks: WebhookLog[] = [
  { id: "w1", at: "2026-05-12 09:42:11", provider: "Stripe", event: "invoice.paid", status: "success", responseMs: 142, payloadId: "evt_1Q8xP2..." },
  { id: "w2", at: "2026-05-12 09:41:55", provider: "Stripe", event: "customer.subscription.updated", status: "success", responseMs: 98, payloadId: "evt_1Q8xN4..." },
  { id: "w3", at: "2026-05-11 22:18:03", provider: "VNPay", event: "payment.success", status: "success", responseMs: 312, payloadId: "vnp_847291" },
  { id: "w4", at: "2026-05-11 14:02:44", provider: "Momo", event: "payment.failed", status: "failed", responseMs: 5012, payloadId: "momo_TXN99812" },
  { id: "w5", at: "2026-05-11 14:02:48", provider: "Momo", event: "payment.failed", status: "retry", responseMs: 4810, payloadId: "momo_TXN99812" },
  { id: "w6", at: "2026-05-10 18:30:12", provider: "PayPal", event: "BILLING.SUBSCRIPTION.CANCELLED", status: "success", responseMs: 211, payloadId: "WH-7K2..." },
  { id: "w7", at: "2026-05-09 11:08:32", provider: "Stripe", event: "charge.refunded", status: "success", responseMs: 156, payloadId: "evt_1Q7vQ8..." },
];

export type RevenueMetrics = {
  mrr: number;
  arr: number;
  churnRate: number;
  conversionRate: number;
  trialActive: number;
  trialConverted: number;
  history: { month: string; mrr: number }[];
};

export const mockRevenue: RevenueMetrics = {
  mrr: 18450000,
  arr: 221400000,
  churnRate: 3.2,
  conversionRate: 12.8,
  trialActive: 64,
  trialConverted: 41,
  history: [
    { month: "T12", mrr: 12100000 },
    { month: "T1", mrr: 13400000 },
    { month: "T2", mrr: 14250000 },
    { month: "T3", mrr: 15800000 },
    { month: "T4", mrr: 17200000 },
    { month: "T5", mrr: 18450000 },
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