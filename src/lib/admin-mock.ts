export type AdminUser = {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Pro" | "Pro+";
  status: "active" | "suspended";
  joinedAt: string;
  streak: number;
};

export const mockUsers: AdminUser[] = [
  { id: "u1", name: "Nguyễn Văn An", email: "an.nguyen@example.com", plan: "Pro", status: "active", joinedAt: "2024-09-12", streak: 28 },
  { id: "u2", name: "Trần Thị Bích", email: "bich.tran@example.com", plan: "Free", status: "active", joinedAt: "2025-01-04", streak: 5 },
  { id: "u3", name: "Lê Minh Cường", email: "cuong.le@example.com", plan: "Pro+", status: "active", joinedAt: "2024-06-21", streak: 102 },
  { id: "u4", name: "Phạm Hồng Đào", email: "dao.pham@example.com", plan: "Free", status: "suspended", joinedAt: "2025-03-15", streak: 0 },
  { id: "u5", name: "Đỗ Quốc Huy", email: "huy.do@example.com", plan: "Pro", status: "active", joinedAt: "2024-11-30", streak: 14 },
  { id: "u6", name: "Vũ Thanh Hà", email: "ha.vu@example.com", plan: "Pro+", status: "active", joinedAt: "2024-04-08", streak: 65 },
  { id: "u7", name: "Bùi Quang Khải", email: "khai.bui@example.com", plan: "Free", status: "active", joinedAt: "2025-04-22", streak: 2 },
];

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