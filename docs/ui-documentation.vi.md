# VocabLab — Tài Liệu UI (Tiếng Việt)

> **Tên ứng dụng:** VocabLab  
> **Tech stack:** TanStack Start · React 19 · Tailwind CSS 4 · Lucide Icons  
> **Routing:** File-based routing qua TanStack Router

---

## Mục lục

1. [Shell ứng dụng (App Shell)](#1-shell-ứng-dụng-app-shell)
2. [Trang Chủ (`/`)](#2-trang-chủ-)
3. [Từ Vựng (`/vocabulary`)](#3-từ-vựng-vocabulary)
4. [Bộ Từ Vựng (`/vocab-sets`)](#4-bộ-từ-vựng-vocab-sets)
5. [Chi Tiết Bộ Từ (`/vocab-sets/:setId`)](#5-chi-tiết-bộ-từ-vocab-setssetid)
6. [Game Phản Xạ (`/games`)](#6-game-phản-xạ-games)
7. [Flashcard (`/games/flashcard`)](#7-flashcard-gamesflashcard)
8. [Phần Thưởng (`/store`)](#8-phần-thưởng-store)
9. [Xếp Hạng (`/leaderboard`)](#9-xếp-hạng-leaderboard)
10. [Quản Trị (`/admin`)](#10-quản-trị-admin)
11. [Các Component Dùng Chung](#11-các-component-dùng-chung)
12. [Mô Hình Dữ Liệu](#12-mô-hình-dữ-liệu)

---

## 1. Shell Ứng Dụng (App Shell)

Shell bao bọc toàn bộ trang khi đã đăng nhập và cung cấp navigation cố định.

### Layout Desktop (`≥ md`)
| Vùng | Component | Mô tả |
|------|-----------|-------|
| Sidebar trái | `AppSidebar` | Cố định, rộng 256px. Chứa logo, các mục nav, menu user. |
| Header trên | `AppHeader` | Sticky, căn phải. Hiển thị chỉ số gamification và nút "NÂNG CẤP PRO". |
| Vùng chính | `<main>` | Cuộn được, `px-8 pb-10`. Render `<Outlet>` đang active. |

### Layout Mobile (`< md`)
| Vùng | Component | Mô tả |
|------|-----------|-------|
| Navbar trên | `MobileNavbar` | Cố định, `z-40`. Trái: hamburger + logo. Phải: chỉ số gamification. |
| Sidebar trượt | `MobileSidebar` | Trượt từ trái khi bấm toggle. Overlay mờ phía sau. ESC / bấm overlay để đóng. Khóa scroll body khi mở. |
| Vùng chính | `<main>` | `px-4 pb-10`. Render `<Outlet>` đang active. |

### Các Mục Navigation
| Nhãn | Route | Icon |
|------|-------|------|
| Trang chủ | `/` | `Home` |
| Bộ từ vựng | `/vocab-sets` | `BookMarked` |
| Từ vựng | `/vocabulary` | `BookOpen` |
| Game phản xạ | `/games` | `Gamepad2` |
| Phần thưởng | `/store` | `Gift` |
| Xếp hạng | `/leaderboard` | `Trophy` |
| Quản trị | `/admin` | `Shield` |

### HUD Gamification (`HeaderStats`)
Luôn hiển thị trên header/navbar.
- **Streak** — badge màu cam với icon `Flame`.
- **Xu (Coins)** — badge màu hổ phách với icon `Coins` + hiệu ứng đếm lên.
- **Level + thanh XP** — badge level tròn + thanh tiến trình có animation (ẩn trên `< sm`).

### Menu User (Chỉ trên sidebar desktop)
Popup kích hoạt từ avatar user ở cuối sidebar.
- **Card header:** Avatar chữ tắt, tên, email, badge gói.
- **Lưới chỉ số:** Level · Streak · Xu.
- **Hành động:** Hồ sơ, Cài đặt, Đăng xuất.

### Toast Toàn Cục
Sử dụng **Sonner** (`richColors`, vị trí `top-right`).

### Overlay Gamification
- `FloatingFeedback` — hiệu ứng +XP / +Xu nổi khi nhận thưởng.
- `LevelUpModal` — modal popup khi người dùng lên cấp.

---

## 2. Trang Chủ (`/`)

**Tiêu đề trang:** `Trang chủ — VocabLab`

### Các Phần

#### 2.1 Hero Grid (`grid lg:grid-cols-4`)
- **Ảnh banner** (col-span-2) — ảnh full-bleed.
- **Thẻ thống kê** (lưới 2×2):
  | Chỉ số | Màu |
  |--------|-----|
  | Tổng từ vựng | Xanh dương |
  | Đã học | Xanh lá |
  | Tiến độ % | Tím |
  | Cần ôn | Cam |
- **Thẻ Streak** — panel gradient cam. Hiển thị streak hiện tại + lưới lịch 7 ngày với icon lửa.

#### 2.2 Truy Cập Nhanh
4 nút shortcut dạng lưới responsive:
- Thêm từ, Luyện tập, Xếp hạng, Cộng đồng.

#### 2.3 Lộ Trình Học
- **Bộ lọc danh mục (pills):** Tất cả · THPT · IELTS · TOEIC · TOEFL · Giao tiếp.
- **Thẻ khóa học** (lưới responsive) — mỗi thẻ hiển thị:
  - Thanh màu, tiêu đề, badge danh mục.
  - Số từ + số đã học.
  - Thanh tiến trình.
  - Độ khó (1–5 chấm).

---

## 3. Từ Vựng (`/vocabulary`)

**Tiêu đề trang:** `Từ vựng — VocabLab`

### Hàng Thống Kê
4 thẻ: Tổng từ · Đã học · Chưa học · Tỉ lệ %.

### Thanh Công Cụ
| Control | Loại | Tùy chọn |
|---------|------|----------|
| Tìm kiếm | Text input | Lọc theo `word` hoặc `meaning` |
| Loại từ | Select | ALL · NOUN · VERB · ADJ · ADV |
| Trạng thái | Select | Tất cả · Đã học · Chưa học |
| Thêm nhiều từ | Button (Dialog) | Mở dialog dán nhiều từ |
| Thêm từ mới | Button (Dialog) | Mở form thêm 1 từ |

#### Form Thêm 1 Từ
Các trường: Từ* · Phiên âm · Nghĩa* · Loại từ · Ví dụ.

#### Dialog Thêm Nhiều Từ
Dán text nhiều dòng theo định dạng: `word | meaning | TYPE | example`

### Bảng Từ Vựng
Cột có thể sắp xếp: Từ · Nghĩa · Loại · Trạng thái đã học.
Mỗi hàng:
- 🔊 Nút nghe phát âm (Web Speech API).
- Từ + phiên âm.
- Nghĩa (ẩn khi `< md`).
- Badge loại từ (ẩn khi `< md`).
- Câu ví dụ (ẩn khi `< lg`, bị cắt bớt).
- Toggle "Đã học" (Switch).
- Nút xóa (hiện khi hover, kèm dialog xác nhận).

### Phân Trang
- Chọn số hàng mỗi trang: 5 · 10 · 20 · 50.
- Nút Trước/Sau.
- Chỉ báo trang.

### Dialog Xác Nhận
Modal xác nhận chung cho các hành động xóa/nguy hiểm.

---

## 4. Bộ Từ Vựng (`/vocab-sets`)

**Tiêu đề trang:** `Bộ từ vựng — VocabLab`

### Thanh Hành Động
- **"TẠO BỘ TỪ MỚI"** (xanh lá) — mở dialog tạo mới.
- **"LỘ TRÌNH"** (vàng) — nút lộ trình học (placeholder).

### Dialog Tạo Bộ Từ Mới
Các trường:
| Trường | Loại | Ràng buộc |
|--------|------|-----------|
| Tên bộ từ* | Text | tối đa 80 ký tự |
| Mô tả | Textarea | tối đa 300 ký tự |
| Màu chủ đạo | 6 pill màu | tùy chọn gradient |
| Chọn từ | Danh sách checkbox cuộn | chọn từ danh sách từ toàn cục |

### Lưới Thẻ Bộ Từ
Responsive: `sm:grid-cols-2 lg:grid-cols-3`.

Mỗi thẻ:
- Thanh gradient màu trên cùng (màu của bộ).
- Tiêu đề + checkbox chọn.
- Mô tả (giới hạn 2 dòng).
- Số từ + số đã học.
- Thanh tiến trình (gradient).
- Hành động: **Xem** (→ trang chi tiết) · **Phát** · **Sửa** · **Xóa**.

---

## 5. Chi Tiết Bộ Từ (`/vocab-sets/:setId`)

**Tiêu đề trang:** `Chi tiết bộ từ — VocabLab`

### Banner Header
Gradient (màu của bộ). Hiển thị: tiêu đề, mô tả, số từ, số đã học, thanh tiến trình.
Hành động: **Luyện tập** (→ flashcard) · **Xóa**.

### Bảng Danh Sách Từ
Cột: 🔊 Nghe · Từ + phiên âm · Nghĩa · Badge loại · Badge trạng thái học.

### Trạng Thái Lỗi
- **Không tìm thấy** — empty state thân thiện với link quay lại hoặc về trang chủ.
- **Lỗi tải** — nút thử lại.

---

## 6. Game Phản Xạ (`/games`)

**Tiêu đề trang:** `Game phản xạ — VocabLab`

### Thẻ Chế Độ Chơi
Lưới responsive 6 chế độ:
| Chế độ | Gradient | Trạng thái |
|--------|----------|------------|
| Flashcard | Tím | ✅ Hoạt động |
| Trắc nghiệm | Cam | Sắp ra mắt |
| Nối từ | Xanh dương | Sắp ra mắt |
| Gõ từ | Xanh lá | Sắp ra mắt |
| Nghe viết | Teal | Sắp ra mắt |
| Tổng hợp | Hồng | Nhãn HOT |

### Banner SRS
Panel gradient tím full-width quảng bá tính năng Spaced Repetition System với nút CTA.

---

## 7. Flashcard (`/games/flashcard`)

**Tiêu đề trang:** `Flashcard — VocabLab`

### Trạng Thái Game
- Bộ bài: 8 từ đầu tiên từ danh sách từ toàn cục.
- Mỗi thẻ: `undefined` | `true` (đã thuộc) | `false` (chưa thuộc).

### Thanh Tiến Trình
Hiển thị vị trí thẻ hiện tại / tổng, số đúng (xanh) / số sai (đỏ).

### Thẻ Lật (Flip Card)
- **Mặt trước** — gradient tím. Hiển thị: từ, phiên âm, badge loại từ, nút 🔊 phát âm.
- **Mặt sau** — trắng. Hiển thị: loại từ, nghĩa, câu ví dụ.
- Bấm vào thẻ để lật (CSS `perspective` + transition `rotateY`).

### Nút Trả Lời
- ❌ **Chưa thuộc** — nút đỏ, không thưởng XP.
- ✅ **Đã thuộc** — nút xanh lá, thưởng +5 XP, tiến trình quest.

### Nút Điều Hướng
Quay lại · Làm lại · Tiếp theo.

### Trạng Thái Hoàn Thành
- **Banner inline** — "Hoàn thành! Bạn thuộc X/Y từ" + nút chơi lại.
- **`SessionCompleteModal`** — modal overlay hiển thị: XP kiếm được, xu kiếm được, kết quả đúng/tổng.

### Gamification Khi Kết Thúc
Thưởng XP bonus + xu. Tăng streak hằng ngày. Tiến trình quest `q4`.

---

## 8. Phần Thưởng (`/store`)

**Tiêu đề trang:** `Phần thưởng — VocabLab`

### Số Dư Xu
Hiển thị badge màu hổ phách phía trên bên phải.

### Thẻ Streak
- Streak hiện tại + kỷ lục.
- Thanh tiến trình đến mốc tiếp theo.
- Badge mốc: 3 · 7 · 14 · 30 · 60 · 100 ngày.
- Câu trích dẫn động lực.

### Nhiệm Vụ Hằng Ngày
4 nhiệm vụ làm mới mỗi 24h:
| Nhiệm vụ | Mục tiêu | Phần thưởng |
|----------|----------|-------------|
| Học 20 từ mới | 20 | 50 XP + 30 xu |
| Ôn 10 từ | 10 | 30 XP + 20 xu |
| 5 đáp án đúng liên tiếp | 5 | 40 XP + 25 xu |
| Chơi 1 mini-game | 1 | 25 XP + 15 xu |

Mỗi nhiệm vụ hiển thị: thanh tiến trình · hiện tại/mục tiêu · nút nhận thưởng.

### Cửa Hàng Phần Thưởng
Lọc danh mục: Tất cả · Trợ năng · Nội dung · Giao diện · Tiện ích.

Các vật phẩm trong shop:
| ID | Tên | Giá | Danh mục |
|----|-----|-----|----------|
| `ai-explain` | Giải thích AI | 80 xu | Trợ năng |
| `pack-business` | Bộ từ Business+ | 250 xu | Nội dung |
| `pack-ielts` | Bộ từ IELTS 7+ | 320 xu | Nội dung |
| `streak-freeze` | Streak Freeze | 60 xu | Tiện ích |
| `theme-sunset` | Theme Sunset | 150 xu | Giao diện |
| `theme-ocean` | Theme Ocean | 150 xu | Giao diện |
| `extra-retry` | Thêm 3 lượt thử | 40 xu | Tiện ích |

Modal xác nhận trước khi mua.

---

## 9. Xếp Hạng (`/leaderboard`)

**Tiêu đề trang:** `Xếp hạng — VocabLab`

**Trạng thái:** Placeholder — "Sắp ra mắt" với icon cúp.

---

## 10. Quản Trị (`/admin`)

**Tiêu đề trang:** `Quản trị — VocabLab`

Panel quản trị đầy đủ tính năng. (Chi tiết trong `_app.admin.tsx`.)

---

## 11. Các Component Dùng Chung

| Component | Đường dẫn | Mô tả |
|-----------|-----------|-------|
| `AppSidebar` | `components/layout/AppSidebar.tsx` | Sidebar desktop với nav + menu user |
| `SidebarContent` | `components/layout/SidebarContent.tsx` | Các mục nav dùng chung (mobile + desktop) |
| `AppHeader` | `components/layout/AppHeader.tsx` | Header sticky desktop |
| `MobileNavbar` | `components/layout/MobileNavbar.tsx` | Navbar cố định phía trên mobile |
| `MobileSidebar` | `components/layout/MobileSidebar.tsx` | Sidebar trượt mobile |
| `HeaderStats` | `components/gamification/HeaderStats.tsx` | HUD XP/streak/xu |
| `FloatingFeedback` | `components/gamification/FloatingFeedback.tsx` | Hiệu ứng +XP/+xu nổi |
| `LevelUpModal` | `components/gamification/LevelUpModal.tsx` | Modal mừng lên cấp |
| `SessionCompleteModal` | `components/gamification/SessionCompleteModal.tsx` | Modal kết quả sau game |

---

## 12. Mô Hình Dữ Liệu

### `Word` (Từ vựng)
```typescript
type Word = {
  id: string;
  word: string;         // Từ tiếng Anh
  phonetic: string;     // Phiên âm IPA
  meaning: string;      // Nghĩa tiếng Việt
  type: "NOUN" | "VERB" | "ADJ" | "ADV";
  example: string;      // Câu ví dụ
  learned: boolean;     // Đã học chưa
  status?: "draft" | "published";
  difficulty?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
};
```

### `VocabSet` (Bộ từ vựng)
```typescript
type VocabSet = {
  id: string;
  title: string;
  description: string;
  total: number;        // Tổng số từ (derived: wordIds.length)
  learned: number;      // Số từ đã học (derived)
  color: string;        // Class Tailwind gradient
  wordIds: string[];    // Danh sách ID từ trong bộ
  status?: "draft" | "published";
  difficulty?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
};
```

### `GamificationState` (Trạng thái gamification)
```typescript
type GamificationState = {
  xp: number;
  level: number;
  coins: number;
  streak: number;
  bestStreak: number;
  lastActiveDay: string;  // ISO date "YYYY-MM-DD"
  quests: Quest[];
  inventory: string[];    // Mảng ID các ShopItem đã sở hữu
};
```

### `Quest` (Nhiệm vụ)
```typescript
type Quest = {
  id: string;
  title: string;
  description: string;
  goal: number;
  progress: number;
  rewardXp: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
};
```

### `ShopItem` (Vật phẩm shop)
```typescript
type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: "sparkles" | "package" | "snowflake" | "palette" | "rotate";
  category: "boost" | "content" | "cosmetic" | "utility";
};
```

---

*Tạo ngày: 2026-05-11 | VocabLab v1.0*
